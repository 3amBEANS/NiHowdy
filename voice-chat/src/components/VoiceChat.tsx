'use client';

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
  /** Shown to the learner as the goal */
  description: string;
  /** Optional hint shown below the description */
  hint?: string;
  /**
   * Context passed to the AI so it knows what information to hold back and
   * eventually reveal. Keep this out of the UI — it's for the system prompt only.
   */
  missionContext?: string;
}

export interface VoiceChatProps {
  /** BCP-47 language code: 'en' | 'zh' | 'ja' | 'ko' | 'es' | 'fr' */
  language?: string;
  /** Human-readable language name, e.g. "Mandarin Chinese" */
  languageName?: string;
  /** Optional mission / goal for the session */
  mission?: Mission;
  /** API endpoint to call. Defaults to /api/voice */
  apiEndpoint?: string;
  /** Called when the AI decides the mission is complete */
  onMissionComplete?: (reason: string) => void;
}

// ── constants ──────────────────────────────────────────────────────────────

const LANG_NAMES: Record<string, string> = {
  en: 'English',
  zh: 'Mandarin Chinese',
  ja: 'Japanese',
  ko: 'Korean',
  es: 'Spanish',
  fr: 'French',
};

// Confidence below this threshold → flag as likely pronunciation issue
const CONFIDENCE_THRESHOLD = 0.75;

// ── component ──────────────────────────────────────────────────────────────

