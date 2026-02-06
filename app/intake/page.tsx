import { Suspense } from "react"
import { Header } from "@/components/layout/header"
import { IntakeContent } from "./intake-content"

function IntakeSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border bg-card p-6 h-64 space-y-3">
      <div className="h-4 w-1/3 rounded bg-muted" />
      <div className="h-24 rounded bg-muted" />
    </div>
  )
}

export default function IntakePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Registrar Demanda</h1>
          <p className="text-muted-foreground">
            Envie texto ou áudio e gere a tarefa estruturada automaticamente
          </p>
        </div>
        <Suspense fallback={<IntakeSkeleton />}>
          <IntakeContent />
        </Suspense>
      </main>
    </div>
  )
}
