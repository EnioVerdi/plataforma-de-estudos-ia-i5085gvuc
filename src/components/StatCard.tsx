import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface StatCardProps {
  title: string
  value: React.ReactNode
  description: React.ReactNode
  icon: React.ReactNode
  gradientFrom: string
  gradientTo: string
  shadowColor: string
  textColor?: string // ✅ ADICIONADO: Propriedade para cor do texto
}

export default function StatCard({
  title,
  value,
  description,
  icon,
  gradientFrom,
  gradientTo,
  shadowColor,
  textColor = 'text-white', // ✅ DEFAULT: text-white
}: StatCardProps) {
  return (
    <Card
      className={`relative overflow-hidden rounded-2xl border-none p-0 shadow-lg transition-all duration-300 ease-in-out hover:scale-[1.02] group bg-gradient-to-br ${gradientFrom} ${gradientTo} ${shadowColor}`}
    >
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
        <CardTitle className={`text-sm font-medium ${textColor}/80`}>{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent className="relative z-10">
        <div className={`text-3xl font-bold ${textColor}`}>{value}</div>
        <p className={`text-xs ${textColor}/70 mt-1`}>{description}</p>
      </CardContent>
    </Card>
  )
}
