import { Suspense } from "react"
import { Header } from "@/components/layout/header"
import { ReservasContent } from "./reservas-content"

interface ReservasPageProps {
  searchParams: Promise<{ dataInicio?: string; dataFim?: string }>
}

function ReservasSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-6 animate-pulse space-y-4">
      <div className="h-10 w-full rounded-lg bg-muted" />
      <div className="h-64 rounded-lg bg-muted" />
    </div>
  )
}

export default async function ReservasPage({ searchParams }: ReservasPageProps) {
  const params = await searchParams

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reservas (Hotel)</h1>
          <p className="text-muted-foreground">
            Tripulantes que precisam de hotel — check-in, check-out, valor, café/almoço e confirmação
          </p>
        </div>

        <Suspense fallback={<ReservasSkeleton />}>
          <ReservasContent dataInicio={params.dataInicio} dataFim={params.dataFim} />
        </Suspense>
      </main>
    </div>
  )
}
