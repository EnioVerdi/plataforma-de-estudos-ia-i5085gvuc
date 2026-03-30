import { create } from 'zustand'

// Interface para um flashcard com informações de revisão
export interface FlashcardWithReview {
  id: string
  question: string
  answer: string
  subjectId: string
  difficulty: 1 | 2 | 3 | 4 | 5
  nextReviewAt: string
  lastReviewAt?: string
  reviewCount: number
  createdAt: string
}

// ✅ INTERFACE ATUALIZADA: Suporta respostas discursivas
export interface UserAssessmentData {
  studentLevel: string
  studyTime: string
  goal: string
  difficulties?: string
  learningPreference?: string
  knowledgeLevel?: string
}

// Interface para uma matéria/disciplina
export interface Subject {
  id: string
  name: string
}

// Interface para as métricas diárias de estudo
export interface DailyMetric {
  date: string
  studyTime: number
  flashcardsReviewed: number
}

// ✅ NOVO: Interface para dados do gráfico de dificuldade
export interface DifficultyStats {
  difficulty: number
  label: string
  count: number
  color: string
  bg: string
}

// ✅ NOVO: Interface para templates de prompts
export interface PromptTemplate {
  subjectId: string
  subjectName: string
  template: string
  example: string
}

// ✅ NOVO: Interface para notificação de revisão
export interface ReviewNotification {
  date: string
  totalCards: number
  bySubject: Array<{
    subjectId: string
    subjectName: string
    count: number
  }>
}

// Interface para o estado global da aplicação
interface AppState {
  subjects: Subject[]
  flashcards: FlashcardWithReview[]
  userAssessment: UserAssessmentData | null
  chatContext: string
  metrics: DailyMetric[]

  // ✅ ADICIONADO: Propriedades para o sistema de ofensiva (streak)
  studyStreak: {
    current: number
    max: number
  }
  lastStudyDate: string | null

  // Funções para gerenciar matérias
  addSubject: (subject: Subject) => void

  // Funções para gerenciar flashcards
  addFlashcard: (
    card: Omit<
      FlashcardWithReview,
      'id' | 'nextReviewAt' | 'lastReviewAt' | 'reviewCount' | 'createdAt'
    > & { difficulty?: 1 | 2 | 3 | 4 | 5 }
  ) => void
  deleteFlashcard: (id: string) => void
  updateFlashcardDifficulty: (cardId: string, difficulty: 1 | 2 | 3 | 4 | 5) => void
  getFlashcardsForToday: () => FlashcardWithReview[]

  // Funções para gerenciar avaliação do usuário
  setUserAssessment: (assessment: UserAssessmentData) => void
  setChatContext: (context: string) => void

  // Funções para gerenciar métricas diárias
  addOrUpdateMetric: (date: string, studyTime: number, flashcardsReviewed: number) => void
  updateDayMetrics: (type: 'studyTime' | 'flashcardsReviewed', value: number) => void

  // ✅ NOVO: Funções para estatísticas de dificuldade (para o gráfico)
  getDifficultyStats: () => DifficultyStats[]

  // ✅ NOVO: Função para obter template de prompts
  getPromptTemplate: (subjectId: string) => PromptTemplate | undefined

  // ✅ NOVO: Funções para email de revisão diária
  getTodayReviewSummary: () => ReviewNotification
  sendDailyReviewEmail: (userEmail: string, userName: string) => Promise<{ success: boolean; data?: any; error?: any }>

  // ✅ ADICIONADO: Funções para gerenciar a ofensiva (streak)
  updateStudyStreak: () => void
  resetStreak: () => void
  incrementStreak: () => void
}

