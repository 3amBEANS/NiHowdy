import { useState, useRef, useEffect, useCallback } from 'react'
import { BookOpen, Play, Star, Loader2, X, ChevronRight, RotateCcw, Volume2 } from 'lucide-react'

// ── types ─────────────────────────────────────────────────────────────────

interface ProcessedWord {
  text: string
  difficulty: number // 1 (easiest) – 5 (hardest)
  translation?: string
}

interface ProcessedSegment {
  start: number
  duration: number
  originalText: string
  translatedText: string
  words: ProcessedWord[]
}

interface VideoAnalysis {
  overallDifficulty: number
  targetLanguage: string
  segments: ProcessedSegment[]
}

interface WordBankEntry {
  word: string
  translation: string
  context: string
  difficulty: number
  addedAt: number
}

type PageStatus = 'idle' | 'fetching' | 'analyzing' | 'ready' | 'error'
type ActiveTab = 'video' | 'wordbank' | 'quiz'

// ── YouTube IFrame hook ───────────────────────────────────────────────────

declare global {
  interface Window {
    YT: {
      Player: new (
        el: string | HTMLElement,
        opts: {
          videoId: string
          playerVars?: Record<string, number | string>
          events?: {
            onReady?: (e: { target: YTPlayer }) => void
            onStateChange?: (e: { data: number }) => void
          }
        }
      ) => YTPlayer
      PlayerState: { PLAYING: number; PAUSED: number; ENDED: number }
    }
    onYouTubeIframeAPIReady?: () => void
  }
}

interface YTPlayer {
  getCurrentTime: () => number
  getPlayerState: () => number
  destroy: () => void
}

function useYouTubePlayer(
  containerId: string,
  videoId: string | null,
  onTimeUpdate: (t: number) => void
) {
  const playerRef = useRef<YTPlayer | null>(null)
  const rafRef = useRef<number>(0)
  const [ready, setReady] = useState(false)

  // Inject YT IFrame API script once
  useEffect(() => {
    if (document.getElementById('yt-api-script')) return
    const script = document.createElement('script')
    script.id = 'yt-api-script'
    script.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(script)
  }, [])

  // Build/destroy player when videoId changes
  useEffect(() => {
    if (!videoId) return
    setReady(false)

    const init = () => {
      playerRef.current?.destroy()
      playerRef.current = new window.YT.Player(containerId, {
        videoId,
        playerVars: { rel: 0, modestbranding: 1, cc_load_policy: 0 },
        events: {
          onReady: () => setReady(true),
          onStateChange: (e) => {
            cancelAnimationFrame(rafRef.current)
            if (e.data === window.YT.PlayerState.PLAYING) tick()
          },
        },
      })
    }

    if (window.YT?.Player) {
      init()
    } else {
      window.onYouTubeIframeAPIReady = init
    }

    return () => {
      cancelAnimationFrame(rafRef.current)
      playerRef.current?.destroy()
      playerRef.current = null
    }
  }, [videoId, containerId]) // eslint-disable-line react-hooks/exhaustive-deps

  const tick = useCallback(() => {
    if (playerRef.current) {
      onTimeUpdate(playerRef.current.getCurrentTime())
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [onTimeUpdate])

  return { ready }
}

// ── helpers ───────────────────────────────────────────────────────────────

function extractVideoId(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname === 'youtu.be') return u.pathname.slice(1).split('?')[0]
    if (u.hostname.includes('youtube.com')) return u.searchParams.get('v')
  } catch {
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url
  }
  return null
}

const DIFF_COLORS: Record<number, string> = {
  1: 'text-emerald-300',
  2: 'text-sky-300',
  3: 'text-yellow-300',
  4: 'text-orange-300',
  5: 'text-red-400',
}

const DIFF_BG: Record<number, string> = {
  1: 'bg-emerald-900/60 border-emerald-700/40',
  2: 'bg-sky-900/60 border-sky-700/40',
  3: 'bg-yellow-900/60 border-yellow-700/40',
  4: 'bg-orange-900/60 border-orange-700/40',
  5: 'bg-red-900/60 border-red-700/40',
}

