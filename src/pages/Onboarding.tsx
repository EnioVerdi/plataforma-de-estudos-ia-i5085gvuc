import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { toast } from 'sonner'
import { ArrowLeft, ArrowRight, CheckCircle2, X } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const SUBJECTS = [
  'Português',
  'Matemática',
  'Física',
  'Química',
  'Biologia',
  'História',
  'Geografia',
  'Filosofia',
  'Sociologia',
  'Inglês',
  'Literatura',
  'Redação',
  'Espanhol',
]

const GOALS = [
  'Vestibular',
  'Concurso Público',
  'Aprimoramento Pessoal',
  'Língua Estrangeira',
  'Outro',
]

const STYLES = [
  { id: 'Visual', label: 'Visual (gráficos, diagramas)' },
  { id: 'Auditivo', label: 'Auditivo (explicações)' },
  { id: 'Cinestésico', label: 'Cinestésico (prática)' },
  { id: 'Leitura/Escrita', label: 'Leitura/Escrita (textos)' },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [data, setData] = useState({
    studyGoals: [] as string[],
    learningStyle: [] as string[],
    preferredSubjects: [] as string[],
    difficultySubjects: [] as string[],
    studyHoursPerDay: 2,
  })

  const toggleArrayItem = (key: keyof typeof data, value: string) => {
    setData((prev) => {
      const current = prev[key] as string[]
      return {
        ...prev,
        [key]: current.includes(value) ? current.filter((i) => i !== value) : [...current, value],
      }
    })
  }

  const saveProfileData = async () => {
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .update({
        onboarding_completed: true,
        study_goals: data.studyGoals,
        learning_style: data.learningStyle,
        preferred_subjects: data.preferredSubjects,
        difficulty_subjects: data.difficultySubjects,
        study_hours_per_day: data.studyHoursPerDay,
      })
      .eq('id', user.id)

    if (error) {
      toast.error('Erro ao salvar preferências.')
      console.error('Erro ao salvar perfil:', error)
      return false
    }
    return true
  }

  const handleNext = async () => {
    if (step < 5) {
      setStep(step + 1)
    } else {
      setLoading(true)
      const success = await saveProfileData()
      if (success) {
        toast.success('Perfil configurado com sucesso!')
        navigate('/')
      }
      setLoading(false)
    }
  }

  const handleSkip = async () => {
    setLoading(true)
    const success = await saveProfileData()
    if (success) {
      toast.info('Onboarding pulado. Você pode configurar seu perfil nas configurações.')
      navigate('/')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-beige-50 p-4">
      <Card className="w-full max-w-2xl p-6 md:p-8 animate-fade-in-up bg-white border-beige-300">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-darkBlue-700">Configure seu Consultor IA</h1>
            <span className="text-sm text-darkBlue-500">Passo {step} de 5</span>
          </div>
          <Progress value={step * 20} className="h-2 bg-beige-200" />
        </div>

        <div className="min-h-[350px]">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-4">
                <Label className="text-lg font-semibold text-darkBlue-700">
                  Qual é o seu principal objetivo de estudo?
                </Label>
                <p className="text-sm text-darkBlue-500">Selecione uma ou mais opções.</p>
                <div className="grid gap-3 mt-4">
                  {GOALS.map((opt) => (
                    <div
                      key={opt}
                      className="flex items-center space-x-3 bg-beige-100 p-3 rounded-lg border border-beige-200 hover:bg-beige-200 transition-colors"
                    >
                      <Checkbox
                        id={`goal-${opt}`}
                        checked={data.studyGoals.includes(opt)}
                        onCheckedChange={() => toggleArrayItem('studyGoals', opt)}
                      />
                      <Label
                        htmlFor={`goal-${opt}`}
                        className="flex-1 font-medium cursor-pointer text-darkBlue-700"
                      >
                        {opt}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-4">
                <Label className="text-lg font-semibold text-darkBlue-700">
                  Qual é o seu estilo de aprendizado?
                </Label>
                <p className="text-sm text-darkBlue-500">
                  Como você absorve informações com mais facilidade?
                </p>
                <div className="grid gap-3 mt-4">
                  {STYLES.map((opt) => (
                    <div
                      key={opt.id}
                      className="flex items-center space-x-3 bg-beige-100 p-3 rounded-lg border border-beige-200 hover:bg-beige-200 transition-colors"
                    >
                      <Checkbox
                        id={`style-${opt.id}`}
                        checked={data.learningStyle.includes(opt.id)}
                        onCheckedChange={() => toggleArrayItem('learningStyle', opt.id)}
                      />
                      <Label
                        htmlFor={`style-${opt.id}`}
                        className="flex-1 font-medium cursor-pointer text-darkBlue-700"
                      >
                        {opt.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-4">
                <Label className="text-lg font-semibold text-darkBlue-700">
                  Quais são suas disciplinas favoritas?
                </Label>
                <p className="text-sm text-darkBlue-500">
                  As matérias que você tem mais facilidade e gosta de estudar.
                </p>
                <div className="flex flex-wrap gap-3 mt-4">
                  {SUBJECTS.map((d) => {
                    const isSelected = data.preferredSubjects.includes(d)
                    return (
                      <button
                        key={d}
                        onClick={() => toggleArrayItem('preferredSubjects', d)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          isSelected
                            ? 'bg-darkBlue-500 text-white shadow-sm'
                            : 'bg-beige-100 text-darkBlue-700 hover:bg-beige-200 border border-beige-200'
                        }`}
                      >
                        {d}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-4">
                <Label className="text-lg font-semibold text-darkBlue-700">
                  Quais disciplinas você tem mais dificuldade?
                </Label>
                <p className="text-sm text-darkBlue-500">
                  Isso ajudará a IA a focar melhor nas suas lacunas.
                </p>
                <div className="flex flex-wrap gap-3 mt-4">
                  {SUBJECTS.map((d) => {
                    const isSelected = data.difficultySubjects.includes(d)
                    return (
                      <button
                        key={d}
                        onClick={() => toggleArrayItem('difficultySubjects', d)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          isSelected
                            ? 'bg-red-500 text-white shadow-sm'
                            : 'bg-beige-100 text-darkBlue-700 hover:bg-beige-200 border border-beige-200'
                        }`}
                      >
                        {d}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-6">
                <Label className="text-lg font-semibold text-darkBlue-700">
                  Quantas horas por dia você pretende estudar?
                </Label>
                <p className="text-sm text-darkBlue-500">
                  Seja realista para criar um hábito sustentável.
                </p>

                <div className="pt-8 pb-4 px-2">
                  <Slider
                    value={[data.studyHoursPerDay]}
                    onValueChange={(vals) => setData((p) => ({ ...p, studyHoursPerDay: vals[0] }))}
                    max={8}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="text-center">
                  <span className="text-4xl font-bold text-darkBlue-700">
                    {data.studyHoursPerDay}
                  </span>
                  <span className="text-lg text-darkBlue-500 ml-2">
                    {data.studyHoursPerDay === 1 ? 'hora por dia' : 'horas por dia'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-8 pt-6 border-t border-beige-300">
          <Button
            variant="outline"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1 || loading}
            className="border-beige-300 text-darkBlue-700 hover:bg-beige-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={handleSkip}
              disabled={loading}
              className="text-darkBlue-500 hover:bg-beige-100"
            >
              <X className="w-4 h-4 mr-2" />
              Pular
            </Button>
            <Button
              onClick={handleNext}
              disabled={loading}
              className="bg-darkBlue-500 hover:bg-darkBlue-600 text-white"
            >
              {loading ? (
                'Salvando...'
              ) : step === 5 ? (
                <>
                  Salvar e Continuar
                  <CheckCircle2 className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Próximo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
