import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'

export default function Onboarding() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState({
    name: '',
    level: '',
    goal: '',
    disciplines: [] as string[],
    frequency: '',
    style: '',
    scienceLevel: '',
    flashcardPref: '',
    studyTime: '',
    reminders: '',
    time: '',
    gamification: false,
  })

  const update = (key: string, value: any) => setData((p) => ({ ...p, [key]: value }))

  const handleNext = async () => {
    if (step < 4) setStep(step + 1)
    else {
      setLoading(true)
      if (user) {
        await supabase
          .from('profiles')
          .update({
            onboarding_completed: true,
            name: data.name,
            study_goals: [data.goal],
            learning_style: [data.style],
            preferred_subjects: data.disciplines,
          })
          .eq('id', user.id)

        await supabase.from('reminder_settings').insert({
          user_id: user.id,
          email_enabled: data.reminders !== 'Não',
          preferred_time: data.time || '08:00',
          frequency: data.reminders.includes('diariamente') ? 'daily' : 'weekly',
        })
      }
      toast.success(`Bem-vindo, ${data.name || 'Estudante'}!`)
      setLoading(false)
      navigate('/')
    }
  }

  const toggleDiscipline = (d: string) => {
    const current = data.disciplines
    update('disciplines', current.includes(d) ? current.filter((i) => i !== d) : [...current, d])
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-2xl p-6 md:p-8 animate-fade-in-up">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Personalize sua experiência</h1>
            <span className="text-sm text-muted-foreground">Passo {step} de 4</span>
          </div>
          <Progress value={step * 25} className="h-2" />
        </div>

        <div className="min-h-[350px]">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-3">
                <Label className="text-base">Qual é o seu nome completo?</Label>
                <Input
                  value={data.name}
                  onChange={(e) => update('name', e.target.value)}
                  placeholder="Ex: Maria Luiza Silva"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-base">Em qual série/nível você está?</Label>
                <RadioGroup value={data.level} onValueChange={(v) => update('level', v)}>
                  {[
                    'Ensino Fundamental',
                    'Ensino Médio',
                    'Vestibular 1º ano',
                    'Vestibular 2º ano',
                    'Outro',
                  ].map((opt) => (
                    <div key={opt} className="flex items-center space-x-2">
                      <RadioGroupItem value={opt} id={`lvl-${opt}`} />
                      <Label htmlFor={`lvl-${opt}`} className="font-normal">
                        {opt}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-base">Qual é seu principal objetivo?</Label>
                <RadioGroup value={data.goal} onValueChange={(v) => update('goal', v)}>
                  {[
                    'Passar no ENEM',
                    'Entrar em universidade específica',
                    'Melhorar notas',
                    'Aprender por interesse',
                  ].map((opt) => (
                    <div key={opt} className="flex items-center space-x-2">
                      <RadioGroupItem value={opt} id={`goal-${opt}`} />
                      <Label htmlFor={`goal-${opt}`} className="font-normal">
                        {opt}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-3">
                <Label className="text-base">
                  Quais disciplinas mais te interessam? (Múltipla escolha)
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    'Matemática',
                    'Português',
                    'Química',
                    'Física',
                    'Biologia',
                    'História',
                    'Geografia',
                    'Inglês',
                    'Filosofia',
                    'Sociologia',
                  ].map((d) => (
                    <div key={d} className="flex items-center space-x-2">
                      <Checkbox
                        id={`disc-${d}`}
                        checked={data.disciplines.includes(d)}
                        onCheckedChange={() => toggleDiscipline(d)}
                      />
                      <Label htmlFor={`disc-${d}`} className="font-normal cursor-pointer">
                        {d}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <Label className="text-base">Quanto tempo pretende estudar por dia?</Label>
                <RadioGroup value={data.frequency} onValueChange={(v) => update('frequency', v)}>
                  <div className="flex gap-4 flex-wrap">
                    {['30 min/dia', '1 hora/dia', '2 horas/dia', '3+ horas/dia'].map((opt) => (
                      <div key={opt} className="flex items-center space-x-2">
                        <RadioGroupItem value={opt} id={`freq-${opt}`} />
                        <Label htmlFor={`freq-${opt}`} className="font-normal">
                          {opt}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-3">
                <Label className="text-base">Como você aprende melhor?</Label>
                <RadioGroup value={data.style} onValueChange={(v) => update('style', v)}>
                  {[
                    'Explicações simples',
                    'Exemplos práticos',
                    'Analogias',
                    'Aprofundamento técnico',
                  ].map((opt) => (
                    <div key={opt} className="flex items-center space-x-2">
                      <RadioGroupItem value={opt} id={`style-${opt}`} />
                      <Label htmlFor={`style-${opt}`} className="font-normal">
                        {opt}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-base">
                  Qual seu nível geral de conhecimento nas ciências?
                </Label>
                <RadioGroup
                  value={data.scienceLevel}
                  onValueChange={(v) => update('scienceLevel', v)}
                  className="flex gap-6"
                >
                  {['Iniciante', 'Intermediário', 'Avançado'].map((opt) => (
                    <div key={opt} className="flex items-center space-x-2">
                      <RadioGroupItem value={opt} id={`sci-${opt}`} />
                      <Label htmlFor={`sci-${opt}`} className="font-normal">
                        {opt}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-base">Você já tem familiaridade com Flashcards?</Label>
                <RadioGroup
                  value={data.flashcardPref}
                  onValueChange={(v) => update('flashcardPref', v)}
                >
                  {['Sim, uso frequentemente', 'Já tentei usar', 'Nunca usei, quero aprender'].map(
                    (opt) => (
                      <div key={opt} className="flex items-center space-x-2">
                        <RadioGroupItem value={opt} id={`fpref-${opt}`} />
                        <Label htmlFor={`fpref-${opt}`} className="font-normal">
                          {opt}
                        </Label>
                      </div>
                    ),
                  )}
                </RadioGroup>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-3">
                <Label className="text-base">Em qual turno prefere estudar?</Label>
                <RadioGroup
                  value={data.studyTime}
                  onValueChange={(v) => update('studyTime', v)}
                  className="flex gap-6"
                >
                  {['Manhã', 'Tarde', 'Noite'].map((opt) => (
                    <div key={opt} className="flex items-center space-x-2">
                      <RadioGroupItem value={opt} id={`time-${opt}`} />
                      <Label htmlFor={`time-${opt}`} className="font-normal">
                        {opt}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-base">Aceita receber lembretes por e-mail?</Label>
                <RadioGroup value={data.reminders} onValueChange={(v) => update('reminders', v)}>
                  {['Sim diariamente', 'Sim 3x semana', 'Não'].map((opt) => (
                    <div key={opt} className="flex items-center space-x-2">
                      <RadioGroupItem value={opt} id={`rem-${opt}`} />
                      <Label htmlFor={`rem-${opt}`} className="font-normal">
                        {opt}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-base">Horário ideal para o lembrete</Label>
                <Input
                  type="time"
                  value={data.time}
                  onChange={(e) => update('time', e.target.value)}
                  className="w-32"
                />
              </div>

              <div className="flex items-center space-x-2 pt-4 border-t">
                <Checkbox
                  id="gamification"
                  checked={data.gamification}
                  onCheckedChange={(c) => update('gamification', c)}
                />
                <Label htmlFor="gamification" className="font-medium cursor-pointer">
                  Habilitar gamificação (pontos, ofensas e rankings)
                </Label>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-8 pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <Button
            onClick={handleNext}
            disabled={loading}
            className={step === 4 ? 'bg-primary' : ''}
          >
            {loading ? (
              'Salvando...'
            ) : step === 4 ? (
              <>
                Concluir e Entrar
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
      </Card>
    </div>
  )
}
