import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Trash2, BotMessageSquare, Lightbulb, BookOpen, Sparkles, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import useAppStore from '@/stores/useAppStore'
import UserAssessment from '../components/UserAssessment'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { v4 as uuidv4 } from 'uuid'

interface Message {
  id: string
  role: 'user' | 'ai'
  content: string
  timestamp: number
}

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MAX_MESSAGES = 50
const MESSAGE_RETENTION_DAYS = 14

export default function FlashcardsChat(): React.JSX.Element {
  const { user } = useAuth()
  const { subjects, addFlashcard, userAssessment, getPromptTemplate, loadFlashcardsFromSupabase } = useAppStore()
  const [showAssessment, setShowAssessment] = useState(!userAssessment)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial-ai',
      role: 'ai',
      content: 'Olá! Sou seu assistente para criar flashcards. Explique o conteúdo que deseja estudar!',
      timestamp: Date.now(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState('')
  const [displayMessages, setDisplayMessages] = useState<Message[]>([])
  const [showTemplate, setShowTemplate] = useState(false)
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user?.id) {
      console.log('DEBUG - FlashcardsChat: Carregando flashcards do Supabase para usuário:', user.id)
      loadFlashcardsFromSupabase(user.id)
    }
  }, [user?.id, loadFlashcardsFromSupabase])

  useEffect(() => {
    const cleanOldMessages = () => {
      const cutoffDate = Date.now() - MESSAGE_RETENTION_DAYS * 24 * 60 * 60 * 1000
      setMessages((prev) => prev.filter((msg) => msg.timestamp > cutoffDate))
    }
    cleanOldMessages()
  }, [])

  useEffect(() => {
    const start = Math.max(0, messages.length - MAX_MESSAGES)
    setDisplayMessages(messages.slice(start))
  }, [messages])

  useEffect(() => {
    const loadHistory = async () => {
      if (!user || hasLoadedHistory) return

      const { data } = await supabase
        .from('flashcard_chat_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: true })
        .limit(100)

      if (data && data.length > 0) {
        const history = data.flatMap((s: any) => [
          {
            id: `${s.id}-user-${Date.now()}-${Math.random()}`,
            role: 'user' as const,
            content: s.query,
            timestamp: new Date(s.timestamp).getTime(),
          },
          {
            id: `${s.id}-ai-${Date.now()}-${Math.random()}`,
            role: 'ai' as const,
            content: s.response,
            timestamp: new Date(s.timestamp).getTime(),
          },
        ])
        setMessages((prev) => [...prev, ...history])
      }
      setHasLoadedHistory(true)
    }
    loadHistory()
  }, [user, hasLoadedHistory])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [displayMessages])

  const parseFlashcardsFromAI = (aiResponse: string) => {
    const flashcards: Array<{ question: string; answer: string }> = []
    const lines = aiResponse
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0)

    console.log('DEBUG - parseFlashcardsFromAI: Linhas da resposta:', lines)

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      if (line.includes('|')) {
        const match = line.match(
          /^(?:P|Pergunta|R|Resposta|Q|A)[\s:]*(.+?)\s*\|\s*(?:P|Pergunta|R|Resposta|Q|A)[\s:]*(.+?)$/,
        )
        if (match) {
          const q = match[1].trim()
          const a = match[2].trim()
          if (q && a) {
            flashcards.push({ question: q, answer: a })
            console.log('DEBUG - parseFlashcardsFromAI: Flashcard extraído (padrão pipe):', { q, a })
            continue
          }
        }
      }

      if (line.match(/^(P:|Pergunta:|Q:|Frente:)/i)) {
        const question = line.replace(/^(P:|Pergunta:|Q:|Frente:)\s*/i, '').trim()

        if (question && i + 1 < lines.length) {
          const nextLine = lines[i + 1]
          if (nextLine.match(/^(R:|Resposta:|A:|Verso:)/i)) {
            const answer = nextLine.replace(/^(R:|Resposta:|A:|Verso:)\s*/i, '').trim()

            if (answer) {
              flashcards.push({ question, answer })
              console.log('DEBUG - parseFlashcardsFromAI: Flashcard extraído (padrão P/R):', { question, answer })
              i += 1
              continue
            }
          }
        }
      }

      const numMatch = line.match(/^(\d+)\.\s*(.+?)$/)
      if (numMatch && i + 1 < lines.length) {
        const question = numMatch[2].trim()
        const nextLine = lines[i + 1]

        if (!nextLine.match(/^\d+\./) && !nextLine.match(/^(P:|R:|Pergunta:|Resposta:)/i)) {
          const answer = nextLine.trim()

          if (question && answer) {
            flashcards.push({ question, answer })
            console.log('DEBUG - parseFlashcardsFromAI: Flashcard extraído (padrão numerado):', { question, answer })
            i += 1
            continue
          }
        }
      }
    }

    console.log('DEBUG - parseFlashcardsFromAI: Total de flashcards extraídos:', flashcards.length)
    console.log('DEBUG - parseFlashcardsFromAI: Flashcards parseados:', flashcards)
    return flashcards
  }

  const saveFlashcardsToSupabase = async (
    flashcards: Array<{ question: string; answer: string }>,
    subjectId: string,
  ) => {
    if (!user || flashcards.length === 0) {
      console.log('DEBUG - saveFlashcardsToSupabase: Usuário não autenticado ou sem flashcards')
      return { success: false }
    }

    try {
      const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser()
      if (authError || !supabaseUser?.id) {
        console.error('DEBUG - saveFlashcardsToSupabase: Erro ao pegar UUID do Supabase:', authError)
        toast.error('Erro de autenticação. Faça login novamente.')
        return { success: false, error: 'Usuário não autenticado no Supabase' }
      }

      const supabaseUserId = supabaseUser.id
      console.log('DEBUG - saveFlashcardsToSupabase: UUID Supabase correto:', supabaseUserId, 'Type:', typeof supabaseUserId)

      const now = new Date()
      // ✅ CORREÇÃO: Para novos cartões de IA, setar nextReviewAt para HOJE (permitir revisão imediata)
      const nextReviewDate = new Date(now.toISOString()) // Hoje, hora atual

      const flashcardsToInsert = flashcards.map((card) => ({
        question: card.question,
        answer: card.answer,
        subject_id: subjectId,
        user_id: supabaseUserId,
        difficulty: 3,
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
        next_review_at: nextReviewDate.toISOString(),
        is_generated_by_ai: true,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        review_count: 0,
      }))

      console.log('DEBUG - saveFlashcardsToSupabase: Payload para INSERT (nextReviewAt=hoje para novos):', flashcardsToInsert)

      const { data, error } = await supabase
        .from('flashcards')
        .insert(flashcardsToInsert)
        .select('id, question, answer, next_review_at, user_id, subject_id')

      if (error) {
        console.error('DEBUG - saveFlashcardsToSupabase: Erro detalhado:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        })
        toast.error(`Erro ao salvar: ${error.message}`)
        return { success: false, error: error.message }
      }

      console.log('DEBUG - saveFlashcardsToSupabase: SUCESSO! Inseridos:', data.length, 'flashcards')
      console.log('IDs inseridos pelo Supabase:', data.map((d: any) => d.id))
      console.log('User ID salvo:', data[0]?.user_id)
      console.log('Subject ID salvo:', data[0]?.subject_id)

      toast.success(`${data.length} flashcard${data.length > 1 ? 's' : ''} salvo${data.length > 1 ? 's' : ''} com sucesso no banco!`)
      return { success: true, data }
    } catch (error: any) {
      console.error('DEBUG - saveFlashcardsToSupabase: Exceção capturada:', error)
      toast.error('Falha ao salvar. Verifique se a matéria está selecionada e tente novamente.')
      return { success: false, error: error.message || 'Erro desconhecido' }
    }
  }

  const handleAiResponse = async (userText: string) => {
    setIsLoading(true)
    console.log('DEBUG - FlashcardsChat: Iniciando handleAiResponse com:', userText)
    console.log('DEBUG - FlashcardsChat: selectedSubject =', selectedSubject)

    if (!selectedSubject || selectedSubject.trim() === '') {
      console.log('DEBUG - FlashcardsChat: ERRO - Matéria não selecionada!')
      toast.error('Selecione a matéria antes de criar flashcards.')
      setIsLoading(false)
      return
    }

    console.log('DEBUG - FlashcardsChat: Matéria selecionada com sucesso:', selectedSubject)

    try {
      const template = getPromptTemplate(selectedSubject)
      const templateInstructions = template
        ? `\n\nSIGA ESTE PADRÃO para ${template.subjectName}:\n${template.template}`
        : ''

      const systemPrompt = `Você é um professor especialista em flashcards para estudos. Aja como um tutor natural e paciente: responda EXATAMENTE e SOMENTE o que o usuário pediu, focando em criar flashcards concisos e úteis (máx 2-3 linhas por card). Use formato P: [pergunta curta] | R: [resposta direta] (um por linha).

Mantenha conversa fluida, lembre o contexto anterior e evite repetições. Seja objetivo, priorizando conceitos-chave para provas.

No FINAL da resposta, se relevante, sugira APENAS 1 opção variada (NÃO repita sugestões anteriores):
- "Quer mais flashcards sobre isso?"
- "Quer dicas de revisão para Enem/UFPR?"
- "Quer flashcards em outro formato?"

Varie sugestões com base no histórico. Se não for necessário, não sugira.`

      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userText },
          ],
          temperature: 0.7,
          max_tokens: 1500,
        }),
      })

      if (!response.ok) throw new Error('Erro ao conectar com Groq')

      const data = await response.json()
      const aiResponseContent = data.choices[0].message.content

      const parsedFlashcards = parseFlashcardsFromAI(aiResponseContent)
      let chatMessage = ''

      if (parsedFlashcards.length > 0) {
        const subjectToUse = selectedSubject

        parsedFlashcards.forEach((card) => {
          addFlashcard({
            question: card.question,
            answer: card.answer,
            subjectId: subjectToUse,
            difficulty: 3,
          })
        })

        const saveResult = await saveFlashcardsToSupabase(parsedFlashcards, subjectToUse)
        console.log('DEBUG - handleAiResponse: Resultado do saveFlashcardsToSupabase:', saveResult)

        // ✅ CORREÇÃO: Recarregar flashcards do Supabase APÓS salvar com sucesso (sincroniza a aba)
        if (user?.id && saveResult.success) {
          try {
            console.log('DEBUG - handleAiResponse: Recarregando flashcards do Supabase após criação via IA...')
            await loadFlashcardsFromSupabase(user.id)
            console.log('DEBUG - handleAiResponse: Flashcards recarregados com sucesso. A aba agora deve sincronizar!')
          } catch (reloadError) {
            console.error('DEBUG - handleAiResponse: Erro ao recarregar flashcards após save:', reloadError)
            toast.error('Erro ao sincronizar flashcards. Tente recarregar a página.')
          }
        }

        if (saveResult.success) {
          const subjectName = subjects.find((s) => s.id === subjectToUse)?.name || 'matéria'
          chatMessage = `✅ **${parsedFlashcards.length} flashcard${parsedFlashcards.length > 1 ? 's' : ''}** criado${parsedFlashcards.length > 1 ? 's' : ''} com sucesso na matéria **${subjectName}**! 🎯`
        } else {
          const subjectName = subjects.find((s) => s.id === subjectToUse)?.name || 'matéria'
          chatMessage = `✅ **${parsedFlashcards.length} flashcard${parsedFlashcards.length > 1 ? 's' : ''}** criado${parsedFlashcards.length > 1 ? 's' : ''} na matéria **${subjectName}**! (Localmente - banco falhou, mas está salvo no app) 🎯`
        }

        console.log(`Flashcards processados: ${parsedFlashcards.length} na matéria ${subjectToUse}`)
      } else {
        chatMessage = `Não consegui extrair flashcards do formato esperado.\n\n${aiResponseContent}\n\n💡 Tente com: P: [pergunta] | R: [resposta]`
      }

      setMessages((prev) => [
        ...prev,
        { id: Math.random().toString(), role: 'ai', content: chatMessage, timestamp: Date.now() },
      ])

      if (user) {
        await supabase.from('flashcard_chat_sessions').insert({
          user_id: user.id,
          query: userText,
          response: aiResponseContent,
          timestamp: new Date().toISOString(),
        })
      }
    } catch (error) {
      console.error('Erro geral no handleAiResponse:', error)
      toast.error('Desculpe, ocorreu um erro ao gerar flashcards.')
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          role: 'ai',
          content: '❌ Erro ao processar sua solicitação. Tente novamente.',
          timestamp: Date.now(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSend = (text: string = input) => {
    if (!text.trim() || isLoading) return
    setMessages((prev) => [
      ...prev,
      { id: Math.random().toString(), role: 'user', content: text, timestamp: Date.now() },
    ])
    setInput('')
    handleAiResponse(text)
  }

  const handleDeleteHistory = async () => {
    if (!user) return
    try {
      await supabase.from('flashcard_chat_sessions').delete().eq('user_id', user.id)
      setMessages([
        {
          id: 'initial-ai',
          role: 'ai',
          content: 'Olá! Sou seu assistente para criar flashcards. Explique o conteúdo que deseja estudar!',
          timestamp: Date.now(),
        },
      ])
      setHasLoadedHistory(false)
      toast.success('Histórico de conversas limpo com sucesso!')
    } catch (error) {
      console.error('Erro ao limpar histórico:', error)
      toast.error('Erro ao limpar histórico de conversas.')
    }
  }

  const currentTemplate = selectedSubject ? getPromptTemplate(selectedSubject) : null

  if (showAssessment && userAssessment === null) {
    return <UserAssessment onComplete={() => setShowAssessment(false)} />
  }

  return (
    <div className="flex h-full w-full bg-gradient-light text-darkBlue-700 overflow-hidden">
      {/* ✅ SIDEBAR - Modernizada com Gradientes */}
      <div className="w-[30%] min-w-[280px] border-r border-beige-200 bg-white hidden md:flex flex-col shadow-sm">
        {/* ✅ HEADER SIDEBAR */}
        <div className="p-5 border-b border-beige-100 bg-gradient-to-b from-white to-beige-50 space-y-4">
          <div>
            <h3 className="font-bold text-sm text-darkBlue-700 mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-darkBlue-600" />
              Selecione a Matéria
            </h3>
          </div>

          {/* ✅ SELECT DROPDOWN - Estilizado */}
          <div className="relative">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-beige-200 bg-white text-sm font-semibold text-darkBlue-700 focus:border-darkBlue-500 focus:outline-none focus:ring-2 focus:ring-darkBlue-200 transition-all duration-300 appearance-none cursor-pointer hover:border-beige-300"
            >
              <option value="">📚 Selecione...</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <ArrowRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-darkBlue-400 pointer-events-none" />
          </div>

          {/* ✅ TEMPLATE BUTTON - Com animação */}
          {selectedSubject && (
            <Button
              onClick={() => setShowTemplate(true)}
              className="w-full bg-gradient-to-r from-darkBlue-500 to-darkBlue-600 hover:shadow-lg text-white font-semibold gap-2 h-11 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <Lightbulb className="h-5 w-5" />
              Dica de Como Pedir
            </Button>
          )}

          {/* ✅ EMPTY STATE - Quando nenhuma matéria selecionada */}
          {!selectedSubject && (
            <div className="mt-6 p-4 bg-gradient-soft rounded-xl border border-beige-200 text-center">
              <Sparkles className="h-8 w-8 text-darkBlue-400 mx-auto mb-2 opacity-60" />
              <p className="text-xs text-darkBlue-600 font-medium">
                Escolha uma matéria para começar
              </p>
            </div>
          )}
        </div>

        {/* ✅ SCROLLAREA - Para futuras expansões */}
        <ScrollArea className="flex-1 p-4" />

        {/* ✅ FOOTER SIDEBAR - Dicas */}
        <div className="p-4 border-t border-beige-100 bg-beige-50">
          <div className="text-xs text-darkBlue-600 space-y-2">
            <p className="font-semibold flex items-center gap-2">
              <Sparkles className="h-3 w-3" />
              Dica Rápida
            </p>
            <p className="text-darkBlue-500">
              Descreva bem o conteúdo e a IA criará flashcards automaticamente! ✨
            </p>
          </div>
        </div>
      </div>

      {/* ✅ MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col">
        {/* ✅ HEADER DO CHAT */}
        <div className="p-4 border-b border-beige-200 bg-white/80 backdrop-blur-md flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0 shadow-md">
              <BotMessageSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg bg-gradient-to-r from-darkBlue-700 to-darkBlue-600 bg-clip-text text-transparent">
                Flashcards IA
              </h2>
              <p className="text-xs text-darkBlue-400 font-semibold">Gerador inteligente</p>
            </div>
          </div>

          {/* ✅ DELETE BUTTON */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 rounded-lg text-darkBlue-500 hover:bg-red-50 hover:text-red-600 transition-all duration-300 group"
              >
                <Trash2 className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-white text-darkBlue-700 border-beige-300 rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-lg font-bold">Limpar Histórico de Conversas?</AlertDialogTitle>
                <AlertDialogDescription className="text-darkBlue-600">
                  Esta ação não pode ser desfeita. Isso excluirá permanentemente todas as suas
                  mensagens com o Flashcards IA.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="hover:bg-beige-100 border-beige-300 text-darkBlue-700 rounded-lg">
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteHistory}
                  className="bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold"
                >
                  Limpar Histórico
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* ✅ CHAT MESSAGES AREA */}
        <ScrollArea className="flex-1 p-4 md:p-6 bg-gradient-light" ref={scrollRef}>
          <div className="space-y-4 max-w-3xl mx-auto pb-4">
            {displayMessages.length === 1 && !selectedSubject && (
              // ✅ EMPTY STATE - RESOLVE AQUELE ESPAÇO BRANCO CRÍTICO!
              <div className="h-96 flex items-center justify-center">
                <div className="text-center space-y-6 w-full px-4">
                  {/* ✅ ILUSTRAÇÃO / ÍCONE PRINCIPAL */}
                  <div className="flex justify-center">
                    <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-darkBlue-100 to-purple-100 flex items-center justify-center shadow-lg">
                      <BookOpen className="h-12 w-12 text-darkBlue-600" />
                    </div>
                  </div>

                  {/* ✅ TEXTO PRINCIPAL */}
                  <div>
                    <h3 className="text-2xl font-bold text-darkBlue-700 mb-2">
                      Bem-vindo ao Gerador de Flashcards!
                    </h3>
                    <p className="text-darkBlue-600 text-sm leading-relaxed max-w-sm mx-auto">
                      Selecione uma matéria no painel ao lado e comece a criar flashcards inteligentes com a IA
                    </p>
                  </div>

                  {/* ✅ CARDS DE SUGESTÃO RÁPIDA */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                    {subjects.slice(0, 4).map((subject) => (
                      <button
                        key={subject.id}
                        onClick={() => setSelectedSubject(subject.id)}
                        className="p-4 rounded-xl bg-white border-2 border-beige-200 hover:border-darkBlue-500 hover:shadow-card-hover transition-all duration-300 group text-left"
                      >
                        <p className="font-semibold text-darkBlue-700 text-sm group-hover:text-darkBlue-600 flex items-center justify-between">
                          {subject.name}
                          <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1" />
                        </p>
                        <p className="text-xs text-darkBlue-500 mt-1">Clique para começar</p>
                      </button>
                    ))}
                  </div>

                  {/* ✅ DIVIDER */}
                  <div className="pt-2">
                    <div className="h-px bg-gradient-to-r from-transparent via-beige-300 to-transparent"></div>
                  </div>

                  {/* ✅ INFO BOX */}
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg text-left">
                    <p className="text-xs text-blue-700 font-semibold mb-2">💡 Como Funciona</p>
                    <ul className="text-xs text-blue-600 space-y-1">
                      <li>✨ Escolha uma matéria</li>
                      <li>✍️ Descreva o conteúdo</li>
                      <li>🤖 A IA cria flashcards automáticos</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* ✅ MENSAGENS DO CHAT */}
            {displayMessages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex w-full gap-3 animate-slide-up',
                  msg.role === 'user' ? 'justify-end' : 'justify-start',
                )}
              >
                {msg.role === 'ai' && (
                  <div className="w-9 h-9 rounded-xl bg-darkBlue-500/10 flex items-center justify-center shrink-0 mt-auto">
                    <BotMessageSquare className="h-5 w-5 text-darkBlue-500" />
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[85%] md:max-w-[70%] rounded-2xl px-5 py-3.5 text-sm md:text-base leading-relaxed shadow-card transition-all duration-300',
                    msg.role === 'user'
                      ? 'bg-gradient-primary text-white rounded-br-sm hover:shadow-card-hover'
                      : 'bg-white text-darkBlue-700 border border-beige-200 rounded-bl-sm hover:shadow-card-hover hover:border-beige-300',
                  )}
                >
                  {msg.content.split('\n').map((line, j) => (
                    <p key={j} className={j > 0 ? 'mt-2' : ''}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            ))}

            {/* ✅ LOADING STATE - ANIMAÇÃO */}
            {isLoading && (
              <div className="flex w-full gap-3 justify-start animate-slide-up">
                <div className="w-9 h-9 rounded-xl bg-darkBlue-500/10 flex items-center justify-center shrink-0 mt-auto">
                  <BotMessageSquare className="h-5 w-5 text-darkBlue-500" />
                </div>
                <div className="bg-white border border-beige-200 rounded-2xl rounded-bl-sm px-5 py-3 flex gap-2 items-center shadow-card">
                  <div className="w-2.5 h-2.5 rounded-full bg-darkBlue-500/60 animate-bounce"></div>
                  <div
                    className="w-2.5 h-2.5 rounded-full bg-darkBlue-500/60 animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                  <div
                    className="w-2.5 h-2.5 rounded-full bg-darkBlue-500/60 animate-bounce"
                    style={{ animationDelay: '0.4s' }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* ✅ INPUT FOOTER */}
        <div className="p-4 border-t border-beige-200 bg-white/80 backdrop-blur-md shrink-0 shadow-elevation">
          <div className="max-w-3xl mx-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex gap-2 items-end"
            >
              <div className="flex-1 relative">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder={selectedSubject ? "Descreva o conteúdo..." : "Selecione a matéria antes..."}
                  className="w-full px-5 py-3 rounded-xl h-12 bg-beige-50 border-2 border-beige-200 focus:border-darkBlue-500 focus:outline-none focus:ring-2 focus:ring-darkBlue-200 transition-all duration-300 text-darkBlue-700 placeholder-darkBlue-400 text-base font-medium shadow-sm hover:border-beige-300"
                  disabled={!selectedSubject || isLoading}
                />
              </div>
              <Button
                type="submit"
                size="icon"
                className="h-12 w-12 rounded-xl shrink-0 shadow-md bg-gradient-primary hover:shadow-lg hover:scale-105 active:scale-95 text-white transition-all duration-300"
                disabled={!input.trim() || isLoading || !selectedSubject}
              >
                <Send className="h-5 w-5" />
              </Button>
            </form>
            <p className="text-xs text-darkBlue-500 mt-2 px-5">
              💡 Dica: Seja descritivo e o IA criará flashcards melhores!
            </p>
          </div>
        </div>
      </div>

      {/* ✅ TEMPLATE DIALOG - Modernizado */}
      <Dialog open={showTemplate} onOpenChange={setShowTemplate}>
        <DialogContent className="sm:max-w-[650px] bg-white border-beige-300 text-darkBlue-700 rounded-2xl shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-darkBlue-700 flex items-center gap-2 text-xl font-bold">
              <Lightbulb className="h-6 w-6 text-yellow-500" />
              Como pedir flashcards eficientes sobre {currentTemplate?.subjectName}
            </DialogTitle>
            <DialogDescription className="text-darkBlue-600 font-medium">
              Siga este formato para extrair o máximo da IA:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* ✅ TEMPLATE BOX */}
            <div className="bg-gradient-soft p-5 rounded-xl border-2 border-darkBlue-200">
              <p className="text-sm font-bold text-darkBlue-700 mb-3 flex items-center gap-2">
                📝 Template Sugerido
              </p>
              <p className="text-sm text-darkBlue-700 whitespace-pre-wrap font-mono bg-white p-4 rounded-lg border border-beige-200 shadow-sm">
                {currentTemplate?.template}
              </p>
            </div>

            {/* ✅ EXAMPLE BOX */}
            <div className="bg-emerald-50 p-5 rounded-xl border-2 border-emerald-300">
              <p className="text-sm font-bold text-emerald-700 mb-2 flex items-center gap-2">
                ✅ Dica Prática
              </p>
              <p className="text-sm text-emerald-700">{currentTemplate?.example}</p>
            </div>

            {/* ✅ WHY IT WORKS BOX */}
            <div className="bg-sky-50 p-5 rounded-xl border-2 border-sky-300">
              <p className="text-sm font-bold text-sky-700 mb-2 flex items-center gap-2">
                💡 Por que Funciona
              </p>
              <p className="text-sm text-sky-700 leading-relaxed">
                Ao seguir este padrão, a IA entende exatamente qual é o contexto e o nível de
                profundidade que você precisa, gerando flashcards mais relevantes e focados.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setShowTemplate(false)}
              className="bg-gradient-primary hover:shadow-lg text-white font-semibold w-full rounded-xl h-11 transition-all duration-300 hover:scale-105"
            >
              Entendi! Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}