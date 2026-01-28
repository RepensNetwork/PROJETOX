import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4 text-center">
        <div className="rounded-lg border border-muted bg-card p-6">
          <h2 className="text-4xl font-bold mb-2">404</h2>
          <h3 className="text-2xl font-semibold mb-2">Página não encontrada</h3>
          <p className="text-muted-foreground mb-6">
            A página que você está procurando não existe ou foi movida.
          </p>
          <div className="flex gap-2 justify-center">
            <Button asChild>
              <Link href="/">Voltar ao início</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard">Ir para Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
