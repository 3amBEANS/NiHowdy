import { Routes, Route } from 'react-router-dom'
import Navigation from '@/components/navigation'
import StudyPlanDashboard from '@/components/study-plan-dashboard'
import MaterialsContent from '@/components/materials-content'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Routes>
        <Route path="/" element={<StudyPlanDashboard />} />
        <Route path="/materials" element={<MaterialsContent />} />
      </Routes>
    </div>
  )
}

export default App