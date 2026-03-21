"use client"

import { useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Overview } from "@/components/dashboard/overview"
import { Schedule } from "@/components/dashboard/schedule"
import { Subjects } from "@/components/dashboard/subjects"
import { VideoTranslations } from "@/components/dashboard/video-translations"
import { Analytics } from "@/components/dashboard/analytics"
import { Settings } from "@/components/dashboard/settings"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <Overview />
      case "schedule":
        return <Schedule />
      case "subjects":
        return <Subjects />
      case "videos":
        return <VideoTranslations />
      case "analytics":
        return <Analytics />
      case "settings":
        return <Settings />
      default:
        return <Overview />
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab)
            setMobileMenuOpen(false)
          }}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
          <span className="text-lg font-semibold text-foreground">StudyFlow</span>
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-sm font-medium text-primary-foreground">
            JS
          </div>
        </header>

        <div className="p-4 lg:p-8">{renderContent()}</div>
      </main>
    </div>
  )
}
