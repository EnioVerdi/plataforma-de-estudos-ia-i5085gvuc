import { BrainCircuit, Search, Bell, Settings } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function Header() {
  const [searchFocused, setSearchFocused] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-beige-200 shadow-elevation transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-6">
        {/* ✅ LOGO E NOME - Melhorado */}
        <Link 
          to="/" 
          className="flex items-center gap-3 hover:scale-105 transition-transform duration-300 active:scale-95 flex-shrink-0 group"
        >
          <div className="w-11 h-11 bg-gradient-primary rounded-xl flex items-center justify-center shadow-card group-hover:shadow-glow transition-all duration-300">
            <BrainCircuit className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg bg-gradient-to-r from-darkBlue-700 to-darkBlue-600 bg-clip-text text-transparent">
              FlashStudy
            </span>
            <span className="text-xs text-darkBlue-400 font-semibold tracking-widest">MENTORIA</span>
          </div>
        </Link>

        {/* ✅ SEARCH BAR - Moderno com animação */}
        <div className="hidden md:flex flex-1 max-w-md">
          <div
            className={cn(
              'relative w-full transition-all duration-300',
              searchFocused ? 'scale-105' : 'scale-100'
            )}
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-darkBlue-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar conteúdo..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-beige-200 focus:border-darkBlue-500 focus:outline-none bg-white transition-all duration-300 text-darkBlue-700 placeholder-darkBlue-400 text-sm font-medium hover:border-beige-300"
            />
          </div>
        </div>

        {/* ✅ HEADER ACTIONS - Notificações, Configurações */}
        <div className="flex items-center gap-3">
          {/* Notificações */}
          <button className="p-2.5 rounded-lg hover:bg-beige-100 transition-all duration-300 relative group">
            <Bell className="h-5 w-5 text-darkBlue-700 group-hover:text-darkBlue-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-gradient-to-b from-transparent via-beige-300 to-transparent"></div>

          {/* Configurações */}
          <button className="p-2.5 rounded-lg hover:bg-beige-100 transition-all duration-300 group">
            <Settings className="h-5 w-5 text-darkBlue-700 group-hover:text-darkBlue-600 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>
      </div>
    </header>
  )
}

// ✅ Helper para concatenar classes (se não estiver importado)
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}