// ✅ NOVO: Templates de prompts por matéria
const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    subjectId: '1',
    subjectName: 'Português',
    template: `Crie flashcards sobre [TEMA] focando em:
- Definições de conceitos principais
- Exceções gramaticais importantes
- Exemplos práticos de uso
- Dicas para não confundir termos similares`,
    example: 'Dica: Cole um texto ou descreva o conteúdo do livro/aula',
  },
  {
    subjectId: '2',
    subjectName: 'Matemática',
    template: `Crie flashcards sobre [TEMA] focando em:
- Fórmulas principais com quando usar
- Passo a passo de resoluções
- Casos especiais e exceções
- Erros comuns a evitar`,
    example: 'Dica: Descreva o tipo de problema ou fórmula que precisa estudar',
  },
  {
    subjectId: '3',
    subjectName: 'Inglês',
    template: `Crie flashcards sobre [TEMA] focando em:
- Vocabulário com contexto de uso
- Phrasal verbs e expressões idiomáticas
- Diferenças entre termos similares
- Pronunciação (quando aplicável)`,
    example: 'Dica: Descreva o nível de proficiência e o contexto (conversação, negócios, etc)',
  },
  {
    subjectId: '4',
    subjectName: 'Biologia',
    template: `Crie flashcards sobre [TEMA] focando em:
- Estruturas e funções de componentes
- Processos biológicos passo a passo
- Diferenças entre conceitos similares
- Ciclos e relações entre organismos`,
    example: 'Dica: Descreva o capítulo ou o sistema que está estudando',
  },
  {
    subjectId: '5',
    subjectName: 'Química',
    template: `Crie flashcards sobre [TEMA] focando em:
- Reações químicas com balanceamento
- Propriedades de elementos
- Quando cada reação ocorre
- Mnemônicos para memorizar sequências`,
    example: 'Dica: Descreva a classe de reação ou elemento em questão',
  },
  {
    subjectId: '6',
    subjectName: 'Física',
    template: `Crie flashcards sobre [TEMA] focando em:
- Fórmulas com unidades corretas
- Aplicações práticas no mundo real
- Diferenças entre conceitos (força vs aceleração, etc)
- Problemas comuns de compreensão`,
    example: 'Dica: Descreva o tema (mecânica, óptica, termodinâmica, etc)',
  },
  {
    subjectId: '7',
    subjectName: 'História',
    template: `Crie flashcards sobre [TEMA] focando em:
- Datas importantes e contexto
- Personagens-chave e suas ações
- Causas e consequências de eventos
- Conexões entre períodos históricos`,
    example: 'Dica: Descreva o período ou evento que está estudando',
  },
  {
    subjectId: '8',
    subjectName: 'Geografia',
    template: `Crie flashcards sobre [TEMA] focando em:
- Localização e características geográficas
- Clima, vegetação e recursos naturais
- Dados demográficos e econômicos
- Impactos ambientais e sociais`,
    example: 'Dica: Descreva a região ou tema ambiental em questão',
  },
  {
    subjectId: '9',
    subjectName: 'Educação Física',
    template: `Crie flashcards sobre [TEMA] focando em:
- Técnicas e movimentos corretos
- Benefícios e objetivos do exercício
- Erros comuns a evitar
- Variações e progressões de dificuldade`,
    example: 'Dica: Descreva o esporte ou exercício que está estudando',
  },
  {
    subjectId: '10',
    subjectName: 'Artes',
    template: `Crie flashcards sobre [TEMA] focando em:
- Artistas e suas obras principais
- Movimentos artísticos e características
- Técnicas e materiais utilizados
- Contexto histórico e influências`,
    example: 'Dica: Descreva o movimento artístico ou artista em questão',
  },
  {
    subjectId: '11',
    subjectName: 'Sociologia',
    template: `Crie flashcards sobre [TEMA] focando em:
- Conceitos-chave e definições
- Teóricos importantes e suas ideias
- Aplicações práticas na sociedade
- Críticas e perspectivas alternativas`,
    example: 'Dica: Descreva o conceito social que está estudando',
  },
  {
    subjectId: '12',
    subjectName: 'Filosofia',
    template: `Crie flashcards sobre [TEMA] focando em:
- Perguntas filosóficas fundamentais
- Pensadores e suas correntes de pensamento
- Argumentos principais e contra-argumentos
- Aplicações contemporâneas`,
    example: 'Dica: Descreva a corrente filosófica ou pensador em questão',
  },
]

// Função auxiliar para calcular a próxima data de revisão
const calculateNextReviewDate = (difficulty: 1 | 2 | 3 | 4 | 5): string => {
  const now = new Date()
  let daysToAdd = 1

  switch (difficulty) {
    case 1:
      daysToAdd = 30
      break
    case 2:
      daysToAdd = 14
      break
    case 3:
      daysToAdd = 3
      break
    case 4:
      daysToAdd = 1
      break
    case 5:
      daysToAdd = 0
      break
  }

  now.setDate(now.getDate() + daysToAdd)
  return now.toISOString().split('T')[0]
}