const LANGUAGES = [
  { code: 'ja', label: '🇯🇵 Japanese' },
  { code: 'zh', label: '🇨🇳 Mandarin' },
  { code: 'ko', label: '🇰🇷 Korean' },
  { code: 'es', label: '🇪🇸 Spanish' },
  { code: 'fr', label: '🇫🇷 French' },
  { code: 'en', label: '🇬🇧 English' },
]

// ── Quiz component ─────────────────────────────────────────────────────────

function WordBankQuiz({
  wordBank,
  onClose,
}: {
  wordBank: WordBankEntry[]
  onClose: () => void
}) {
  const [idx, setIdx] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [done, setDone] = useState(false)

  const shuffled = useRef([...wordBank].sort(() => Math.random() - 0.5))
  const current = shuffled.current[idx]

  const advance = (correct: boolean) => {
    setScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
    setRevealed(false)
    if (idx + 1 >= shuffled.current.length) {
      setDone(true)
    } else {
      setIdx((i) => i + 1)
    }
  }

  if (done) {
    const pct = Math.round((score.correct / score.total) * 100)
    return (
      <div className="flex flex-col items-center gap-5 py-8">
        <div className="text-5xl">{pct >= 80 ? '🎉' : pct >= 50 ? '💪' : '📖'}</div>
        <h3 className="text-xl font-bold text-foreground">Quiz Complete!</h3>
        <p className="text-muted-foreground">
          {score.correct} / {score.total} correct ({pct}%)
        </p>
        <button
          onClick={onClose}
          className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-500"
        >
          Back to word bank
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Card {idx + 1} / {shuffled.current.length}</span>
        <span className="text-emerald-400">{score.correct} correct</span>
      </div>

      <div
        className="min-h-[140px] rounded-2xl border border-border bg-accent/60 p-6 flex flex-col items-center justify-center gap-3 cursor-pointer select-none"
        onClick={() => setRevealed(true)}
      >
        <p className="text-2xl font-bold text-foreground">{current?.word}</p>
        <p className="text-xs text-muted-foreground">from: {current?.context}</p>
        {!revealed && (
          <p className="text-xs text-muted-foreground mt-2">Tap to reveal translation</p>
        )}
        {revealed && (
          <p className="text-lg text-indigo-400 mt-2">{current?.translation || '—'}</p>
        )}
      </div>

      {revealed && (
        <div className="flex gap-3">
          <button
            onClick={() => advance(false)}
            className="flex-1 rounded-xl border border-red-800/60 bg-red-950/40 py-3 text-sm text-red-300 hover:bg-red-900/40"
          >
            ✗ Not yet
          </button>
          <button
            onClick={() => advance(true)}
            className="flex-1 rounded-xl bg-emerald-800/60 py-3 text-sm text-emerald-200 hover:bg-emerald-700/60"
          >
            ✓ Got it
          </button>
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────

export default function VideoLearningPage() {
  const [urlInput, setUrlInput] = useState('')
  const [videoId, setVideoId] = useState<string | null>(null)
  const [targetLang, setTargetLang] = useState('ja')
  const [status, setStatus] = useState<PageStatus>('idle')
  const [statusMsg, setStatusMsg] = useState('')
  const [analysis, setAnalysis] = useState<VideoAnalysis | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [userDifficulty, setUserDifficulty] = useState(3)
  const [wordBank, setWordBank] = useState<WordBankEntry[]>([])
  const [activeTab, setActiveTab] = useState<ActiveTab>('video')
  const [showQuiz, setShowQuiz] = useState(false)
  const [tooltip, setTooltip] = useState<{ word: ProcessedWord; x: number; y: number } | null>(null)

  const { ready: playerReady } = useYouTubePlayer('yt-player', videoId, setCurrentTime)

  // Current subtitle segment
  const currentSegment = analysis?.segments.find(
    (s) => currentTime >= s.start && currentTime < s.start + s.duration
  ) ?? null

  const handleLoad = useCallback(async () => {
    const id = extractVideoId(urlInput.trim())
    if (!id) {
      setStatus('error')
      setStatusMsg('Could not find a valid YouTube video ID in that URL.')
      return
    }

    setStatus('fetching')
    setStatusMsg('Fetching transcript from YouTube…')
    setAnalysis(null)
    setVideoId(id)
    setActiveTab('video')

    try {
      const res = await fetch('/api/video/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: urlInput.trim(),
          targetLanguage: LANGUAGES.find((l) => l.code === targetLang)?.label.slice(3) ?? 'Japanese',
          nativeLanguage: 'English',
        }),
      })

      if (!res.body) throw new Error('No response body')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          let ev: { step: string; error?: string; count?: number; videoId?: string; analysis?: VideoAnalysis }
          try { ev = JSON.parse(line.slice(6)) } catch { continue }

          if (ev.step === 'fetching') {
            setStatus('fetching')
            setStatusMsg('Transcript fetched — sending to Gemini for analysis…')
          } else if (ev.step === 'analyzing') {
            setStatus('analyzing')
            setStatusMsg(`Analyzing ${ev.count} subtitle segments…`)
          } else if (ev.step === 'done' && ev.analysis) {
            setAnalysis(ev.analysis)
            setStatus('ready')
          } else if (ev.step === 'error') {
            setStatus('error')
            setStatusMsg(ev.error ?? 'Something went wrong.')
          }
        }
      }
    } catch (err) {
      setStatus('error')
      setStatusMsg(err instanceof Error ? err.message : 'Network error')
    }
  }, [urlInput, targetLang])

  const addToWordBank = (word: ProcessedWord, context: string) => {
    setWordBank((prev) => {
      if (prev.some((w) => w.word === word.text)) return prev
      return [
        {
          word: word.text,
          translation: word.translation ?? '',
          context,
          difficulty: word.difficulty,
          addedAt: Date.now(),
        },
        ...prev,
      ]
    })
    setTooltip(null)
  }

  const removeFromWordBank = (word: string) => {
    setWordBank((prev) => prev.filter((w) => w.word !== word))
  }

  // Close tooltip on outside click
  useEffect(() => {
    const handler = () => setTooltip(null)
    window.addEventListener('click', handler)
    return () => window.removeEventListener('click', handler)
  }, [])

  const renderWord = (word: ProcessedWord, _segmentText: string, wIdx: number) => {
    const inRange = word.difficulty <= userDifficulty
    const color = inRange ? DIFF_COLORS[word.difficulty] : 'text-muted-foreground/50'
    const inBank = wordBank.some((w) => w.word === word.text)

    return (
      <span
        key={wIdx}
        onClick={(e) => {
          e.stopPropagation()
          if (!inRange) return
          setTooltip((prev) =>
            prev?.word.text === word.text
              ? null
              : { word, x: e.clientX, y: e.clientY }
          )
        }}
        className={`relative inline-block cursor-pointer rounded px-0.5 transition-colors ${color} ${
          inRange ? 'hover:bg-white/10' : ''
        } ${inBank ? 'underline decoration-dotted' : ''}`}
      >
        {word.text}{' '}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Floating word tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 rounded-xl border border-border bg-card p-3 shadow-2xl w-56"
          style={{ left: Math.min(tooltip.x, window.innerWidth - 240), top: tooltip.y + 12 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`font-bold text-base ${DIFF_COLORS[tooltip.word.difficulty]}`}>
              {tooltip.word.text}
            </span>
            <span className={`text-xs px-1.5 py-0.5 rounded border ${DIFF_BG[tooltip.word.difficulty]} ${DIFF_COLORS[tooltip.word.difficulty]}`}>
              L{tooltip.word.difficulty}
            </span>
          </div>
          {tooltip.word.translation && (
            <p className="text-sm text-foreground mb-2">{tooltip.word.translation}</p>
          )}
          <button
            onClick={() => addToWordBank(tooltip.word, currentSegment?.originalText ?? '')}
            disabled={wordBank.some((w) => w.word === tooltip.word.text)}
            className="w-full rounded-lg bg-indigo-600 py-1.5 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-default"
          >
            {wordBank.some((w) => w.word === tooltip.word.text)
              ? '✓ In word bank'
              : '+ Add to word bank'}
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600">
          <Play className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Video Learning</h1>
          <p className="text-sm text-muted-foreground">
            Watch YouTube videos with AI-powered dual subtitles and vocabulary tracking
          </p>
        </div>
      </div>

      {/* URL + language input */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              YouTube URL
            </label>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLoad()}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div className="sm:w-44">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Language in video
            </label>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-indigo-500 focus:outline-none"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleLoad}
            disabled={!urlInput || status === 'fetching' || status === 'analyzing'}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {(status === 'fetching' || status === 'analyzing')
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Loading…</>
              : <><ChevronRight className="h-4 w-4" /> Load video</>}
          </button>
        </div>

        {/* Status messages */}
        {(status === 'fetching' || status === 'analyzing') && (
          <p className="mt-3 flex items-center gap-2 text-xs text-indigo-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            {statusMsg}
          </p>
        )}
        {status === 'error' && (
          <p className="mt-3 text-xs text-red-400">⚠ {statusMsg}</p>
        )}
      </div>

      {/* Main content: only show once we have a videoId */}
      {videoId && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">

          {/* Left column */}
          <div className="flex flex-col gap-4">

            {/* YouTube embed */}
            <div className="relative w-full overflow-hidden rounded-2xl bg-black" style={{ aspectRatio: '16/9' }}>
              <div id="yt-player" className="absolute inset-0 w-full h-full" />
              {!playerReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Difficulty slider */}
            {analysis && (
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Subtitle difficulty
                  </p>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map((n) => (
                      <Star
                        key={n}
                        className={`h-4 w-4 ${n <= analysis.overallDifficulty ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
                      />
                    ))}
                    <span className="ml-1 text-xs text-muted-foreground">video difficulty</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={userDifficulty}
                  onChange={(e) => setUserDifficulty(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Beginner (A1)</span>
                  <span className="text-indigo-400 font-medium">Level {userDifficulty}</span>
                  <span>Advanced (C2)</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Words above your level are grayed out. Click highlighted words for translations.
                </p>
                {/* Difficulty legend */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {[1,2,3,4,5].map((n) => (
                    <span key={n} className={`flex items-center gap-1 text-xs ${DIFF_COLORS[n]}`}>
                      <span className={`h-2 w-2 rounded-full inline-block bg-current`} />
                      L{n}: {['A1','A2','B1','B2','C1+'][n-1]}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Subtitles */}
            {analysis && (
              <div className="rounded-2xl border border-border bg-card/80 p-4 min-h-30">
                <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  <Volume2 className="h-3.5 w-3.5" />
                  Live subtitles
                  {wordBank.length > 0 && (
                    <span className="ml-auto text-indigo-400">{wordBank.length} saved</span>
                  )}
                </div>

                {currentSegment ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-lg leading-relaxed text-foreground">
                      {currentSegment.words.map((w, i) =>
                        renderWord(w, currentSegment.originalText, i)
                      )}
                    </p>
                    {currentSegment.translatedText && (
                      <p className="text-sm text-muted-foreground italic">
                        {currentSegment.translatedText}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    {status === 'ready'
                      ? 'Play the video — subtitles will appear here.'
                      : 'Subtitles load after analysis completes.'}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right column: tabs */}
          <div className="flex flex-col gap-4">

            {/* Tab buttons */}
            <div className="flex rounded-xl border border-border bg-card p-1 gap-1">
              {(['video', 'wordbank', 'quiz'] as ActiveTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setShowQuiz(false) }}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-medium capitalize transition-colors ${
                    activeTab === tab
                      ? 'bg-indigo-600 text-white'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab === 'wordbank' ? `Bank (${wordBank.length})` : tab}
                </button>
              ))}
            </div>

            {/* Video info tab */}
            {activeTab === 'video' && analysis && (
              <div className="rounded-2xl border border-border bg-card p-4 flex flex-col gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                    Overall difficulty
                  </p>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map((n) => (
                      <Star
                        key={n}
                        className={`h-5 w-5 ${n <= analysis.overallDifficulty ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
                      />
                    ))}
                    <span className="ml-2 text-sm text-muted-foreground">
                      {['', 'Beginner', 'Elementary', 'Intermediate', 'Upper-Int.', 'Advanced'][analysis.overallDifficulty]}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                    Language
                  </p>
                  <p className="text-sm text-foreground">{analysis.targetLanguage}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                    Subtitles loaded
                  </p>
                  <p className="text-sm text-foreground">{analysis.segments.length} segments</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Click any highlighted word while the video plays to get its translation and add it to your word bank.
                </p>
              </div>
            )}

            {/* Word bank tab */}
            {activeTab === 'wordbank' && (
              <div className="rounded-2xl border border-border bg-card p-4 flex flex-col gap-3">
                {showQuiz ? (
                  <WordBankQuiz wordBank={wordBank} onClose={() => setShowQuiz(false)} />
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">
                        {wordBank.length === 0 ? 'No words saved yet' : `${wordBank.length} words`}
                      </p>
                      {wordBank.length > 0 && (
                        <button
                          onClick={() => setShowQuiz(true)}
                          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500"
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                          Quiz me
                        </button>
                      )}
                    </div>

                    {wordBank.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        Play the video and click on highlighted words to add them here.
                      </p>
                    ) : (
                      <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
                        {wordBank.map((entry) => (
                          <div
                            key={entry.word}
                            className={`rounded-xl border p-3 ${DIFF_BG[entry.difficulty]}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className={`font-semibold text-sm ${DIFF_COLORS[entry.difficulty]}`}>
                                  {entry.word}
                                </p>
                                {entry.translation && (
                                  <p className="text-xs text-muted-foreground mt-0.5">{entry.translation}</p>
                                )}
                                {entry.context && (
                                  <p className="text-xs text-muted-foreground/70 mt-1 truncate">
                                    "{entry.context}"
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={() => removeFromWordBank(entry.word)}
                                className="shrink-0 text-muted-foreground/50 hover:text-muted-foreground"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Quiz tab (shortcut) */}
            {activeTab === 'quiz' && (
              <div className="rounded-2xl border border-border bg-card p-4">
                {wordBank.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-6 text-center">
                    <BookOpen className="h-8 w-8 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">
                      Your word bank is empty. Click words in the subtitles to save them, then come back to quiz yourself.
                    </p>
                  </div>
                ) : (
                  <WordBankQuiz wordBank={wordBank} onClose={() => setActiveTab('wordbank')} />
                )}
              </div>
            )}

            {/* Full transcript scroll */}
            {activeTab === 'video' && analysis && (
              <div className="rounded-2xl border border-border bg-card p-4 flex-1">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Full transcript
                  </p>
                  <button
                    onClick={() => setAnalysis(null)}
                    className="text-xs text-muted-foreground/50 hover:text-muted-foreground flex items-center gap-1"
                  >
                    <RotateCcw className="h-3 w-3" /> Clear
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto flex flex-col gap-1.5">
                  {analysis.segments.map((seg, i) => {
                    const isActive = currentTime >= seg.start && currentTime < seg.start + seg.duration
                    return (
                      <p
                        key={i}
                        className={`text-xs transition-colors rounded px-1 py-0.5 ${
                          isActive ? 'bg-indigo-900/40 text-indigo-200' : 'text-muted-foreground/50'
                        }`}
                      >
                        {seg.originalText}
                      </p>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!videoId && status === 'idle' && (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-900/30 border border-red-800/30">
            <Play className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Paste a YouTube link to get started</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            The AI will fetch captions, assess vocabulary difficulty (1–5), translate each line to English,
            and sync them to the video. Click any word for its meaning and save it to your personal word bank.
          </p>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left max-w-xl">
            {[
              { icon: '🎬', title: 'YouTube player', desc: 'Watch the video inline with synced dual subtitles' },
              { icon: '📊', title: 'Difficulty rating', desc: 'Each word tagged A1→C2, filter by your level' },
              { icon: '📚', title: 'Word bank + quiz', desc: 'Save words, then test yourself with flashcards' },
            ].map((f) => (
              <div key={f.title} className="rounded-xl border border-border bg-card p-3">
                <p className="text-lg mb-1">{f.icon}</p>
                <p className="text-sm font-medium text-foreground">{f.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
