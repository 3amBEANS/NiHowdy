import { useState } from 'react'
import { Plus, Trash2, Check, BookOpen, Clock } from 'lucide-react'

interface StudyTask {
  id: number
  language: string
  task: string
  duration: number // in minutes
  completed: boolean
}

const LANGUAGES = ['Spanish', 'French', 'Japanese', 'German', 'Korean', 'Chinese', 'Italian', 'Portuguese', 'Russian', 'Arabic']

export default function App() {
  const [tasks, setTasks] = useState<StudyTask[]>([])
  const [language, setLanguage] = useState(LANGUAGES[0])
  const [task, setTask] = useState('')
  const [duration, setDuration] = useState(30)

  const addTask = () => {
    if (!task.trim()) return
    
    setTasks([
      ...tasks,
      {
        id: Date.now(),
        language,
        task: task.trim(),
        duration,
        completed: false
      }
    ])
    setTask('')
  }

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ))
  }

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(t => t.id !== id))
  }

  const totalMinutes = tasks.reduce((acc, t) => acc + t.duration, 0)
  const completedMinutes = tasks.filter(t => t.completed).reduce((acc, t) => acc + t.duration, 0)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-emerald-600 text-white py-6 px-4 shadow-lg">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <BookOpen size={32} />
            <h1 className="text-2xl font-bold">Language Study Planner</h1>
          </div>
          <p className="mt-1 text-emerald-100">Plan your daily language learning</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Stats */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-slate-500 text-sm">Today's Progress</p>
              <p className="text-2xl font-bold text-slate-800">
                {completedMinutes} <span className="text-slate-400 font-normal">/ {totalMinutes} min</span>
              </p>
            </div>
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
              <span className="text-emerald-600 font-bold">
                {totalMinutes > 0 ? Math.round((completedMinutes / totalMinutes) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Add Task Form */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 space-y-4">
          <h2 className="font-semibold text-slate-800">Add Study Task</h2>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-600 mb-1">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Duration (min)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Math.max(5, parseInt(e.target.value) || 0))}
                min="5"
                step="5"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">Task Description</label>
            <input
              type="text"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTask()}
              placeholder="e.g., Practice vocab flashcards, Watch a video lesson..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            onClick={addTask}
            className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors"
          >
            <Plus size={20} />
            Add Task
          </button>
        </div>

        {/* Task List */}
        <div className="space-y-3">
          <h2 className="font-semibold text-slate-800">Study Tasks ({tasks.length})</h2>
          
          {tasks.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center border border-slate-200">
              <BookOpen className="mx-auto text-slate-300 mb-2" size={40} />
              <p className="text-slate-500">No tasks yet. Add your first study task above!</p>
            </div>
          ) : (
            tasks.map(t => (
              <div
                key={t.id}
                className={`bg-white rounded-xl p-4 border shadow-sm flex items-center gap-3 transition-all ${
                  t.completed 
                    ? 'border-emerald-200 bg-emerald-50' 
                    : 'border-slate-200'
                }`}
              >
                <button
                  onClick={() => toggleTask(t.id)}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                    t.completed 
                      ? 'bg-emerald-500 border-emerald-500 text-white' 
                      : 'border-slate-300 hover:border-emerald-500'
                  }`}
                >
                  {t.completed && <Check size={16} />}
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {t.language}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock size={12} /> {t.duration} min
                    </span>
                  </div>
                  <p className={`mt-1 ${t.completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                    {t.task}
                  </p>
                </div>

                <button
                  onClick={() => deleteTask(t.id)}
                  className="text-slate-400 hover:text-red-500 transition-colors p-1"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-slate-400 text-sm">
        Keep learning, one task at a time! 🌍
      </footer>
    </div>
  )
}

