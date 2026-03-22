import { Routes, Route } from 'react-router-dom'
import Navigation from '@/components/navigation'
import StudyPlanDashboard from '@/components/study-plan-dashboard'
import MaterialsContent from '@/components/materials-content'
import { WeeklyPlan } from './components/weekly-plan'
import {Auth0Provider} from "@auth0/auth0-react"
import { StrictMode } from 'react'

function App() {
  return (
    <StrictMode>
      <Auth0Provider
        domain="dev-5d72ymseihy5vc1o.us.auth0.com"
        clientId="NazzAxLakglLksC63NZ5D8Kv22VJmXZa"
        authorizationParams={{ redirect_uri: window.location.origin }}
      >
        <div className="min-h-screen bg-background">
          <Navigation />
          <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            <Routes>
              <Route path="/" element={<StudyPlanDashboard />} />
              <Route path="/materials" element={<MaterialsContent />} />
              <Route path="/weeklyPlan" element={<WeeklyPlan />} />
            </Routes>
          </main>
        </div>
      </Auth0Provider>
    </StrictMode>
  )
}

export default App