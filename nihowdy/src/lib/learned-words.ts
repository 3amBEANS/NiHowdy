const STORAGE_KEY = "nihowdy.learned-words"

export type LearnedWordsData = Record<string, Record<string, string[]>>

function load(): LearnedWordsData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as LearnedWordsData) : {}
  } catch {
    return {}
  }
}

function save(data: LearnedWordsData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  window.dispatchEvent(new Event("nihowdy:learned-words-updated"))
}

export function getLearnedWords(vocabSet: string, language: string): string[] {
  const data = load()
  return data[vocabSet]?.[language] ?? []
}

export function isWordLearned(
  vocabSet: string,
  language: string,
  word: string
): boolean {
  return getLearnedWords(vocabSet, language).includes(word)
}

export function setWordLearned(
  vocabSet: string,
  language: string,
  word: string,
  learned: boolean
): void {
  const data = load()
  if (!data[vocabSet]) data[vocabSet] = {}
  if (!data[vocabSet][language]) data[vocabSet][language] = []

  const words = data[vocabSet][language]
  const index = words.indexOf(word)
  if (learned && index < 0) {
    words.push(word)
  } else if (!learned && index >= 0) {
    words.splice(index, 1)
  }

  save(data)
}
