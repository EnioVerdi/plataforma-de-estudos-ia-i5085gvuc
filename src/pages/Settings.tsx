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
import { BellRing, Plane, User, Lock, Mail } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function Settings() {
  const handleSave = () => {
    toast({
      title: 'Configurações salvas',
      description: 'Suas preferências foram atualizadas com sucesso.',
    })
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
                <Label className="text-base">E-mail Diário</Label>
                <p className="text-sm text-muted-foreground">
                  Receba um resumo das revisões pendentes do dia.
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Horário preferido</Label>
                <Input type="time" defaultValue="08:00" className="w-full" />
              </div>
              <div className="space-y-2">
                <Label>Frequência extra</Label>
                <Select defaultValue="none">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Apenas o resumo matinal</SelectItem>
                    <SelectItem value="urgent">Alertas de revisões urgentes</SelectItem>
                    <SelectItem value="weekly">Relatório semanal aos domingos</SelectItem>
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
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 ring-1 ring-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-emerald-500" />
              <CardTitle>Dados do Perfil</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input defaultValue="Aluno Dedicado" />
            </div>
            <div className="space-y-2">
              <Label>E-mail da Conta</Label>
              <Input defaultValue="aluno@estudoia.com" disabled className="bg-muted" />
            </div>
            <Button onClick={handleSave} className="mt-2">
              Salvar Alterações
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
