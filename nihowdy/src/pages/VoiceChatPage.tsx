import { useState } from 'react'
import { VoiceChat } from '@/components/VoiceChat'
import type { Mission } from '@/components/VoiceChat'
import { BookOpen, Mic, Globe } from 'lucide-react'

const LANGUAGES = [
  { code: 'zh', label: '🇨🇳 Mandarin Chinese' },
  { code: 'ja', label: '🇯🇵 Japanese' },
  { code: 'ko', label: '🇰🇷 Korean' },
  { code: 'es', label: '🇪🇸 Spanish' },
  { code: 'fr', label: '🇫🇷 French' },
  { code: 'en', label: '🇬🇧 English' },
]

const SAMPLE_MISSIONS: Mission[] = [
  {
    description: 'Find out what the most popular food in the country is.',
    hint: 'Ask the bot about traditional or popular local dishes!',
    missionContext:
      'The learner wants to know the most iconic national dish of the country whose language they are learning. You ARE that native speaker and you know the answer — Japanese: Ramen (ラーメン), Mandarin Chinese: Dumplings/Jiaozi (饺子), Korean: Kimchi (김치), Spanish: Paella, French: Croissant/Baguette, English: Fish and Chips. When the learner asks about food or cuisine, enthusiastically tell them the specific dish. Set missionComplete=true in the same response where you name the dish.',
    answer: 'Ramen',
    wrongChoices: ['Pizza', 'Tacos', 'Croissant'],
    xpReward: 120,
  },
  {
    description: 'Ask for directions to the nearest train station.',
    hint: 'Try saying "Where is the train station?" in the language!',
    missionContext:
      'The learner wants directions to the nearest train station. You are a local who knows the way. When the learner asks for directions, give them a simple set of directions (e.g. turn left, go straight two blocks). Set missionComplete=true in the same response where you give them the actual directions.',
    answer: 'Turn left at the corner, then go straight for 2 blocks',
    wrongChoices: ['Take the bus line 5', 'It is across the bridge', 'Walk south for 10 minutes'],
    xpReward: 100,
  },
  {
    description: 'Order a coffee at a café.',
    hint: 'Ask for a coffee — try adding "please" in the language!',
    missionContext:
      'The learner is at a café and wants to order a coffee. Play the role of a friendly barista. The mission is complete as soon as the learner has asked for a coffee and you have accepted the order — you do NOT need to ask follow-up questions about size or type. Keep it simple: accept the order and confirm it. Set missionComplete=true in the same response where you confirm the order.',
    answer: 'One coffee coming right up!',
    wrongChoices: ['Sorry, we are closed', 'We only serve tea', 'You need a reservation'],
    xpReward: 80,
  },
]

export default function VoiceChatPage() {
  const [selectedLang, setSelectedLang] = useState('ja')
  const [selectedMission, setSelectedMission] = useState<Mission | undefined>(SAMPLE_MISSIONS[0])
  const [missionIndex, setMissionIndex] = useState(0)
  const [completedMissions, setCompletedMissions] = useState<Set<number>>(new Set())
  const [key, setKey] = useState(0)

  const handleLangChange = (code: string) => {
    setSelectedLang(code)
    setKey((k) => k + 1)
  }

  const handleMissionChange = (idx: number) => {
    setMissionIndex(idx)
    setSelectedMission(SAMPLE_MISSIONS[idx])
    setKey((k) => k + 1)
  }

  const handleMissionComplete = () => {
    setCompletedMissions((prev) => new Set([...prev, missionIndex]))
  }

  const langLabel = LANGUAGES.find((l) => l.code === selectedLang)?.label ?? selectedLang

  const getMissionTabClass = (idx: number) => {
    const isSelected = missionIndex === idx
    const isCompleted = completedMissions.has(idx)

    if (isCompleted) return 'bg-emerald-600 text-white'
    if (isSelected) return 'bg-indigo-500 text-white'
    return 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
          <Mic className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Voice Practice</h1>
          <p className="text-sm text-muted-foreground">Speak with an AI tutor in your target language</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">

        {/* Sidebar: controls */}
        <div className="flex flex-col gap-4">

          {/* Language picker */}
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <Globe className="h-3.5 w-3.5" />
              Language
            </div>
            <div className="flex flex-col gap-1.5">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLangChange(lang.code)}
                  className={`rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                    selectedLang === lang.code
                      ? 'bg-indigo-500 text-white shadow-sm shadow-indigo-400/30'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mission picker */}
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5" />
              Mission
            </div>
            <div className="flex flex-col gap-1.5">
              {SAMPLE_MISSIONS.map((mission, idx) => (
                <button
                  key={idx}
                  onClick={() => handleMissionChange(idx)}
                  className={`rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${getMissionTabClass(idx)}`}
                >
                  <span className="mr-1.5">
                    {completedMissions.has(idx) ? '✅' : '🎯'}
                  </span>
                  {mission.description}
                </button>
              ))}
              <button
                onClick={() => { setSelectedMission(undefined); setKey((k) => k + 1) }}
                className={`rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                  !selectedMission
                    ? 'bg-indigo-500 text-white shadow-sm shadow-indigo-400/30'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <span className="mr-1.5">💬</span>
                Free conversation
              </button>
            </div>
          </div>

          {/* Tips */}
          <div className="rounded-2xl border border-border bg-card/50 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Tips</p>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li>🎙️ Tap the mic to start speaking</li>
              <li>⚠️ Orange badges = pronunciation to work on</li>
              <li>🔥 Complete faster for XP bonus</li>
              <li>📚 Word bank tracks tricky words</li>
            </ul>
          </div>
        </div>

        {/* Main: VoiceChat component */}
        <div className="flex justify-center">
          <div className="w-full max-w-lg">
            <VoiceChat
              key={key}
              language={selectedLang}
              languageName={langLabel}
              mission={selectedMission}
              apiEndpoint="/api/voice"
              onMissionComplete={handleMissionComplete}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
