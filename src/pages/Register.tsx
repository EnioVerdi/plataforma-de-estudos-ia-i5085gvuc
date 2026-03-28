import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'

export default function Register() {
  const navigate = useNavigate()
  const { signUp, signIn } = useAuth()
  const [isLogin, setIsLogin] = useState(false)
  const [data, setData] = useState({ name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLogin && data.password !== data.confirm) {
      toast.error('Senhas não conferem')
      return
    }

    setLoading(true)
    if (isLogin) {
      const { error } = await signIn(data.email, data.password)
      if (error) toast.error(error.message)
      else navigate('/')
    } else {
      const { error } = await signUp(data.email, data.password)
      if (error) toast.error(error.message)
      else {
        toast.success('Conta criada com sucesso!')
        navigate('/onboarding')
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md p-6 md:p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">
            {isLogin ? 'Bem-vindo de volta' : 'Crie sua Conta'}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {isLogin ? 'Acesse sua conta para continuar' : 'Comece sua jornada de estudos'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input
                required
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              required
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Senha</Label>
            <Input
              type="password"
              required
              value={data.password}
              onChange={(e) => setData({ ...data, password: e.target.value })}
            />
          </div>
          {!isLogin && (
            <div className="space-y-2">
              <Label>Confirmar Senha</Label>
              <Input
                type="password"
                required
                value={data.confirm}
                onChange={(e) => setData({ ...data, confirm: e.target.value })}
              />
            </div>
          )}

          {!isLogin && (
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox id="terms" required />
              <Label htmlFor="terms" className="text-sm font-normal">
                Li e concordo com os termos
              </Label>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Aguarde...' : isLogin ? 'ENTRAR' : 'CRIAR CONTA'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-primary hover:underline"
          >
            {isLogin ? 'Não tem conta? Criar agora' : 'Já tem conta? Fazer login'}
          </button>
        </div>
      </Card>
    </div>
  )
}
