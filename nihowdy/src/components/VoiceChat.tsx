

import { useState, useRef, useCallback, useEffect } from 'react';

// ── types ──────────────────────────────────────────────────────────────────

type Status =
  | 'idle'
  | 'recording'
  | 'transcribing'
  | 'thinking'
  | 'speaking'
  | 'playing'
  | 'error';

type QuizPhase = 'none' | 'quiz' | 'correct' | 'wrong';

interface WordResult {
  word: string;
  confidence: number;
}

interface VoiceChatEvent {
  step: 'transcribing' | 'thinking' | 'speaking' | 'done' | 'error';
  transcript?: string;
  response?: string;
  audio?: string;
  pronunciationIssues?: WordResult[];
  missionComplete?: boolean;
  missionReason?: string;
  error?: string;
}

interface ConversationTurn {
  userText: string;
  aiText: string;
  pronunciationIssues: WordResult[];
}

export interface Mission {
  /** Shown to the learner as their goal */
  description: string;
  /** Optional visible hint */
  hint?: string;
  /** Sent to the AI — what info to hold back and eventually reveal */
  missionContext?: string;
  /** The correct answer shown in the quiz (required for quiz to appear) */
  answer?: string;
  /** Exactly 3 plausible wrong answers */
  wrongChoices?: [string, string, string];
  /** Base XP awarded for completing the mission (default 100) */
  xpReward?: number;
}

export interface VoiceChatProps {
  /** BCP-47 language code: 'en' | 'zh' | 'ja' | 'ko' | 'es' | 'fr' */
  language?: string;
  /** Human-readable language name shown in the badge */
  languageName?: string;
  mission?: Mission;
  /** Defaults to /api/voice */
  apiEndpoint?: string;
  onMissionComplete?: (reason: string) => void;
}

// ── helpers ────────────────────────────────────────────────────────────────

