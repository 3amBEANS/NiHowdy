"use client"

import { useState } from "react"
import { Card, CardContent} from "@/components/ui/card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Play, 
  Clock, 
  BookOpen, 
  ClipboardCheck, 
  CheckCircle2,
  Lock,
  ChevronRight,
  Video,
  FileText,
  Award,
  Trophy
} from "lucide-react"
import { cn } from "@/lib/utils"

const days = [
    {day: "Sunday", lessons: []},

    { day: "Monday", lessons: [
        //Please ignore the dates, they are just placeholders and not relevant to the functionality of the component
        { id: 1, title: "Vocabulary: Food & Drinks", type: "vocabulary", duration: "15 min", completed: true },
        { id: 2, title: "Grammar: Present Tense", type: "grammar", duration: "20 min", completed: false },]
    },
    { day: "Tuesday", lessons: [
        { id: 3, title: "Listening: Conversations", type: "listening", duration: "15 min", completed: true },
        { id: 4, title: "Speaking Practice", type: "speaking", duration: "10 min", completed: false },]
    },
    { day: "Wednesday", lessons: [
        { id: 5, title: "Reading: Short Story", type: "reading", duration: "20 min", completed: false },
        { id: 6, title: "Writing Exercise", type: "writing", duration: "15 min", completed: false },]
    },
    { day: "Thursday", lessons: [
        { id: 7, title: "Vocabulary: Food & Drinks", type: "vocabulary", duration: "15 min", completed: false },
        { id: 8, title: "Grammar: Articles", type: "grammar", duration: "20 min", completed: false },]
    },
    { day: "Friday", lessons: [
        { id: 9, title: "Review & Practice", type: "review", duration: "25 min", completed: false },
        { id: 10, title: "Weekly Assessment", type: "assessment", duration: "15 min", completed: false },]
    },
    {day: "Saturday", lessons: []},
]



export function WeeklyPlan() {
    const [selectedDay, setSelectedDay] = useState(0)
    
    return ( 
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h1 className="text-2xl font-bold mb-6">Weekly Plan</h1>
            <Tabs defaultValue={days[selectedDay].day} className="w-full">
                <TabsList className="bg-transparent border-b border-border mb-4">
                    {days.map((day, index) => (
                        <TabsTrigger 
                            key={day.day}
                            value={day.day}
                            onClick={() => setSelectedDay(index)}
                            className={cn(
                                "data-[state=active]:border-primary data-[state=active]:border-b-2",    
                                "px-3 py-2 text-sm font-medium",
                                "text-muted-foreground hover:text-foreground",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                "rounded-t-lg",
                                selectedDay === index ? "border-primary border-b-2" : "border-transparent"
                            )}
                        >
                            <div className="flex items-center gap-2">
                                <p>{day.day}</p>
                                <Badge variant="outline" className="text-xs">
                                    {day.lessons.length} Lessons
                                </Badge>
                            </div>
                      </TabsTrigger>
                    ))}
                </TabsList>
                {days.map((day) => (
                    <TabsContent key={day.day} value={day.day}>
                        {day.lessons.length === 0 ? (
                            <div className="text-center py-10">
                                <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                <p className="text-muted-foreground">No lessons scheduled for {day.day}.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {day.lessons.map((lesson) => (
                                    <Card key={lesson.id} className="border">
                                        <CardContent className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-lg font-semibold">{lesson.title}</h3>
                                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <Clock      className="h-4 w-4" />
                                                    {lesson.duration}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {lesson.completed ? (
                                                    <>
                                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                        <Badge >Completed</Badge>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Lock className="h-5 w-5 text-red-500" />
                                                        <Badge variant="destructive">Pending</Badge>
                                                    </>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    )
}

export default WeeklyPlan