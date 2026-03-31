import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Trash2, BotMessageSquare, Lightbulb } from 'lucide-react'
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
const FLASHCARD_LIMIT_PER_SUBJECT = 20

export default function FlashcardsChat(): React.JSX.Element {
  const { user } = useAuth()
  const { subjects, addFlashcard, userAssessment, getPromptTemplate, loadFlashcardsFromSupabase, getFlashcardsCountBySubject, canAddFlashcard } = useAppStore()
  const [showAssessment, setShowAssessment] = useState(!userAssessment)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial-ai',
      role: 'ai',
      content:
        'Olá! Sou seu assistente para criar flashcards. Explique o conteúdo que deseja estudar!',
      timestamp: Date.now(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState('')
  const [displayMessages, setDisplayMessages] = useState<Message[]>([])
  const [showTemplate, setShowTemplate] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Carregar flashcards do Supabase quando o usuário logar
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
      if (!user) return
      const { data } = await supabase
        .from('flashcard_chat_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: true })
        .limit(100)

      if (data && data.length > 0) {
        const history = data.flatMap((s: any) => [
          {
            id: s.id + '-user',
            role: 'user' as const,
            content: s.query,
            timestamp: new Date(s.timestamp).getTime(),
          },
          {
            id: s.id + '-ai',
            role: 'ai' as const,
            content: s.response,
            timestamp: new Date(s.timestamp).getTime(),
          },
        ])
        setMessages((prev) => [...prev, ...history])
      }
    }
    loadHistory()
  }, [user])

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

    console.log('Linhas da resposta:', lines)

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
            console.log('Flashcard extraído (padrão pipe):', { q, a })
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
              console.log('Flashcard extraído (padrão P/R):', { question, answer })
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
            console.log('Flashcard extraído (padrão numerado):', { question, answer })
            i += 1
            continue
          }
        }
      }
    }

    console.log('Total de flashcards extraídos:', flashcards.length)
    console.log('Flashcards parseados:', flashcards)
    return flashcards
  }

  const handleAiResponse = async (userText: string) => {
    setIsLoading(true)
    console.log('DEBUG - FlashcardsChat: Iniciando handleAiResponse')
    console.log('DEBUG - FlashcardsChat: selectedSubject =', selectedSubject)

    // ✅ VALIDAÇÃO: Verifica se a matéria foi selecionada
    if (!selectedSubject || selectedSubject.trim() === '') {
      console.log('DEBUG - FlashcardsChat: ERRO - Matéria não selecionada!')
      toast.error('Selecione a matéria antes de criar flashcards.')
      setIsLoading(false)
      return
    }

    // ✅ VALIDAÇÃO: Verifica se pode adicionar mais flashcards
    if (!canAddFlashcard(selectedSubject)) {
      console.log('DEBUG - FlashcardsChat: ERRO - Limite de flashcards atingido para a matéria:', selectedSubject)
      toast.error(`Limite de ${FLASHCARD_LIMIT_PER_SUBJECT} flashcards atingido para esta matéria.`)
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
        const subjectToUse = selectedSubject || subjects[0]?.id

        if (subjectToUse) {
          let flashcardsAddedCount = 0
          for (const card of parsedFlashcards) {
            // ✅ Verifica limite antes de adicionar cada flashcard
            if (canAddFlashcard(subjectToUse)) {
              addFlashcard({
                question: card.question,
                answer: card.answer,
                subjectId: subjectToUse,
                difficulty: 3,
              })
              flashcardsAddedCount++
            } else {
              console.log('DEBUG - FlashcardsChat: Limite atingido, parando adição de flashcards.')
              break
            }
          }

          const subjectName = subjects.find((s) => s.id === subjectToUse)?.name || 'matéria'
          const currentCount = getFlashcardsCountBySubject(subjectToUse)
          const remainingSlots = FLASHCARD_LIMIT_PER_SUBJECT - currentCount

          if (flashcardsAddedCount > 0) {
            chatMessage = `✅ **${flashcardsAddedCount} flashcard${flashcardsAddedCount > 1 ? 's' : ''}** foi${flashcardsAddedCount > 1 ? 'ram' : ''} adicionado${flashcardsAddedCount > 1 ? 's' : ''} à matéria **${subjectName}**!\n\n`

            if (remainingSlots > 0) {
              chatMessage += `Você pode adicionar mais ${remainingSlots} flashcard${remainingSlots > 1 ? 's' : ''} a esta matéria. 🎯`
            } else {
              chatMessage += `Limite de ${FLASHCARD_LIMIT_PER_SUBJECT} flashcards atingido para esta matéria. 🛑`
            }
          } else {
            chatMessage = `Não consegui adicionar flashcards ou o limite foi atingido para esta matéria.`
          }

          console.log(`Flashcards criados: ${flashcardsAddedCount} na matéria ${subjectName}`)
        } else {
          chatMessage = '⚠️ Selecione uma matéria para adicionar flashcards.'
        }
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
      console.error('Erro:', error)
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
          content:
            'Olá! Sou seu assistente para criar flashcards. Explique o conteúdo que deseja estudar!',
          timestamp: Date.now(),
        },
      ])
      toast.success('Histórico de conversas limpo com sucesso!')
    } catch (error) {
      console.error('Erro ao limpar histórico:', error)
      toast.error('Erro ao limpar histórico de conversas.')
    }
  }

  const currentTemplate = selectedSubject ? getPromptTemplate(selectedSubject) : null
  const isSubjectLimitReached = selectedSubject ? !canAddFlashcard(selectedSubject) : false

  if (showAssessment && userAssessment === null) {
    return <UserAssessment onComplete={() => setShowAssessment(false)} />
  }

  return (
    <div className="flex h-full w-full bg-beige-50 text-darkBlue-700 overflow-hidden">
      <div className="w-[30%] min-w-[280px] border-r border-beige-300 bg-white hidden md:flex flex-col">
        <div className="p-4 border-b border-beige-300 space-y-4">
          <h3 className="font-semibold text-sm text-darkBlue-700">Matéria</h3>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-beige-300 bg-beige-50 text-sm text-darkBlue-700 focus:ring-darkBlue-500 focus:border-darkBlue-500"
          >
            <option value="">Selecione...</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({getFlashcardsCountBySubject(s.id)}/{FLASHCARD_LIMIT_PER_SUBJECT})
              </option>
            ))}
          </select>

          {selectedSubject && (
            <Button
              onClick={() => setShowTemplate(true)}
              variant="outline"
              className="w-full border-darkBlue-300 text-darkBlue-700 hover:bg-beige-100 gap-2"
            >
              <Lightbulb className="h-4 w-4" />
              Ver dica de como pedir
            </Button>
          )}
        </div>
        <ScrollArea className="flex-1" />
      </div>

      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-beige-300 bg-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-darkBlue-500/10 flex items-center justify-center shrink-0">
              <BotMessageSquare className="h-5 w-5 text-darkBlue-500" />
            </div>
            <div>
              <h2 className="font-semibold text-darkBlue-700">Flashcards IA</h2>
            </div>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-darkBlue-500 hover:bg-beige-100">
                <Trash2 className="h-5 w-5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-white text-darkBlue-700 border-beige-300">
              <AlertDialogHeader>
                <AlertDialogTitle>Limpar Histórico de Conversas?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Isso excluirá permanentemente todas as suas
                  mensagens com o Flashcards IA.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="hover:bg-beige-100 border-beige-300 text-darkBlue-700">
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteHistory}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  Limpar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <ScrollArea className="flex-1 p-4 md:p-6 bg-beige-50" ref={scrollRef}>
          <div className="space-y-4 max-w-3xl mx-auto pb-4">
            {displayMessages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex w-full gap-3',
                  msg.role === 'user' ? 'justify-end' : 'justify-start',
                )}
              >
                {msg.role === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-darkBlue-500/10 flex items-center justify-center shrink-0 mt-auto">
                    <BotMessageSquare className="h-4 w-4 text-darkBlue-500" />
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[85%] md:max-w-[75%] rounded-xl px-4 py-3 text-sm md:text-base leading-relaxed shadow-sm',
                    msg.role === 'user'
                      ? 'bg-darkBlue-500 text-white rounded-br-sm'
                      : 'bg-beige-100 text-darkBlue-700 rounded-bl-sm',
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

            {isLoading && (
              <div className="flex w-full gap-3 justify-start animate-pulse">
                <div className="w-8 h-8 rounded-full bg-darkBlue-500/10 flex items-center justify-center shrink-0 mt-auto">
                  <BotMessageSquare className="h-4 w-4 text-darkBlue-500" />
                </div>
                <div className="bg-beige-100 rounded-xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-darkBlue-500/40 animate-bounce"></div>
                  <div
                    className="w-2 h-2 rounded-full bg-darkBlue-500/40 animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-darkBlue-500/40 animate-bounce"
                    style={{ animationDelay: '0.4s' }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-beige-300 bg-white shrink-0">
          <div className="max-w-3xl mx-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex gap-2 items-end"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={selectedSubject ? (isSubjectLimitReached ? "Limite de flashcards atingido para esta matéria." : "Descreva o conteúdo...") : "Selecione a matéria antes..."}
                className="rounded-xl h-12 bg-beige-50 border-beige-300 focus-visible:ring-darkBlue-500 shadow-sm text-darkBlue-700"
                disabled={!selectedSubject || isLoading || isSubjectLimitReached}
              />
              <Button
                type="submit"
                size="icon"
                className="h-12 w-12 rounded-xl shrink-0 shadow-sm bg-darkBlue-500 hover:bg-darkBlue-600 text-white"
                disabled={!input.trim() || isLoading || !selectedSubject || isSubjectLimitReached}
              >
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      <Dialog open={showTemplate} onOpenChange={setShowTemplate}>
        <DialogContent className="sm:max-w-[600px] bg-white border-beige-300 text-darkBlue-700">
          <DialogHeader>
            <DialogTitle className="text-darkBlue-700 flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Como pedir flashcards eficientes sobre {currentTemplate?.subjectName}
            </DialogTitle>
            <DialogDescription className="text-darkBlue-500">
              Siga este formato para extrair o máximo da IA:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-beige-50 p-4 rounded-lg border border-beige-300">
              <p className="text-sm font-semibold text-darkBlue-700 mb-3">📝 Template sugerido:</p>
              <p className="text-sm text-darkBlue-700 whitespace-pre-wrap font-mono bg-white p-3 rounded border border-beige-200">
                {currentTemplate?.template}
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-300">
              <p className="text-sm font-semibold text-green-700 mb-2">✅ Dica prática:</p>
              <p className="text-sm text-green-700">{currentTemplate?.example}</p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-300">
              <p className="text-sm font-semibold text-blue-700 mb-2">💡 Por que funciona:</p>
              <p className="text-sm text-blue-700">
                Ao seguir este padrão, a IA entende exatamente qual é o contexto e o nível de
                profundidade que você precisa, gerando flashcards mais relevantes e focados.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setShowTemplate(false)}
              className="bg-darkBlue-500 hover:bg-darkBlue-600 text-white"
            >
              Entendido! Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}