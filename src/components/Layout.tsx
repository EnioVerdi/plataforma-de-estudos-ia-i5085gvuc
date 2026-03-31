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
import { Home, Layers, MessageSquare, Settings, BrainCircuit, Moon, Sun, Bot } from 'lucide-react'
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
      <div className="flex min-h-screen w-full bg-beige-50 text-darkBlue-700">
        <Sidebar className="hidden md:flex border-r border-beige-300 bg-white">
          <SidebarHeader className="p-6">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-gradient-to-br from-darkBlue-600 to-darkBlue-800 rounded-lg flex items-center justify-center shadow-md">
                <BrainCircuit className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-darkBlue-700">FlashStudy</span>
                <span className="text-xs text-beige-500 font-medium">Mentoria</span>
              </div>
            </Link>
          </SidebarHeader>
          <SidebarContent className="px-3">
            <SidebarGroup>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.path} className="mb-1">
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.path}
                      className={cn(
                        'py-5 text-base font-medium rounded-xl',
                        location.pathname === item.path
                          ? 'bg-darkBlue-500 text-white hover:bg-darkBlue-600'
                          : 'text-darkBlue-700 hover:bg-beige-100',
                      )}
                    >
                      <Link to={item.path}>
                        <item.icon className="h-5 w-5 mr-1" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
          <header className="h-16 border-b border-beige-300 flex items-center justify-between px-6 shrink-0 bg-white z-10 shadow-sm">
            <h2 className="font-semibold text-xl text-darkBlue-700">{title}</h2>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-darkBlue-700 bg-beige-300 px-3 py-1.5 rounded-full">
                <BrainCircuit className="h-4 w-4 fill-darkBlue-500" />
                {studyStreak.current} dias
              </div>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-full hover:bg-beige-100 transition-colors text-darkBlue-700"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="outline-none ring-0">
                    <Avatar className="h-9 w-9 border-2 border-darkBlue-200 cursor-pointer bg-darkBlue-100">
                      <AvatarFallback className="bg-transparent text-darkBlue-700 font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 mt-2 bg-white text-darkBlue-700 border-beige-300"
                >
                  <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-beige-200" />
                  <DropdownMenuItem className="hover:bg-beige-100">Perfil</DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-beige-100">Estatísticas</DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-red-500 hover:bg-red-50 cursor-pointer"
                    onClick={handleSignOut}
                  >
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8 relative bg-beige-50">
            <Outlet />
          </div>

          <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-beige-300 flex items-center justify-around z-50 px-2 pb-safe">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors',
                    isActive ? 'text-darkBlue-700' : 'text-darkBlue-400',
                  )}
                >
                  <item.icon className={cn('h-5 w-5', isActive && 'fill-darkBlue-200')} />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}