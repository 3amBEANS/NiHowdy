import { useEffect, useMemo, useState, type ElementType } from "react"
import { useAuth0 } from "@auth0/auth0-react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/Button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Clock,
  Trophy,
  Flame,
  BookOpen,
  Headphones,
  PenTool,
  MessageCircle,
  ChevronRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react"
import { cn } from "../lib/utils"

type SettingsData = {
  displayName?: string
  learningLanguage?: string
}

type PerformanceData = {
  completedLessonIds: number[]
  assessmentScores?: Record<string, number>
}

const SETTINGS_KEY = "nihowdy.settings"
const PERFORMANCE_KEY_PREFIX = "nihowdy.performance"

// remove `completed` from lesson seed data; completion is now persisted
const weeklyPlan = [
  {
    day: "Monday",
    lessons: [
      { id: 1, title: "Vocabulary: Daily Routines", type: "vocabulary", duration: "15 min" },
      { id: 2, title: "Grammar: Present Tense", type: "grammar", duration: "20 min" },
    ],
  },
  {
    day: "Tuesday",
    lessons: [
      { id: 3, title: "Listening: Conversations", type: "listening", duration: "15 min" },
      { id: 4, title: "Speaking Practice", type: "speaking", duration: "10 min" },
    ],
  },
  {
    day: "Wednesday",
    lessons: [
      { id: 5, title: "Reading: Chinese Article", type: "article", duration: "20 min" },
      { id: 6, title: "Writing Exercise", type: "writing", duration: "15 min" },
    ],
  },
  {
    day: "Thursday",
    lessons: [
      { id: 7, title: "Vocabulary: Food & Drinks", type: "vocabulary", duration: "15 min" },
      { id: 8, title: "Grammar: Articles", type: "grammar", duration: "20 min" },
      { id: 11, title: "Video Lesson: Ordering at a Café", type: "video", duration: "12 min" },
    ],
  },
  {
    day: "Friday",
    lessons: [
      { id: 9, title: "Review & Practice", type: "review", duration: "25 min" },
      { id: 10, title: "Weekly Assessment", type: "assessment", duration: "15 min" },
    ],
  },
]

const typeIcons: Record<string, ElementType> = {
  vocabulary: BookOpen,
  grammar: PenTool,
  listening: Headphones,
  speaking: MessageCircle,
  reading: BookOpen,
  writing: PenTool,
  review: Sparkles,
  assessment: Trophy,
  article: BookOpen,
  video: Sparkles,
}

const getLessonRoute = (type: string) => {
  if (type === "reading" || type === "article") return "/articles"
  if (type === "assessment") return "/test-page"
  if (type === "speaking") return "/voice-chat"
  if (type === "video") return "/video"
  if (type === "writing") return "/materials?tab=resources"
  return "/materials"
}

const getLessonButtonLabel = (type: string) => {
  if (type === "reading" || type === "article") return "Read Article"
  if (type === "assessment") return "Start Test"
  if (type === "speaking") return "Start Voice Chat"
  if (type === "video") return "Watch Video"
  if (type === "writing") return "Chinese Worksheet"
  return "Open"
}

const parseMinutes = (duration: string) => Number(duration.replace(/[^\d]/g, "")) || 0

