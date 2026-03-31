import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import useAppStore, { UserAssessmentData } from '@/stores/useAppStore'
import { useAuth } from '@/hooks/use-auth'

export function useOnboarding() {
  const { user } = useAuth()
  const { setUserAssessment } = useAppStore()
  const [showAssessment, setShowAssessment] = useState(false)
  const [isLoadingOnboarding, setIsLoadingOnboarding] = useState(true)

  useEffect(() => {
    const loadUserPreferences = async () => {
      setIsLoadingOnboarding(true)
      console.log('DEBUG - useOnboarding: Iniciando carregamento de preferências.')

      if (!user) {
        console.log('DEBUG - useOnboarding: Usuário não logado.')
        setShowAssessment(false)
        setIsLoadingOnboarding(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') {
          console.error('DEBUG - useOnboarding: Erro ao buscar:', error)
          throw error
        }

        if (data) {
          console.log('DEBUG - useOnboarding: Preferências encontradas:', data)

          let difficultiesString = ''
          if (Array.isArray(data.difficulties)) {
            difficultiesString = data.difficulties.join(', ')
          } else if (typeof data.difficulties === 'string') {
            difficultiesString = data.difficulties
          }

          const assessmentData: UserAssessmentData = {
            studentLevel: data.student_level || '',
            studyTime: data.study_time || '',
            goal: data.goal || '',
            difficulties: difficultiesString,
            learningPreference: data.learning_preference || '',
            knowledgeLevel: data.knowledge_level || '',
          }

          console.log('DEBUG - useOnboarding: Enviando para store:', assessmentData)
          setUserAssessment(assessmentData)
          setShowAssessment(false)
          localStorage.setItem('onboarding_completed', 'true')
          console.log('DEBUG - useOnboarding: Onboarding carregado com sucesso.')
        } else {
          console.log('DEBUG - useOnboarding: Nenhuma preferência encontrada. Mostrando avaliação.')
          setShowAssessment(true)
          localStorage.removeItem('onboarding_completed')
        }
      } catch (error) {
        console.error('DEBUG - useOnboarding: Erro crítico:', error)
        setShowAssessment(true)
        localStorage.removeItem('onboarding_completed')
      } finally {
        setIsLoadingOnboarding(false)
        console.log('DEBUG - useOnboarding: Finalizado.')
      }
    }

    loadUserPreferences()
  }, [user, setUserAssessment])

  return { showAssessment, isLoadingOnboarding, setShowAssessment }
}