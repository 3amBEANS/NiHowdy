import { useEffect, useMemo, useState } from "react"
import { BookOpen, Languages, MessagesSquare } from "lucide-react"

type SettingsData = {
  learningLanguage?: string
}

type DialogueLine = {
  speaker: string
  hanzi: string
  pinyin: string
  translation: string
}

type VocabItem = {
  hanzi: string
  pinyin: string
  meaning: string
}

type DialoguePack = {
  id: number
  title: string
  level: string
  people: [string, string]
  lines: DialogueLine[]
  vocab: VocabItem[]
}

const STORAGE_KEY = "nihowdy.settings"

const DIALOGUES: DialoguePack[] = [
  {
    id: 1,
    title: "在咖啡店学习中文",
    level: "Beginner",
    people: ["小林", "美美"],
    lines: [
      { speaker: "小林", hanzi: "你好，美美！你今天也来学习吗？", pinyin: "Nǐ hǎo, Měiměi! Nǐ jīntiān yě lái xuéxí ma?", translation: "Hi, Meimei! Did you come to study today too?" },
      { speaker: "美美", hanzi: "你好！是的，我想练习中文对话。", pinyin: "Nǐ hǎo! Shì de, wǒ xiǎng liànxí Zhōngwén duìhuà.", translation: "Hi! Yes, I want to practice Chinese dialogue." },
      { speaker: "小林", hanzi: "太好了。我们先点咖啡吧。", pinyin: "Tài hǎo le. Wǒmen xiān diǎn kāfēi ba.", translation: "Great. Let’s order coffee first." },
      { speaker: "美美", hanzi: "我想喝拿铁，你呢？", pinyin: "Wǒ xiǎng hē nátiě, nǐ ne?", translation: "I want a latte, how about you?" },
      { speaker: "小林", hanzi: "我要一杯美式咖啡。", pinyin: "Wǒ yào yì bēi měishì kāfēi.", translation: "I’ll have an Americano." },
      { speaker: "美美", hanzi: "点完以后，我们读短文吗？", pinyin: "Diǎn wán yǐhòu, wǒmen dú duǎnwén ma?", translation: "After ordering, shall we read a short text?" },
      { speaker: "小林", hanzi: "好啊，然后做词汇练习。", pinyin: "Hǎo a, ránhòu zuò cíhuì liànxí.", translation: "Sure, then we can do vocabulary practice." },
      { speaker: "美美", hanzi: "今天一定会有进步！", pinyin: "Jīntiān yídìng huì yǒu jìnbù!", translation: "We’ll definitely make progress today!" },
    ],
    vocab: [
      { hanzi: "学习", pinyin: "xuéxí", meaning: "to study" },
      { hanzi: "练习", pinyin: "liànxí", meaning: "to practice" },
      { hanzi: "对话", pinyin: "duìhuà", meaning: "dialogue/conversation" },
      { hanzi: "咖啡", pinyin: "kāfēi", meaning: "coffee" },
      { hanzi: "拿铁", pinyin: "nátiě", meaning: "latte" },
      { hanzi: "美式", pinyin: "měishì", meaning: "Americano style" },
      { hanzi: "点", pinyin: "diǎn", meaning: "to order" },
      { hanzi: "短文", pinyin: "duǎnwén", meaning: "short passage" },
      { hanzi: "词汇", pinyin: "cíhuì", meaning: "vocabulary" },
      { hanzi: "然后", pinyin: "ránhòu", meaning: "then/after that" },
      { hanzi: "进步", pinyin: "jìnbù", meaning: "progress" },
      { hanzi: "一定", pinyin: "yídìng", meaning: "definitely/certainly" },
    ],
  },
]

export default function ArticlePage() {
  const [settings, setSettings] = useState<SettingsData>({})
  const [showTranslation, setShowTranslation] = useState(true)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      setSettings(raw ? (JSON.parse(raw) as SettingsData) : {})
    } catch {
      setSettings({})
    }
  }, [])

  const preferredLanguage = settings.learningLanguage || "Spanish"
  const isChinese = preferredLanguage === "Chinese" || preferredLanguage === "Mandarin"
  const dialogue = useMemo(() => DIALOGUES[0], [])

  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <MessagesSquare className="h-6 w-6 text-primary" />
          Chinese Dialogue Practice
        </h1>
        <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
          <Languages className="h-4 w-4" />
          Preferred language: <span className="font-medium">{preferredLanguage}</span>
        </p>
      </header>

      {!isChinese && (
        <div className="rounded-lg border bg-accent/40 p-3 text-sm">
          Your preferred language is not Chinese, but you can still use this dialogue.
        </div>
      )}

      <section className="rounded-xl border bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{dialogue.title}</h2>
            <p className="text-sm text-muted-foreground">
              Speakers: {dialogue.people[0]} & {dialogue.people[1]}
            </p>
          </div>
          <span className="rounded-full border px-2 py-1 text-xs">{dialogue.level}</span>
        </div>

        <button
          type="button"
          onClick={() => setShowTranslation((v) => !v)}
          className="mb-4 rounded-md border px-3 py-2 text-sm hover:bg-accent"
        >
          {showTranslation ? "Hide translation" : "Show translation"}
        </button>

        <div className="space-y-3">
          {dialogue.lines.map((line, i) => (
            <div key={i} className="rounded-md border p-3">
              <p className="font-medium">{line.speaker}: {line.hanzi}</p>
              <p className="text-sm text-muted-foreground">{line.pinyin}</p>
              {showTranslation && <p className="text-sm text-muted-foreground/90">{line.translation}</p>}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border bg-card p-5">
        <h3 className="mb-3 flex items-center gap-2 text-base font-semibold">
          <BookOpen className="h-4 w-4 text-primary" />
          Vocabulary (12 words)
        </h3>
        <ul className="grid gap-2 sm:grid-cols-2">
          {dialogue.vocab.map((v) => (
            <li key={v.hanzi} className="rounded-md border px-3 py-2">
              <p className="font-medium">{v.hanzi}</p>
              <p className="text-xs text-muted-foreground">{v.pinyin}</p>
              <p className="text-sm text-muted-foreground">{v.meaning}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}