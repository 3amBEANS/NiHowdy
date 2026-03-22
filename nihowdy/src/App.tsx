import { Routes, Route } from 'react-router-dom'
import Navigation from '@/components/navigation'
import StudyPlanDashboard from '@/components/study-plan-dashboard'
import MaterialsContent from '@/components/materials-content'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="mx-auto w-full max-w-7.5xl px-4 sm:px-6 lg:px-8 py-6">
        <Routes>
          <Route path="/" element={<StudyPlanDashboard />} />
          <Route path="/materials" element={<MaterialsContent />} />
        </Routes>
      </main>
    </div>
  )
}

export default App