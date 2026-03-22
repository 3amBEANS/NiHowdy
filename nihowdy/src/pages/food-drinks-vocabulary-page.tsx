import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/Button"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, BookOpen, CheckCircle2, Languages, ListTodo } from "lucide-react"
import {
  FOOD_DRINKS_BY_LANGUAGE,
  VOCAB_SET,
  type VocabItem,
} from "@/data/food-drinks-vocabulary"
import { getLearnedWords, isWordLearned, setWordLearned } from "@/lib/learned-words"

type SettingsData = {
  learningLanguage?: string
}

const SETTINGS_KEY = "nihowdy.settings"

function VocabItemRow({
  item,
  checked,
  onToggle,
}: {
  item: VocabItem
  checked: boolean
  onToggle: () => void
}) {
  return (
    <li
      className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 ${
        checked
          ? "border-primary/30 bg-primary/10"
          : "border-border/50 bg-accent/30"
      }`}
    >
      <div className="flex min-w-0 flex-1 items-baseline gap-2">
        <Checkbox
          checked={checked}
          onCheckedChange={onToggle}
          aria-label={`Mark "${item.word}" as ${checked ? "not learned" : "learned"}`}
        />
        <div className="min-w-0">
          <span className="font-medium text-foreground">{item.word}</span>
          {item.pronunciation && (
            <span className="ml-2 text-sm text-muted-foreground">
              ({item.pronunciation})
            </span>
          )}
        </div>
      </div>
      <span className="shrink-0 text-sm text-muted-foreground">
        {item.meaning}
      </span>
    </li>
  )
}

export default function FoodDrinksVocabularyPage() {
  const [settings, setSettings] = useState<SettingsData>({})
  const [learnedSet, setLearnedSet] = useState<Set<string>>(new Set())

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY)
      setSettings(raw ? (JSON.parse(raw) as SettingsData) : {})
    } catch {
      setSettings({})
    }
  }, [])

  const preferredLanguage = settings.learningLanguage || "Spanish"
  const vocab =
    FOOD_DRINKS_BY_LANGUAGE[preferredLanguage] ??
    FOOD_DRINKS_BY_LANGUAGE.Spanish

  useEffect(() => {
    const words = getLearnedWords(VOCAB_SET, preferredLanguage)
    setLearnedSet(new Set(words))
  }, [preferredLanguage])

  useEffect(() => {
    const handler = () => {
      const words = getLearnedWords(VOCAB_SET, preferredLanguage)
      setLearnedSet(new Set(words))
    }
    window.addEventListener("nihowdy:learned-words-updated", handler)
    return () =>
      window.removeEventListener("nihowdy:learned-words-updated", handler)
  }, [preferredLanguage])

  const handleToggle = (word: string) => {
    const learned = !isWordLearned(VOCAB_SET, preferredLanguage, word)
    setWordLearned(VOCAB_SET, preferredLanguage, word, learned)
    setLearnedSet((prev) => {
      const next = new Set(prev)
      if (learned) next.add(word)
      else next.delete(word)
      return next
    })
  }

  const learned = vocab.items.filter((i) => learnedSet.has(i.word))
  const toLearn = vocab.items.filter((i) => !learnedSet.has(i.word))

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Study Plan
      </Link>

      <header>
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <BookOpen className="h-6 w-6 text-primary" />
          Vocabulary: Food & Drinks
        </h1>
        <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
          <Languages className="h-4 w-4" />
          Learning: <span className="font-medium">{vocab.language}</span>
        </p>
      </header>

      <p className="text-muted-foreground">
        Check off words as you learn them. Only checked words will appear in the
        Food & Drinks quiz.
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        {learned.length > 0 && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-5">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Learned ({learned.length})
              </h2>
              <ul className="space-y-3">
                {learned.map((item) => (
                  <VocabItemRow
                    key={item.word}
                    item={item}
                    checked={true}
                    onToggle={() => handleToggle(item.word)}
                  />
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <Card className="border-border/50">
          <CardContent className="p-5">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
              <ListTodo className="h-5 w-5" />
              To Learn ({toLearn.length})
            </h2>
            <ul className="space-y-3">
              {toLearn.map((item) => (
                <VocabItemRow
                  key={item.word}
                  item={item}
                  checked={false}
                  onToggle={() => handleToggle(item.word)}
                />
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {learned.length > 0 && (
        <Link to="/assessment/food-drinks">
          <Button>Quiz: Food & Drinks ({learned.length} words)</Button>
        </Link>
      )}

      <Link to="/">
        <Button variant="outline">Back to Study Plan</Button>
      </Link>
    </main>
  )
}
