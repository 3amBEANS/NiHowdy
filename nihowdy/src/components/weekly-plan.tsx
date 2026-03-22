"use client"

import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, CheckCircle2, ChevronRight, Clock } from "lucide-react"
import { cn } from "../lib/utils"

type Lesson = {
  id: number
  title: string
  type: string
  duration: string
  completed: boolean
}

type DayPlan = {
  day: string
  short: string
  lessons: Lesson[]
}

const weeklyPlan: DayPlan[] = [
  { day: "Sunday", short: "Sun", lessons: [] },
  {
    day: "Monday",
    short: "Mon",
    lessons: [
      { id: 1, title: "Vocabulary: Daily Routines", type: "vocabulary", duration: "15 min", completed: true },
      { id: 2, title: "Grammar: Present Tense", type: "grammar", duration: "20 min", completed: true },
    ],
  },
  {
    day: "Tuesday",
    short: "Tue",
    lessons: [
      { id: 3, title: "Listening: Conversations", type: "listening", duration: "15 min", completed: true },
      { id: 4, title: "Speaking Practice", type: "speaking", duration: "10 min", completed: false },
    ],
  },
  {
    day: "Wednesday",
    short: "Wed",
    lessons: [
      { id: 5, title: "Reading: Chinese Dialogue", type: "article", duration: "20 min", completed: false },
      { id: 6, title: "Writing Exercise", type: "writing", duration: "15 min", completed: false },
    ],
  },
  {
    day: "Thursday",
    short: "Thu",
    lessons: [
      { id: 7, title: "Vocabulary: Food & Drinks", type: "vocabulary", duration: "15 min", completed: false },
      { id: 8, title: "Grammar: Articles", type: "grammar", duration: "20 min", completed: false },
      { id: 11, title: "Video Lesson: Ordering at a Café", type: "video", duration: "12 min", completed: false },
    ],
  },
  {
    day: "Friday",
    short: "Fri",
    lessons: [
      { id: 9, title: "Review & Practice", type: "review", duration: "25 min", completed: false },
      { id: 10, title: "Weekly Assessment", type: "assessment", duration: "15 min", completed: false },
    ],
  },
  { day: "Saturday", short: "Sat", lessons: [] },
]

const getLessonRoute = (type: string, lessonId?: number) => {
  if (type === "vocabulary" && lessonId === 7) return "/vocabulary/food-drinks"
  if (type === "reading" || type === "article") return "/articles"
  if (type === "assessment") return "/test-page"
  if (type === "speaking") return "/voice-chat"
  if (type === "video") return "/video"
  if (type === "writing") return "/materials?tab=resources"
  if (type === "vocabulary") return "/materials"
  return "/materials"
}

const getLessonButtonLabel = (type: string, lessonId?: number) => {
  if (type === "vocabulary" && lessonId === 7) return "Study Vocabulary"
  if (type === "reading" || type === "article") return "Read Article"
  if (type === "assessment") return "Start Test"
  if (type === "speaking") return "Start Voice Chat"
  if (type === "video") return "Watch Video"
  if (type === "writing") return "Chinese Worksheet"
  return "Open"
}

export function WeeklyPlan() {
  const todayIndex = 3 // Wednesday default
  const [selectedDay, setSelectedDay] = useState(todayIndex)

  const selected = useMemo(() => weeklyPlan[selectedDay], [selectedDay])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Weekly Plan</h1>
        <p className="text-muted-foreground">Choose a day and continue your lessons.</p>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-primary" />
            This Week
          </CardTitle>
          <CardDescription>Tap a day to view lessons</CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {weeklyPlan.map((day, index) => {
              const completed = day.lessons.length > 0 && day.lessons.every((l) => l.completed)
              const partial = day.lessons.some((l) => l.completed) && !completed

              return (
                <button
                  key={day.day}
                  type="button"
                  onClick={() => setSelectedDay(index)}
                  className={cn(
                    "min-w-[78px] rounded-lg border px-3 py-2 text-left transition",
                    selectedDay === index
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-accent/40 hover:bg-accent"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{day.short}</span>
                    {completed && <CheckCircle2 className="h-4 w-4" />}
                    {partial && !completed && <span className="h-2 w-2 rounded-full bg-current opacity-80" />}
                  </div>
                  <p
                    className={cn(
                      "mt-1 text-xs",
                      selectedDay === index ? "text-primary-foreground/80" : "text-muted-foreground"
                    )}
                  >
                    {day.lessons.length} lesson{day.lessons.length === 1 ? "" : "s"}
                  </p>
                </button>
              )
            })}
          </div>

          <div className="space-y-3">
            <h3 className="text-base font-semibold">{selected.day}&apos;s Lessons</h3>

            {selected.lessons.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                No lessons scheduled for {selected.day}.
              </div>
            ) : (
              selected.lessons.map((lesson) => {
                const lessonRoute = getLessonRoute(lesson.type, lesson.id)
                const label = lesson.completed ? "Review" : getLessonButtonLabel(lesson.type, lesson.id)

                return (
                  <div
                    key={lesson.id}
                    className={cn(
                      "flex items-center justify-between rounded-xl border p-4",
                      lesson.completed
                        ? "border-primary/30 bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-accent/50"
                    )}
                  >
                    <div>
                      <p className={cn("font-medium", lesson.completed ? "text-primary" : "text-foreground")}>
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

                    <Button asChild size="sm" variant={lesson.completed ? "outline" : "default"}>
                      <Link to={lessonRoute} className="inline-flex items-center gap-1">
                        {label}
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default WeeklyPlan