export function VoiceChat({
  language = 'en',
  languageName,
  mission,
  apiEndpoint = '/api/voice',
  onMissionComplete,
}: VoiceChatProps) {
  const langLabel = languageName ?? LANG_NAMES[language] ?? language;

  const [status, setStatus] = useState<Status>('idle');
  const [turns, setTurns] = useState<ConversationTurn[]>([]);
  // Accumulated word bank across the whole session
  const [wordBank, setWordBank] = useState<WordResult[]>([]);
  const [missionDone, setMissionDone] = useState(false);
  const [missionReason, setMissionReason] = useState('');
  const [error, setError] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const mimeTypeRef = useRef('audio/webm');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const conversationEndRef = useRef<HTMLDivElement | null>(null);

  // Derive history from turns for the API
  const buildHistory = (currentTurns: ConversationTurn[]) =>
    currentTurns.flatMap((t) => [
      { role: 'user' as const, content: t.userText },
      { role: 'model' as const, content: t.aiText },
    ]);

  // Auto-scroll conversation
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
      // Send current conversation history so the AI has context
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
      // Will be filled as SSE events arrive
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

              // Commit the turn
              const completedTurn: ConversationTurn = {
                userText: pendingTurn.userText ?? '',
                aiText: pendingTurn.aiText ?? ev.response ?? '',
                pronunciationIssues: ev.pronunciationIssues ?? pendingTurn.pronunciationIssues ?? [],
              };
              setTurns((prev) => [...prev, completedTurn]);

              // Add new low-confidence words to the word bank (dedupe by word)
              if (ev.pronunciationIssues?.length) {
                setWordBank((prev) => {
                  const existing = new Set(prev.map((w) => w.word));
                  const newWords = ev.pronunciationIssues!.filter(
                    (w) => !existing.has(w.word)
                  );
                  return [...prev, ...newWords];
                });
              }

              // Mission check
              if (ev.missionComplete && !missionDone) {
                setMissionDone(true);
                setMissionReason(ev.missionReason ?? '');
                onMissionComplete?.(ev.missionReason ?? '');
              }

              setStatus('playing');
              const audio = new Audio(`data:audio/mpeg;base64,${ev.audio}`);
              audioRef.current = audio;
              audio.onended = () => setStatus('idle');
              audio.onerror = () => {
                setError('Failed to play audio response.');
                setStatus('error');
              };
              audio.play().catch(() => {
                setError('Browser blocked autoplay — tap the play button to hear the response.');
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
    [language, mission, turns, apiEndpoint, missionDone, onMissionComplete]
  );

  // ── button handler ────────────────────────────────────────────────────────

  const handleButton = () => {
    if (status === 'idle' || status === 'error') startRecording();
    else if (status === 'recording') stopRecording();
    else if (status === 'playing') {
      audioRef.current?.pause();
      setStatus('idle');
    }
  };

  const isProcessing = ['transcribing', 'thinking', 'speaking'].includes(status);
  const canPress = !isProcessing;

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col w-full max-w-lg gap-4">
      {/* ── Language badge ───────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <span className="text-xs uppercase tracking-widest text-gray-500 font-medium">
          Practicing
        </span>
        <span className="bg-indigo-900/60 border border-indigo-700/50 text-indigo-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">
          {langLabel}
        </span>
      </div>

      {/* ── Mission card ─────────────────────────────────────────── */}
      {mission && (
        <div
          className={`rounded-2xl p-4 border transition-colors ${
            missionDone
              ? 'bg-emerald-950/60 border-emerald-600/50'
              : 'bg-amber-950/40 border-amber-700/40'
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="text-xl">{missionDone ? '✅' : '🎯'}</span>
            <div>
              <p className="text-xs uppercase tracking-widest text-amber-500/80 mb-1">
                {missionDone ? 'Mission complete!' : 'Mission'}
              </p>
              <p className="text-gray-100 text-sm font-medium">{mission.description}</p>
              {mission.hint && !missionDone && (
                <p className="text-gray-500 text-xs mt-1">Hint: {mission.hint}</p>
              )}
              {missionDone && missionReason && (
                <p className="text-emerald-400 text-xs mt-1">{missionReason}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Conversation history ──────────────────────────────────── */}
      {turns.length > 0 && (
        <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
          {turns.map((turn, i) => (
            <div key={i} className="flex flex-col gap-2">
              {/* User bubble */}
              <div className="self-end max-w-[85%]">
                <div className="bg-indigo-700/40 border border-indigo-600/30 rounded-2xl rounded-br-sm px-4 py-2.5">
                  <p className="text-gray-100 text-sm">{turn.userText}</p>
                </div>
                {/* Pronunciation issues for this turn */}
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

              {/* AI bubble */}
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

      {/* ── Mic button + status ───────────────────────────────────── */}
      <div className="flex flex-col items-center gap-3 py-2">
        <div className="relative">
          {status === 'recording' && (
            <span className="absolute inset-0 rounded-full bg-red-500/40 animate-ping" />
          )}
          <button
            onClick={handleButton}
            disabled={!canPress}
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

        {/* Step progress bar */}
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
          {status === 'idle' && 'Tap to speak'}
          {status === 'recording' && 'Listening… tap to stop'}
          {status === 'transcribing' && 'Transcribing…'}
          {status === 'thinking' && 'Thinking…'}
          {status === 'speaking' && 'Generating audio…'}
          {status === 'playing' && 'Playing — tap to stop'}
          {status === 'error' && 'Tap to retry'}
        </p>
      </div>

      {/* ── Error ────────────────────────────────────────────────── */}
      {status === 'error' && error && (
        <div className="bg-red-950/50 border border-red-700/40 rounded-xl p-3">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* ── Pronunciation word bank ───────────────────────────────── */}
      {wordBank.length > 0 && (
        <details className="group" open={false}>
          <summary className="cursor-pointer list-none flex items-center gap-2 text-xs text-gray-500 hover:text-gray-400 select-none">
            <span className="group-open:rotate-90 inline-block transition-transform">▶</span>
            📚 Pronunciation word bank ({wordBank.length} word{wordBank.length !== 1 ? 's' : ''} to review)
          </summary>
          <div className="mt-2 bg-gray-900/60 border border-gray-700/40 rounded-xl p-3">
            <p className="text-xs text-gray-600 mb-2">
              Words where Deepgram had low confidence — worth practising:
            </p>
            <div className="flex flex-wrap gap-2">
              {wordBank.map((w, i) => (
                <span
                  key={i}
                  title={`Confidence: ${Math.round(w.confidence * 100)}%`}
                  className="flex items-center gap-1 text-sm bg-gray-800 border border-gray-700 text-gray-300 px-2.5 py-1 rounded-lg"
                >
                  {w.word}
                  <span className="text-xs text-gray-600">
                    {Math.round(w.confidence * 100)}%
                  </span>
                </span>
              ))}
            </div>
          </div>
        </details>
      )}
    </div>
  );
}
