import { Link, Outlet, useLocation } from 'react-router-dom'
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
import { Home, Layers, MessageSquare, Settings, Zap, Moon, Sun, Bot } from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

export default function Layout() {
  const location = useLocation()
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

  const title = navItems.find((n) => n.path === location.pathname)?.label || 'EstudoIA'

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <Sidebar className="hidden md:flex border-r">
          <SidebarHeader className="p-6">
            <div className="flex items-center gap-3 font-bold text-2xl text-primary">
              <Zap className="h-6 w-6 fill-primary" />
              <span>EstudoIA</span>
            </div>
          </SidebarHeader>
          <SidebarContent className="px-3">
            <SidebarGroup>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.path} className="mb-1">
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.path}
                      className="py-5 text-base font-medium rounded-xl"
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
          <header className="h-16 border-b flex items-center justify-between px-6 shrink-0 bg-card z-10 shadow-sm">
            <h2 className="font-semibold text-xl">{title}</h2>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-orange-500 bg-orange-500/10 px-3 py-1.5 rounded-full">
                <Zap className="h-4 w-4 fill-orange-500" />
                12 dias
              </div>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-full hover:bg-secondary transition-colors"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="outline-none ring-0">
                    <Avatar className="h-9 w-9 border-2 border-primary/20 cursor-pointer">
                      <AvatarImage src="https://img.usecurling.com/ppl/thumbnail?gender=male&seed=1" />
                      <AvatarFallback>AL</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2">
                  <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Perfil</DropdownMenuItem>
                  <DropdownMenuItem>Estatísticas</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-500">Sair</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8 relative">
            <Outlet />
          </div>

          <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t flex items-center justify-around z-50 px-2 pb-safe">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground',
                  )}
                >
                  <item.icon className={cn('h-5 w-5', isActive && 'fill-primary/20')} />
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
