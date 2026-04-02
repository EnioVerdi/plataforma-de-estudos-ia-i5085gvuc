import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Sidebar,
  SidebarProvider,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Home, Layers, MessageSquare, Settings, BrainCircuit, Moon, Sun, Bot, Sparkles } from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import useAppStore from '@/stores/useAppStore'

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { studyStreak } = useAppStore()
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: Layers, label: 'Flashcards', path: '/flashcards' },
    { icon: MessageSquare, label: 'Consultoria IA', path: '/consultoria' },
    { icon: Bot, label: 'Chat de Flashcards', path: '/flashcards-chat' },
    { icon: Settings, label: 'Configurações', path: '/settings' },
  ]

  const title = navItems.find((n) => n.path === location.pathname)?.label || 'Dashboard'

  const initials = user?.email?.substring(0, 2).toUpperCase() || 'US'

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth/register')
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-light text-darkBlue-700">
        {/* ✅ SIDEBAR - Modernizado com Gradientes */}
        <Sidebar className="hidden md:flex border-r border-beige-200 bg-white shadow-sm">
          {/* ✅ HEADER DA SIDEBAR */}
          <SidebarHeader className="p-6 border-b border-beige-100 bg-gradient-to-b from-white to-beige-50">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-all duration-300 group">
              <div className="w-11 h-11 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                <BrainCircuit className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg bg-gradient-to-r from-darkBlue-700 to-darkBlue-600 bg-clip-text text-transparent">
                  FlashStudy
                </span>
                <span className="text-xs text-darkBlue-400 font-semibold tracking-wide">MENTORIA</span>
              </div>
            </Link>
          </SidebarHeader>

          {/* ✅ CONTEÚDO DA SIDEBAR */}
          <SidebarContent className="px-3 py-6">
            <SidebarGroup>
              <SidebarMenu className="space-y-2">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path
                  return (
                    <SidebarMenuItem key={item.path} className="mb-1">
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className={cn(
                          'py-5 px-4 text-base font-semibold rounded-xl transition-all duration-300 relative overflow-hidden group',
                          isActive
                            ? 'bg-gradient-primary text-white shadow-lg scale-105'
                            : 'text-darkBlue-700 hover:bg-beige-100 hover:text-darkBlue-800',
                        )}
                      >
                        <Link to={item.path} className="flex items-center gap-3 w-full">
                          <item.icon className={cn(
                            'h-5 w-5 transition-all duration-300',
                            isActive && 'animate-pulse-glow'
                          )} />
                          <span>{item.label}</span>
                          {isActive && (
                            <Sparkles className="h-4 w-4 ml-auto animate-bounce-subtle" />
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>

          {/* ✅ FOOTER DA SIDEBAR - Streak Display */}
          <div className="px-3 py-4 border-t border-beige-100 bg-gradient-soft">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/50 border border-beige-200">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-md">
                <span className="text-lg font-bold text-white">🔥</span>
              </div>
              <div className="flex-1">
                <p className="text-xs text-darkBlue-600 font-semibold">Sequência de Estudos</p>
                <p className="text-lg font-bold text-darkBlue-700">{studyStreak.current} dias</p>
              </div>
            </div>
          </div>
        </Sidebar>

        {/* ✅ MAIN CONTENT AREA */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
          {/* ✅ HEADER - Modernizado */}
          <header className="h-16 border-b border-beige-200 flex items-center justify-between px-6 shrink-0 bg-white/80 backdrop-blur-md z-10 shadow-sm">
            <h2 className="font-bold text-2xl bg-gradient-to-r from-darkBlue-700 to-darkBlue-600 bg-clip-text text-transparent">
              {title}
            </h2>

            <div className="flex items-center gap-4">
              {/* ✅ STREAK BADGE - Desktop */}
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-soft border border-beige-200 hover:border-darkBlue-300 transition-all duration-300">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                  <span className="text-sm font-bold">🔥</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-darkBlue-600 font-semibold leading-none">Sequência</span>
                  <span className="text-sm font-bold text-darkBlue-700">{studyStreak.current} dias</span>
                </div>
              </div>

              {/* ✅ THEME TOGGLE */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2.5 rounded-lg hover:bg-beige-100 transition-all duration-300 text-darkBlue-700 hover:text-darkBlue-600 group"
                title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5 group-hover:rotate-45 transition-transform duration-300" />
                ) : (
                  <Moon className="h-5 w-5 group-hover:rotate-45 transition-transform duration-300" />
                )}
              </button>

              {/* ✅ USER DROPDOWN MENU */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="outline-none ring-0 hover:scale-110 transition-transform duration-300">
                    <Avatar className="h-10 w-10 border-2 border-darkBlue-200 cursor-pointer bg-gradient-to-br from-darkBlue-100 to-purple-100 shadow-md hover:shadow-lg transition-all duration-300">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-transparent bg-gradient-to-br from-darkBlue-600 to-purple-600 text-white font-bold text-sm">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-56 mt-3 bg-white text-darkBlue-700 border-beige-200 rounded-xl shadow-lg"
                >
                  <DropdownMenuLabel className="px-4 py-3 font-bold text-darkBlue-700 bg-beige-50 rounded-t-lg">
                    {user?.email || 'Minha Conta'}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-beige-150 my-1" />
                  
                  <DropdownMenuItem className="px-4 py-2.5 text-sm cursor-pointer hover:bg-beige-100 transition-colors duration-200 rounded-lg m-1">
                    👤 Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem className="px-4 py-2.5 text-sm cursor-pointer hover:bg-beige-100 transition-colors duration-200 rounded-lg m-1">
                    📊 Estatísticas
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator className="bg-beige-150 my-1" />
                  
                  <DropdownMenuItem
                    className="px-4 py-2.5 text-sm text-red-500 font-semibold cursor-pointer hover:bg-red-50 transition-colors duration-200 rounded-lg m-1"
                    onClick={handleSignOut}
                  >
                    🚪 Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* ✅ MAIN CONTENT - Com Background Gradient */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-10 relative bg-gradient-light scrollbar-custom">
            <Outlet />
          </div>

          {/* ✅ MOBILE NAVIGATION - Modernizada */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-md border-t border-beige-200 flex items-center justify-around z-50 px-2 pb-safe shadow-lg">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 rounded-xl',
                    isActive
                      ? 'text-darkBlue-600 bg-beige-100/50'
                      : 'text-darkBlue-400 hover:text-darkBlue-600 hover:bg-beige-50/30',
                  )}
                >
                  <item.icon className={cn(
                    'h-6 w-6 transition-all duration-300',
                    isActive && 'scale-110'
                  )} />
                  <span className="text-[11px] font-semibold">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}