import { useState, useMemo, useEffect } from 'react'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
import { BrainCircuit, Plus, Play, Trash2, Loader } from 'lucide-react'
import useAppStore, { FlashcardWithReview } from '@/stores/useAppStore'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'

const DIFFICULTY_COLORS = {
  1: { label: 'Muito Fácil', color: '#10b981', bg: '#d1fae5' },
  2: { label: 'Fácil', color: '#3b82f6', bg: '#dbeafe' },
  3: { label: 'Médio', color: '#f59e0b', bg: '#fef3c7' },
  4: { label: 'Difícil', color: '#ef4444', bg: '#fee2e2' },
  5: { label: 'Muito Difícil', color: '#9333ea', bg: '#faf5ff' },
}

const formatNextReviewDate = (nextReviewAt: string, reviewCount: number, repetitions: number): string => {
  // ✅ Verifica se é um flashcard novo (nunca foi revisado)
  if (reviewCount === 0 && repetitions === 0) {
    return 'Novo' // ✅ Flashcard novo - nunca revisado
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const reviewDate = new Date(nextReviewAt)
  reviewDate.setHours(0, 0, 0, 0)

  const diffTime = reviewDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Hoje'
  if (diffDays === 1) return 'Amanhã'
  if (diffDays > 1) return `Em ${diffDays} dias`
  return `Atrasado em ${Math.abs(diffDays)} dias`
}

export default function Flashcards() {
  const { user } = useAuth()
  const {
    subjects,
    flashcards,
    addFlashcard,
    deleteFlashcard,
    updateFlashcardDifficulty,
    getFlashcardsForToday,
    loadFlashcardsFromSupabase,
  } = useAppStore()

  // Estados para modais e UI
  const [open, setOpen] = useState(false)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [currentReviewCard, setCurrentReviewCard] = useState<FlashcardWithReview | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [reviewSessionCards, setReviewSessionCards] = useState<FlashcardWithReview[]>([])
  const [reviewIndex, setReviewIndex] = useState(0)
  const [search, setSearch] = useState('')
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all')
  const [isLoadedFromSupabase, setIsLoadedFromSupabase] = useState(false)
  const [isLoadingFlashcards, setIsLoadingFlashcards] = useState(false)
  const [isDeletingCardId, setIsDeletingCardId] = useState<string | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null)

  // Estado para novo flashcard
  const [newCard, setNewCard] = useState({
    question: '',
    answer: '',
    subjectId: '',
    difficulty: 3 as 1 | 2 | 3 | 4 | 5,
  })

  // ✅ Carregar flashcards do Supabase UMA VEZ quando o usuário logar
  useEffect(() => {
    if (user?.id && !isLoadedFromSupabase) {
      console.log('DEBUG - Flashcards.tsx: Carregando flashcards do Supabase para usuário:', user.id)
      setIsLoadingFlashcards(true)
      loadFlashcardsFromSupabase(user.id).finally(() => {
        setIsLoadingFlashcards(false)
        setIsLoadedFromSupabase(true)
      })
    }
  }, [user?.id])

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

  // ✅ Criar novo flashcard (apenas localmente, será sincronizado via FlashcardsChat.tsx)
  const handleAdd = async () => {
    if (!newCard.question || !newCard.answer || !newCard.subjectId) {
      toast.error('Preencha todos os campos.')
      return
    }

    try {
      // Valida tamanho dos campos
      if (newCard.question.length > 1000) {
        toast.error('A pergunta não pode ter mais de 1000 caracteres.')
        return
      }
      if (newCard.answer.length > 5000) {
        toast.error('A resposta não pode ter mais de 5000 caracteres.')
        return
      }

      // Adiciona localmente ao Zustand
      addFlashcard({
        question: newCard.question,
        answer: newCard.answer,
        subjectId: newCard.subjectId,
        difficulty: newCard.difficulty,
      })

      // Salva no Supabase
      if (user?.id) {
        const now = new Date()
        const nextReviewDate = new Date(now.getTime() + 24 * 60 * 60 * 1000)

        const { error } = await supabase.from('flashcards').insert({
          question: newCard.question,
          answer: newCard.answer,
          subject_id: newCard.subjectId,
          user_id: user.id,
          difficulty: newCard.difficulty,
          next_review_at: nextReviewDate.toISOString(),
          review_count: 0,
          ease_factor: 2.5,
          interval: 0,
          repetitions: 0,
          is_generated_by_ai: false,
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
        })

        if (error) {
          console.error('DEBUG - handleAdd: Erro ao salvar no Supabase:', error)
          toast.error(`Erro ao salvar: ${error.message}`)
          return
        }
      }

      setNewCard({ question: '', answer: '', subjectId: '', difficulty: 3 })
      setOpen(false)
      toast.success('Flashcard criado com sucesso!')
    } catch (error: any) {
      console.error('DEBUG - handleAdd: Erro:', error)
      toast.error('Erro ao criar flashcard.')
    }
  }

  // ✅ Deletar flashcard com confirmação
  const deleteFlashcardFromSupabase = async (cardId: string) => {
    if (!user) {
      toast.error('Usuário não autenticado.')
      return
    }

    try {
      setIsDeletingCardId(cardId)

      // 1️⃣ Deleta do Zustand (estado local)
      deleteFlashcard(cardId)

      // 2️⃣ Deleta do Supabase
      const { error } = await supabase
        .from('flashcards')
        .delete()
        .eq('id', cardId)
        .eq('user_id', user.id)

      if (error) {
        console.error('DEBUG - deleteFlashcardFromSupabase: Erro ao deletar:', error)
        toast.error('Erro ao excluir flashcard.')
        // Recarrega para sincronizar estado
        await loadFlashcardsFromSupabase(user.id)
        return
      }

      console.log('DEBUG - deleteFlashcardFromSupabase: Flashcard deletado com sucesso')
      toast.success('Flashcard excluído com sucesso!')
      setDeleteConfirmation(null)
    } catch (error: any) {
      console.error('DEBUG - deleteFlashcardFromSupabase: Erro:', error)
      toast.error('Erro ao excluir flashcard.')
    } finally {
      setIsDeletingCardId(null)
    }
  }

  // ✅ Iniciar sessão de revisão - Adicionada validação de carregamento
  const startReviewSession = () => {
    // Proteção: Verifica se flashcards foram carregados antes de iniciar revisão
    if (!isLoadedFromSupabase) {
      console.log('DEBUG - startReviewSession: Flashcards ainda não carregados, aguardando...')
      toast.error('Aguarde o carregamento dos flashcards antes de iniciar a revisão.')
      return
    }
    const cardsToReview = getFlashcardsForToday()
    if (cardsToReview.length === 0) {
      toast.info('Nenhum flashcard para revisar agora!')
      return
    }
    console.log('DEBUG - startReviewSession: Iniciando sessão com', cardsToReview.length, 'cartões')
    setReviewSessionCards(cardsToReview)
    setReviewIndex(0)
    setShowAnswer(false)
    setCurrentReviewCard(cardsToReview[0])
    setIsReviewModalOpen(true)
  }

  // ✅ Selecionar dificuldade na revisão - Proteção contra marcação automática
  const handleDifficultySelect = async (difficulty: 1 | 2 | 3 | 4 | 5) => {
    // Proteção: Verifica se há um cartão atual para revisar
    if (!currentReviewCard) {
      console.error('DEBUG - handleDifficultySelect: Nenhum cartão atual para revisar')
      toast.error('Erro: Nenhum cartão selecionado para revisão.')
      return
    }
    // Proteção: Evita marcação automática - só atualiza se o usuário selecionar explicitamente
    console.log('DEBUG - handleDifficultySelect: Atualizando dificuldade para cartão', currentReviewCard.id, 'com dificuldade', difficulty)
    try {
      // Atualiza localmente
      updateFlashcardDifficulty(currentReviewCard.id, difficulty)

      // Atualiza no Supabase
      if (user?.id) {
        const nextReviewDate = new Date()
        const daysToAdd = difficulty === 1 ? 30 : difficulty === 2 ? 14 : difficulty === 3 ? 3 : difficulty === 4 ? 1 : 0
        nextReviewDate.setDate(nextReviewDate.getDate() + daysToAdd)

        const { error } = await supabase
          .from('flashcards')
          .update({
            difficulty,
            next_review_at: nextReviewDate.toISOString(),
            last_review_at: new Date().toISOString(),
            review_count: currentReviewCard.reviewCount + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentReviewCard.id)
          .eq('user_id', user.id)

        if (error) {
          console.error('DEBUG - handleDifficultySelect: Erro ao atualizar:', error)
          toast.error('Erro ao salvar revisão.')
          return
        }
      }

      toast.success('Flashcard revisado!')
    } catch (error: any) {
      console.error('DEBUG - handleDifficultySelect: Erro:', error)
      toast.error('Erro ao revisar flashcard.')
      return
    }

    // Passa para o próximo cartão ou finaliza sessão
    if (reviewIndex < reviewSessionCards.length - 1) {
      setReviewIndex(reviewIndex + 1)
      setCurrentReviewCard(reviewSessionCards[reviewIndex + 1])
      setShowAnswer(false)
    } else {
      console.log('DEBUG - handleDifficultySelect: Sessão de revisão concluída')
      toast.success('Sessão de revisão concluída! Bom trabalho!')
      setIsReviewModalOpen(false)
      setReviewSessionCards([])
      setReviewIndex(0)
      setCurrentReviewCard(null)
    }
  }

  const todayStr = new Date().toISOString().split('T')[0]

  // Loading state
  if (isLoadingFlashcards && flashcards.length === 0) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in-up pb-8">
        <div className="flex items-center justify-center h-96 gap-2">
          <Loader className="h-6 w-6 animate-spin text-darkBlue-500" />
          <span className="text-darkBlue-700">Carregando seus flashcards...</span>
        </div>
      </div>
    )
  }

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
          <Button
            onClick={startReviewSession}
            disabled={flashcardsDueToday.length === 0}
            className="gap-2 bg-darkBlue-500 hover:bg-darkBlue-600 text-white flex-1 sm:flex-none"
          >
            <BrainCircuit className="h-4 w-4" />
            Iniciar Revisão
          </Button>

          <Dialog open={open} onOpenChange={setOpen}>
            <Button
              onClick={() => setOpen(true)}
              className="gap-2 bg-darkBlue-500 hover:bg-darkBlue-600 text-white flex-1 sm:flex-none"
            >
              <Plus className="h-4 w-4" />
              Novo Cartão
            </Button>
            <DialogContent className="sm:max-w-[425px] bg-white border-beige-300 text-darkBlue-700">
              <DialogHeader>
                <DialogTitle className="text-darkBlue-700">Criar Flashcard</DialogTitle>
                <DialogDescription className="text-darkBlue-500">
                  Preencha os campos para criar um novo flashcard manualmente.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="text-darkBlue-700">Matéria</Label>
                  <Select onValueChange={(val) => setNewCard({ ...newCard, subjectId: val })}>
                    <SelectTrigger className="bg-beige-50 border-beige-300 text-darkBlue-700">
                      <SelectValue placeholder="Selecione uma matéria" />
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
                    placeholder="Digite a pergunta do flashcard..."
                    className="bg-beige-50 border-beige-300 text-darkBlue-700 min-h-[100px]"
                    maxLength={1000}
                  />
                  <p className="text-xs text-darkBlue-500">
                    {newCard.question.length}/1000 caracteres
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-darkBlue-700">Verso (Resposta)</Label>
                  <Textarea
                    value={newCard.answer}
                    onChange={(e) => setNewCard({ ...newCard, answer: e.target.value })}
                    placeholder="Digite a resposta do flashcard..."
                    className="bg-beige-50 border-beige-300 text-darkBlue-700 min-h-[100px]"
                    maxLength={5000}
                  />
                  <p className="text-xs text-darkBlue-500">
                    {newCard.answer.length}/5000 caracteres
                  </p>
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
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="border-beige-300 text-darkBlue-700 hover:bg-beige-100"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleAdd}
                  className="bg-darkBlue-500 hover:bg-darkBlue-600 text-white"
                  disabled={!newCard.subjectId || !newCard.question || !newCard.answer}
                >
                  Salvar Cartão
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <Input
              placeholder="Buscar flashcards..."
              className="max-w-sm bg-white border-beige-300 text-darkBlue-700"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select value={selectedSubjectFilter} onValueChange={setSelectedSubjectFilter}>
              <SelectTrigger className="w-full sm:w-[200px] bg-white border-beige-300 text-darkBlue-700">
                <SelectValue placeholder="Filtrar por matéria" />
              </SelectTrigger>
              <SelectContent className="bg-white border-beige-300 text-darkBlue-700">
                <SelectItem value="all">Todas as matérias</SelectItem>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="border border-beige-300 rounded-xl bg-white overflow-hidden">
            <Table>
              <TableHeader className="bg-beige-100">
                <TableRow>
                  <TableHead className="w-[150px] text-darkBlue-700">Matéria</TableHead>
                  <TableHead className="text-darkBlue-700">Pergunta</TableHead>
                  <TableHead className="text-darkBlue-700">Resposta</TableHead>
                  <TableHead className="w-[100px] text-darkBlue-700">Dificuldade</TableHead>
                  <TableHead className="w-[80px] text-darkBlue-700">EF</TableHead>
                  <TableHead className="w-[120px] text-darkBlue-700">Próx. Revisão</TableHead>
                  <TableHead className="text-right text-darkBlue-700">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFlashcards.length > 0 ? (
                  filteredFlashcards.map((card) => {
                    const s = subjects.find((s) => s.id === card.subjectId)
                    const diffInfo =
                      DIFFICULTY_COLORS[card.difficulty as keyof typeof DIFFICULTY_COLORS]
                    
                    // ✅ NOVO: Verifica se é um flashcard novo (nunca foi revisado)
                    const isNewCard = card.reviewCount === 0 && card.repetitions === 0

                    console.log('DEBUG - Flashcards.tsx: Card ID', card.id, '- isNewCard:', isNewCard, '- reviewCount:', card.reviewCount, '- repetitions:', card.repetitions) // ✅ Log para debug

                    return (
                      <TableRow 
                        key={card.id} 
                        className={cn(
                          'border-beige-200 hover:bg-beige-50',
                          isNewCard && 'bg-blue-50' // ✅ Destaca flashcards novos com fundo azul claro
                        )}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-beige-100 text-darkBlue-700">
                              {s?.name || 'Desconhecido'}
                            </span>
                            {/* ✅ NOVO: Badge "NOVO" para flashcards nunca revisados */}
                            {isNewCard && (
                              <Badge className="bg-blue-500 text-white text-xs">NOVO</Badge>
                            )}
                          </div>
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
                        <TableCell className="text-darkBlue-500">
                          {card.easeFactor ? card.easeFactor.toFixed(2) : 'N/A'}
                        </TableCell>
                        <TableCell className="text-darkBlue-500">
                          {/* ✅ NOVO: Chama a função com 3 argumentos */}
                          {formatNextReviewDate(card.nextReviewAt, card.reviewCount, card.repetitions)}
                        </TableCell>
                        <TableCell className="text-right">
                          <AlertDialog open={deleteConfirmation === card.id} onOpenChange={() => setDeleteConfirmation(null)}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => setDeleteConfirmation(card.id)}
                              disabled={isDeletingCardId === card.id}
                            >
                              {isDeletingCardId === card.id ? (
                                <Loader className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Excluir
                                </>
                              )}
                            </Button>
                            <AlertDialogContent className="bg-white border-beige-300">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-darkBlue-700">
                                  Excluir flashcard?
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-darkBlue-500">
                                  Tem certeza que deseja excluir este flashcard? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="border-beige-300 text-darkBlue-700 hover:bg-beige-100">
                                  Cancelar
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteFlashcardFromSupabase(card.id)}
                                  className="bg-red-500 hover:bg-red-600 text-white"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-darkBlue-500">
                      {search || selectedSubjectFilter !== 'all'
                        ? 'Nenhum cartão encontrado com esses critérios.'
                        : 'Nenhum cartão criado ainda. Crie um novo cartão para começar!'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* ✅ Modal de Revisão */}
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
                    <p className="text-darkBlue-700 font-medium">Como foi sua resposta?</p>
                    <div className="grid grid-cols-5 gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handleDifficultySelect(5)}
                        className="border-emerald-500 text-emerald-500 hover:bg-emerald-50 text-xs"
                        title="Muito Fácil - Acertou com confiança"
                      >
                        5 ✓
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDifficultySelect(4)}
                        className="border-blue-500 text-blue-500 hover:bg-blue-50 text-xs"
                        title="Fácil - Acertou com alguma hesitação"
                      >
                        4 ◐
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDifficultySelect(3)}
                        className="border-yellow-500 text-yellow-500 hover:bg-yellow-50 text-xs"
                        title="Médio - Acertou com dificuldade"
                      >
                        3 ○
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDifficultySelect(2)}
                        className="border-red-500 text-red-500 hover:bg-red-50 text-xs"
                        title="Difícil - Errou mas conhece o assunto"
                      >
                        2 ◑
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDifficultySelect(1)}
                        className="border-purple-500 text-purple-500 hover:bg-purple-50 text-xs"
                        title="Muito Difícil - Não sabia a resposta"
                      >
                        1 ✗
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-24 gap-2">
                <Loader className="h-6 w-6 animate-spin text-darkBlue-500" />
                <span className="text-darkBlue-700">Carregando flashcard...</span>
              </div>
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