export default function StudyPlanDashboard() {
  const [selectedDay, setSelectedDay] = useState(2)
  const { user } = useAuth0()
  const [settings, setSettings] = useState<SettingsData>({})
  const [completedLessonIds, setCompletedLessonIds] = useState<number[]>([])
  const [assessmentScores, setAssessmentScores] = useState<Record<string, number>>({})

  const performanceKey = `${PERFORMANCE_KEY_PREFIX}.${user?.sub ?? "guest"}`

  useEffect(() => {
    const loadSettings = () => {
      try {
        const raw = localStorage.getItem(SETTINGS_KEY)
        setSettings(raw ? (JSON.parse(raw) as SettingsData) : {})
      } catch {
        setSettings({})
      }
    }

    loadSettings()
    window.addEventListener("nihowdy:settings-updated", loadSettings)
    window.addEventListener("storage", loadSettings)
    return () => {
      window.removeEventListener("nihowdy:settings-updated", loadSettings)
      window.removeEventListener("storage", loadSettings)
    }
  }, [])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(performanceKey)
      const parsed = raw ? (JSON.parse(raw) as PerformanceData) : { completedLessonIds: [] }
      setCompletedLessonIds(Array.isArray(parsed.completedLessonIds) ? parsed.completedLessonIds : [])
      setAssessmentScores(parsed.assessmentScores && typeof parsed.assessmentScores === "object" ? parsed.assessmentScores : {})
    } catch {
      setCompletedLessonIds([])
      setAssessmentScores({})
    }
  }, [performanceKey])

  const savePerformance = (ids: number[]) => {
    const payload: PerformanceData = {
      completedLessonIds: ids,
      assessmentScores, // keep saved scores when writing performance
    }
    localStorage.setItem(performanceKey, JSON.stringify(payload))
  }

  const markLessonCompleted = (lessonId: number) => {
    setCompletedLessonIds((prev) => {
      if (prev.includes(lessonId)) return prev
      const next = [...prev, lessonId]
      savePerformance(next)
      return next
    })
  }

  const displayName = useMemo(
    () =>
      settings.displayName?.trim() ||
      user?.given_name ||
      user?.name ||
      user?.email?.split("@")[0] ||
      "Learner",
    [settings.displayName, user]
  )

  const preferredLanguage = settings.learningLanguage || "Spanish"
  const completedSet = useMemo(() => new Set(completedLessonIds), [completedLessonIds])

  const allLessons = useMemo(() => weeklyPlan.flatMap((d) => d.lessons), [])
  const completedLessons = allLessons.filter((l) => completedSet.has(l.id)).length
  const totalLessons = allLessons.length
  const progressPercent = Math.round((completedLessons / totalLessons) * 100)

  const minutesStudied = allLessons
    .filter((l) => completedSet.has(l.id))
    .reduce((sum, l) => sum + parseMinutes(l.duration), 0)

  const wordsLearned = allLessons
    .filter((l) => completedSet.has(l.id))
    .reduce((sum, l) => {
      if (l.type === "vocabulary") return sum + 25
      if (l.type === "article" || l.type === "reading") return sum + 15
      return sum + 8
    }, 0)

  const today = new Date().getDay() // 0 Sun ... 6 Sat
  const todayPlanIndex = today >= 1 && today <= 5 ? today - 1 : 4
  let streak = 0
  for (let i = todayPlanIndex; i >= 0; i--) {
    const done = weeklyPlan[i].lessons.length > 0 && weeklyPlan[i].lessons.every((l) => completedSet.has(l.id))
    if (!done) break
    streak++
  }

  const achievements =
    (streak >= 3 ? 1 : 0) +
    (completedLessons >= 5 ? 1 : 0) +
    (minutesStudied >= 120 ? 1 : 0) +
    (wordsLearned >= 100 ? 1 : 0)

  const stats = [
    { label: "Day Streak", value: String(streak), icon: Flame, color: "text-orange-500" },
    { label: "Words Learned", value: String(wordsLearned), icon: BookOpen, color: "text-primary" },
    { label: "Hours Studied", value: (minutesStudied / 60).toFixed(1), icon: Clock, color: "text-blue-500" },
    { label: "Achievements", value: String(achievements), icon: Trophy, color: "text-yellow-500" },
  ]

  const getAssessmentScore = (lessonId: number) => {
    const v = assessmentScores[String(lessonId)]
    return typeof v === "number" ? v : null
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground gap-2">
            Welcome back, <span className="text-primary">{displayName}</span>
          </h1>
          <p className="mt-1 text-muted-foreground">Continue your {preferredLanguage} learning journey</p>
        </div>
        <Badge variant="secondary" className="w-fit gap-1.5 px-3 py-1.5 text-sm">
          <Flame className="h-4 w-4 text-orange-500" />
          {streak} day streak
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="border-border/50">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
                  <Icon className={cn("h-6 w-6", stat.color)} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Weekly Progress</CardTitle>
              <CardDescription>
                {completedLessons} of {totalLessons} lessons completed
              </CardDescription>
            </div>
            <span className="text-2xl font-bold text-primary">{progressPercent}%</span>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={progressPercent} className="h-3" />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border/50 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-primary" />
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {weeklyPlan.map((day, index) => {
              const dayCompleted = day.lessons.length > 0 && day.lessons.every((l) => completedSet.has(l.id))
              const dayPartial = day.lessons.some((l) => completedSet.has(l.id)) && !dayCompleted

              return (
                <button
                  key={day.day}
                  onClick={() => setSelectedDay(index)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg p-3 text-left transition-all",
                    selectedDay === index ? "bg-primary text-primary-foreground" : "bg-accent/50 hover:bg-accent"
                  )}
                >
                  <div>
                    <p className={cn("font-medium", selectedDay === index ? "text-primary-foreground" : "text-foreground")}>
                      {day.day}
                    </p>
                    <p
                      className={cn(
                        "text-sm",
                        selectedDay === index ? "text-primary-foreground/80" : "text-muted-foreground"
                      )}
                    >
                      {day.lessons.length} lessons
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {dayCompleted && (
                      <CheckCircle2
                        className={cn("h-5 w-5", selectedDay === index ? "text-primary-foreground" : "text-primary")}
                      />
                    )}
                    {dayPartial && (
                      <div
                        className={cn("h-2 w-2 rounded-full", selectedDay === index ? "bg-primary-foreground" : "bg-primary")}
                      />
                    )}
                    <ChevronRight
                      className={cn("h-4 w-4", selectedDay === index ? "text-primary-foreground" : "text-muted-foreground")}
                    />
                  </div>
                </button>
              )
            })}
          </CardContent>
        </Card>

        <Card className="border-border/50 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">{weeklyPlan[selectedDay].day}&apos;s Lessons</CardTitle>
            <CardDescription>
              {weeklyPlan[selectedDay].lessons.filter((l) => completedSet.has(l.id)).length} of{" "}
              {weeklyPlan[selectedDay].lessons.length} completed
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {weeklyPlan[selectedDay].lessons.map((lesson) => {
              const completed = completedSet.has(lesson.id)
              const score = lesson.type === "assessment" ? getAssessmentScore(lesson.id) : null
              const Icon = typeIcons[lesson.type] || BookOpen
              const lessonRoute = getLessonRoute(lesson.type)
              const buttonLabel = getLessonButtonLabel(lesson.type)

              return (
                <div
                  key={lesson.id}
                  className={cn(
                    "flex items-center justify-between rounded-xl border p-4 transition-all",
                    completed
                      ? "border-primary/30 bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-accent/50"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", completed ? "bg-primary/20" : "bg-accent")}>
                      <Icon className={cn("h-6 w-6", completed ? "text-primary" : "text-muted-foreground")} />
                    </div>

                    <div>
                      <p className={cn("font-medium", completed ? "text-primary" : "text-foreground")}>{lesson.title}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs capitalize">
                          {lesson.type}
                        </Badge>
                        {typeof score === "number" && (
                          <Badge variant="outline" className="text-xs">
                            {score}%
                          </Badge>
                        )}
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {lesson.duration}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button asChild size="sm" variant={completed ? "outline" : "default"}>
                    <Link to={lessonRoute} onClick={() => markLessonCompleted(lesson.id)}>
                      {completed ? "Review" : buttonLabel}
                    </Link>
                  </Button>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
