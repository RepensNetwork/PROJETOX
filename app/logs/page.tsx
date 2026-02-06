import { Suspense } from "react"
import { Header } from "@/components/layout/header"
import { LogsContent } from "./logs-content"

function LogsSkeleton() {
  return (
    <div className="rounded-xl border bg-card divide-y">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 space-y-2 animate-pulse">
          <div className="h-4 w-1/3 rounded bg-muted" />
          <div className="h-3 w-1/2 rounded bg-muted" />
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div className="h-20 rounded bg-muted" />
            <div className="h-20 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function LogsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Logs de auditoria</h1>
          <p className="text-muted-foreground">Registros de alterações com valores antigos e novos</p>
        </div>

        <Suspense fallback={<LogsSkeleton />}>
          <LogsContent />
        </Suspense>
      </main>
    </div>
  )
}
