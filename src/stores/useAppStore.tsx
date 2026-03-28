import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'

export interface Subject {
  id: string
  name: string
  color: string
}

export interface Flashcard {
  id: string
  question: string
  answer: string
  subjectId: string
  repetitions: number
  interval: number
  easeFactor: number
  nextReviewAt: string
}

export interface ProgressMetric {
  date: string
  studyTime: number
  flashcardsReviewed: number
}

interface AppStore {
  subjects: Subject[]
  flashcards: Flashcard[]
  metrics: ProgressMetric[]
  reviewCard: (cardId: string, quality: number) => void
  addFlashcard: (
    card: Omit<Flashcard, 'id' | 'repetitions' | 'interval' | 'easeFactor' | 'nextReviewAt'>,
  ) => void
  deleteFlashcard: (cardId: string) => void
  chatContext: string
  setChatContext: (ctx: string) => void
}

const today = new Date()
const yesterday = new Date(today)
yesterday.setDate(yesterday.getDate() - 1)
const tomorrow = new Date(today)
tomorrow.setDate(tomorrow.getDate() + 1)

const MOCK_SUBJECTS: Subject[] = [
  { id: 's1', name: 'Matemática', color: 'hsl(var(--chart-1))' },
  { id: 's2', name: 'Biologia', color: 'hsl(var(--chart-2))' },
  { id: 's3', name: 'História', color: 'hsl(var(--chart-3))' },
  { id: 's4', name: 'Química', color: 'hsl(var(--chart-4))' },
]

const MOCK_CARDS: Flashcard[] = [
  {
    id: 'c1',
    question: 'O que é a mitocôndria?',
    answer: 'Organela responsável pela respiração celular e produção de ATP.',
    subjectId: 's2',
    repetitions: 0,
    interval: 0,
    easeFactor: 2.5,
    nextReviewAt: today.toISOString(),
  },
  {
    id: 'c2',
    question: 'Qual a fórmula de Bhaskara?',
    answer: 'x = (-b ± √(b² - 4ac)) / 2a',
    subjectId: 's1',
    repetitions: 2,
    interval: 3,
    easeFactor: 2.6,
    nextReviewAt: yesterday.toISOString(),
  },
  {
    id: 'c3',
    question: 'Quem descobriu o Brasil?',
    answer: 'Pedro Álvares Cabral, em 1500.',
    subjectId: 's3',
    repetitions: 5,
    interval: 14,
    easeFactor: 2.8,
    nextReviewAt: tomorrow.toISOString(),
  },
  {
    id: 'c4',
    question: 'O que é ligação covalente?',
    answer: 'Compartilhamento de pares de elétrons entre átomos não metálicos.',
    subjectId: 's4',
    repetitions: 0,
    interval: 0,
    easeFactor: 2.5,
    nextReviewAt: today.toISOString(),
  },
  {
    id: 'c5',
    question: 'Para que serve o Teorema de Pitágoras?',
    answer:
      'Para encontrar a medida de um lado de um triângulo retângulo conhecendo os outros dois (a² = b² + c²).',
    subjectId: 's1',
    repetitions: 1,
    interval: 1,
    easeFactor: 2.5,
    nextReviewAt: today.toISOString(),
  },
  {
    id: 'c6',
    question: 'Qual a principal função do Ribossomo?',
    answer: 'Sintetizar proteínas.',
    subjectId: 's2',
    repetitions: 3,
    interval: 7,
    easeFactor: 2.5,
    nextReviewAt: yesterday.toISOString(),
  },
]

const MOCK_METRICS: ProgressMetric[] = Array.from({ length: 7 }).map((_, i) => {
  const d = new Date()
  d.setDate(d.getDate() - (6 - i))
  return {
    date: d.toISOString().split('T')[0],
    studyTime: Math.floor(Math.random() * 45) + 15,
    flashcardsReviewed: Math.floor(Math.random() * 30) + 10,
  }
})

const AppStoreContext = createContext<AppStore | null>(null)

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [subjects] = useState<Subject[]>(MOCK_SUBJECTS)
  const [flashcards, setFlashcards] = useState<Flashcard[]>(MOCK_CARDS)
  const [metrics, setMetrics] = useState<ProgressMetric[]>(MOCK_METRICS)
  const [chatContext, setChatContext] = useState('')

  const reviewCard = useCallback((cardId: string, quality: number) => {
    setFlashcards((prev) =>
      prev.map((card) => {
        if (card.id !== cardId) return card

        let { repetitions, interval, easeFactor } = card
        if (quality >= 3) {
          if (repetitions === 0) interval = 1
          else if (repetitions === 1) interval = 6
          else interval = Math.round(interval * easeFactor)
          repetitions += 1
        } else {
          repetitions = 0
          interval = 1
        }

        easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
        if (easeFactor < 1.3) easeFactor = 1.3

        const nextReview = new Date()
        nextReview.setDate(nextReview.getDate() + interval)

        return {
          ...card,
          repetitions,
          interval,
          easeFactor,
          nextReviewAt: nextReview.toISOString(),
        }
      }),
    )

    const todayStr = new Date().toISOString().split('T')[0]
    setMetrics((prev) => {
      const newMetrics = [...prev]
      const todayMetric = newMetrics.find((m) => m.date === todayStr)
      if (todayMetric) {
        todayMetric.flashcardsReviewed += 1
        todayMetric.studyTime += 0.5
      }
      return newMetrics
    })
  }, [])

  const addFlashcard = useCallback(
    (card: Omit<Flashcard, 'id' | 'repetitions' | 'interval' | 'easeFactor' | 'nextReviewAt'>) => {
      setFlashcards((prev) => [
        ...prev,
        {
          ...card,
          id: Math.random().toString(36).substr(2, 9),
          repetitions: 0,
          interval: 0,
          easeFactor: 2.5,
          nextReviewAt: new Date().toISOString(),
        },
      ])
    },
    [],
  )

  const deleteFlashcard = useCallback((cardId: string) => {
    setFlashcards((prev) => prev.filter((c) => c.id !== cardId))
  }, [])

  const value = useMemo(
    () => ({
      subjects,
      flashcards,
      metrics,
      reviewCard,
      addFlashcard,
      deleteFlashcard,
      chatContext,
      setChatContext,
    }),
    [subjects, flashcards, metrics, reviewCard, addFlashcard, deleteFlashcard, chatContext],
  )

  return React.createElement(AppStoreContext.Provider, { value }, children)
}

export default function useAppStore() {
  const context = useContext(AppStoreContext)
  if (!context) throw new Error('useAppStore must be used within AppStoreProvider')
  return context
}
