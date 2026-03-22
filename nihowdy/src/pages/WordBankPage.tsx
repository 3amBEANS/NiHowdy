import { useState, useRef } from 'react'
import { BookOpen, Trash2, X, Play, RotateCcw } from 'lucide-react'
import { useWordBank, type WordBankItem } from '@/hooks/useWordBank'

// ── Difficulty helpers ──────────────────────────────────────────────────────

const DIFF_LABEL: Record<number, string> = {
  1: 'A1', 2: 'A2', 3: 'B1', 4: 'B2', 5: 'C1+',
}

const DIFF_COLORS: Record<number, string> = {
  1: 'text-indigo-500', 2: 'text-indigo-600', 3: 'text-violet-600',
  4: 'text-purple-600', 5: 'text-fuchsia-600',
}

const DIFF_BG: Record<number, string> = {
  1: 'bg-indigo-50 border-indigo-200',
  2: 'bg-indigo-100 border-indigo-300',
  3: 'bg-violet-50 border-violet-200',
  4: 'bg-purple-50 border-purple-200',
  5: 'bg-fuchsia-50 border-fuchsia-200',
}

// ── Assessment (flashcard quiz) ─────────────────────────────────────────────

function Assessment({
  words,
  onClose,
}: {
  words: WordBankItem[]
  onClose: () => void
}) {
  const shuffled = useRef([...words].sort(() => Math.random() - 0.5))
  const [idx, setIdx] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [done, setDone] = useState(false)

  const current = shuffled.current[idx]

  const advance = (correct: boolean) => {
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
    setRevealed(false)
    if (idx + 1 >= shuffled.current.length) {
      setDone(true)
    } else {
      setIdx(i => i + 1)
    }
  }

  if (done) {
    const pct = Math.round((score.correct / score.total) * 100)
    return (
      <div className="flex flex-col items-center gap-6 py-10">
        <div className="text-6xl">{pct >= 80 ? '🎉' : pct >= 50 ? '💪' : '📖'}</div>
        <div className="text-center">
          <h3 className="text-2xl font-bold text-foreground">Assessment Complete!</h3>
          <p className="text-muted-foreground mt-1">
            {score.correct} / {score.total} correct &nbsp;·&nbsp; {pct}%
          </p>
        </div>
        {pct >= 80 && (
          <p className="text-sm text-emerald-600">Great recall! Keep it up.</p>
        )}
        {pct < 50 && (
          <p className="text-sm text-indigo-500">Review these words a few more times.</p>
        )}
        <button
          onClick={onClose}
          className="rounded-xl bg-indigo-600 px-8 py-3 text-sm font-medium text-white hover:bg-indigo-500"
        >
          Back to word bank
        </button>
      </div>
    )
  }

  const diff = current?.difficulty ?? 3
  const isVoice = current?.source === 'voice'

  return (
    <div className="flex flex-col gap-5 max-w-lg mx-auto">
      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all"
            style={{ width: `${((idx) / shuffled.current.length) * 100}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground shrink-0">
          {idx + 1} / {shuffled.current.length}
        </span>
        <span className="text-xs text-emerald-400 shrink-0">{score.correct} ✓</span>
      </div>

      {/* Source badge */}
      <div className="flex items-center gap-2">
        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
          isVoice
            ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
            : `${DIFF_BG[diff]} ${DIFF_COLORS[diff]}`
        }`}>
          {isVoice ? '🎙 Voice' : `📹 Video · L${diff} ${DIFF_LABEL[diff]}`}
        </span>
        {current?.language && (
          <span className="text-xs text-muted-foreground">{current.language}</span>
        )}
      </div>

      {/* Card */}
      <div
        onClick={() => !revealed && setRevealed(true)}
        className={`min-h-[160px] rounded-2xl border p-6 flex flex-col items-center justify-center gap-3 ${
          revealed ? 'border-border bg-accent/40' : 'border-border bg-accent/60 cursor-pointer hover:bg-accent/80'
        } transition-colors select-none`}
      >
        <p className="text-3xl font-bold text-foreground tracking-wide">{current?.word}</p>

        {!revealed && (
          <p className="text-xs text-muted-foreground mt-1">
            {isVoice ? 'Tap to see IPA & pronunciation tip' : 'Tap to reveal meaning'}
          </p>
        )}

        {revealed && (
          <div className="flex flex-col items-center gap-2 mt-2 w-full">
            {isVoice ? (
              <>
                {current?.ipa && (
                  <p className="text-lg text-indigo-400 font-mono">{current.ipa}</p>
                )}
                {current?.tip && (
                  <p className="text-sm text-muted-foreground text-center">{current.tip}</p>
                )}
                {current?.confidence !== undefined && (
                  <p className="text-xs text-violet-500">
                    Speech confidence: {Math.round(current.confidence * 100)}%
                  </p>
                )}
              </>
            ) : (
              <>
                {current?.translation && (
                  <p className="text-xl text-indigo-400">{current.translation}</p>
                )}
                {current?.context && (
                  <p className="text-xs text-muted-foreground/70 italic text-center">
                    "{current.context}"
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      {revealed ? (
        <div className="flex gap-3">
          <button
            onClick={() => advance(false)}
            className="flex-1 rounded-xl border border-red-200 bg-red-50 py-3 text-sm text-red-600 hover:bg-red-100"
          >
            ✗ Not yet
          </button>
          <button
            onClick={() => advance(true)}
            className="flex-1 rounded-xl bg-emerald-500 py-3 text-sm text-white hover:bg-emerald-600"
          >
            ✓ Got it
          </button>
        </div>
      ) : (
        <button
          onClick={() => setRevealed(true)}
          className="w-full rounded-xl border border-border bg-accent/40 py-3 text-sm text-muted-foreground hover:bg-accent/60"
        >
          Reveal answer
        </button>
      )}
    </div>
  )
}

// ── Word card ───────────────────────────────────────────────────────────────

function WordCard({ item, onRemove }: { item: WordBankItem; onRemove: () => void }) {
  const diff = item.difficulty ?? 3
  const isVoice = item.source === 'voice'

  return (
    <div className={`rounded-xl border p-4 flex items-start gap-3 ${
      isVoice
        ? 'bg-indigo-50 border-indigo-200'
        : DIFF_BG[diff]
    }`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className={`font-bold text-base ${isVoice ? 'text-indigo-700' : DIFF_COLORS[diff]}`}>
            {item.word}
          </span>
          {item.language && (
            <span className="text-xs text-slate-400">{item.language}</span>
          )}
          <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${
            isVoice
              ? 'bg-indigo-100 border-indigo-300 text-indigo-600'
              : `${DIFF_BG[diff]} ${DIFF_COLORS[diff]}`
          }`}>
            {isVoice ? '🎙 Voice' : `📹 L${diff}`}
          </span>
        </div>

        {isVoice ? (
          <div className="flex flex-col gap-0.5">
            {item.ipa && (
              <p className="text-sm text-indigo-600 font-mono">{item.ipa}</p>
            )}
            {item.tip && (
              <p className="text-xs text-slate-500">{item.tip}</p>
            )}
            {item.confidence !== undefined && (
              <p className="text-xs text-violet-500">
                Confidence: {Math.round(item.confidence * 100)}%
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {item.translation && (
              <p className="text-sm text-slate-600">{item.translation}</p>
            )}
            {item.context && (
              <p className="text-xs text-slate-400 italic truncate">
                "{item.context}"
              </p>
            )}
          </div>
        )}
      </div>

      <button
        onClick={onRemove}
        className="shrink-0 text-muted-foreground/40 hover:text-muted-foreground mt-0.5"
        title="Remove from word bank"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

// ── Main page ───────────────────────────────────────────────────────────────

type FilterTab = 'all' | 'video' | 'voice'

export default function WordBankPage() {
  const { items, removeItem, clearAll } = useWordBank()
  const [filter, setFilter] = useState<FilterTab>('all')
  const [assessing, setAssessing] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const filtered = filter === 'all'
    ? items
    : items.filter(i => i.source === filter)

  const videoCount = items.filter(i => i.source === 'video').length
  const voiceCount = items.filter(i => i.source === 'voice').length

  if (assessing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAssessing(false)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4" />
            Back
          </button>
          <h2 className="text-lg font-semibold text-foreground">Assessment</h2>
          <span className="text-xs text-muted-foreground">
            {filtered.length} words
          </span>
        </div>
        <Assessment words={filtered} onClose={() => setAssessing(false)} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
          <BookOpen className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Word Bank</h1>
          <p className="text-sm text-muted-foreground">
            Your struggling words from video & voice practice
          </p>
        </div>
      </div>

      {/* Stats bar */}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-3">
          <div className="rounded-xl border border-border bg-card px-4 py-2 text-center">
            <p className="text-2xl font-bold text-foreground">{items.length}</p>
            <p className="text-xs text-muted-foreground">Total words</p>
          </div>
          <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-center">
            <p className="text-2xl font-bold text-indigo-600">{videoCount}</p>
            <p className="text-xs text-slate-500">From video</p>
          </div>
          <div className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-2 text-center">
            <p className="text-2xl font-bold text-violet-600">{voiceCount}</p>
            <p className="text-xs text-slate-500">From voice</p>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center gap-5 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-900/30 border border-indigo-800/30">
            <BookOpen className="h-8 w-8 text-indigo-400" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Your word bank is empty</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Words you struggle with get saved here automatically. Click words in Video subtitles
            to add them, or practice Voice Chat — pronunciation issues are tracked automatically.
          </p>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-sm">
            <div className="rounded-xl border border-border bg-card p-3">
              <p className="text-lg mb-1">📹</p>
              <p className="text-sm font-medium text-foreground">Video</p>
              <p className="text-xs text-muted-foreground mt-0.5">Click hard words in subtitles to save them</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3">
              <p className="text-lg mb-1">🎙</p>
              <p className="text-sm font-medium text-foreground">Voice Chat</p>
              <p className="text-xs text-muted-foreground mt-0.5">Low-confidence words are saved automatically</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Action bar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Filter tabs */}
            <div className="flex rounded-xl border border-border bg-card p-1 gap-1">
              {([
                ['all', `All (${items.length})`],
                ['video', `Video (${videoCount})`],
                ['voice', `Voice (${voiceCount})`],
              ] as [FilterTab, string][]).map(([tab, label]) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    filter === tab
                      ? 'bg-indigo-600 text-white'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex-1" />

            {/* Start assessment */}
            {filtered.length > 0 && (
              <button
                onClick={() => setAssessing(true)}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
              >
                <Play className="h-4 w-4" />
                Start Assessment
              </button>
            )}

            {/* Clear all */}
            {showClearConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Clear all words?</span>
                <button
                  onClick={() => { clearAll(); setShowClearConfirm(false) }}
                  className="text-xs text-red-400 hover:text-red-300 font-medium"
                >
                  Yes, clear
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30"
                title="Clear all words"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear all
              </button>
            )}
          </div>

          {/* Word list */}
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No {filter} words yet.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map(item => (
                <WordCard
                  key={item.id}
                  item={item}
                  onRemove={() => removeItem(item.word)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
