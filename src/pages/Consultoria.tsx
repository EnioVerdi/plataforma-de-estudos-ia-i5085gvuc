import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Sparkles, BookOpen, BrainCircuit, BotMessageSquare, Trash2 } from 'lucide-react'
import useAppStore from '@/stores/useAppStore'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
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

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

interface Message {
  id: string
  role: 'user' | 'ai'
  content: string
  timestamp: number
}

export default function Consultoria() {
  const { user } = useAuth()
  const { chatContext, setChatContext, userAssessment } = useAppStore()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial-ai',
      role: 'ai',
      content:
        'Olá! Sou seu consultor de estudos inteligente. Como posso te ajudar a entender melhor os conteúdos hoje?',
      timestamp: Date.now(),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadHistory = async () => {
      if (!user) return
      const { data } = await supabase
        .from('consultation_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: true })
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
    if (chatContext) {
      setMessages((prev) => [
        ...prev,
        { id: `ctx-${Date.now()}`, role: 'user', content: chatContext, timestamp: Date.now() },
      ])
      setChatContext('')
      handleConsult(chatContext)
    }
  }, [chatContext, setChatContext, user])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const handleConsult = async (userQuery: string) => {
    setIsTyping(true)
    try {
      let systemPrompt = `Atue como um Professor Particular de Elite e Especialista em Didática para o Ensino Médio e Vestibulares do Brasil.

Seu Objetivo: Preparar um aluno do 3º ano do ensino médio para os exames mais concorridos do país (ENEM, Fuvest, Unicamp e Federais), focando em uma didática excepcional, construção de base sólida e alto rendimento para cursos de exatas e tecnologia (como Engenharia de Software e Ciência da Computação).

Sua Didática e Metodologia de Ensino:

Nivelamento Progressivo: Nunca presuma que o aluno sabe a base. Comece explicando o conceito de forma simples e intuitiva. Só depois aprofunde para o nível de complexidade cobrado nos vestibulares paulistas e no ENEM.

Analogias Memoráveis: Transforme conceitos abstratos de Física, Química, Biologia ou Matemática em situações do dia a dia ou em sistemas lógicos/tecnológicos. Facilite a visualização mental.

Método Socrático Guiado: Quando o aluno enviar uma dúvida ou errar uma questão, não dê a resposta de imediato. Faça perguntas estratégicas que o guiem até a conclusão correta. Mostre onde o raciocínio falhou.

Engenharia Reversa de Questões: Ao explicar uma questão, desconstrua as alternativas. Explique não apenas por que a alternativa correta está certa, mas exatamente qual foi a "pegadinha" que tornou as outras incorretas.

Adaptação por Banca: Se o aluno mencionar um vestibular específico em uma pergunta (ex: "Como isso cai no ENEM?"), adapte a explicação. Para o ENEM, foque em interpretação e aplicação prática (TRI); para Fuvest/Unicamp, foque em profundidade teórica e fórmulas.

Ferramentas de Estudo:

Revisão Ativa (Anki): Sempre que explicar um conceito novo ou fizer um resumo, gere automaticamente no final da resposta 3 a 5 Flashcards de fixação no formato Frente/Verso, prontos para copiar e colar.

Gestão de Tempo: Sugira divisões de estudo baseadas em ciclos de foco (método Pomodoro), dividindo a teoria e a prática de forma equilibrada.

Formatação e Comunicação:

Use parágrafos curtos. Textos longos e densos atrapalham a absorção.

Use negrito para destacar palavras-chave, fórmulas e conceitos centrais.

Mantenha um tom encorajador, paciente e analítico. Celebre os acertos e trate os erros como degraus de aprendizado.`

      console.log('DEBUG - Consultoria: userAssessment completo:', userAssessment)

      if (userAssessment && Object.keys(userAssessment).length > 0) {
        console.log('DEBUG - Consultoria: userAssessment encontrado, adicionando ao prompt.')
        systemPrompt += `

IMPORTANTE: Personalize TODAS as suas respostas baseado no perfil específico do aluno abaixo. Adapte a profundidade, velocidade e estilo de explicação exatamente conforme as preferências dele:

Perfil do Aluno:
- Nível de Conhecimento: ${userAssessment.studentLevel || 'Não informado'}
- Tempo Disponível para Estudo: ${userAssessment.studyTime || 'Não informado'}
- Objetivo Principal: ${userAssessment.goal || 'Não informado'}
- Principais Dificuldades: ${userAssessment.difficulties || 'Não informado'}
- Estilo de Aprendizado Preferido: ${userAssessment.learningPreference || 'Não informado'}
- Conhecimento Geral: ${userAssessment.knowledgeLevel || 'Não informado'}

Use OBRIGATORIAMENTE essas informações para:
1. Ajustar o nível de profundidade das explicações
2. Usar exemplos relacionados às dificuldades específicas mencionadas
3. Aplicar o método de aprendizado preferido (prático, visual, teórico, etc)
4. Considerar o tempo disponível ao sugerir cronogramas
5. Direcionar para o objetivo específico do aluno`
      } else {
        console.log('DEBUG - Consultoria: userAssessment vazio ou não carregado, usando prompt genérico.')
      }

      const conversationHistory = messages
        .filter((msg) => msg.role !== undefined)
        .map((msg) => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        }))

      console.log('DEBUG - Consultoria: Histórico de conversa enviado à IA:', conversationHistory)

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
            ...conversationHistory,
            { role: 'user', content: userQuery },
          ],
          temperature: 0.7,
          max_tokens: 1024,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Erro ao conectar com Groq')
      }

      const data = await response.json()
      const aiResponse = data.choices[0].message.content

      setMessages((prev) => [
        ...prev,
        { id: `ai-${Date.now()}`, role: 'ai', content: aiResponse, timestamp: Date.now() },
      ])

      if (user) {
        await supabase.from('consultation_sessions').insert({
          user_id: user.id,
          query: userQuery,
          response: aiResponse,
          timestamp: new Date().toISOString(),
        })
      }
    } catch (error) {
      console.error('DEBUG - Consultoria: Erro ao consultar IA:', error)
      const errorResponse =
        'Desculpe, ocorreu um erro ao conectar com a IA. Verifique sua conexão e tente novamente.'
      setMessages((prev) => [
        ...prev,
        { id: `err-${Date.now()}`, role: 'ai', content: errorResponse, timestamp: Date.now() },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  const handleSend = (e?: React.FormEvent, presetQuery?: string) => {
    e?.preventDefault()
    const text = presetQuery || input.trim()
    if (!text) return

    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: 'user', content: text, timestamp: Date.now() },
    ])
    setInput('')
    handleConsult(text)
  }

  const handleDeleteHistory = async () => {
    if (!user) return
    try {
      await supabase.from('consultation_sessions').delete().eq('user_id', user.id)
      setMessages([
        {
          id: 'initial-ai',
          role: 'ai',
          content:
            'Olá! Sou seu consultor de estudos inteligente. Como posso te ajudar a entender melhor os conteúdos hoje?',
          timestamp: Date.now(),
        },
      ])
      toast.success('Histórico de conversas limpo com sucesso!')
    } catch (error) {
      console.error('DEBUG - Consultoria: Erro ao limpar histórico:', error)
      toast.error('Erro ao limpar histórico de conversas.')
    }
  }

  const presets = [
    { label: 'Explique como uma criança', icon: Sparkles },
    { label: 'Resumo Técnico', icon: BookOpen },
    { label: 'Gerar Exercício Prático', icon: BrainCircuit },
  ]

  return (
    <div className="flex flex-col h-full w-full bg-beige-50 text-darkBlue-700 overflow-hidden">
      <div className="p-4 border-b border-beige-300 bg-white flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-darkBlue-500/10 flex items-center justify-center shrink-0">
            <BotMessageSquare className="h-5 w-5 text-darkBlue-500" />
          </div>
          <div>
            <h2 className="font-semibold text-darkBlue-700">Consultor EstudoIA</h2>
            <p className="text-xs text-emerald-500 font-medium flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Online e pronto para ajudar
            </p>
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
                mensagens com o Consultor EstudoIA.
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
          {messages.map((msg) => (
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

          {isTyping && (
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
          <div className="flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-none">
            {presets.map((p) => (
              <Button
                key={p.label}
                variant="outline"
                size="sm"
                onClick={() => handleSend(undefined, p.label)}
                className="shrink-0 rounded-full border-darkBlue-200 hover:bg-beige-100 text-xs md:text-sm text-darkBlue-700"
              >
                <p.icon className="w-3.5 h-3.5 mr-1.5 text-darkBlue-500" />
                {p.label}
              </Button>
            ))}
          </div>
          <form onSubmit={handleSend} className="flex gap-2 items-end">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua dúvida ou cole um texto..."
              className="rounded-xl h-12 bg-beige-50 border-beige-300 focus-visible:ring-darkBlue-500 shadow-sm text-darkBlue-700"
            />
            <Button
              type="submit"
              size="icon"
              className="h-12 w-12 rounded-xl shrink-0 shadow-sm bg-darkBlue-500 hover:bg-darkBlue-600 text-white"
              disabled={!input.trim() || isTyping}
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>
          <p className="text-[10px] text-center text-darkBlue-500 mt-3">
            A IA pode cometer erros. Verifique informações importantes no seu material de aula.
          </p>
        </div>
      </div>
    </div>
  )
}