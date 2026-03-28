import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { BellRing, Plane, User, LogOut } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { useNavigate } from 'react-router-dom'

export default function Settings() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState({ name: '' })
  const [settings, setSettings] = useState({
    email_enabled: true,
    preferred_time: '08:00',
    frequency: 'daily',
    vacation_mode: false,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!user) return
      const [profRes, setRes] = await Promise.all([
        supabase.from('profiles').select('name').eq('id', user.id).maybeSingle(),
        supabase.from('reminder_settings').select('*').eq('user_id', user.id).maybeSingle(),
      ])
      if (profRes.data) setProfile({ name: profRes.data.name || '' })
      if (setRes.data) setSettings(setRes.data)
    }
    load()
  }, [user])

  const handleSave = async () => {
    if (!user) return
    setLoading(true)
    await Promise.all([
      supabase.from('profiles').update({ name: profile.name }).eq('id', user.id),
      supabase.from('reminder_settings').upsert({ user_id: user.id, ...settings }),
    ])
    setLoading(false)
    toast({
      title: 'Configurações salvas',
      description: 'Suas preferências foram atualizadas com sucesso.',
    })
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth/register')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie suas notificações e preferências de estudo.
        </p>
      </div>

      <div className="grid gap-6">
        <Card className="border-0 ring-1 ring-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BellRing className="h-5 w-5 text-primary" />
              <CardTitle>Notificações e Lembretes</CardTitle>
            </div>
            <CardDescription>
              Configure como e quando você quer ser lembrado de estudar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">E-mail de Lembretes</Label>
                <p className="text-sm text-muted-foreground">
                  Receba um resumo das revisões pendentes.
                </p>
              </div>
              <Switch
                checked={settings.email_enabled}
                onCheckedChange={(v) => setSettings({ ...settings, email_enabled: v })}
              />
            </div>
            <Separator />
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Horário preferido</Label>
                <Input
                  type="time"
                  value={settings.preferred_time}
                  onChange={(e) => setSettings({ ...settings, preferred_time: e.target.value })}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label>Frequência</Label>
                <Select
                  value={settings.frequency}
                  onValueChange={(v) => setSettings({ ...settings, frequency: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diariamente</SelectItem>
                    <SelectItem value="weekly">Semanalmente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 ring-1 ring-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Plane className="h-5 w-5 text-indigo-500" />
              <CardTitle>Modo Férias</CardTitle>
            </div>
            <CardDescription>
              Pausa o algoritmo de repetição espaçada. Seus cartões não acumularão atrasos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between bg-indigo-50 dark:bg-indigo-950/30 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
              <div className="space-y-0.5">
                <Label className="text-base text-indigo-900 dark:text-indigo-100">
                  Ativar Modo Férias
                </Label>
                <p className="text-sm text-indigo-700/80 dark:text-indigo-300/80">
                  Ideal para semanas de provas ou descanso prolongado.
                </p>
              </div>
              <Switch
                checked={settings.vacation_mode}
                onCheckedChange={(v) => setSettings({ ...settings, vacation_mode: v })}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 ring-1 ring-border shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-emerald-500" />
                <CardTitle>Dados do Perfil</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" /> Sair da Conta
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input value={profile.name} onChange={(e) => setProfile({ name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>E-mail da Conta</Label>
              <Input value={user?.email || ''} disabled className="bg-muted" />
            </div>
            <Button onClick={handleSave} disabled={loading} className="mt-2">
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
