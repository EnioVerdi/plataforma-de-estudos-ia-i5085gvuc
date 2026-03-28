import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useAppStore from '@/stores/useAppStore'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { HelpCircle, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Study() {
  const { subjectId } = useParams()
  const navigate = useNavigate()
  const { flashcards, subjects, reviewCard, setChatContext } = useAppStore()
  const [isFlipped, setIsFlipped] = useState(false)

  const subject = subjects.find((s) => s.id === subjectId)
  const todayStr = new Date().toISOString().split('T')[0]

  const dueCards = useMemo(() => {
    return flashcards.filter(
      (c) =>
        c.subjectId === subjectId &&
        (c.nextReviewAt.startsWith(todayStr) || new Date(c.nextReviewAt) < new Date()),
    )
  }, [flashcards, subjectId, todayStr])

  const [currentIndex, setCurrentIndex] = useState(0)
  const currentCard = dueCards[currentIndex]

  const totalDue = dueCards.length
  const progress = totalDue === 0 ? 100 : (currentIndex / totalDue) * 100

  const handleReview = (quality: number) => {
    if (!currentCard) return
    reviewCard(currentCard.id, quality)
    setIsFlipped(false)
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1)
    }, 150) // slight delay for smooth transition
  }

  const handleNeedHelp = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!currentCard) return
    setChatContext(
      `Preciso de ajuda para entender este flashcard de ${subject?.name}:\n\nPergunta: ${currentCard.question}\nResposta: ${currentCard.answer}\n\nPode me explicar de forma mais detalhada?`,
    )
    navigate('/consultoria')
  }

  if (!subject)
    return <div className="p-8 text-center text-muted-foreground">Matéria não encontrada.</div>

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col py-4 md:py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8 px-4">
        <Button variant="ghost" onClick={() => navigate('/')} className="text-muted-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" /> Sair
        </Button>
        <div className="flex items-center gap-4 w-1/2 max-w-xs">
          <Progress value={progress} className="h-2" />
          <span className="text-sm font-medium tabular-nums">
            {currentIndex}/{totalDue}
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full relative">
        {!currentCard ? (
          <div className="flex flex-col items-center justify-center text-center gap-6 animate-slide-up">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4 shadow-inner">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Revisão Concluída!
            </h2>
            <p className="text-muted-foreground max-w-md">
              Você dominou todos os cartões de {subject.name} agendados para hoje. Excelente
              trabalho!
            </p>
            <Button size="lg" className="mt-4" onClick={() => navigate('/')}>
              Voltar ao Dashboard
            </Button>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center justify-center perspective-1000 px-4">
            <div
              className={cn(
                'relative w-full max-w-2xl aspect-[4/3] md:aspect-[2/1] transition-transform duration-500 preserve-3d cursor-pointer shadow-lg hover:shadow-xl rounded-3xl',
                isFlipped && 'rotate-y-180',
              )}
              onClick={() => !isFlipped && setIsFlipped(true)}
            >
              {/* Front */}
              <div className="absolute inset-0 backface-hidden bg-card border-2 border-border/60 rounded-3xl flex flex-col items-center justify-center p-8 md:p-12 text-center transition-colors">
                <span
                  className="text-xs font-bold text-muted-foreground uppercase tracking-widest absolute top-8"
                  style={{ color: subject.color }}
                >
                  {subject.name}
                </span>
                <h3 className="text-2xl md:text-4xl font-medium leading-tight text-foreground">
                  {currentCard.question}
                </h3>
                <p className="absolute bottom-8 text-sm text-muted-foreground animate-pulse flex items-center gap-2">
                  Clique no cartão para revelar a resposta
                </p>
              </div>

              {/* Back */}
              <div className="absolute inset-0 backface-hidden bg-card border-2 border-primary/20 rounded-3xl flex flex-col items-center justify-center p-8 md:p-12 text-center rotate-y-180 shadow-[0_0_40px_-15px_rgba(0,0,0,0.1)] shadow-primary/20">
                <div className="overflow-y-auto max-h-full w-full scrollbar-none py-8">
                  <h3 className="text-xl md:text-3xl font-medium leading-relaxed text-foreground">
                    {currentCard.answer}
                  </h3>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute top-6 right-6 text-muted-foreground hover:text-primary bg-secondary/50"
                  onClick={handleNeedHelp}
                >
                  <HelpCircle className="h-4 w-4 md:mr-2" />{' '}
                  <span className="hidden md:inline">Explicação com IA</span>
                </Button>
              </div>
            </div>

            {/* SM-2 Actions */}
            <div
              className={cn(
                'mt-12 flex flex-wrap items-center justify-center gap-3 md:gap-6 transition-all duration-500 w-full px-4',
                isFlipped
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-4 pointer-events-none',
              )}
            >
              <Button
                size="lg"
                variant="outline"
                className="flex-1 md:flex-none h-14 md:h-16 px-4 md:px-8 border-red-500 text-red-600 hover:bg-red-500 hover:text-white rounded-xl text-base font-semibold"
                onClick={() => handleReview(1)}
              >
                Errei{' '}
                <span className="hidden md:inline font-normal opacity-80 ml-2">(Repetir logo)</span>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="flex-1 md:flex-none h-14 md:h-16 px-4 md:px-8 border-amber-500 text-amber-600 hover:bg-amber-500 hover:text-white rounded-xl text-base font-semibold"
                onClick={() => handleReview(3)}
              >
                Bom{' '}
                <span className="hidden md:inline font-normal opacity-80 ml-2">
                  (Lembrei com esforço)
                </span>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="flex-1 md:flex-none h-14 md:h-16 px-4 md:px-8 border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-xl text-base font-semibold"
                onClick={() => handleReview(5)}
              >
                Fácil{' '}
                <span className="hidden md:inline font-normal opacity-80 ml-2">
                  (Acertei direto)
                </span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
