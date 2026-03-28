import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'

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

const AppStoreContext = createContext<AppStore | null>(null)

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [metrics, setMetrics] = useState<ProgressMetric[]>([])
  const [chatContext, setChatContext] = useState('')

  useEffect(() => {
    if (!user) return
    const loadData = async () => {
      const [subRes, cardRes, metRes] = await Promise.all([
        supabase.from('subjects').select('*').eq('user_id', user.id),
        supabase.from('flashcards').select('*').eq('user_id', user.id),
        supabase
          .from('progress_metrics')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(7),
      ])

      if (subRes.data && subRes.data.length === 0) {
        const defaults = [
          { name: 'Matemática', color: 'hsl(var(--chart-1))', user_id: user.id },
          { name: 'Biologia', color: 'hsl(var(--chart-2))', user_id: user.id },
          { name: 'História', color: 'hsl(var(--chart-3))', user_id: user.id },
          { name: 'Química', color: 'hsl(var(--chart-4))', user_id: user.id },
        ]
        const { data: newSubs } = await supabase.from('subjects').insert(defaults).select()
        if (newSubs)
          setSubjects(newSubs.map((s: any) => ({ id: s.id, name: s.name, color: s.color })))
      } else if (subRes.data) {
        setSubjects(subRes.data.map((s: any) => ({ id: s.id, name: s.name, color: s.color })))
      }

      if (cardRes.data) {
        setFlashcards(
          cardRes.data.map((c: any) => ({
            id: c.id,
            question: c.question,
            answer: c.answer,
            subjectId: c.subject_id,
            repetitions: c.repetitions,
            interval: c.interval,
            easeFactor: c.ease_factor,
            nextReviewAt: c.next_review_at,
          })),
        )
      }

      if (metRes.data) {
        setMetrics(
          metRes.data.map((m: any) => ({
            date: m.date,
            studyTime: m.study_time,
            flashcardsReviewed: m.flashcards_reviewed,
          })),
        )
      }
    }
    loadData()
  }, [user])

  const reviewCard = useCallback(
    async (cardId: string, quality: number) => {
      if (!user) return
      const card = flashcards.find((c) => c.id === cardId)
      if (!card) return

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
      const nextReviewStr = nextReview.toISOString()

      setFlashcards((prev) =>
        prev.map((c) =>
          c.id === cardId
            ? { ...c, repetitions, interval, easeFactor, nextReviewAt: nextReviewStr }
            : c,
        ),
      )

      await supabase
        .from('flashcards')
        .update({
          repetitions,
          interval,
          ease_factor: easeFactor,
          next_review_at: nextReviewStr,
          last_reviewed_at: new Date().toISOString(),
        })
        .eq('id', cardId)

      await supabase.from('reviews').insert({
        flashcard_id: cardId,
        user_id: user.id,
        rating: quality,
      })

      const todayStr = new Date().toISOString().split('T')[0]
      const todayMetric = metrics.find((m) => m.date === todayStr)

      if (todayMetric) {
        const updatedTime = todayMetric.studyTime + 0.5
        const updatedCount = todayMetric.flashcardsReviewed + 1
        await supabase
          .from('progress_metrics')
          .update({ study_time: updatedTime, flashcards_reviewed: updatedCount })
          .eq('user_id', user.id)
          .eq('date', todayStr)
        setMetrics((prev) =>
          prev.map((m) =>
            m.date === todayStr
              ? { ...m, studyTime: updatedTime, flashcardsReviewed: updatedCount }
              : m,
          ),
        )
      } else {
        await supabase
          .from('progress_metrics')
          .insert({ user_id: user.id, date: todayStr, study_time: 1, flashcards_reviewed: 1 })
        setMetrics((prev) => [...prev, { date: todayStr, studyTime: 1, flashcardsReviewed: 1 }])
      }
    },
    [flashcards, metrics, user],
  )

  const addFlashcard = useCallback(
    async (
      card: Omit<Flashcard, 'id' | 'repetitions' | 'interval' | 'easeFactor' | 'nextReviewAt'>,
    ) => {
      if (!user) return
      const newCard = {
        question: card.question,
        answer: card.answer,
        subject_id: card.subjectId,
        user_id: user.id,
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
        next_review_at: new Date().toISOString(),
      }
      const { data } = await supabase.from('flashcards').insert(newCard).select().single()
      if (data) {
        setFlashcards((prev) => [
          ...prev,
          {
            id: data.id,
            question: data.question,
            answer: data.answer,
            subjectId: data.subject_id,
            repetitions: data.repetitions,
            interval: data.interval,
            easeFactor: data.ease_factor,
            nextReviewAt: data.next_review_at,
          },
        ])
      }
    },
    [user],
  )

  const deleteFlashcard = useCallback(async (cardId: string) => {
    setFlashcards((prev) => prev.filter((c) => c.id !== cardId))
    await supabase.from('flashcards').delete().eq('id', cardId)
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
