import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: ReactNode
  description: ReactNode
  icon: ReactNode
  gradientFrom: string
  gradientTo: string
  shadowColor?: string
  textColor?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  onClick?: () => void
  animated?: boolean
}

export default function StatCard({
  title,
  value,
  description,
  icon,
  gradientFrom,
  gradientTo,
  shadowColor = 'shadow-card',
  textColor = 'text-white',
  trend,
  onClick,
  animated = true,
}: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-2xl border-0 p-6 transition-all duration-300 ease-apple group cursor-pointer',
        'bg-gradient-to-br',
        gradientFrom,
        gradientTo,
        shadowColor,
        'hover:shadow-card-hover hover:scale-105 active:scale-95',
        onClick && 'hover:cursor-pointer',
        animated && 'animate-slide-up'
      )}
      style={{
        perspective: '1000px',
      }}
    >
      {/* ✅ BACKGROUND EFFECT - Glassmorphism no Hover */}
      <div className="absolute inset-0 bg-white/15 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* ✅ GRADIENT OVERLAY - Efeito de Profundidade */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>

      {/* ✅ ANIMATED BACKGROUND PATTERN */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500"></div>

      {/* ✅ CONTENT - Posicionamento Relativo */}
      <div className="relative z-10">
        {/* Header com Título e Ícone */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className={cn('text-sm font-semibold', textColor, 'opacity-90 mb-1')}>
              {title}
            </p>
          </div>
          
          {/* ✅ ICON COM ANIMAÇÃO */}
          <div className={cn(
            'p-2.5 rounded-lg backdrop-blur-sm transition-all duration-300',
            'bg-white/20 group-hover:bg-white/30 group-hover:scale-110',
          )}>
            {icon}
          </div>
        </div>

        {/* Valor Principal */}
        <div className="mb-3">
          <div className={cn('text-3xl font-bold', textColor, 'group-hover:scale-110 transition-transform duration-300 origin-left')}>
            {value}
          </div>
        </div>

        {/* Description com Trend (opcional) */}
        <div className="flex items-end justify-between">
          <p className={cn('text-xs font-medium', textColor, 'opacity-80')}>
            {description}
          </p>

          {/* ✅ TREND INDICATOR - Se existir */}
          {trend && (
            <div className={cn(
              'px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1',
              trend.isPositive 
                ? 'bg-emerald-400/30 text-emerald-100' 
                : 'bg-red-400/30 text-red-100'
            )}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
      </div>

      {/* ✅ BORDER GRADIENT - Efeito Premium */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%)',
        }}
      ></div>
    </div>
  )
}