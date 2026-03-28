import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { MailCheck } from 'lucide-react'

export default function CheckEmail() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md p-8 text-center animate-fade-in-up">
        <MailCheck className="w-16 h-16 mx-auto mb-6 text-primary" />
        <h1 className="text-2xl font-bold mb-2">Verifique seu email</h1>
        <p className="text-muted-foreground mb-8">
          Um email de confirmação foi enviado para o seu endereço. Verifique sua caixa de entrada
          para ativar sua conta.
        </p>
        <Button asChild className="w-full">
          <Link to="/auth/register">Voltar para o Login</Link>
        </Button>
      </Card>
    </div>
  )
}
