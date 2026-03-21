"use client"

import { useState } from "react"
import { Card, CardContent} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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

const videos = [
  {
    id: 1,
    title: "Introduction to Spanish Pronunciation",
    duration: "12:34",
    thumbnail: "bg-gradient-to-br from-primary/30 to-accent",
    category: "Beginner",
    views: "2.4k",
    completed: true,
  },
  {
    id: 2,
    title: "Common Phrases for Travel",
    duration: "18:22",
    thumbnail: "bg-gradient-to-br from-accent to-secondary",
    category: "Beginner",
    views: "1.8k",
    completed: true,
  },
  {
    id: 3,
    title: "Mastering Spanish Verb Conjugation",
    duration: "24:15",
    thumbnail: "bg-gradient-to-br from-primary/20 to-primary/40",
    category: "Intermediate",
    views: "3.2k",
    completed: false,
  },
  {
    id: 4,
    title: "Listening Practice: Native Speakers",
    duration: "15:45",
    thumbnail: "bg-gradient-to-br from-secondary to-accent",
    category: "Intermediate",
    views: "956",
    completed: false,
  },
  {
    id: 5,
    title: "Advanced Conversation Techniques",
    duration: "21:08",
    thumbnail: "bg-gradient-to-br from-accent to-primary/30",
    category: "Advanced",
    views: "724",
    completed: false,
    locked: true,
  },
  {
    id: 6,
    title: "Regional Accents & Dialects",
    duration: "28:33",
    thumbnail: "bg-gradient-to-br from-primary/40 to-secondary",
    category: "Advanced",
    views: "512",
    completed: false,
    locked: true,
  },
]

const assessments = [
  {
    id: 1,
    title: "Beginner Level Assessment",
    description: "Test your foundational Spanish knowledge",
    questions: 20,
    timeLimit: "15 min",
    difficulty: "Beginner",
    score: 95,
    completed: true,
    badge: "gold",
  },
  {
    id: 2,
    title: "Vocabulary Quiz: Daily Life",
    description: "Test your vocabulary on everyday topics",
    questions: 15,
    timeLimit: "10 min",
    difficulty: "Beginner",
    score: 88,
    completed: true,
    badge: "silver",
  },
  {
    id: 3,
    title: "Grammar Test: Present Tense",
    description: "Master the present tense conjugations",
    questions: 25,
    timeLimit: "20 min",
    difficulty: "Intermediate",
    score: null,
    completed: false,
  },
  {
    id: 4,
    title: "Listening Comprehension",
    description: "Understand native speaker conversations",
    questions: 10,
    timeLimit: "25 min",
    difficulty: "Intermediate",
    score: null,
    completed: false,
  },
  {
    id: 5,
    title: "Mid-Course Evaluation",
    description: "Comprehensive review of all topics covered",
    questions: 40,
    timeLimit: "45 min",
    difficulty: "Intermediate",
    score: null,
    completed: false,
    locked: true,
  },
  {
    id: 6,
    title: "Advanced Proficiency Test",
    description: "Prove your advanced Spanish skills",
    questions: 50,
    timeLimit: "60 min",
    difficulty: "Advanced",
    score: null,
    completed: false,
    locked: true,
  },
]

const resources = [
  {
    id: 1,
    title: "Spanish Grammar Cheat Sheet",
    type: "PDF",
    pages: 12,
    downloads: "4.2k",
  },
  {
    id: 2,
    title: "Vocabulary Flashcards: Top 500 Words",
    type: "Interactive",
    cards: 500,
    downloads: "3.8k",
  },
  {
    id: 3,
    title: "Verb Conjugation Tables",
    type: "PDF",
    pages: 24,
    downloads: "2.9k",
  },
  {
    id: 4,
    title: "Practice Worksheets Bundle",
    type: "PDF",
    pages: 45,
    downloads: "1.7k",
  },
]

const badgeColors = {
  gold: "bg-yellow-100 text-yellow-700 border-yellow-300",
  silver: "bg-gray-100 text-gray-700 border-gray-300",
  bronze: "bg-orange-100 text-orange-700 border-orange-300",
}

const difficultyColors = {
  Beginner: "bg-green-100 text-green-700",
  Intermediate: "bg-blue-100 text-blue-700",
  Advanced: "bg-purple-100 text-purple-700",
}

