import { useState, useEffect, useCallback } from 'react'

export interface WordBankItem {
  id: string
  word: string
  translation?: string
  context?: string
  source: 'video' | 'voice'
  /** CEFR difficulty 1-5 (video words) */
  difficulty?: number
  /** Deepgram speech confidence 0-1 (voice words, lower = more struggle) */
  confidence?: number
  /** IPA pronunciation (voice words) */
  ipa?: string
  /** Pronunciation tip (voice words) */
  tip?: string
  /** Human-readable language name */
  language?: string
  addedAt: number
}

const STORAGE_KEY = 'nihowdy.wordbank'

function load(): WordBankItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as WordBankItem[]
  } catch {
    return []
  }
}

function persist(items: WordBankItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function useWordBank() {
  const [items, setItems] = useState<WordBankItem[]>(load)

  // Sync across browser tabs
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setItems(load())
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  const addItem = useCallback((item: Omit<WordBankItem, 'id' | 'addedAt'>) => {
    setItems(prev => {
      if (prev.some(w => w.word === item.word)) return prev
      const next = [
        { ...item, id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, addedAt: Date.now() },
        ...prev,
      ]
      persist(next)
      return next
    })
  }, [])

  const removeItem = useCallback((word: string) => {
    setItems(prev => {
      const next = prev.filter(w => w.word !== word)
      persist(next)
      return next
    })
  }, [])

  const clearAll = useCallback(() => {
    setItems([])
    persist([])
  }, [])

  return { items, addItem, removeItem, clearAll }
}
