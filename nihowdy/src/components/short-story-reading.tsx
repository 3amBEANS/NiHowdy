import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/Button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ArrowLeft, BookOpen } from "lucide-react"
import { cn } from "../lib/utils"

const STORY_SECTIONS = [
  {
    paragraph: {
      chinese: "早上好！小明去学校。",
      pinyin: "Zǎoshang hǎo! Xiǎo Míng qù xuéxiào.",
      english: "Good morning! Xiao Ming goes to school.",
    },
  },
  {
    paragraph: {
      chinese: "他说：早上好，老师！老师笑了。",
      pinyin: "Tā shuō: Zǎoshang hǎo, lǎoshī! Lǎoshī xiào le.",
      english: 'He says: "Good morning, teacher!" The teacher smiles.',
    },
  },
  {
    paragraph: {
      chinese: "小明喜欢学习。他的书在桌子上。他喝茶。",
      pinyin: "Xiǎo Míng xǐhuan xuéxí. Tā de shū zài zhuōzi shang. Tā hē chá.",
      english:
        "Xiao Ming likes to study. His book is on the table. He drinks tea.",
    },
  },
  {
    paragraph: {
      chinese: "放学后，小明说：再见，朋友！他回家。",
      pinyin:
        "Fàngxué hòu, Xiǎo Míng shuō: Zàijiàn, péngyou! Tā huí jiā.",
      english:
        'After school, Xiao Ming says: "Goodbye, friend!" He goes home.',
    },
  },
]

const COMPREHENSION_QUESTIONS = [
  {
    id: 1,
    question: "小明在哪里学习？(Where does Xiao Ming study?)",
    options: [
      { value: "a", text: "在家 (at home)" },
      { value: "b", text: "在学校 (at school)" },
      { value: "c", text: "在朋友家 (at a friend's house)" },
    ],
    correct: "b",
  },
  {
    id: 2,
    question: "小明喝什么？(What does Xiao Ming drink?)",
    options: [
      { value: "a", text: "水 (water)" },
      { value: "b", text: "茶 (tea)" },
      { value: "c", text: "咖啡 (coffee)" },
    ],
    correct: "b",
  },
]

export function ShortStoryReading() {
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleAnswerChange = (questionId: number, value: string) => {
    if (submitted) return
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const handleSubmit = () => {
    setSubmitted(true)
  }

  const correctCount = COMPREHENSION_QUESTIONS.filter(
    (q) => answers[q.id] === q.correct
  ).length
  const totalQuestions = COMPREHENSION_QUESTIONS.length
  const score =
    submitted && totalQuestions > 0
      ? Math.round((correctCount / totalQuestions) * 100)
      : null

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
        <span className="text-sm text-muted-foreground">Reading • 20 min</span>
      </div>

      <Card className="border-border/50 overflow-hidden">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">小明的一天</CardTitle>
              <CardDescription>Xiao Ming&apos;s Day — A Short Story</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {STORY_SECTIONS.map((section, index) => (
            <div key={index} className="space-y-4">
              <div className="rounded-lg border border-border/50 bg-accent/30 p-4">
                <p className="text-lg font-medium text-foreground">
                  {section.paragraph.chinese}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {section.paragraph.pinyin}
                </p>
                <p className="mt-1 text-sm italic text-muted-foreground">
                  {section.paragraph.english}
                </p>
              </div>
            </div>
          ))}

          <div className="border-t border-border pt-6">
            <h3 className="mb-4 text-lg font-semibold text-foreground">
              Comprehension Questions
            </h3>

            {submitted && score !== null && (
              <div
                className={cn(
                  "mb-6 rounded-xl border p-4 text-center",
                  score === 100
                    ? "border-primary/30 bg-primary/5"
                    : "border-border"
                )}
              >
                <p className="text-2xl font-bold text-foreground">{score}%</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {correctCount} of {totalQuestions} correct
                </p>
              </div>
            )}

            <div className="space-y-6">
              {COMPREHENSION_QUESTIONS.map((q) => (
                <div key={q.id} className="space-y-3">
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
                          disabled={submitted}
                        />
                        <Label
                          htmlFor={`q${q.id}-${opt.value}`}
                          className={cn(
                            "flex-1 cursor-pointer font-normal",
                            submitted && opt.value === q.correct && "text-primary",
                            submitted &&
                              answers[q.id] === opt.value &&
                              opt.value !== q.correct &&
                              "text-destructive"
                          )}
                        >
                          {opt.text}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}
            </div>

            {!submitted ? (
              <Button
                size="lg"
                className="mt-6 w-full"
                onClick={handleSubmit}
                disabled={
                  Object.keys(answers).length < totalQuestions
                }
              >
                Check Answers
              </Button>
            ) : (
              <Link to="/">
                <Button variant="outline" className="mt-6 w-full">
                  Return to Study Plan
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ShortStoryReading
