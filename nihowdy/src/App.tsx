import { Routes, Route } from 'react-router-dom'
import Navigation from '@/components/navigation'
import StudyPlanDashboard from '@/components/study-plan-dashboard'
import MaterialsContent from '@/components/materials-content'
import VoiceChatPage from '@/pages/VoiceChatPage'
import VideoLearningPage from '@/pages/VideoLearningPage'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Routes>
        <Route
          path="/"
          element={
            <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
              <StudyPlanDashboard />
            </main>
          }
        />
        <Route
          path="/materials"
          element={
            <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
              <MaterialsContent />
            </main>
          }
        />
        <Route path="/voice-chat" element={<VoiceChatPage />} />
        <Route path="/video" element={<VideoLearningPage />} />
      </Routes>
    </div>
  )
}

export default App