import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Label } from '@/components/ui/label'
import { Sparkles, Plus, Play } from 'lucide-react'
import useAppStore from '@/stores/useAppStore'
import { Link } from 'react-router-dom'
import { toast } from '@/hooks/use-toast'
import { getSubjectConfig } from '@/lib/subjects'

export default function Flashcards() {
  const { subjects, flashcards, addFlashcard, deleteFlashcard } = useAppStore()
  const [open, setOpen] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)
  const [newCard, setNewCard] = useState({ question: '', answer: '', subjectId: '' })
  const [aiText, setAiText] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [search, setSearch] = useState('')

  const todayStr = new Date().toISOString().split('T')[0]

  const handleAdd = () => {
    if (!newCard.question || !newCard.answer || !newCard.subjectId) {
      toast({ title: 'Erro', description: 'Preencha todos os campos.', variant: 'destructive' })
      return
    }
    addFlashcard(newCard)
    setNewCard({ question: '', answer: '', subjectId: '' })
    setOpen(false)
    toast({ title: 'Cartão adicionado!', description: 'Seu flashcard foi criado com sucesso.' })
  }

  const handleAIGenerate = () => {
    if (!aiText || !newCard.subjectId) {
      toast({
        title: 'Atenção',
        description: 'Selecione a matéria e insira um texto base.',
        variant: 'destructive',
      })
      return
    }
    setIsGenerating(true)
    setTimeout(() => {
      addFlashcard({
        question: 'Quais os principais fatores mencionados no texto?',
        answer: 'Fatores ambientais e genéticos que influenciam o desenvolvimento.',
        subjectId: newCard.subjectId,
      })
      addFlashcard({
        question: 'Resuma o conceito central abordado.',
        answer: 'O conceito trata da adaptação das espécies ao longo das gerações.',
        subjectId: newCard.subjectId,
      })
      setIsGenerating(false)
      setAiOpen(false)
      setAiText('')
      toast({
        title: 'Mágica concluída! ✨',
        description: 'A IA gerou 2 novos cartões baseados no seu texto.',
      })
    }, 1500)
  }

  const filteredCards = flashcards.filter(
    (c) =>
      c.question.toLowerCase().includes(search.toLowerCase()) ||
      c.answer.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in-up pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus Flashcards</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seus decks e gere novos cartões com IA.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Dialog open={aiOpen} onOpenChange={setAiOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="gap-2 flex-1 sm:flex-none border-primary/20 hover:bg-primary/5"
              >
                <Sparkles className="h-4 w-4 text-primary" /> IA Gerador
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Gerador Automático com IA</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Selecione a Matéria</Label>
                  <Select onValueChange={(val) => setNewCard({ ...newCard, subjectId: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Matéria de destino" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((s) => {
                        const { icon: Icon, color } = getSubjectConfig(s.name)
                        return (
                          <SelectItem key={s.id} value={s.id}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" style={{ color }} />
                              <span>{s.name}</span>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Cole seu resumo ou texto base</Label>
                  <Textarea
                    placeholder="Cole aqui o texto do seu PDF ou anotações..."
                    className="h-32 resize-none"
                    value={aiText}
                    onChange={(e) => setAiText(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setAiOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAIGenerate} disabled={isGenerating}>
                  {isGenerating ? 'Analisando texto...' : 'Gerar Cartões'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 flex-1 sm:flex-none">
                <Plus className="h-4 w-4" /> Novo Cartão
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Criar Flashcard</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Matéria</Label>
                  <Select onValueChange={(val) => setNewCard({ ...newCard, subjectId: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((s) => {
                        const { icon: Icon, color } = getSubjectConfig(s.name)
                        return (
                          <SelectItem key={s.id} value={s.id}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" style={{ color }} />
                              <span>{s.name}</span>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Frente (Pergunta)</Label>
                  <Textarea
                    value={newCard.question}
                    onChange={(e) => setNewCard({ ...newCard, question: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Verso (Resposta)</Label>
                  <Textarea
                    value={newCard.answer}
                    onChange={(e) => setNewCard({ ...newCard, answer: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAdd}>Salvar Cartão</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="decks" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="decks" className="px-6">
            Visão por Decks
          </TabsTrigger>
          <TabsTrigger value="all" className="px-6">
            Todos os Cartões
          </TabsTrigger>
        </TabsList>

        <TabsContent value="decks" className="mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => {
              const sCards = flashcards.filter((c) => c.subjectId === subject.id)
              const due = sCards.filter(
                (c) => c.nextReviewAt.startsWith(todayStr) || new Date(c.nextReviewAt) < new Date(),
              ).length
              const { icon: Icon, color } = getSubjectConfig(subject.name)
              return (
                <Card
                  key={subject.id}
                  className="hover:shadow-md transition-shadow border-0 ring-1 ring-border group"
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div
                          className="p-2.5 rounded-lg"
                          style={{ backgroundColor: `${color}15`, color: color }}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-xl">{subject.name}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-end mt-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          {sCards.length} cartões no total
                        </p>
                        {due > 0 ? (
                          <p className="text-sm font-semibold text-orange-500">
                            {due} pendentes para hoje
                          </p>
                        ) : (
                          <p className="text-sm text-emerald-500 font-medium">Tudo revisado</p>
                        )}
                      </div>
                      <Button
                        size="icon"
                        className="rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        asChild
                        disabled={due === 0}
                      >
                        <Link to={`/study/${subject.id}`}>
                          <Play className="h-4 w-4 ml-0.5" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="all" className="mt-0 space-y-4">
          <div className="flex justify-end">
            <Input
              placeholder="Buscar flashcards..."
              className="max-w-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="border rounded-xl bg-card overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-[150px]">Matéria</TableHead>
                  <TableHead>Pergunta</TableHead>
                  <TableHead>Resposta</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCards.length > 0 ? (
                  filteredCards.map((card) => {
                    const s = subjects.find((s) => s.id === card.subjectId)
                    return (
                      <TableRow key={card.id}>
                        <TableCell>
                          {s ? (
                            (() => {
                              const { icon: Icon, color } = getSubjectConfig(s.name)
                              return (
                                <span
                                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium"
                                  style={{ backgroundColor: `${color}15`, color: color }}
                                >
                                  <Icon className="h-3 w-3" />
                                  {s.name}
                                </span>
                              )
                            })()
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground">
                              Desconhecido
                            </span>
                          )}
                        </TableCell>
                        <TableCell
                          className="font-medium max-w-[200px] truncate"
                          title={card.question}
                        >
                          {card.question}
                        </TableCell>
                        <TableCell
                          className="text-muted-foreground max-w-[250px] truncate"
                          title={card.answer}
                        >
                          {card.answer}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => deleteFlashcard(card.id)}
                          >
                            Excluir
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      Nenhum cartão encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
