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
import { useMemo, useEffect } from 'react'

// ✅ NOVO IMPORT: Componente StatCard
import StatCard from '@/components/StatCard'

// ✅ Wrapper para evitar erro de tipo para ChartTooltipContent
const CustomTooltip = ({ active, payload, label }: any) => {
  return <ChartTooltipContent active={active} payload={payload} label={label} />
}

const SUBJECT_COLORS: Record<string, string> = {
  '1': '#ff6b6b',
  '2': '#4ecdc4',
  '3': '#45b7d1',
  '4': '#96ceb4',
  '5': '#ffeaa7',
  '6': '#dfe6e9',
  '7': '#fd79a8',
  '8': '#a29bfe',
  '9': '#fab1a0',
  '10': '#74b9ff',
  '11': '#81ecec',
  '12': '#55efc4',
}

// ✅ NOVO: Cores de dificuldade
const DIFFICULTY_COLORS = {
  5: { label: 'Muito Difícil', color: '#9333ea', bg: '#faf5ff' },
  4: { label: 'Difícil', color: '#ef4444', bg: '#fee2e2' },
  3: { label: 'Médio', color: '#f59e0b', bg: '#fef3c7' },
  2: { label: 'Fácil', color: '#3b82f6', bg: '#dbeafe' },
  1: { label: 'Muito Fácil', color: '#10b981', bg: '#d1fae5' },
}

