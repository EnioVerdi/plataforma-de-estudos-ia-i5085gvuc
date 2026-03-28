import { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Sparkles, BookOpen, BrainCircuit, BotMessageSquare, User } from 'lucide-react'
import useAppStore from '@/stores/useAppStore'
import { cn } from '@/lib/utils'

export default function Consultoria() {
  const { chatContext, setChatContext } = useAppStore()
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([
    {
      role: 'ai',
      content:
        'Olá! Sou seu consultor de estudos inteligente. Como posso te ajudar a entender melhor os conteúdos hoje?',
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chatContext) {
      setMessages((prev) => [...prev, { role: 'user', content: chatContext }])
      setChatContext('')
      setIsTyping(true)
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: 'ai',
            content:
              'Entendi a sua dúvida! Vamos simplificar:\n\nImagine que a célula é uma pequena cidade. A organela em questão age como a **usina de energia** dessa cidade. Ela pega os "combustíveis" e transforma em energia elétrica (ATP) para que tudo continue funcionando.\n\nFicou mais claro agora?',
          },
        ])
        setIsTyping(false)
      }, 1800)
    }
  }, [chatContext, setChatContext])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isTyping])

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim()) return

    setMessages((prev) => [...prev, { role: 'user', content: input }])
    setInput('')
    setIsTyping(true)

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content:
            'Ótima pergunta. O conceito central aqui é a retenção espaçada. Revisar no momento exato em que você está prestes a esquecer fortalece as conexões neurais. Recomendo criar 3 flashcards práticos sobre isso.',
        },
      ])
      setIsTyping(false)
    }, 1500)
  }

  const presets = [
    { label: 'Explique como uma criança', icon: Sparkles },
    { label: 'Resumo Técnico', icon: BookOpen },
    { label: 'Gerar Exercício Prático', icon: BrainCircuit },
  ]

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] md:h-full flex flex-col bg-card border rounded-2xl shadow-sm overflow-hidden animate-fade-in-up">
      <div className="p-4 border-b bg-muted/30 flex items-center gap-3 shrink-0">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <BotMessageSquare className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="font-semibold">Consultor EstudoIA</h2>
          <p className="text-xs text-emerald-500 font-medium flex items-center gap-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Online e pronto para ajudar
          </p>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4 md:p-6 bg-background/50">
        <div className="space-y-6 max-w-3xl mx-auto pb-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                'flex w-full gap-3',
                msg.role === 'user' ? 'justify-end' : 'justify-start',
              )}
            >
              {msg.role === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-auto">
                  <BotMessageSquare className="h-4 w-4 text-primary" />
                </div>
              )}
              <div
                className={cn(
                  'max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-3.5 text-sm md:text-base leading-relaxed shadow-sm',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-card border text-foreground rounded-bl-sm',
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
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-auto">
                <BotMessageSquare className="h-4 w-4 text-primary" />
              </div>
              <div className="bg-card border rounded-2xl rounded-bl-sm px-5 py-4 flex gap-1.5 items-center shadow-sm">
                <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce"></div>
                <div
                  className="w-2 h-2 rounded-full bg-primary/40 animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                ></div>
                <div
                  className="w-2 h-2 rounded-full bg-primary/40 animate-bounce"
                  style={{ animationDelay: '0.4s' }}
                ></div>
              </div>
            </div>
          )}
          <div ref={scrollRef} className="h-1" />
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-card shrink-0">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-none">
            {presets.map((p) => (
              <Button
                key={p.label}
                variant="outline"
                size="sm"
                onClick={() => setInput(p.label)}
                className="shrink-0 rounded-full border-primary/20 hover:bg-primary/5 text-xs md:text-sm"
              >
                <p.icon className="w-3.5 h-3.5 mr-1.5 text-primary" />
                {p.label}
              </Button>
            ))}
          </div>
          <form onSubmit={handleSend} className="flex gap-2 items-end">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua dúvida ou cole um texto..."
              className="rounded-xl h-12 bg-background border-border focus-visible:ring-primary shadow-sm"
            />
            <Button
              type="submit"
              size="icon"
              className="h-12 w-12 rounded-xl shrink-0 shadow-sm"
              disabled={!input.trim() || isTyping}
            >
              <Send className="h-5 w-5 ml-1" />
            </Button>
          </form>
          <p className="text-[10px] text-center text-muted-foreground mt-3">
            A IA pode cometer erros. Verifique informações importantes no seu material de aula.
          </p>
        </div>
      </div>
    </div>
  )
}
