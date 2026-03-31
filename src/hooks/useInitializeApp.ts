import { useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import useAppStore from '@/stores/useAppStore'

export function useInitializeApp() {
  const { user } = useAuth()
  const { loadFlashcardsFromSupabase } = useAppStore()

  useEffect(() => {
    if (user?.id) {
      console.log('DEBUG - useInitializeApp: Usuário logado, carregando flashcards...')
      loadFlashcardsFromSupabase(user.id)
    }
  }, [user?.id, loadFlashcardsFromSupabase])
}