'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
          <h2 className="text-2xl font-bold text-destructive mb-2">
            Algo deu errado!
          </h2>
          <p className="text-muted-foreground mb-4">
            {error.message || 'Ocorreu um erro inesperado. Por favor, tente novamente.'}
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground mb-4">
              ID do erro: {error.digest}
            </p>
          )}
          <div className="flex gap-2">
            <Button onClick={reset} variant="default">
              Tentar novamente
            </Button>
            <Button onClick={() => window.location.href = '/'} variant="outline">
              Voltar ao início
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