export function MaterialsContent() {
  const [activeTab, setActiveTab] = useState("videos")

  const completedVideos = videos.filter(v => v.completed).length
  const completedAssessments = assessments.filter(a => a.completed).length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Supplemental Materials
        </h1>
        <p className="mt-1 text-muted-foreground">
          Videos, assessments, and resources to enhance your learning
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="border-border/50">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
              <Video className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{completedVideos}/{videos.length}</p>
              <p className="text-sm text-muted-foreground">Videos Watched</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
              <ClipboardCheck className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{completedAssessments}/{assessments.length}</p>
              <p className="text-sm text-muted-foreground">Assessments</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
              <Trophy className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">92%</p>
              <p className="text-sm text-muted-foreground">Avg. Score</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
              <FileText className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{resources.length}</p>
              <p className="text-sm text-muted-foreground">Resources</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="videos" className="gap-2">
            <Video className="h-4 w-4" />
            <span className="hidden sm:inline">Videos</span>
          </TabsTrigger>
          <TabsTrigger value="assessments" className="gap-2">
            <ClipboardCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Assessments</span>
          </TabsTrigger>
          <TabsTrigger value="resources" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Resources</span>
          </TabsTrigger>
        </TabsList>

        {/* Videos Tab */}
        <TabsContent value="videos" className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <Card 
                key={video.id} 
                className={cn(
                  "group overflow-hidden border-border/50 transition-all",
                  video.locked ? "opacity-60" : "hover:border-primary/50 hover:shadow-lg"
                )}
              >
                <div className={cn(
                  "relative aspect-video",
                  video.thumbnail
                )}>
                  {video.completed && (
                    <div className="absolute right-2 top-2">
                      <CheckCircle2 className="h-6 w-6 text-primary drop-shadow-md" />
                    </div>
                  )}
                  {video.locked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                      <Lock className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  {!video.locked && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg">
                        <Play className="h-6 w-6 text-primary-foreground" />
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 rounded bg-foreground/80 px-2 py-0.5 text-xs text-background">
                    {video.duration}
                  </div>
                </div>
                <CardContent className="p-4">
                  <Badge 
                    variant="secondary" 
                    className={cn("mb-2 text-xs", difficultyColors[video.category as keyof typeof difficultyColors])}
                  >
                    {video.category}
                  </Badge>
                  <h3 className="font-semibold text-foreground line-clamp-2">
                    {video.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {video.views} views
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Assessments Tab */}
        <TabsContent value="assessments" className="space-y-4">
          {assessments.map((assessment) => (
            <Card 
              key={assessment.id} 
              className={cn(
                "border-border/50 transition-all",
                assessment.locked ? "opacity-60" : "hover:border-primary/50"
              )}
            >
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                    assessment.completed ? "bg-primary/20" : "bg-accent"
                  )}>
                    {assessment.locked ? (
                      <Lock className="h-6 w-6 text-muted-foreground" />
                    ) : assessment.completed ? (
                      <Award className={cn(
                        "h-6 w-6",
                        assessment.badge === "gold" ? "text-yellow-500" : "text-gray-400"
                      )} />
                    ) : (
                      <ClipboardCheck className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">
                        {assessment.title}
                      </h3>
                      {assessment.completed && assessment.badge && (
                        <Badge className={cn("text-xs", badgeColors[assessment.badge as keyof typeof badgeColors])}>
                          {assessment.score}%
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {assessment.description}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <Badge 
                        variant="secondary" 
                        className={cn("text-xs", difficultyColors[assessment.difficulty as keyof typeof difficultyColors])}
                      >
                        {assessment.difficulty}
                      </Badge>
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <BookOpen className="h-3.5 w-3.5" />
                        {assessment.questions} questions
                      </span>
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {assessment.timeLimit}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {assessment.completed ? (
                    <Button variant="outline" size="sm" className="gap-1.5">
                      Review
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  ) : assessment.locked ? (
                    <Button variant="outline" size="sm" disabled>
                      Locked
                    </Button>
                  ) : (
                    <Button size="sm" className="gap-1.5">
                      Start Test
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {resources.map((resource) => (
              <Card key={resource.id} className="border-border/50 transition-all hover:border-primary/50">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">
                      {resource.title}
                    </h3>
                    <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                      <Badge variant="secondary" className="text-xs">
                        {resource.type}
                      </Badge>
                      <span>
                        {resource.pages ? `${resource.pages} pages` : `${resource.cards} cards`}
                      </span>
                      <span>{resource.downloads} downloads</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Download
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default MaterialsContent

