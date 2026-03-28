import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from 'recharts'
import useAppStore from '@/stores/useAppStore'
import { Button } from '@/components/ui/button'
import { Flame, Brain, Clock, Zap, Target } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useMemo } from 'react'

export default function Index() {
  const { metrics, flashcards, subjects } = useAppStore()

  const todayStr = new Date().toISOString().split('T')[0]
  const dueCards = flashcards.filter(
    (c) => c.nextReviewAt.startsWith(todayStr) || new Date(c.nextReviewAt) < new Date(),
  )

  const totalMemorized = flashcards.filter((c) => c.easeFactor > 2.5).length
  const retentionRate = flashcards.length
    ? Math.round((totalMemorized / flashcards.length) * 100)
    : 0
  const todayMetrics = metrics.find((m) => m.date === todayStr) || {
    studyTime: 0,
    flashcardsReviewed: 0,
  }

  const retentionBySubject = useMemo(
    () =>
      subjects.map((s) => {
        const sCards = flashcards.filter((c) => c.subjectId === s.id)
        const retained = sCards.filter((c) => c.easeFactor > 2.5).length
        return {
          subject: s.name,
          retention: sCards.length ? Math.round((retained / sCards.length) * 100) : 0,
        }
      }),
    [subjects, flashcards],
  )

  const dueBySubject = useMemo(
    () =>
      subjects
        .map((s) => ({
          ...s,
          count: dueCards.filter((c) => c.subjectId === s.id).length,
        }))
        .filter((s) => s.count > 0)
        .sort((a, b) => b.count - a.count),
    [subjects, dueCards],
  )

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-fade-in-up pb-8">
      {dueCards.length > 0 && (
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary rounded-full text-white">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-primary-foreground text-primary">
                Você tem {dueCards.length} revisões pendentes!
              </h3>
              <p className="text-sm text-primary/80">
                Recomendamos focar em {dueBySubject[0]?.name || 'seus estudos'} agora.
              </p>
            </div>
          </div>
          <Button asChild size="lg" className="w-full sm:w-auto shadow-md">
            <Link to={`/study/${dueBySubject[0]?.id}`}>Revisar {dueBySubject[0]?.name}</Link>
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ofensiva Diária
            </CardTitle>
            <Flame className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">12 dias</div>
            <p className="text-xs text-muted-foreground mt-1">+2 nesta semana</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tempo Hoje</CardTitle>
            <Clock className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">
              {Math.round(todayMetrics.studyTime)} min
            </div>
            <p className="text-xs text-muted-foreground mt-1">Foco consistente</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cartões Revisados
            </CardTitle>
            <Brain className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">{todayMetrics.flashcardsReviewed}</div>
            <p className="text-xs text-muted-foreground mt-1">Hoje</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taxa de Retenção
            </CardTitle>
            <Target className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">{retentionRate}%</div>
            <p className="text-xs text-emerald-500 font-medium mt-1">▲ +3% desde o mês passado</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm border-0 ring-1 ring-border">
          <CardHeader>
            <CardTitle>Atividade (Últimos 7 dias)</CardTitle>
            <CardDescription>
              Comparativo entre tempo de estudo e cartões memorizados.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ChartContainer
              config={{
                studyTime: { label: 'Estudo (min)', color: 'hsl(var(--chart-1))' },
                flashcardsReviewed: { label: 'Cartões', color: 'hsl(var(--chart-2))' },
              }}
              className="w-full h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(str) =>
                      new Date(str).toLocaleDateString('pt-BR', { weekday: 'short' })
                    }
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis tickLine={false} axisLine={false} dx={-10} />
                  <ChartTooltip
                    content={<ChartTooltipContent indicator="dot" />}
                    cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                  />
                  <Bar
                    dataKey="studyTime"
                    fill="var(--color-studyTime)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                  <Bar
                    dataKey="flashcardsReviewed"
                    fill="var(--color-flashcardsReviewed)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <div className="space-y-6 flex flex-col">
          <Card className="shadow-sm border-0 ring-1 ring-border flex-1">
            <CardHeader className="pb-2">
              <CardTitle>Retenção por Matéria</CardTitle>
            </CardHeader>
            <CardContent className="h-[220px] pb-6">
              <ChartContainer
                config={{ retention: { label: 'Retenção %', color: 'hsl(var(--chart-1))' } }}
                className="w-full h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart
                    data={retentionBySubject}
                    margin={{ top: 10, right: 30, bottom: 10, left: 30 }}
                  >
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <Radar
                      name="Retenção"
                      dataKey="retention"
                      stroke="var(--color-retention)"
                      fill="var(--color-retention)"
                      fillOpacity={0.4}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </RadarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-0 ring-1 ring-border flex-1">
            <CardHeader className="pb-4">
              <CardTitle>Fila de Revisão</CardTitle>
            </CardHeader>
            <CardContent>
              {dueBySubject.length > 0 ? (
                <div className="space-y-4">
                  {dueBySubject.map((s) => (
                    <div key={s.id} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: s.color }}
                        />
                        <span className="font-medium">{s.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                          {s.count}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-7"
                          asChild
                        >
                          <Link to={`/study/${s.id}`}>Revisar</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center space-y-2 py-4">
                  <Brain className="h-10 w-10 text-emerald-500 mb-2 opacity-80" />
                  <p className="font-medium">Tudo limpo!</p>
                  <p className="text-sm text-muted-foreground">
                    Você está em dia com todas as matérias.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
