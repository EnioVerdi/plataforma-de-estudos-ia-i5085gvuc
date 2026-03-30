import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { ArrowLeft, ArrowRight, CheckCircle2, X } from 'lucide-react'
import useAppStore from '@/stores/useAppStore'

const ASSESSMENT_QUESTIONS = [
  {
    id: 1,
    title: 'Qual é seu principal objetivo de estudo?',
    placeholder:
      'Ex: Passar no vestibular da UFPR, melhorar minhas notas em matemática, preparar-me para concursos...',
    description: 'Conte-nos sobre seus objetivos acadêmicos.',
  },
  {
    id: 2,
    title: 'Quais são suas maiores dificuldades nas matérias?',
    placeholder:
      'Ex: Tenho dificuldade em interpretação de textos, cálculos complexos em física, memorização de datas em história...',
    description: 'Nos ajude a entender onde você mais precisa de apoio.',
  },
  {
    id: 3,
    title: 'Como você prefere aprender novos conceitos?',
    placeholder:
      'Ex: Através de exemplos práticos, vídeos explicativos, resumos visuais, exercícios resolvidos passo a passo...',
    description: 'Qual é seu estilo de aprendizado preferido?',
  },
  {
    id: 4,
    title: 'Quanto tempo você consegue dedicar aos estudos por dia?',
    placeholder:
      'Ex: 2 horas, 3 horas em dias de semana e 5 nos fins de semana, varia bastante dependendo do dia...',
    description: 'Isso nos ajuda a criar um plano realista.',
  },
  {
    id: 5,
    title: 'Qual é seu nível de conhecimento em suas matérias principais?',
    placeholder:
      'Ex: Sou bom em português e história, mas preciso melhorar em matemática e ciências. Tenho base em tudo...',
    description: 'Conte-nos sobre seus pontos fortes e fracos.',
  },
]

interface AssessmentData {
  [key: number]: string
}

export default function UserAssessment({ onComplete }: { onComplete: () => void }) {
  const { setUserAssessment } = useAppStore()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [responses, setResponses] = useState<AssessmentData>({})

  const currentQuestion = ASSESSMENT_QUESTIONS.find((q) => q.id === step)
  const totalSteps = ASSESSMENT_QUESTIONS.length

  const handleInputChange = (value: string) => {
    setResponses((prev) => ({
      ...prev,
      [step]: value,
    }))
  }

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      handleComplete()
    }
  }

  const handleComplete = async () => {
    setLoading(true)

    // Criar objeto com as respostas do usuário
    const assessmentData = {
      studentLevel: responses[1] || '',
      studyTime: responses[4] || '',
      goal: responses[1] || '',
      difficulties: responses[2] || '',
      learningPreference: responses[3] || '',
      knowledgeLevel: responses[5] || '',
    }

    // Salvar no store (Zustand)
    setUserAssessment(assessmentData)
    toast.success('Avaliação concluída com sucesso!')

    setLoading(false)
    onComplete()
  }

  const handleSkip = () => {
    // Salvar o que foi respondido, mesmo se pular
    const assessmentData = {
      studentLevel: responses[1] || '',
      studyTime: responses[4] || '',
      goal: responses[1] || '',
      difficulties: responses[2] || '',
      learningPreference: responses[3] || '',
      knowledgeLevel: responses[5] || '',
    }

    setUserAssessment(assessmentData)
    toast.info('Avaliação salva. Você pode completar depois nas configurações.')
    onComplete()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-2xl w-full bg-white border-beige-300 relative">
        {/* ✅ Botão de Fechar no Canto Superior Direito */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-2 text-darkBlue-500 hover:bg-beige-100 rounded-full transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <CardHeader>
          <CardTitle className="text-darkBlue-700">
            Entenda Seu Perfil de Estudo 📋
          </CardTitle>
          <p className="text-sm text-darkBlue-500 mt-2">
            Responda algumas perguntas para personalizarmos a IA de acordo com suas necessidades
          </p>
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-darkBlue-500">
                {step} de {totalSteps}
              </span>
            </div>
            <Progress value={(step / totalSteps) * 100} className="h-2 bg-beige-200" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {currentQuestion && (
            <div className="space-y-4">
              <div>
                <Label className="text-lg font-semibold text-darkBlue-700">
                  {currentQuestion.title}
                </Label>
                <p className="text-sm text-darkBlue-500 mt-1">{currentQuestion.description}</p>
              </div>

              {/* ✅ Textarea para respostas discursivas */}
              <Textarea
                value={responses[step] || ''}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={currentQuestion.placeholder}
                className="min-h-[150px] rounded-xl border-beige-300 bg-beige-50 text-darkBlue-700 focus-visible:ring-darkBlue-500 resize-none"
              />

              <p className="text-xs text-darkBlue-400">
                💡 Quanto mais detalhado você for, melhor poderei ajudá-lo com conselhos personalizados!
              </p>
            </div>
          )}

          <div className="flex gap-2 justify-center">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  s <= step ? 'bg-darkBlue-500' : 'bg-beige-200'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-3 justify-between">
            <Button
              variant="outline"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="border-beige-300 text-darkBlue-700 hover:bg-beige-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>

            <div className="flex gap-2">
              {/* ✅ Botão Pular */}
              <Button
                variant="ghost"
                onClick={handleSkip}
                disabled={loading}
                className="text-darkBlue-500 hover:bg-beige-100"
              >
                <X className="w-4 h-4 mr-2" />
                Pular
              </Button>

              {/* ✅ Botão Próximo/Concluir */}
              {step < totalSteps ? (
                <Button
                  onClick={handleNext}
                  className="bg-darkBlue-500 hover:bg-darkBlue-600 text-white"
                >
                  Próximo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  disabled={loading}
                  className="bg-darkBlue-500 hover:bg-darkBlue-600 text-white"
                >
                  {loading ? 'Salvando...' : 'Concluir Avaliação'}
                  <CheckCircle2 className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>

          <p className="text-xs text-center text-darkBlue-400">
            Você pode voltar para editar suas respostas a qualquer momento!
          </p>
        </CardContent>
      </Card>
    </div>
  )
}