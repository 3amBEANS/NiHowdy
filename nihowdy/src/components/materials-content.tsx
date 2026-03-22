"use client"

import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
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
  Trophy,
  Download
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
    slug: "beginner",
    title: "Beginner Level Assessment",
    description: "Test your foundational knowledge",
    questions: 5,
    timeLimit: "15 min",
    difficulty: "Beginner",
    score: 95,
    completed: true,
    badge: "gold",
    path: "/assessment/beginner",
  },
  {
    id: 2,
    slug: "vocabulary",
    title: "Vocabulary Quiz: Daily Life",
    description: "Test your vocabulary on everyday topics",
    questions: 5,
    timeLimit: "10 min",
    difficulty: "Beginner",
    score: 88,
    completed: true,
    badge: "silver",
    path: "/assessment/vocabulary",
  },
  {
    id: 3,
    slug: "grammar",
    title: "Grammar Test: Present Tense",
    description: "Master basic sentence structures",
    questions: 5,
    timeLimit: "20 min",
    difficulty: "Intermediate",
    score: null,
    completed: false,
    path: "/assessment/grammar",
  },
  {
    id: 4,
    slug: "listening",
    title: "Listening Comprehension",
    description: "Test your understanding of phrases",
    questions: 5,
    timeLimit: "25 min",
    difficulty: "Intermediate",
    score: null,
    completed: false,
    path: "/assessment/listening",
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
    description: "Prove your advanced skills",
    questions: 50,
    timeLimit: "60 min",
    difficulty: "Advanced",
    score: null,
    completed: false,
    locked: true,
  },
]

const pdfModules = import.meta.glob("/src/assets/**/*.pdf", {
  eager: true,
  import: "default",
}) as Record<string, string>

const pdfFiles = Object.entries(pdfModules)
  .map(([path, url]) => {
    const fileName = path.split("/").pop() || "document.pdf"
    const label = fileName.replace(/\.pdf$/i, "").replace(/[-_]/g, " ")
    return { fileName, label, url }
  })
  .sort((a, b) => a.label.localeCompare(b.label))

const difficultyColors = {
  Beginner: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Intermediate: "bg-amber-100 text-amber-700 border-amber-200",
  Advanced: "bg-rose-100 text-rose-700 border-rose-200",
} as const

const badgeColors = {
  gold: "bg-yellow-100 text-yellow-700 border-yellow-200",
  silver: "bg-slate-100 text-slate-700 border-slate-200",
  bronze: "bg-orange-100 text-orange-700 border-orange-200",
} as const

export default function MaterialsContent() {
  const [activeTab, setActiveTab] = useState("videos")
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab === "videos" || tab === "assessments" || tab === "resources") {
      setActiveTab(tab)
    }
  }, [searchParams])

  const completedVideos = videos.filter(v => v.completed).length
  const completedAssessments = assessments.filter(a => a.completed).length
  const resourceCount = pdfFiles.length

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
              <p className="text-2xl font-bold text-foreground">{resourceCount}</p>
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
                  {assessment.completed && assessment.path ? (
                    <Link to={assessment.path}>
                      <Button variant="outline" size="sm" className="gap-1.5">
                        Review
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  ) : assessment.locked ? (
                    <Button variant="outline" size="sm" disabled>
                      Locked
                    </Button>
                  ) : assessment.path ? (
                    <Link to={assessment.path}>
                      <Button size="sm" className="gap-1.5">
                        Start Test
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  ) : (
                    <Button size="sm" className="gap-1.5" disabled>
                      Coming Soon
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-4">
          {pdfFiles.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="p-4 text-sm text-muted-foreground">
                No PDF resources found.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {pdfFiles.map((file, index) => (
                <Card key={file.url} className="border-border/50 transition-all hover:border-primary/50">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{file.label}</h3>
                      <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                        <Badge variant="secondary" className="text-xs">PDF</Badge>
                        <span>Resource #{index + 1}</span>
                      </div>
                    </div>
                    <a href={file.url} download={file.fileName} target="_blank" rel="noreferrer">
                      <Button variant="outline" size="sm" className="gap-1.5">
                        Download
                        <Download className="h-4 w-4" />
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

