import { useMemo, useState, useEffect } from "react"
import { Link } from "react-router-dom"
import confetti from "canvas-confetti"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Trophy, Clock } from "lucide-react"
import { cn } from "../lib/utils"
import wordBankData from "../data/word-bank.json"

type WordEntry = {
  id: string
  chinese: string
  pinyin?: string
  english: string
  partOfSpeech: string
  category: string
}

const wordBank = wordBankData as { words: WordEntry[] }
const WORDS = wordBank.words

function shuffle<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function generateQuestions(): {
  id: number
  question: string
  options: { value: string; text: string }[]
  correct: string
  wordId: string
}[] {
  if (WORDS.length < 5) return []

  const shuffled = shuffle(WORDS)
  const selected = shuffled.slice(0, 5)
  const questions: {
    id: number
    question: string
    options: { value: string; text: string }[]
    correct: string
    wordId: string
  }[] = []

  selected.forEach((word, index) => {
    const questionNum = index + 1
    const isChineseToEnglish = index % 2 === 0
    const displayChinese = word.pinyin
      ? `${word.chinese} (${word.pinyin})`
      : word.chinese

    if (isChineseToEnglish) {
      const correctAnswer = word.english
      const otherWords = WORDS.filter((w) => w.id !== word.id)
      const distractors = shuffle(otherWords)
        .slice(0, 3)
        .map((w) => w.english)
      const allOptions = shuffle([correctAnswer, ...distractors])
      const labels = ["a", "b", "c", "d"]
      const correctIndex = allOptions.indexOf(correctAnswer)

      questions.push({
        id: questionNum,
        question: `What does "${displayChinese}" mean in English?`,
        options: allOptions.map((opt, i) => ({
          value: labels[i],
          text: opt,
        })),
        correct: labels[correctIndex],
        wordId: word.id,
      })
    } else {
      const correctAnswer = word.chinese
      const otherWords = WORDS.filter((w) => w.id !== word.id)
      const distractors = shuffle(otherWords)
        .slice(0, 3)
        .map((w) => w.chinese)
      const allOptions = shuffle([correctAnswer, ...distractors])
      const labels = ["a", "b", "c", "d"]
      const correctIndex = allOptions.indexOf(correctAnswer)

      questions.push({
        id: questionNum,
        question: `How do you say "${word.english}" in Chinese?`,
        options: allOptions.map((opt, i) => ({
          value: labels[i],
          text: opt,
        })),
        correct: labels[correctIndex],
        wordId: word.id,
      })
    }
  })

  return questions
}

export function WeeklyAssessment() {
  const [resetKey, setResetKey] = useState(0)
  const questions = useMemo(() => generateQuestions(), [resetKey])
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [submitted, setSubmitted] = useState(false)

  const handleAnswerChange = (questionId: number, value: string) => {
    if (submitted) return
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const handleSubmit = () => {
    setSubmitted(true)
  }

  const answeredCount = Object.keys(answers).length
  const totalQuestions = questions.length
  const score =
    submitted && totalQuestions > 0
      ? Math.round(
          (questions.filter((q) => answers[q.id] === q.correct).length /
            totalQuestions) *
            100
        )
      : null

  // Scroll to top when starting the assessment
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Firework celebration for 100% score
  useEffect(() => {
    if (submitted && score === 100) {
      const duration = 2500
      const end = Date.now() + duration

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#e11d48", "#f59e0b", "#22c55e", "#3b82f6", "#8b5cf6"],
        })
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#e11d48", "#f59e0b", "#22c55e", "#3b82f6", "#8b5cf6"],
        })
        if (Date.now() < end) requestAnimationFrame(frame)
      }
      frame()

      // Central burst
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 100,
          origin: { y: 0.5, x: 0.5 },
          colors: ["#e11d48", "#f59e0b", "#22c55e", "#3b82f6", "#8b5cf6"],
        })
      }, 200)
    }
  }, [submitted, score])

  if (questions.length === 0) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Study Plan
        </Link>
        <Card className="border-border/50">
          <CardContent className="p-8 text-center text-muted-foreground">
            <p>Not enough words in the word bank to generate an assessment.</p>
            <Link to="/">
              <Button variant="outline" className="mt-4">
                Return to Study Plan
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Study Plan
        </Link>
        <Badge variant="secondary" className="gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          15 min
        </Badge>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Weekly Assessment</CardTitle>
              <CardDescription>
                Test your knowledge of Chinese vocabulary
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {submitted && score !== null && (
            <div
              className={cn(
                "rounded-xl border p-4 text-center",
                score >= 80
                  ? "border-primary/30 bg-primary/5"
                  : score >= 60
                    ? "border-yellow-500/30 bg-yellow-500/5"
                    : "border-destructive/30 bg-destructive/5"
              )}
            >
              <p className="text-3xl font-bold text-foreground">{score}%</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {score >= 80
                  ? "Great job! You've mastered this week's vocabulary."
                  : score >= 60
                    ? "Good effort! Review the incorrect answers and try again."
                    : "Keep practicing! Consider reviewing this week's lessons."}
              </p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSubmitted(false)
                    setAnswers({})
                    setResetKey((k) => k + 1)
                    window.scrollTo(0, 0)
                  }}
                >
                  Try Again
                </Button>
                <Link to="/">
                  <Button variant="outline">
                    Return to Study Plan
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {!submitted && (
            <>
              <p className="text-sm text-muted-foreground">
                {answeredCount} of {totalQuestions} questions answered
              </p>
              <div className="space-y-8">
                {questions.map((q) => (
                  <div
                    key={q.id}
                    className="space-y-3 rounded-lg border border-border p-4"
                  >
                    <p className="font-medium text-foreground">
                      {q.id}. {q.question}
                    </p>
                    <RadioGroup
                      value={answers[q.id] ?? ""}
                      onValueChange={(value) => handleAnswerChange(q.id, value)}
                      className="space-y-2"
                    >
                      {q.options.map((opt) => (
                        <div
                          key={opt.value}
                          className={cn(
                            "flex items-center space-x-2 rounded-lg border px-4 py-3 transition-colors",
                            answers[q.id] === opt.value
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/30"
                          )}
                        >
                          <RadioGroupItem
                            value={opt.value}
                            id={`q${q.id}-${opt.value}`}
                          />
                          <Label
                            htmlFor={`q${q.id}-${opt.value}`}
                            className="flex-1 cursor-pointer font-normal"
                          >
                            {opt.text}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                ))}
              </div>
              <Button
                size="lg"
                className="w-full"
                onClick={handleSubmit}
                disabled={answeredCount < totalQuestions}
              >
                Submit Assessment
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default WeeklyAssessment
