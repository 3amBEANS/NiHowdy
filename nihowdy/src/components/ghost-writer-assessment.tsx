import { useEffect, useState, useMemo } from "react"
import { Link } from "react-router-dom"
import confetti from "canvas-confetti"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Ghost } from "lucide-react"
import { cn } from "../lib/utils"
import wordBankData from "../data/word-bank.json"

type SentenceEntry = {
  id: string
  chinese: string
  pinyin?: string
  english: string
}

const wordBank = wordBankData as { words: unknown[]; sentences?: SentenceEntry[] }
const SENTENCES = wordBank.sentences ?? []
const QUESTIONS_PER_ATTEMPT = 3

const MEMORIZE_SECONDS = 10
const TYPE_SECONDS = 30

function shuffle<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function normalizeForCompare(text: string): string {
  return text.trim().replace(/\s+/g, "")
}

export function GhostWriterAssessment() {
  const [attempt, setAttempt] = useState(0)
  const sentences = useMemo(() => {
    if (SENTENCES.length < QUESTIONS_PER_ATTEMPT) return []
    return shuffle([...SENTENCES]).slice(0, QUESTIONS_PER_ATTEMPT)
  }, [attempt])

  const [questionIndex, setQuestionIndex] = useState(0)
  const [phase, setPhase] = useState<"memorize" | "typing" | "result">("memorize")
  const [memorizeTimeLeft, setMemorizeTimeLeft] = useState(MEMORIZE_SECONDS)
  const [typeTimeLeft, setTypeTimeLeft] = useState(TYPE_SECONDS)
  const [userInput, setUserInput] = useState("")
  const [results, setResults] = useState<boolean[]>([])

  const sentence = sentences[questionIndex]
  const isLastQuestion = questionIndex === QUESTIONS_PER_ATTEMPT - 1

  // Memorization phase countdown
  useEffect(() => {
    if (phase !== "memorize" || !sentence) return
    if (memorizeTimeLeft <= 0) {
      setPhase("typing")
      setTypeTimeLeft(TYPE_SECONDS)
      setUserInput("")
      return
    }
    const timer = setInterval(() => setMemorizeTimeLeft((t) => t - 1), 1000)
    return () => clearInterval(timer)
  }, [phase, memorizeTimeLeft, sentence])

  // Typing phase countdown
  useEffect(() => {
    if (phase !== "typing" || !sentence) return
    if (typeTimeLeft <= 0) {
      const normalizedAnswer = normalizeForCompare(userInput)
      const normalizedCorrect = normalizeForCompare(sentence.chinese)
      setResults((prev) => [...prev, normalizedAnswer === normalizedCorrect])
      setPhase("result")
      return
    }
    const timer = setInterval(() => setTypeTimeLeft((t) => t - 1), 1000)
    return () => clearInterval(timer)
  }, [phase, typeTimeLeft, userInput, sentence])

  const handleSubmit = () => {
    if (phase !== "typing" || !sentence) return
    const normalizedAnswer = normalizeForCompare(userInput)
    const normalizedCorrect = normalizeForCompare(sentence.chinese)
    setResults((prev) => [...prev, normalizedAnswer === normalizedCorrect])
    setPhase("result")
  }

  const goToNextQuestion = () => {
    setQuestionIndex((i) => i + 1)
    setPhase("memorize")
    setMemorizeTimeLeft(MEMORIZE_SECONDS)
    setTypeTimeLeft(TYPE_SECONDS)
    setUserInput("")
  }

  const handleTryAgain = () => {
    setAttempt((a) => a + 1)
    setQuestionIndex(0)
    setPhase("memorize")
    setMemorizeTimeLeft(MEMORIZE_SECONDS)
    setTypeTimeLeft(TYPE_SECONDS)
    setUserInput("")
    setResults([])
    window.scrollTo(0, 0)
  }

  // Scroll to top on mount and when starting new attempt/question
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [attempt, questionIndex])

  // Firework celebration for perfect score (3/3)
  useEffect(() => {
    if (
      phase === "result" &&
      results.length === QUESTIONS_PER_ATTEMPT &&
      results.every(Boolean)
    ) {
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

      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 100,
          origin: { y: 0.5, x: 0.5 },
          colors: ["#e11d48", "#f59e0b", "#22c55e", "#3b82f6", "#8b5cf6"],
        })
      }, 200)
    }
  }, [phase, results])

  if (SENTENCES.length < QUESTIONS_PER_ATTEMPT) {
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
            <p>
              Need at least {QUESTIONS_PER_ATTEMPT} sentences in the word bank
              for this assessment.
            </p>
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

  // Final results after all 3 questions
  if (phase === "result" && results.length === QUESTIONS_PER_ATTEMPT) {
    const correctCount = results.filter(Boolean).length
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Study Plan
          </Link>
          <Badge variant="secondary" className="gap-1.5">
            <Ghost className="h-3.5 w-3.5" />
            Ghost Writer
          </Badge>
        </div>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-xl">Challenge Complete!</CardTitle>
            <CardDescription>
              You got {correctCount} of {QUESTIONS_PER_ATTEMPT} correct
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "rounded-xl border p-6 text-center",
                correctCount === QUESTIONS_PER_ATTEMPT
                  ? "border-primary/30 bg-primary/5"
                  : "border-border"
              )}
            >
              <p className="text-3xl font-bold text-foreground">
                {correctCount}/{QUESTIONS_PER_ATTEMPT}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {correctCount === QUESTIONS_PER_ATTEMPT
                  ? "Perfect score! Amazing memory."
                  : "Keep practicing to improve."}
              </p>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
                <Button variant="outline" onClick={handleTryAgain}>
                  Try Again
                </Button>
                <Link to="/">
                  <Button variant="outline">Return to Study Plan</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // In-progress: show current question
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Study Plan
        </Link>
        <Badge variant="secondary" className="gap-1.5">
          <Ghost className="h-3.5 w-3.5" />
          Question {questionIndex + 1} of {QUESTIONS_PER_ATTEMPT}
        </Badge>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Ghost className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Challenge: Ghost Writer</CardTitle>
              <CardDescription>
                Memorize the sentence, then type it from memory
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {phase === "memorize" && sentence && (
            <div className="space-y-6">
              <p className="text-center text-sm text-muted-foreground">
                Memorize this sentence. You have {memorizeTimeLeft} seconds.
              </p>
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-8 text-center">
                <p className="text-3xl font-medium text-foreground">
                  {sentence.chinese}
                </p>
                {sentence.pinyin && (
                  <p className="mt-2 text-lg text-muted-foreground">
                    {sentence.pinyin}
                  </p>
                )}
                <p className="mt-4 text-sm text-muted-foreground">
                  ({sentence.english})
                </p>
              </div>
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary text-2xl font-bold text-primary">
                  {memorizeTimeLeft}
                </div>
              </div>
            </div>
          )}

          {phase === "typing" && sentence && (
            <div className="space-y-6">
              <p className="text-center text-sm text-muted-foreground">
                Type the exact sentence. You have {typeTimeLeft} seconds.
              </p>
              <div className="flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary text-xl font-bold text-primary">
                  {typeTimeLeft}
                </div>
              </div>
              <div className="space-y-2">
                <Textarea
                  placeholder="Type the sentence here..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  className="min-h-24 text-lg"
                  autoFocus
                />
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={!userInput.trim()}
                >
                  Submit
                </Button>
              </div>
            </div>
          )}

          {phase === "result" && sentence && (
            <div
              className={cn(
                "rounded-xl border p-6 text-center",
                results[results.length - 1]
                  ? "border-primary/30 bg-primary/5"
                  : "border-destructive/30 bg-destructive/5"
              )}
            >
              <p className="text-2xl font-bold text-foreground">
                {results[results.length - 1] ? "Correct!" : "Not quite"}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {results[results.length - 1]
                  ? "You typed the sentence perfectly!"
                  : "The correct sentence was:"}
              </p>
              {!results[results.length - 1] && (
                <p className="mt-4 text-xl font-medium text-foreground">
                  {sentence.chinese}
                </p>
              )}
              <p className="mt-2 text-sm text-muted-foreground">
                Your answer: {userInput || "(empty)"}
              </p>
              <Button className="mt-6" onClick={goToNextQuestion}>
                {isLastQuestion ? "See Results" : "Next Question"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default GhostWriterAssessment