// Cria o store Zustand
const useAppStore = create<AppState>((set, get) => {
  // Carrega dados do localStorage
  const storedStreak = typeof window !== 'undefined' 
    ? JSON.parse(localStorage.getItem('studyStreak') || '{"current": 0, "max": 0}')
    : { current: 0, max: 0 }
  
  const storedLastStudyDate = typeof window !== 'undefined'
    ? localStorage.getItem('lastStudyDate')
    : null

  return {
    // Estado inicial
    subjects: [
      { id: '1', name: 'Português' },
      { id: '2', name: 'Matemática' },
      { id: '3', name: 'Inglês' },
      { id: '4', name: 'Biologia' },
      { id: '5', name: 'Química' },
      { id: '6', name: 'Física' },
      { id: '7', name: 'História' },
      { id: '8', name: 'Geografia' },
      { id: '9', name: 'Educação Física' },
      { id: '10', name: 'Artes' },
      { id: '11', name: 'Sociologia' },
      { id: '12', name: 'Filosofia' },
    ],
    flashcards: [],
    userAssessment: null,
    chatContext: '',
    metrics: [],
    studyStreak: storedStreak,
    lastStudyDate: storedLastStudyDate,

    // ✅ Adiciona uma nova matéria
    addSubject: (subject) => {
      set((state) => ({
        subjects: [...state.subjects, subject],
      }))
    },

    // ✅ Adiciona um novo flashcard
    addFlashcard: (card) => {
      set((state) => ({
        flashcards: [
          ...state.flashcards,
          {
            id: Date.now().toString(),
            ...card,
            difficulty: card.difficulty || 3,
            nextReviewAt: new Date().toISOString().split('T')[0],
            reviewCount: 0,
            createdAt: new Date().toISOString(),
          } as FlashcardWithReview,
        ],
      }))
    },

    // ✅ Exclui um flashcard
    deleteFlashcard: (id) => {
      set((state) => ({
        flashcards: state.flashcards.filter((c) => c.id !== id),
      }))
    },

    // ✅ Atualiza a dificuldade de um flashcard
    updateFlashcardDifficulty: (cardId, difficulty) => {
      set((state) => ({
        flashcards: state.flashcards.map((card) =>
          card.id === cardId
            ? {
                ...card,
                difficulty,
                nextReviewAt: calculateNextReviewDate(difficulty),
                lastReviewAt: new Date().toISOString(),
                reviewCount: card.reviewCount + 1,
              }
            : card
        ),
      }))
    },

    // ✅ Retorna flashcards para revisar hoje
    getFlashcardsForToday: () => {
      const today = new Date().toISOString().split('T')[0]
      return get().flashcards.filter((card) => {
        const reviewDate = card.nextReviewAt.split('T')[0]
        return reviewDate <= today
      })
    },

    // ✅ NOVO: Retorna estatísticas de dificuldade para o gráfico
    getDifficultyStats: () => {
      const flashcards = get().flashcards

      const stats: DifficultyStats[] = [
        { difficulty: 5, label: 'Muito Difícil', count: 0, color: '#9333ea', bg: '#faf5ff' },
        { difficulty: 4, label: 'Difícil', count: 0, color: '#ef4444', bg: '#fee2e2' },
        { difficulty: 3, label: 'Médio', count: 0, color: '#f59e0b', bg: '#fef3c7' },
        { difficulty: 2, label: 'Fácil', count: 0, color: '#3b82f6', bg: '#dbeafe' },
        { difficulty: 1, label: 'Muito Fácil', count: 0, color: '#10b981', bg: '#d1fae5' },
      ]

      flashcards.forEach((card) => {
        const stat = stats.find((s) => s.difficulty === card.difficulty)
        if (stat) {
          stat.count += 1
        }
      })

      // Ordena do mais difícil para o mais fácil
      return stats.sort((a, b) => b.difficulty - a.difficulty)
    },

    // ✅ NOVO: Obtém template de prompt por matéria
    getPromptTemplate: (subjectId) => {
      return PROMPT_TEMPLATES.find((t) => t.subjectId === subjectId)
    },

    // ✅ NOVO: Retorna resumo de revisão para hoje
    getTodayReviewSummary: () => {
      const today = new Date().toISOString().split('T')[0]
      const dueCards = get().flashcards.filter((card) => {
        const reviewDate = card.nextReviewAt.split('T')[0]
        return reviewDate <= today
      })

      const bySubject = get().subjects
        .map((subject) => ({
          subjectId: subject.id,
          subjectName: subject.name,
          count: dueCards.filter((c) => c.subjectId === subject.id).length,
        }))
        .filter((s) => s.count > 0)
        .sort((a, b) => b.count - a.count)

      return {
        date: today,
        totalCards: dueCards.length,
        bySubject,
      }
    },

    // ✅ NOVO: Envia email de revisão diária
    sendDailyReviewEmail: async (userEmail: string, userName: string) => {
      try {
        const summary = get().getTodayReviewSummary()

        if (summary.totalCards === 0) {
          return { 
            success: true, 
            data: { message: 'Nenhuma revisão pendente para hoje' } 
          }
        }

        // TODO: Implement email sending functionality
        // const response = await sendEmailFunction({ ... })
        
        return { 
          success: true, 
          data: { 
            message: 'Notificação de revisão preparada',
            summary 
          } 
        }
      } catch (error) {
        console.error('Erro ao enviar email:', error)
        return { success: false, error }
      }
    },

    // ✅ Define avaliação do usuário
    setUserAssessment: (assessment) => {
      set({ userAssessment: assessment })
    },

    // ✅ Define contexto do chat
    setChatContext: (context) => {
      set({ chatContext: context })
    },

    // ✅ Adiciona ou atualiza métrica diária
    addOrUpdateMetric: (date, studyTime, flashcardsReviewed) => {
      set((state) => {
        const existingIndex = state.metrics.findIndex((m) => m.date === date)
        if (existingIndex > -1) {
          const updated = [...state.metrics]
          updated[existingIndex] = { date, studyTime, flashcardsReviewed }
          return { metrics: updated }
        }
        return { metrics: [...state.metrics, { date, studyTime, flashcardsReviewed }] }
      })
    },

    // ✅ Atualiza métrica do dia atual
    updateDayMetrics: (type, value) => {
      const today = new Date().toISOString().split('T')[0]
      set((state) => {
        const existingIndex = state.metrics.findIndex((m) => m.date === today)
        if (existingIndex > -1) {
          const updated = [...state.metrics]
          updated[existingIndex] = {
            ...updated[existingIndex],
            [type]: updated[existingIndex][type] + value,
          }
          return { metrics: updated }
        }
        return {
          metrics: [
            ...state.metrics,
            {
              date: today,
              studyTime: type === 'studyTime' ? value : 0,
              flashcardsReviewed: type === 'flashcardsReviewed' ? value : 0,
            },
          ],
        }
      })
    },

    // ✅ NOVO: Atualiza a ofensiva diária
    updateStudyStreak: () => {
      set((state) => {
        const today = new Date()
        const todayStr = today.toISOString().split('T')[0]
        const lastStudyDate = state.lastStudyDate

        let newCurrentStreak = state.studyStreak.current
        let newMaxStreak = state.studyStreak.max

        if (lastStudyDate === todayStr) {
          return state
        }

        const yesterday = new Date(today)
        yesterday.setDate(today.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().split('T')[0]

        if (lastStudyDate === yesterdayStr) {
          newCurrentStreak += 1
        } else {
          newCurrentStreak = 1
        }

        newMaxStreak = Math.max(newCurrentStreak, newMaxStreak)

        if (typeof window !== 'undefined') {
          localStorage.setItem('studyStreak', JSON.stringify({ current: newCurrentStreak, max: newMaxStreak }))
          localStorage.setItem('lastStudyDate', todayStr)
        }

        return {
          studyStreak: { current: newCurrentStreak, max: newMaxStreak },
          lastStudyDate: todayStr,
        }
      })
    },

    // ✅ NOVO: Reinicia a ofensiva
    resetStreak: () => {
      set(() => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('studyStreak')
          localStorage.removeItem('lastStudyDate')
        }
        return {
          studyStreak: { current: 0, max: 0 },
          lastStudyDate: null,
        }
      })
    },

    // ✅ NOVO: Incrementa manualmente a ofensiva
    incrementStreak: () => {
      set((state) => {
        const todayStr = new Date().toISOString().split('T')[0]
        const newCurrent = state.studyStreak.current + 1
        const newMax = Math.max(newCurrent, state.studyStreak.max)

        if (typeof window !== 'undefined') {
          localStorage.setItem('studyStreak', JSON.stringify({ current: newCurrent, max: newMax }))
          localStorage.setItem('lastStudyDate', todayStr)
        }

        return {
          studyStreak: { current: newCurrent, max: newMax },
          lastStudyDate: todayStr,
        }
      })
    },
  }
})

export default useAppStore