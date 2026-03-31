import { useState, useMemo } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { BrainCircuit, Plus, Play, Edit, Trash2 } from 'lucide-react'
import useAppStore, { FlashcardWithReview } from '@/stores/useAppStore'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const DIFFICULTY_COLORS = {
  1: { label: 'Muito Fácil', color: '#10b981', bg: '#d1fae5' },
  2: { label: 'Fácil', color: '#3b82f6', bg: '#dbeafe' },
  3: { label: 'Médio', color: '#f59e0b', bg: '#fef3c7' },
  4: { label: 'Difícil', color: '#ef4444', bg: '#fee2e2' },
  5: { label: 'Muito Difícil', color: '#9333ea', bg: '#faf5ff' },
}

export default function Flashcards() {
  const {
    subjects,
    flashcards,
    addFlashcard,
    deleteFlashcard,
    updateFlashcardDifficulty,
    getFlashcardsForToday,
  } = useAppStore()

  const [open, setOpen] = useState(false)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [currentReviewCard, setCurrentReviewCard] = useState<FlashcardWithReview | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [reviewSessionCards, setReviewSessionCards] = useState<FlashcardWithReview[]>([])
  const [reviewIndex, setReviewIndex] = useState(0)
  const [search, setSearch] = useState('')
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all')

  const [newCard, setNewCard] = useState({
    question: '',
    answer: '',
    subjectId: '',
    difficulty: 3 as 1 | 2 | 3 | 4 | 5,
  })

  const flashcardsDueToday = useMemo(() => getFlashcardsForToday(), [flashcards])

  const filteredFlashcards = useMemo(() => {
    let filtered = flashcards
    if (selectedSubjectFilter !== 'all') {
      filtered = filtered.filter((card) => card.subjectId === selectedSubjectFilter)
    }
    if (search) {
      filtered = filtered.filter(
        (c) =>
          c.question.toLowerCase().includes(search.toLowerCase()) ||
          c.answer.toLowerCase().includes(search.toLowerCase()),
      )
    }
    return filtered
  }, [flashcards, selectedSubjectFilter, search])

  const handleAdd = () => {
    if (!newCard.question || !newCard.answer || !newCard.subjectId) {
      toast.error('Preencha todos os campos.')
      return
    }
    addFlashcard({
      question: newCard.question,
      answer: newCard.answer,
      subjectId: newCard.subjectId,
      difficulty: newCard.difficulty,
    })
    setNewCard({ question: '', answer: '', subjectId: '', difficulty: 3 })
    setOpen(false)
    toast.success('Flashcard criado com sucesso!')
  }

  const startReviewSession = () => {
    const cardsToReview = getFlashcardsForToday()
    if (cardsToReview.length === 0) {
      toast.info('Nenhum flashcard para revisar agora!')
      return
    }
    setReviewSessionCards(cardsToReview)
    setReviewIndex(0)
    setShowAnswer(false)
    setCurrentReviewCard(cardsToReview[0])
    setIsReviewModalOpen(true)
  }

  const handleDifficultySelect = (difficulty: 1 | 2 | 3 | 4 | 5) => {
    if (currentReviewCard) {
      updateFlashcardDifficulty(currentReviewCard.id, difficulty)
      toast.success('Flashcard revisado!')
    }

    if (reviewIndex < reviewSessionCards.length - 1) {
      setReviewIndex(reviewIndex + 1)
      setCurrentReviewCard(reviewSessionCards[reviewIndex + 1])
      setShowAnswer(false)
    } else {
      toast.success('Sessão de revisão concluída! Bom trabalho!')
      setIsReviewModalOpen(false)
      setReviewSessionCards([])
      setReviewIndex(0)
      setCurrentReviewCard(null)
    }
  }

  const handleDelete = (cardId: string) => {
    deleteFlashcard(cardId)
    toast.success('Flashcard excluído com sucesso!')
  }

  const todayStr = new Date().toISOString().split('T')[0]

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in-up pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-darkBlue-700">Meus Flashcards</h1>
          <p className="text-darkBlue-500 mt-1">
            {flashcardsDueToday.length} cartões para revisar hoje • Total: {flashcards.length}{' '}
            cartões
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px] bg-white border-beige-300 text-darkBlue-700">
              <DialogHeader>
                <DialogTitle className="text-darkBlue-700">Criar Flashcard</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="text-darkBlue-700">Matéria</Label>
                  <Select onValueChange={(val) => setNewCard({ ...newCard, subjectId: val })}>
                    <SelectTrigger className="bg-beige-50 border-beige-300 text-darkBlue-700">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-beige-300 text-darkBlue-700">
                      {subjects.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-darkBlue-700">Frente (Pergunta)</Label>
                  <Textarea
                    value={newCard.question}
                    onChange={(e) => setNewCard({ ...newCard, question: e.target.value })}
                    className="bg-beige-50 border-beige-300 text-darkBlue-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-darkBlue-700">Verso (Resposta)</Label>
                  <Textarea
                    value={newCard.answer}
                    onChange={(e) => setNewCard({ ...newCard, answer: e.target.value })}
                    className="bg-beige-50 border-beige-300 text-darkBlue-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-darkBlue-700">Nível de Dificuldade</Label>
                  <Select
                    value={newCard.difficulty.toString()}
                    onValueChange={(val) =>
                      setNewCard({ ...newCard, difficulty: parseInt(val) as 1 | 2 | 3 | 4 | 5 })
                    }
                  >
                    <SelectTrigger className="bg-beige-50 border-beige-300 text-darkBlue-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-beige-300 text-darkBlue-700">
                      {Object.entries(DIFFICULTY_COLORS).map(([key, { label }]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleAdd}
                  className="bg-darkBlue-500 hover:bg-darkBlue-600 text-white"
                >
                  Salvar Cartão
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            onClick={startReviewSession}
            disabled={flashcardsDueToday.length === 0}
            className="gap-2 bg-darkBlue-500 hover:bg-darkBlue-600 text-white flex-1 sm:flex-none"
          >
            <BrainCircuit className="h-4 w-4" />
            Iniciar Revisão
          </Button>

          <Button
            onClick={() => setOpen(true)}
            className="gap-2 bg-darkBlue-500 hover:bg-darkBlue-600 text-white flex-1 sm:flex-none"
          >
            <Plus className="h-4 w-4" />
            Novo Cartão
          </Button>
        </div>
      </div>

      <Tabs defaultValue="decks" className="space-y-6">
        <TabsList className="bg-beige-100 border-beige-300 text-darkBlue-700">
          <TabsTrigger value="decks">Visão por Decks</TabsTrigger>
          <TabsTrigger value="all">Todos os Cartões</TabsTrigger>
        </TabsList>

        <TabsContent value="decks" className="mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => {
              const sCards = flashcards.filter((c) => c.subjectId === subject.id)
              const due = sCards.filter((c) => {
                const reviewDate = c.nextReviewAt.split('T')[0]
                return reviewDate <= todayStr
              }).length

              return (
                <Card
                  key={subject.id}
                  className="bg-white border-beige-300 hover:shadow-md transition-shadow group"
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl text-darkBlue-700">{subject.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-end mt-4">
                      <div className="space-y-1">
                        <p className="text-sm text-darkBlue-500">
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
                        className="rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity bg-darkBlue-500 hover:bg-darkBlue-600 text-white"
                        disabled={due === 0}
                        onClick={startReviewSession}
                      >
                        <Play className="h-4 w-4 ml-0.5" />
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
              className="max-w-sm bg-white border-beige-300 text-darkBlue-700"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="border border-beige-300 rounded-xl bg-white overflow-hidden">
            <Table>
              <TableHeader className="bg-beige-100">
                <TableRow>
                  <TableHead className="w-[150px] text-darkBlue-700">Matéria</TableHead>
                  <TableHead className="text-darkBlue-700">Pergunta</TableHead>
                  <TableHead className="text-darkBlue-700">Resposta</TableHead>
                  <TableHead className="w-[100px] text-darkBlue-700">Dificuldade</TableHead>
                  <TableHead className="text-right text-darkBlue-700">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFlashcards.length > 0 ? (
                  filteredFlashcards.map((card) => {
                    const s = subjects.find((s) => s.id === card.subjectId)
                    const diffInfo =
                      DIFFICULTY_COLORS[card.difficulty as keyof typeof DIFFICULTY_COLORS]
                    return (
                      <TableRow key={card.id} className="border-beige-200">
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-beige-100 text-darkBlue-700">
                            {s?.name || 'Desconhecido'}
                          </span>
                        </TableCell>
                        <TableCell
                          className="font-medium max-w-[200px] truncate text-darkBlue-700"
                          title={card.question}
                        >
                          {card.question}
                        </TableCell>
                        <TableCell
                          className="text-darkBlue-500 max-w-[250px] truncate"
                          title={card.answer}
                        >
                          {card.answer}
                        </TableCell>
                        <TableCell>
                          <Badge style={{ backgroundColor: diffInfo.bg, color: diffInfo.color }}>
                            {diffInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(card.id)}
                          >
                            Excluir
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-darkBlue-500">
                      Nenhum cartão encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de Revisão */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white border-beige-300 text-darkBlue-700">
          <DialogHeader>
            <DialogTitle className="text-darkBlue-700">Revisar Flashcard</DialogTitle>
            <DialogDescription className="text-darkBlue-500">
              {currentReviewCard
                ? `Flashcard ${reviewIndex + 1} de ${reviewSessionCards.length}`
                : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {currentReviewCard ? (
              <>
                <Card className="bg-beige-100 border-beige-300">
                  <CardHeader>
                    <CardTitle className="text-darkBlue-700 text-lg">
                      {currentReviewCard.question}
                    </CardTitle>
                  </CardHeader>
                  {showAnswer && (
                    <CardContent>
                      <p className="text-darkBlue-700">{currentReviewCard.answer}</p>
                    </CardContent>
                  )}
                </Card>
                {!showAnswer ? (
                  <Button
                    onClick={() => setShowAnswer(true)}
                    className="w-full bg-darkBlue-500 hover:bg-darkBlue-600 text-white"
                  >
                    Mostrar Resposta
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-darkBlue-700 font-medium">Qual foi a dificuldade?</p>
                    <div className="grid grid-cols-5 gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handleDifficultySelect(5)}
                        className="border-red-500 text-red-500 hover:bg-red-50 text-xs"
                      >
                        5
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDifficultySelect(4)}
                        className="border-orange-500 text-orange-500 hover:bg-orange-50 text-xs"
                      >
                        4
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDifficultySelect(3)}
                        className="border-yellow-500 text-yellow-500 hover:bg-yellow-50 text-xs"
                      >
                        3
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDifficultySelect(2)}
                        className="border-green-500 text-green-500 hover:bg-green-50 text-xs"
                      >
                        2
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDifficultySelect(1)}
                        className="border-emerald-500 text-emerald-500 hover:bg-emerald-50 text-xs"
                      >
                        1
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-darkBlue-500 text-center">Carregando flashcard...</p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsReviewModalOpen(false)}
              className="border-beige-300 text-darkBlue-700 hover:bg-beige-100"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
