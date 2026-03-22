import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import Navigation from '@/components/navigation'
import StudyPlanDashboard from '@/components/study-plan-dashboard'
import MaterialsContent from '@/components/materials-content'
import VoiceChatPage from '@/pages/VoiceChatPage'
import VideoLearningPage from '@/pages/VideoLearningPage'
import { WeeklyPlan } from './components/weekly-plan'
import AuthPage from './components/auth-page'
import { Callback } from './components/callback'
import TestPage from './components/test-page'
import SettingsPage from './components/settings-page'
import ShortStoryPage from './components/short-story-page'
import ArticlePage from "@/pages/article-page"

function RequireAuth() {
  const { isAuthenticated, isLoading } = useAuth0()
  const location = useLocation()

  if (isLoading) return <div className="p-8">Loading...</div>
  if (!isAuthenticated) return <Navigate to="/auth" replace state={{ from: location }} />

  return <Outlet />
}

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-4 flex justify-end">
        </div>

        <Routes>
          {/* Public routes */}
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/callback" element={<Callback />} />

          {/* Protected routes */}
          <Route element={<RequireAuth />}>
            <Route path="/" element={<StudyPlanDashboard />} />
            <Route path="/materials" element={<MaterialsContent />} />
            <Route path="/weeklyPlan" element={<WeeklyPlan />} />
            <Route path="/voice-chat" element={<VoiceChatPage />} />
            <Route path="/video" element={<VideoLearningPage />} />
            <Route path="/test-page" element={<TestPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/stories" element={<ShortStoryPage />} />
            <Route path="/articles" element={<ArticlePage />} />
          </Route>
        </Routes>
      </main>
    </div>
  )
}

export default App