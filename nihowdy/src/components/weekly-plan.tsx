"use client"

import React, { useState } from "react"
import { Badge } from "@/components/ui/badge"
import {
  Clock, BookOpen, CheckCircle2, Lock,
  Headphones, PenTool, MessageCircle, Sparkles, Trophy, ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"

const days = [
  { day: "Sunday", short: "Sun", lessons: [] },
  {
    day: "Monday", short: "Mon", lessons: [
      { id: 1, title: "Vocabulary: Food & Drinks", type: "vocabulary", duration: "15 min", completed: true },
      { id: 2, title: "Grammar: Present Tense", type: "grammar", duration: "20 min", completed: false },
    ]
  },
  {
    day: "Tuesday", short: "Tue", lessons: [
      { id: 3, title: "Listening: Conversations", type: "listening", duration: "15 min", completed: true },
      { id: 4, title: "Speaking Practice", type: "speaking", duration: "10 min", completed: false },
    ]
  },
  {
    day: "Wednesday", short: "Wed", lessons: [
      { id: 5, title: "Reading: Short Story", type: "reading", duration: "20 min", completed: false },
      { id: 6, title: "Writing Exercise", type: "writing", duration: "15 min", completed: false },
    ]
  },
  {
    day: "Thursday", short: "Thu", lessons: [
      { id: 7, title: "Vocabulary: Food & Drinks", type: "vocabulary", duration: "15 min", completed: false },
      { id: 8, title: "Grammar: Articles", type: "grammar", duration: "20 min", completed: false },
    ]
  },
  {
    day: "Friday", short: "Fri", lessons: [
      { id: 9, title: "Review & Practice", type: "review", duration: "25 min", completed: false },
      { id: 10, title: "Weekly Assessment", type: "assessment", duration: "15 min", completed: false },
    ]
  },
  { day: "Saturday", short: "Sat", lessons: [] },
]

const typeConfig: Record<string, { icon: React.ElementType; label: string; dot: string }> = {
  vocabulary: { icon: BookOpen,      label: "Vocab",      dot: "bg-sky-400" },
  grammar:    { icon: PenTool,       label: "Grammar",    dot: "bg-violet-400" },
  listening:  { icon: Headphones,    label: "Listening",  dot: "bg-amber-400" },
  speaking:   { icon: MessageCircle, label: "Speaking",   dot: "bg-rose-400" },
  reading:    { icon: BookOpen,      label: "Reading",    dot: "bg-teal-400" },
  writing:    { icon: PenTool,       label: "Writing",    dot: "bg-pink-400" },
  review:     { icon: Sparkles,      label: "Review",     dot: "bg-blue-400" },
  assessment: { icon: Trophy,        label: "Assessment", dot: "bg-yellow-400" },
}

export function WeeklyPlan() {
  const [selectedDay, setSelectedDay] = useState(1)
  const current = days[selectedDay]

  const completedCount = current.lessons.filter(l => l.completed).length
  const totalCount = current.lessons.length
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  return (
    <div className="flex flex-col h-full min-h-screen w-full bg-background text-foreground">

      {/* Top header bar */}
      <div className="border-b border-border px-6 pt-8 pb-0">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-1">Spanish · Week 12</p>
          <h1 className="text-3xl font-bold tracking-tight mb-6">Weekly Plan</h1>

          {/* Day tabs */}
          <div className="flex gap-1 overflow-x-auto pb-px">
            {days.map((day, index) => {
              const isActive = selectedDay === index
              const done = day.lessons.length > 0 && day.lessons.every(l => l.completed)
              const partial = day.lessons.some(l => l.completed) && !done
              const empty = day.lessons.length === 0

              return (
                <button
                  key={day.day}
                  onClick={() => setSelectedDay(index)}
                  className={cn(
                    "relative flex flex-col items-center gap-1 px-4 py-3 rounded-t-lg text-sm font-medium transition-all select-none shrink-0",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive
                      ? "bg-card border border-border border-b-card text-foreground -mb-px z-10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <span className="hidden sm:block">{day.day}</span>
                  <span className="sm:hidden">{day.short}</span>

                  {/* status dot */}
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full transition-colors",
                    done    ? "bg-emerald-500" :
                    partial ? "bg-amber-400"   :
                    empty   ? "bg-transparent" :
                              "bg-muted-foreground/30"
                  )} />
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 px-6 py-8">
        <div className="max-w-6xl mx-auto">

          {current.lessons.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Rest day</p>
                <p className="text-sm text-muted-foreground mt-1">No lessons scheduled for {current.day}.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">

              {/* Lessons list */}
              <div className="flex flex-col gap-3">
                {current.lessons.map((lesson, i) => {
                  const cfg = typeConfig[lesson.type] || typeConfig.vocabulary
                  const Icon = cfg.icon
                  return (
                    <div
                      key={lesson.id}
                      className={cn(
                        "group flex items-center gap-4 rounded-2xl border px-5 py-4 transition-all",
                        lesson.completed
                          ? "border-border bg-muted/40"
                          : "border-border bg-card hover:border-foreground/20 hover:shadow-sm cursor-pointer"
                      )}
                      style={{ animationDelay: `${i * 60}ms` }}
                    >
                      {/* Icon */}
                      <div className={cn(
                        "shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-colors",
                        lesson.completed ? "bg-muted" : "bg-secondary group-hover:bg-muted"
                      )}>
                        <Icon className={cn(
                          "w-5 h-5",
                          lesson.completed ? "text-muted-foreground" : "text-foreground"
                        )} />
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "font-semibold text-base leading-tight truncate",
                          lesson.completed && "text-muted-foreground line-through decoration-muted-foreground/50"
                        )}>
                          {lesson.title}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className={cn("inline-block w-2 h-2 rounded-full", cfg.dot)} />
                          <span className="text-xs font-medium text-muted-foreground capitalize">{cfg.label}</span>
                          <span className="text-muted-foreground/40 text-xs">·</span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {lesson.duration}
                          </span>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="shrink-0 flex items-center gap-2">
                        {lesson.completed ? (
                          <div className="flex items-center gap-1.5 text-emerald-500">
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="text-xs font-semibold hidden sm:block">Done</span>
                          </div>
                        ) : (
                          <a href="/test-page" className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-muted-foreground hidden sm:block">Start</span>
                            <ChevronRight className="w-4 h-4 text-muted-foreground hover:text-foreground hover:translate-x-0.5 transition-all" />
                          </a>
                        )}
                      </div>
                        
                    </div>
                  )
                })}
              </div>

              {/* Sidebar summary */}
              <div className="flex flex-col gap-4 lg:sticky lg:top-8">

                {/* Progress card */}
                <div className="rounded-2xl border border-border bg-card p-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">{current.day}</p>

                  <div className="flex items-end justify-between mb-3">
                    <span className="text-4xl font-bold tabular-nums">{completedCount}</span>
                    <span className="text-muted-foreground text-sm mb-1">/ {totalCount} lessons</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-foreground transition-all duration-700"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <p className="text-xs text-muted-foreground mt-2">
                    {progress === 100
                      ? "All done! Great work 🎉"
                      : `${totalCount - completedCount} lesson${totalCount - completedCount !== 1 ? "s" : ""} remaining`}
                  </p>
                </div>

                {/* Lesson type breakdown */}
                <div className="rounded-2xl border border-border bg-card p-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Topics</p>
                  <div className="flex flex-col gap-2.5">
                    {current.lessons.map((lesson) => {
                      const cfg = typeConfig[lesson.type] || typeConfig.vocabulary
                      return (
                        <div key={lesson.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={cn("w-2 h-2 rounded-full", cfg.dot)} />
                            <span className="text-sm text-muted-foreground">{cfg.label}</span>
                          </div>
                          {lesson.completed
                            ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            : <Lock className="w-3.5 h-3.5 text-muted-foreground/50" />
                          }
                        </div>
                      )
                    })}
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default WeeklyPlan