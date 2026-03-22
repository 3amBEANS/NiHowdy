import { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/Button"
import { ArrowLeft, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  FOOD_DRINKS_BY_LANGUAGE,
  VOCAB_SET,
} from "@/data/food-drinks-vocabulary"
import { getLearnedWords } from "@/lib/learned-words"

type Question = {
  id: string
  prompt: string
  options: string[]
  correctIndex: number
}

const ASSESSMENTS: Record<
  string,
  { title: string; description: string; questions: Question[] }
> = {
  beginner: {
    title: "Beginner Level Assessment",
    description: "Test your foundational knowledge",
    questions: [
      {
        id: "q1",
        prompt: "What does '你好' mean?",
        options: ["Goodbye", "Hello", "Thank you", "Please"],
        correctIndex: 1,
      },
      {
        id: "q2",
        prompt: "What does '谢谢' mean?",
        options: ["Sorry", "Hello", "Thank you", "Goodbye"],
        correctIndex: 2,
      },
      {
        id: "q3",
        prompt: "What does '再见' mean?",
        options: ["Hello", "Please", "Goodbye", "Thank you"],
        correctIndex: 2,
      },
      {
        id: "q4",
        prompt: "Which word means 'please'?",
        options: ["请", "谢谢", "你好", "再见"],
        correctIndex: 0,
      },
      {
        id: "q5",
        prompt: "What does '水' mean?",
        options: ["Tea", "Rice", "Water", "Apple"],
        correctIndex: 2,
      },
    ],
  },
  vocabulary: {
    title: "Vocabulary Quiz: Daily Life",
    description: "Test your vocabulary on everyday topics",
    questions: [
      {
        id: "q1",
        prompt: "What does '书' mean?",
        options: ["Table", "Book", "School", "Home"],
        correctIndex: 1,
      },
      {
        id: "q2",
        prompt: "What does '家' mean?",
        options: ["School", "Friend", "Home", "Teacher"],
        correctIndex: 2,
      },
      {
        id: "q3",
        prompt: "What does '学习' mean?",
        options: ["To eat", "To study", "To drink", "To like"],
        correctIndex: 1,
      },
      {
        id: "q4",
        prompt: "What does '朋友' mean?",
        options: ["Teacher", "School", "Friend", "Book"],
        correctIndex: 2,
      },
      {
        id: "q5",
        prompt: "What does '苹果' mean?",
        options: ["Water", "Rice", "Tea", "Apple"],
        correctIndex: 3,
      },
    ],
  },
  grammar: {
    title: "Grammar Test: Present Tense",
    description: "Master basic sentence structures",
    questions: [
      {
        id: "q1",
        prompt: "How do you say 'I like apples'?",
        options: [
          "我喜欢苹果",
          "我吃苹果",
          "我喝苹果",
          "我学苹果",
        ],
        correctIndex: 0,
      },
      {
        id: "q2",
        prompt: "What does '请喝茶' mean?",
        options: [
          "Please eat rice",
          "Please drink tea",
          "Please drink water",
          "Please eat",
        ],
        correctIndex: 1,
      },
      {
        id: "q3",
        prompt: "How do you say 'good morning'?",
        options: ["你好", "再见", "早上好", "谢谢"],
        correctIndex: 2,
      },
      {
        id: "q4",
        prompt: "What does '他回家' mean?",
        options: [
          "He goes to school",
          "He goes home",
          "He eats",
          "He studies",
        ],
        correctIndex: 1,
      },
      {
        id: "q5",
        prompt: "What does '老师' mean?",
        options: ["Friend", "Student", "Teacher", "School"],
        correctIndex: 2,
      },
    ],
  },
  listening: {
    title: "Listening Comprehension",
    description: "Test your understanding of phrases",
    questions: [
      {
        id: "q1",
        prompt: "If someone says '你叫什么名字？', what are they asking?",
        options: [
          "How are you?",
          "What is your name?",
          "Where do you live?",
          "What time is it?",
        ],
        correctIndex: 1,
      },
      {
        id: "q2",
        prompt: "What would you say when leaving?",
        options: ["你好", "谢谢", "再见", "请"],
        correctIndex: 2,
      },
      {
        id: "q3",
        prompt: "What does '对不起' mean?",
        options: ["Thank you", "Please", "Sorry", "Hello"],
        correctIndex: 2,
      },
      {
        id: "q4",
        prompt: "What does '书在桌子上' mean?",
        options: [
          "The book is on the table",
          "The book is at school",
          "I read the book",
          "The table has a book",
        ],
        correctIndex: 0,
      },
      {
        id: "q5",
        prompt: "What does '我喜欢学习' mean?",
        options: [
          "I like to eat",
          "I like to drink",
          "I like to study",
          "I like school",
        ],
        correctIndex: 2,
      },
    ],
  },
}

type SettingsData = { learningLanguage?: string }
const SETTINGS_KEY = "nihowdy.settings"

function buildFoodDrinksQuestions(
  languageKey: string
): { title: string; description: string; questions: Question[] } {
  const vocab =
    FOOD_DRINKS_BY_LANGUAGE[languageKey] ?? FOOD_DRINKS_BY_LANGUAGE.Spanish
  const learned = getLearnedWords(VOCAB_SET, languageKey)
  const learnedItems = vocab.items.filter((i) => learned.includes(i.word))
  const allMeanings = vocab.items.map((i) => i.meaning)

  const questions: Question[] = learnedItems.map((item, idx) => {
    const others = allMeanings.filter((m) => m !== item.meaning)
    const shuffled = [...others].sort(() => Math.random() - 0.5)
    const distractors = shuffled.slice(0, 3)
    const options = [item.meaning, ...distractors].sort(
      () => Math.random() - 0.5
    )
    const correctIndex = options.indexOf(item.meaning)
    return {
      id: `fd-${idx}`,
      prompt: `What does "${item.word}"${item.pronunciation ? ` (${item.pronunciation})` : ""} mean?`,
      options,
      correctIndex,
    }
  })

  return {
    title: "Food & Drinks Quiz",
    description: `Test yourself on ${learnedItems.length} learned word${learnedItems.length === 1 ? "" : "s"}`,
    questions,
  }
}

export default function AssessmentPage() {
  const { id } = useParams<{ id: string }>()
  const [settings, setSettings] = useState<SettingsData>({})

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY)
      setSettings(raw ? (JSON.parse(raw) as SettingsData) : {})
    } catch {
      setSettings({})
    }
  }, [])

  const languageKey = settings.learningLanguage ?? "Spanish"

  const assessment = useMemo(() => {
    if (!id) return null
    if (id === "food-drinks") {
      const built = buildFoodDrinksQuestions(languageKey)
      if (built.questions.length === 0) return "no-learned-words"
      return built
    }
    return ASSESSMENTS[id] ?? null
  }, [id, languageKey])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number | null>>({})
  const [submitted, setSubmitted] = useState(false)

  const questions =
    assessment && assessment !== "no-learned-words"
      ? assessment.questions
      : []
  const current = questions[currentIndex]
  const selected = current ? answers[current.id] : null
  const assessmentData =
    assessment && assessment !== "no-learned-words" ? assessment : null

  const progress = useMemo(() => {
    if (questions.length === 0) return 0
    const answeredCount = Object.values(answers).filter((v) => v !== null).length
    return Math.round((answeredCount / questions.length) * 100)
  }, [answers, questions.length])

  const score = useMemo(() => {
    return questions.reduce((acc, q) => {
      return answers[q.id] === q.correctIndex ? acc + 1 : acc
    }, 0)
  }, [answers, questions])

  const setAnswer = (optionIndex: number) => {
    if (submitted || !current) return
    setAnswers((prev) => ({ ...prev, [current.id]: optionIndex }))
  }

  const goPrev = () => setCurrentIndex((i) => Math.max(0, i - 1))
  const goNext = () =>
    setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))

  const submitTest = () => setSubmitted(true)

  if (assessment === "no-learned-words") {
    return (
      <div className="mx-auto max-w-2xl space-y-6 p-4">
        <Link
          to="/materials?tab=assessments"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Materials
        </Link>
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">
              You haven&apos;t learned any Food & Drinks words yet. Check off some
              words on the vocabulary page first, then come back to take the
              quiz.
            </p>
            <Link to="/vocabulary/food-drinks">
              <Button className="gap-2">
                <BookOpen className="h-4 w-4" />
                Go to Food & Drinks Vocabulary
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!assessmentData) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 p-4">
        <Link
          to="/materials?tab=assessments"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Materials
        </Link>
        <Card className="border-border/50">
          <CardContent className="p-8 text-center text-muted-foreground">
            <p>Assessment not found.</p>
            <Link to="/materials?tab=assessments">
              <Button variant="outline" className="mt-4">
                View Assessments
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4">
      <Link
        to="/materials?tab=assessments"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Materials
      </Link>

      <header>
        <h1 className="text-2xl font-semibold text-foreground">
          {assessmentData.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {assessmentData.description}
        </p>
      </header>

      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="mb-4 flex items-center justify-between text-sm">
            <span>
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span>{progress}% complete</span>
          </div>
          <div className="mb-6 h-2 w-full overflow-hidden rounded bg-muted">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <h2 className="text-lg font-medium text-foreground">{current.prompt}</h2>

          <div className="mt-4 grid gap-3">
            {current.options.map((option, optionIndex) => {
              const isSelected = selected === optionIndex
              const isCorrect = optionIndex === current.correctIndex
              const showCorrect = submitted && isCorrect
              const showWrong = submitted && isSelected && !isCorrect

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setAnswer(optionIndex)}
                  className={cn(
                    "w-full rounded-lg border px-4 py-3 text-left transition-all",
                    isSelected ? "border-primary bg-primary/5" : "border-border",
                    showCorrect && "border-green-500 bg-green-500/10",
                    showWrong && "border-destructive bg-destructive/10",
                    submitted ? "cursor-default" : "hover:border-primary/50"
                  )}
                  disabled={submitted}
                >
                  {option}
                </button>
              )
            })}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={goPrev}
              disabled={currentIndex === 0}
            >
              Previous
            </Button>

            <span className="text-sm text-muted-foreground">
              {Object.values(answers).filter((v) => v !== null).length} answered
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={goNext}
              disabled={currentIndex === questions.length - 1}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          onClick={submitTest}
          disabled={submitted || Object.keys(answers).length < questions.length}
        >
          {submitted ? "Submitted" : "Submit Test"}
        </Button>

        {submitted && (
          <div
            className={cn(
              "rounded-lg border px-4 py-2",
              score === questions.length
                ? "border-green-500/50 bg-green-500/10"
                : "border-border"
            )}
          >
            <span className="font-medium">
              Score: {score} / {questions.length}
            </span>
            <span className="ml-2 text-sm text-muted-foreground">
              ({Math.round((score / questions.length) * 100)}%)
            </span>
          </div>
        )}
      </div>

      {submitted && (
        <Link to="/materials?tab=assessments">
          <Button variant="outline" className="w-full">
            Back to Assessments
          </Button>
        </Link>
      )}
    </div>
  )
}
