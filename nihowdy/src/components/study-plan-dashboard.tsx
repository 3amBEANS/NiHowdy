import { useEffect, useMemo, useState } from "react"
import { useAuth0 } from "@auth0/auth0-react"
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
  Sparkles
} from "lucide-react"
import { cn } from "../lib/utils"

type SettingsData = {
  displayName?: string
  learningLanguage?: string
}

const SETTINGS_KEY = "nihowdy.settings"

const weeklyPlan = [
  {
    day: "Monday",
    lessons: [
      { id: 1, title: "Vocabulary: Daily Routines", type: "vocabulary", duration: "15 min", completed: true },
      { id: 2, title: "Grammar: Present Tense", type: "grammar", duration: "20 min", completed: true },
    ]
  },
  {
    day: "Tuesday",
    lessons: [
      { id: 3, title: "Listening: Conversations", type: "listening", duration: "15 min", completed: true },
      { id: 4, title: "Speaking Practice", type: "speaking", duration: "10 min", completed: false },
    ]
  },
  {
    day: "Wednesday",
    lessons: [
      { id: 5, title: "Reading: Short Story", type: "reading", duration: "20 min", completed: false },
      { id: 6, title: "Writing Exercise", type: "writing", duration: "15 min", completed: false },
    ]
  },
  {
    day: "Thursday",
    lessons: [
      { id: 7, title: "Vocabulary: Food & Drinks", type: "vocabulary", duration: "15 min", completed: false },
      { id: 8, title: "Grammar: Articles", type: "grammar", duration: "20 min", completed: false },
    ]
  },
  {
    day: "Friday",
    lessons: [
      { id: 9, title: "Review & Practice", type: "review", duration: "25 min", completed: false },
      { id: 10, title: "Weekly Assessment", type: "assessment", duration: "15 min", completed: false },
    ]
  },
]

const stats = [
  { label: "Day Streak", value: "12", icon: Flame, color: "text-orange-500" },
  { label: "Words Learned", value: "248", icon: BookOpen, color: "text-primary" },
  { label: "Hours Studied", value: "24", icon: Clock, color: "text-blue-500" },
  { label: "Achievements", value: "8", icon: Trophy, color: "text-yellow-500" },
]

const typeIcons: Record<string, React.ElementType> = {
  vocabulary: BookOpen,
  grammar: PenTool,
  listening: Headphones,
  speaking: MessageCircle,
  reading: BookOpen,
  writing: PenTool,
  review: Sparkles,
  assessment: Trophy,
}

export function StudyPlanDashboard() {
  const [selectedDay, setSelectedDay] = useState(2) // Wednesday (today)
  const { user } = useAuth0()
  const [settings, setSettings] = useState<SettingsData>({})

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

  const completedLessons = weeklyPlan.flatMap(d => d.lessons).filter(l => l.completed).length
  const totalLessons = weeklyPlan.flatMap(d => d.lessons).length
  const progressPercent = Math.round((completedLessons / totalLessons) * 100)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground gap-2">
            Welcome back, <span className="text-primary">{displayName}</span>
          </h1>
          <p className="mt-1 text-muted-foreground">
            Continue your {preferredLanguage} learning journey
          </p>
        </div>
        <Badge variant="secondary" className="w-fit gap-1.5 px-3 py-1.5 text-sm">
          <Flame className="h-4 w-4 text-orange-500" />
          12 day streak
        </Badge>
      </div>

      {/* Stats Grid */}
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

      {/* Weekly Progress */}
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

      {/* Study Plan Calendar */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Day Selector */}
        <Card className="border-border/50 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-primary" />
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {weeklyPlan.map((day, index) => {
              const dayCompleted = day.lessons.every(l => l.completed)
              const dayPartial = day.lessons.some(l => l.completed) && !dayCompleted
              return (
                <button
                  key={day.day}
                  onClick={() => setSelectedDay(index)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg p-3 text-left transition-all",
                    selectedDay === index
                      ? "bg-primary text-primary-foreground"
                      : "bg-accent/50 hover:bg-accent"
                  )}
                >
                  <div>
                    <p className={cn(
                      "font-medium",
                      selectedDay === index ? "text-primary-foreground" : "text-foreground"
                    )}>
                      {day.day}
                    </p>
                    <p className={cn(
                      "text-sm",
                      selectedDay === index ? "text-primary-foreground/80" : "text-muted-foreground"
                    )}>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {dayCompleted && (
                      <CheckCircle2 className={cn(
                        "h-5 w-5",
                        selectedDay === index ? "text-primary-foreground" : "text-primary"
                      )} />
                    )}
                    {dayPartial && (
                      <div className={cn(
                        "h-2 w-2 rounded-full",
                        selectedDay === index ? "bg-primary-foreground" : "bg-primary"
                      )} />
                    )}
                    <ChevronRight className={cn(
                      "h-4 w-4",
                      selectedDay === index ? "text-primary-foreground" : "text-muted-foreground"
                    )} />
                  </div>
                </button>
              )
            })}
          </CardContent>
        </Card>

        {/* Day's Lessons */}
        <Card className="border-border/50 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">
              {weeklyPlan[selectedDay].day}&apos;s Lessons
            </CardTitle>
            <CardDescription>
              {weeklyPlan[selectedDay].lessons.filter(l => l.completed).length} of{" "}
              {weeklyPlan[selectedDay].lessons.length} completed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {weeklyPlan[selectedDay].lessons.map((lesson) => {
              const Icon = typeIcons[lesson.type] || BookOpen
              return (
                <div
                  key={lesson.id}
                  className={cn(
                    "flex items-center justify-between rounded-xl border p-4 transition-all",
                    lesson.completed
                      ? "border-primary/30 bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-accent/50"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-xl",
                      lesson.completed ? "bg-primary/20" : "bg-accent"
                    )}>
                      <Icon className={cn(
                        "h-6 w-6",
                        lesson.completed ? "text-primary" : "text-muted-foreground"
                      )} />
                    </div>
                    <div>
                      <p className={cn(
                        "font-medium",
                        lesson.completed ? "text-primary" : "text-foreground"
                      )}>
                        {lesson.title}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs capitalize">
                          {lesson.type}
                        </Badge>
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {lesson.duration}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {lesson.completed ? (
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    ) : (
                      <Button size="sm" className="gap-1.5">
                        Start
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-border/50 bg-gradient-to-r from-primary/10 via-accent to-secondary">
        <CardContent className="flex flex-col items-center justify-between gap-4 p-6 sm:flex-row">
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-semibold text-foreground">
              Ready for your next lesson?
            </h3>
            <p className="text-sm text-muted-foreground">
              Continue where you left off and keep your streak going!
            </p>
          </div>
          <Button size="lg" className="gap-2 px-6">
            <Sparkles className="h-5 w-5" />
            Continue Learning
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default StudyPlanDashboard