const LANG_NAMES: Record<string, string> = {
  en: 'English',
  zh: 'Mandarin Chinese',
  ja: 'Japanese',
  ko: 'Korean',
  es: 'Spanish',
  fr: 'French',
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function calcReward(
  base: number,
  turns: number,
  pronunciationIssues: number
): { xp: number; stars: number } {
  let mult = 1;
  if (turns <= 3) mult += 0.5;
  else if (turns <= 5) mult += 0.25;
  if (pronunciationIssues === 0) mult += 0.25;
  else if (pronunciationIssues <= 2) mult += 0.1;

  const xp = Math.round(base * mult);

  let stars = 1;
  if (turns <= 5 && pronunciationIssues <= 3) stars = 2;
  if (turns <= 3 && pronunciationIssues <= 1) stars = 3;

  return { xp, stars };
}

// ── component ──────────────────────────────────────────────────────────────

export function VoiceChat({
  language = 'en',
  languageName,
  mission,
  apiEndpoint = '/api/voice',
  onMissionComplete,
}: VoiceChatProps) {
  const langLabel = languageName ?? LANG_NAMES[language] ?? language;
  const hasQuiz = !!(mission?.answer && mission?.wrongChoices?.length === 3);

  // ── core state ───────────────────────────────────────────────────────────
  const [status, setStatus] = useState<Status>('idle');
  const [turns, setTurns] = useState<ConversationTurn[]>([]);
  const [wordBank, setWordBank] = useState<WordResult[]>([]);
  const [missionDone, setMissionDone] = useState(false);
  const [missionReason, setMissionReason] = useState('');
  const [error, setError] = useState('');

  // ── quiz state ───────────────────────────────────────────────────────────
  const [quizPhase, setQuizPhase] = useState<QuizPhase>('none');
  const [shuffledChoices, setShuffledChoices] = useState<string[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [xpEarned, setXpEarned] = useState(0);
  const [starsEarned, setStarsEarned] = useState(0);

  // ── refs ──────────────────────────────────────────────────────────────────
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const mimeTypeRef = useRef('audio/webm');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const conversationEndRef = useRef<HTMLDivElement | null>(null);
  // Set to true when the API says missionComplete; quiz fires when audio ends
  const pendingQuizRef = useRef(false);

  const buildHistory = (t: ConversationTurn[]) =>
    t.flatMap((turn) => [
      { role: 'user' as const, content: turn.userText },
      { role: 'model' as const, content: turn.aiText },
    ]);

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns]);

  // ── recording ─────────────────────────────────────────────────────────────

  const startRecording = useCallback(async () => {
    setError('');
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError('Microphone access denied.');
      setStatus('error');
      return;
    }

    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : MediaRecorder.isTypeSupported('audio/webm')
      ? 'audio/webm'
      : 'audio/mp4';
    mimeTypeRef.current = mimeType;

    const recorder = new MediaRecorder(stream, { mimeType });
    mediaRecorderRef.current = recorder;
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      processAudio(new Blob(chunksRef.current, { type: mimeTypeRef.current }));
    };

    recorder.start(100);
    setStatus('recording');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setStatus('transcribing');
  }, []);

  // ── pipeline ──────────────────────────────────────────────────────────────

  const processAudio = useCallback(
    async (blob: Blob) => {
      const form = new FormData();
      form.append('audio', blob, 'recording.webm');
      form.append('language', language);
      if (mission?.missionContext) form.append('missionContext', mission.missionContext);
      form.append('history', JSON.stringify(buildHistory(turns)));

      let res: Response;
      try {
        res = await fetch(apiEndpoint, { method: 'POST', body: form });
      } catch {
        setError('Network error — check your connection.');
        setStatus('error');
        return;
      }

      if (!res.body) {
        setError('No response from server.');
        setStatus('error');
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let pendingTurn: Partial<ConversationTurn> = {};

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          let ev: VoiceChatEvent;
          try {
            ev = JSON.parse(line.slice(6));
          } catch {
            continue;
          }

          switch (ev.step) {
            case 'transcribing':
              setStatus('transcribing');
              break;

            case 'thinking':
              pendingTurn.userText = ev.transcript ?? '';
              pendingTurn.pronunciationIssues = ev.pronunciationIssues ?? [];
              setStatus('thinking');
              break;

            case 'speaking':
              pendingTurn.aiText = ev.response ?? '';
              setStatus('speaking');
              break;

            case 'done': {
              if (!ev.audio) break;

              const completedTurn: ConversationTurn = {
                userText: pendingTurn.userText ?? '',
                aiText: pendingTurn.aiText ?? ev.response ?? '',
                pronunciationIssues:
                  ev.pronunciationIssues ?? pendingTurn.pronunciationIssues ?? [],
              };
              setTurns((prev) => [...prev, completedTurn]);

              if (ev.pronunciationIssues?.length) {
                setWordBank((prev) => {
                  const existing = new Set(prev.map((w) => w.word));
                  return [
                    ...prev,
                    ...ev.pronunciationIssues!.filter((w) => !existing.has(w.word)),
                  ];
                });
              }

              if (ev.missionComplete && !missionDone) {
                setMissionDone(true);
                setMissionReason(ev.missionReason ?? '');
                onMissionComplete?.(ev.missionReason ?? '');
                if (hasQuiz) pendingQuizRef.current = true;
              }

              setStatus('playing');
              const audio = new Audio(`data:audio/mpeg;base64,${ev.audio}`);
              audioRef.current = audio;
              audio.onended = () => {
                setStatus('idle');
                // Launch the quiz after the AI finishes speaking
                if (pendingQuizRef.current && mission?.answer && mission?.wrongChoices) {
                  pendingQuizRef.current = false;
                  setShuffledChoices(
                    shuffle([mission.answer, ...mission.wrongChoices])
                  );
                  setQuizPhase('quiz');
                }
              };
              audio.onerror = () => {
                setError('Failed to play audio.');
                setStatus('error');
              };
              audio.play().catch(() => {
                setError('Browser blocked autoplay — tap to retry.');
                setStatus('error');
              });
              break;
            }

            case 'error':
              setError(ev.error ?? 'Something went wrong.');
              setStatus('error');
              break;
          }
        }
      }
    },
    [language, mission, turns, apiEndpoint, missionDone, hasQuiz, onMissionComplete]
  );

  // ── quiz ──────────────────────────────────────────────────────────────────

  const handleChoice = (choice: string) => {
    if (quizPhase !== 'quiz') return;
    setSelectedChoice(choice);

    if (choice === mission?.answer) {
      const { xp, stars } = calcReward(
        mission.xpReward ?? 100,
        turns.length,
        wordBank.length
      );
      setXpEarned(xp);
      setStarsEarned(stars);
      setQuizPhase('correct');
    } else {
      setQuizPhase('wrong');
    }
  };

  const handleRetry = () => {
    setQuizPhase('none');
    setSelectedChoice(null);
    setMissionDone(false);
    pendingQuizRef.current = false;
  };

  const handleReset = () => {
    setTurns([]);
    setWordBank([]);
    setMissionDone(false);
    setMissionReason('');
    setQuizPhase('none');
    setSelectedChoice(null);
    setStatus('idle');
    setError('');
    pendingQuizRef.current = false;
  };

  // ── button ────────────────────────────────────────────────────────────────

  const handleButton = () => {
    if (status === 'idle' || status === 'error') startRecording();
    else if (status === 'recording') stopRecording();
    else if (status === 'playing') {
      audioRef.current?.pause();
      setStatus('idle');
    }
  };

  const isProcessing = ['transcribing', 'thinking', 'speaking'].includes(status);

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="relative flex flex-col w-full max-w-lg gap-4">

      {/* ── Language badge ────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-widest text-gray-500 font-medium">
            Practicing
          </span>
          <span className="bg-indigo-500 border border-indigo-400/50 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
            {langLabel}
          </span>
        </div>
        {turns.length > 0 && (
          <span className="text-xs text-gray-600">
            Turn {turns.length}
            {turns.length <= 3 && (
              <span className="text-emerald-500 ml-1">🔥</span>
            )}
          </span>
        )}
      </div>

      {/* ── Mission card ──────────────────────────────────────── */}
      {mission && (
        <div
          style={{
            backgroundColor: missionDone && quizPhase === 'none'
              ? 'rgb(17,53,37)'
              : 'rgba(49,46,129,0.6)',
            borderColor: missionDone && quizPhase === 'none'
              ? 'rgba(34,197,94,0.4)'
              : 'rgba(99,102,241,0.5)',
          }}
          className="rounded-2xl p-4 border transition-all duration-500"
        >
          <div className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0">
              {missionDone && quizPhase === 'none' ? '✅' : '🎯'}
            </span>
            <div className="flex-1 min-w-0">
              <p className={`text-xs uppercase tracking-widest mb-1 ${
                missionDone && quizPhase === 'none' ? 'text-emerald-400' : 'text-white'
              }`}>
                {missionDone && quizPhase === 'none' ? 'Mission complete!' : 'Your mission'}
              </p>
              <p className="text-gray-100 text-sm font-medium">{mission.description}</p>
              {mission.hint && !missionDone && (
                <p className="text-white text-xs mt-1">💡 {mission.hint}</p>
              )}
              {missionDone && missionReason && quizPhase === 'none' && (
                <p className="text-emerald-400 text-xs mt-1">{missionReason}</p>
              )}
              {hasQuiz && !missionDone && (
                <p className="text-white text-xs mt-2">
                  ✨ Quiz unlocks when you find the answer
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Conversation ──────────────────────────────────────── */}
      {turns.length > 0 && (
        <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-1">
          {turns.map((turn, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="self-end max-w-[85%]">
                <div className="bg-indigo-700/40 border border-indigo-600/30 rounded-2xl rounded-br-sm px-4 py-2.5">
                  <p className="text-gray-100 text-sm">{turn.userText}</p>
                </div>
                {turn.pronunciationIssues.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1 justify-end">
                    {turn.pronunciationIssues.map((w, j) => (
                      <span
                        key={j}
                        title={`Confidence: ${Math.round(w.confidence * 100)}%`}
                        className="text-xs bg-orange-950/60 border border-orange-700/40 text-orange-300 px-2 py-0.5 rounded-full cursor-help"
                      >
                        ⚠ {w.word}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="self-start max-w-[85%]">
                <div className="bg-gray-800/60 border border-gray-700/50 rounded-2xl rounded-bl-sm px-4 py-2.5">
                  <p className="text-gray-100 text-sm">{turn.aiText}</p>
                </div>
              </div>
            </div>
          ))}
          <div ref={conversationEndRef} />
        </div>
      )}

      {/* ── Mic button + status ───────────────────────────────── */}
      {quizPhase === 'none' && (
        <div className="flex flex-col items-center gap-3 py-2">
          <div className="relative">
            {status === 'recording' && (
              <span className="absolute inset-0 rounded-full bg-red-500/40 animate-ping" />
            )}
            <button
              onClick={handleButton}
              disabled={isProcessing}
              className={`relative w-24 h-24 rounded-full text-4xl font-bold text-white shadow-xl transition-all duration-200 ${
                status === 'recording'
                  ? 'bg-red-500 hover:bg-red-400 scale-110'
                  : isProcessing
                  ? 'bg-gray-600 cursor-not-allowed opacity-60'
                  : status === 'playing'
                  ? 'bg-emerald-500 hover:bg-emerald-400'
                  : status === 'error'
                  ? 'bg-orange-500 hover:bg-orange-400'
                  : 'bg-indigo-600 hover:bg-indigo-500'
              }`}
            >
              {status === 'recording'
                ? '⏹'
                : isProcessing
                ? '⋯'
                : status === 'playing'
                ? '🔊'
                : status === 'error'
                ? '↺'
                : '🎙️'}
            </button>
          </div>

          {isProcessing && (
            <div className="flex gap-1.5">
              {(['transcribing', 'thinking', 'speaking'] as const).map((step) => (
                <div
                  key={step}
                  className={`h-1 w-14 rounded-full transition-colors duration-500 ${
                    status === step
                      ? 'bg-indigo-400'
                      : (status === 'thinking' && step === 'transcribing') ||
                        (status === 'speaking' && step !== 'speaking')
                      ? 'bg-indigo-700'
                      : 'bg-gray-700'
                  }`}
                />
              ))}
            </div>
          )}

          <p className="text-gray-500 text-xs min-h-[1rem]">
            {status === 'idle' && (turns.length === 0 ? 'Tap to speak' : 'Tap to continue')}
            {status === 'recording' && 'Listening… tap to stop'}
            {status === 'transcribing' && 'Transcribing…'}
            {status === 'thinking' && 'Thinking…'}
            {status === 'speaking' && 'Generating audio…'}
            {status === 'playing' && 'Playing — tap to stop'}
            {status === 'error' && 'Tap to retry'}
          </p>
        </div>
      )}

      {/* ── Error ─────────────────────────────────────────────── */}
      {status === 'error' && error && quizPhase === 'none' && (
        <div className="bg-red-950/50 border border-red-700/40 rounded-xl p-3">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* ── Word bank ─────────────────────────────────────────── */}
      {wordBank.length > 0 && quizPhase === 'none' && (
        <details className="group">
          <summary className="cursor-pointer list-none flex items-center gap-2 text-xs text-gray-600 hover:text-gray-400 select-none">
            <span className="group-open:rotate-90 inline-block transition-transform">▶</span>
            📚 Word bank — {wordBank.length} to review
          </summary>
          <div className="mt-2 bg-gray-900/60 border border-gray-700/40 rounded-xl p-3 flex flex-wrap gap-2">
            {wordBank.map((w, i) => (
              <span
                key={i}
                title={`Confidence: ${Math.round(w.confidence * 100)}%`}
                className="flex items-center gap-1 text-sm bg-gray-800 border border-gray-700 text-gray-300 px-2.5 py-1 rounded-lg"
              >
                {w.word}
                <span className="text-xs text-gray-600">{Math.round(w.confidence * 100)}%</span>
              </span>
            ))}
          </div>
        </details>
      )}

      {/* ════════════════════════════════════════════════════════ */}
      {/* ── Quiz overlay ──────────────────────────────────────── */}
      {/* ════════════════════════════════════════════════════════ */}

      {quizPhase === 'quiz' && (
        <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="text-center">
            <p className="text-2xl mb-1">🧠</p>
            <h3 className="text-white font-bold text-lg">Pop Quiz!</h3>
            <p className="text-gray-400 text-sm">You found the answer — now prove it.</p>
          </div>

          <div className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-4">
            <p className="text-gray-300 text-sm font-medium">{mission?.description}</p>
          </div>

          <div className="flex flex-col gap-2">
            {shuffledChoices.map((choice, i) => (
              <button
                key={i}
                onClick={() => handleChoice(choice)}
                className="w-full text-left px-4 py-3 rounded-xl border border-gray-700 bg-gray-800/50 hover:bg-indigo-900/40 hover:border-indigo-600 text-gray-200 text-sm transition-all duration-150 active:scale-[0.98]"
              >
                <span className="text-gray-500 mr-2 font-mono text-xs">
                  {String.fromCharCode(65 + i)}
                </span>
                {choice}
              </button>
            ))}
          </div>

          <p className="text-center text-xs text-gray-600">
            Turns taken: {turns.length} · Pronunciation flags: {wordBank.length}
          </p>
        </div>
      )}

      {/* ── Correct answer ────────────────────────────────────── */}
      {quizPhase === 'correct' && (
        <div className="flex flex-col items-center gap-5 py-4 animate-in fade-in zoom-in-95 duration-300">
          <div className="text-6xl animate-bounce">🎉</div>

          <div className="text-center">
            <p className="text-white font-bold text-2xl mb-1">Correct!</p>
            <p className="text-gray-400 text-sm">{mission?.answer}</p>
          </div>

          {/* Stars */}
          <div className="flex gap-1 text-3xl">
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className={`transition-all duration-300 ${
                  s <= starsEarned ? 'opacity-100 scale-110' : 'opacity-20 grayscale'
                }`}
                style={{ transitionDelay: `${s * 100}ms` }}
              >
                ⭐
              </span>
            ))}
          </div>

          {/* XP */}
          <div className="bg-indigo-900/60 border border-indigo-700/50 rounded-2xl px-8 py-4 text-center">
            <p className="text-indigo-300 text-xs uppercase tracking-widest mb-1">XP Earned</p>
            <p className="text-white font-bold text-4xl">+{xpEarned}</p>
          </div>

          {/* Breakdown */}
          <div className="w-full bg-gray-900/40 border border-gray-800 rounded-xl p-3 text-xs text-gray-500 flex justify-around">
            <span>
              Turns:{' '}
              <span className={turns.length <= 3 ? 'text-emerald-400' : 'text-gray-400'}>
                {turns.length} {turns.length <= 3 ? '🔥' : ''}
              </span>
            </span>
            <span>
              Pronunciation flags:{' '}
              <span className={wordBank.length === 0 ? 'text-emerald-400' : 'text-orange-400'}>
                {wordBank.length}
              </span>
            </span>
          </div>

          <button
            onClick={handleReset}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-colors"
          >
            Play again
          </button>
        </div>
      )}

      {/* ── Wrong answer ──────────────────────────────────────── */}
      {quizPhase === 'wrong' && (
        <div className="flex flex-col items-center gap-5 py-4 animate-in fade-in zoom-in-95 duration-300">
          <div className="text-5xl">😬</div>

          <div className="text-center">
            <p className="text-white font-bold text-xl mb-1">Not quite!</p>
            <p className="text-gray-400 text-sm">
              You picked: <span className="text-red-400">{selectedChoice}</span>
            </p>
          </div>

          <div className="w-full bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-sm text-gray-300">
            Go back to the conversation and ask for more details — the answer is in there!
          </div>

          <div className="flex flex-col gap-2 w-full">
            <button
              onClick={handleRetry}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-colors"
            >
              Keep talking to the bot
            </button>
            <button
              onClick={() => {
                setQuizPhase('quiz');
                setSelectedChoice(null);
              }}
              className="w-full py-3 rounded-xl border border-gray-700 hover:border-gray-600 text-gray-400 text-sm transition-colors"
            >
              Try the quiz again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