export default function Index() {
  const { metrics, flashcards, subjects, studyStreak, updateStudyStreak, getDifficultyStats } = useAppStore()

  const todayStr = new Date().toISOString().split('T')[0]
  
  const dueCards = flashcards.filter(
    (c) =>
      c.nextReviewAt.startsWith(todayStr) ||
      new Date(c.nextReviewAt).valueOf() < new Date().valueOf(),
  )

  const totalMemorized = flashcards.filter((c) => c.difficulty > 2).length
  const retentionRate = flashcards.length
    ? Math.round((totalMemorized / flashcards.length) * 100)
    : 0

  const todayMetrics = (metrics || []).find((m) => m.date === todayStr) || {
    date: todayStr,
    studyTime: 0,
    flashcardsReviewed: 0,
  }

  const retentionBySubject = useMemo(
    () =>
      subjects.map((s) => {
        const sCards = flashcards.filter((c) => c.subjectId === s.id)
        const retained = sCards.filter((c) => c.difficulty > 2).length
        return {
          subject: s.name,
          retention: sCards.length
            ? Math.round((retained / sCards.length) * 100)
            : 0,
        }
      }),
    [subjects, flashcards],
  )

  const dueBySubject: Array<{ id: string; name: string; count: number; color: string }> =
    useMemo(
      () =>
        subjects
          .map((s) => ({
            id: s.id,
            name: s.name,
            count: dueCards.filter((c) => c.subjectId === s.id).length,
            color: SUBJECT_COLORS[s.id] || '#6c757d',
          }))
          .filter((s) => s.count > 0)
          .sort((a, b) => b.count - a.count),
      [subjects, dueCards],
    )

  const chartData = useMemo(() => {
    const last7days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const dayMetrics = (metrics || []).find((m) => m.date === dateStr) || {
        date: dateStr,
        studyTime: 0,
        flashcardsReviewed: 0,
      }
      last7days.push(dayMetrics)
    }
    return last7days
  }, [metrics])

  // ✅ NOVO: Dados do gráfico de dificuldade
  const difficultyChartData = useMemo(() => {
    const stats = getDifficultyStats()
    return stats.map((stat) => ({
      difficulty: stat.difficulty,
      label: stat.label,
      count: stat.count,
      fill: stat.color,
    }))
  }, [flashcards, getDifficultyStats])

  useEffect(() => {
    updateStudyStreak()
  }, [updateStudyStreak])

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-fade-in-up pb-8">
      {dueCards.length > 0 && (
        <div className="bg-darkBlue-500/10 border border-darkBlue-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-darkBlue-500 rounded-full text-white">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-darkBlue-700">
                Você tem {dueCards.length} revisões pendentes!
              </h3>
              <p className="text-sm text-darkBlue-500/80">
                Recomendamos focar em {dueBySubject[0]?.name || 'seus estudos'} agora.
              </p>
            </div>
          </div>
          <Button asChild size="lg" className="w-full sm:w-auto shadow-md bg-darkBlue-500 hover:bg-darkBlue-600 text-white">
            <Link to={`/study/${dueBySubject[0]?.id}`}>Revisar {dueBySubject[0]?.name}</Link>
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard
          title="Ofensiva Diária"
          value={`${studyStreak.current} dias`}
          description="+2 nesta semana"
          icon={<Flame className="h-5 w-5 text-white" />}
          gradientFrom="from-darkBlue-500"
          gradientTo="to-darkBlue-700"
          shadowColor="shadow-darkBlue-400/40"
          textColor="text-white"
        />
        <StatCard
          title="Tempo Hoje"
          value={`${Math.round(todayMetrics.studyTime)} min`}
          description="Foco consistente"
          icon={<Clock className="h-5 w-5 text-darkBlue-700" />}
          gradientFrom="from-beige-300"
          gradientTo="to-beige-500"
          shadowColor="shadow-beige-400/40"
          textColor="text-darkBlue-700"
        />
        <StatCard
          title="Cartões Revisados"
          value={todayMetrics.flashcardsReviewed}
          description="Hoje"
          icon={<Brain className="h-5 w-5 text-white" />}
          gradientFrom="from-darkBlue-500"
          gradientTo="to-darkBlue-700"
          shadowColor="shadow-darkBlue-400/40"
          textColor="text-white"
        />
        <StatCard
          title="Taxa de Retenção"
          value={`${retentionRate}%`}
          description="▲ +3% desde o mês passado"
          icon={<Target className="h-5 w-5 text-darkBlue-700" />}
          gradientFrom="from-beige-300"
          gradientTo="to-beige-500"
          shadowColor="shadow-beige-400/40"
          textColor="text-darkBlue-700"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ✅ NOVO: Gráfico de Dificuldade */}
        <Card className="lg:col-span-2 shadow-sm border-0 ring-1 ring-beige-300 bg-white">
          <CardHeader>
            <CardTitle className="text-darkBlue-700">Distribuição de Dificuldade</CardTitle>
            <CardDescription className="text-darkBlue-500">
              Quantidade de flashcards por nível de dificuldade.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ChartContainer
              config={{
                count: { label: 'Quantidade', color: '#404d8c' },
              }}
              className="w-full h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={difficultyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e8dfd5"
                  />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                    tick={{ fill: '#404d8c', fontSize: 12 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    dx={-10}
                    tick={{ fill: '#404d8c', fontSize: 12 }}
                  />
                  <ChartTooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: 'rgba(64, 77, 140, 0.1)' }}
                  />
                  <Bar
                    dataKey="count"
                    fill="#404d8c"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={60}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <div className="space-y-6 flex flex-col">
          {/* Retenção por Matéria */}
          <Card className="shadow-sm border-0 ring-1 ring-beige-300 bg-white flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-darkBlue-700">Retenção por Matéria</CardTitle>
            </CardHeader>
            <CardContent className="h-[220px] pb-6">
              <ChartContainer
                config={{ retention: { label: 'Retenção %', color: '#404d8c' } }}
                className="w-full h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart
                    data={retentionBySubject}
                    margin={{ top: 10, right: 30, bottom: 10, left: 30 }}
                  >
                    <PolarGrid stroke="#e8dfd5" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fill: '#404d8c', fontSize: 12 }}
                    />
                    <Radar
                      name="Retenção"
                      dataKey="retention"
                      stroke="#404d8c"
                      fill="#404d8c"
                      fillOpacity={0.4}
                    />
                    <ChartTooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Fila de Revisão */}
          <Card className="shadow-sm border-0 ring-1 ring-beige-300 bg-white flex-1">
            <CardHeader className="pb-4">
              <CardTitle className="text-darkBlue-700">Fila de Revisão</CardTitle>
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
                        <span className="font-medium text-darkBlue-700">{s.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-semibold text-darkBlue-700 bg-beige-100 px-2 py-0.5 rounded-md">
                          {s.count}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-7 hover:bg-beige-100 text-darkBlue-700"
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
                  <Brain className="h-10 w-10 text-darkBlue-500 mb-2 opacity-80" />
                  <p className="font-medium text-darkBlue-700">Tudo limpo!</p>
                  <p className="text-sm text-darkBlue-500">
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