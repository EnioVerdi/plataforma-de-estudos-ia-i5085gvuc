import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Bot, Paperclip, Send, Search, MessageSquarePlus, PlusCircle } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'ai'
  content: string
}

const HISTORY_MOCK = [
  { id: '1', title: 'Dúvidas sobre Mitose', date: 'Hoje' },
  { id: '2', title: 'Fórmulas de Física - Termodinâmica', date: 'Ontem' },
  { id: '3', title: 'Revisão Guerra Fria', date: '25/03/2026' },
  { id: '4', title: 'Regras de Crase', date: '20/03/2026' },
]

const QUICK_CHIPS = [
  'Como melhorar a retenção?',
  'Explicar este flashcard',
  'Gerar exercícios',
  'Simplificar conceito',
]

export default function FlashcardsChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial',
      role: 'ai',
      content:
        'Olá! Sou seu assistente focado em flashcards. Posso ajudar a criar novos cartões, melhorar os existentes ou explicar conceitos complexos. Como posso ajudar hoje?',
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const simulateAiResponse = (userText: string) => {
    const aiResponse = `Entendi. Para trabalhar com "${userText}", recomendo criar flashcards que isolem partes do conceito. Quer que eu gere alguns exemplos práticos baseados no seu estilo de aprendizado?`

    setTimeout(() => {
      setIsLoading(false)
      const newAiId = Math.random().toString()
      setMessages((prev) => [...prev, { id: newAiId, role: 'ai', content: '' }])

      let i = 0
      const interval = setInterval(() => {
        setMessages((prev) => {
          const updated = [...prev]
          const lastIndex = updated.length - 1
          if (updated[lastIndex].id === newAiId) {
            updated[lastIndex].content = aiResponse.slice(0, i + 1)
          }
          return updated
        })
        i++
        if (i >= aiResponse.length) clearInterval(interval)
      }, 25)
    }, 800)
  }

  const handleSend = (text: string = input) => {
    if (!text.trim() || isLoading) return
    const newMsg: Message = { id: Math.random().toString(), role: 'user', content: text }
    setMessages((prev) => [...prev, newMsg])
    setInput('')
    setIsLoading(true)
    simulateAiResponse(text)
  }

  return (
    <div className="flex h-full bg-card rounded-2xl border shadow-sm overflow-hidden animate-fade-in-up">
      {/* Left Sidebar - History */}
      <div className="w-[30%] min-w-[280px] border-r bg-muted/10 hidden md:flex flex-col">
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
              Histórico de Conversas
            </h3>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary">
              <MessageSquarePlus className="h-5 w-5" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar conversas..." className="pl-9 h-9 bg-background" />
          </div>
          <Button
            variant="outline"
            className="w-full justify-start h-9"
            onClick={() => setMessages([messages[0]])}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova Conversa
          </Button>
        </div>
        <ScrollArea className="flex-1 p-2">
          <div className="space-y-1">
            {HISTORY_MOCK.map((item) => (
              <button
                key={item.id}
                className="w-full text-left px-3 py-3 rounded-xl hover:bg-muted transition-colors group"
              >
                <div className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                  {item.title}
                </div>
                <div className="text-xs text-muted-foreground mt-1">{item.date}</div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Right Area - Chat */}
      <div className="flex-1 flex flex-col relative bg-background/50">
        {/* Header */}
        <div className="h-16 border-b flex items-center px-6 bg-background shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold leading-none mb-1">Chat de Flashcards com IA</h2>
              <p className="text-xs text-muted-foreground">
                Tire dúvidas e otimize seus cartões com ajuda da IA
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6" ref={scrollRef}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn('flex gap-4 max-w-[85%]', msg.role === 'user' ? 'ml-auto' : 'mr-auto')}
            >
              {msg.role === 'ai' && (
                <Avatar className="h-8 w-8 mt-1 border border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary">IA</AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-sm'
                    : 'bg-muted rounded-tl-sm',
                )}
              >
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarImage src="https://img.usecurling.com/ppl/thumbnail?gender=male&seed=1" />
                  <AvatarFallback>AL</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4 max-w-[85%] mr-auto items-center text-muted-foreground">
              <Avatar className="h-8 w-8 border border-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary">IA</AvatarFallback>
              </Avatar>
              <div className="bg-muted px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1 items-center">
                <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" />
                <span
                  className="w-2 h-2 rounded-full bg-primary/50 animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                />
                <span
                  className="w-2 h-2 rounded-full bg-primary/50 animate-bounce"
                  style={{ animationDelay: '0.4s' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-background border-t shrink-0">
          <div className="flex flex-wrap gap-2 mb-4">
            {QUICK_CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={() => handleSend(chip)}
                className="text-xs bg-muted hover:bg-muted/80 px-3 py-1.5 rounded-full transition-colors border shadow-sm"
              >
                {chip}
              </button>
            ))}
          </div>
          <div className="relative flex items-center shadow-sm">
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 text-muted-foreground hover:text-foreground hover:bg-transparent"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Digite sua pergunta..."
              className="pl-12 pr-14 h-14 rounded-full border-muted-foreground/20 bg-muted/30 focus-visible:ring-primary/50"
            />
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 h-10 w-10 rounded-full p-0"
            >
              <Send className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
