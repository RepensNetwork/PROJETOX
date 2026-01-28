import { Header } from "@/components/layout/header"
import { Mail } from "lucide-react"

export default function EmailsLoading() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Inbox
            </h1>
            <p className="text-muted-foreground">Carregando emails...</p>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 w-2/5 rounded bg-muted" />
            <div className="h-3 w-3/5 rounded bg-muted" />
            <div className="h-3 w-1/2 rounded bg-muted" />
          </div>
        </div>

        <div className="rounded-lg border bg-card">
          <div className="divide-y">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="p-4">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 w-3/4 rounded bg-muted" />
                  <div className="h-3 w-2/5 rounded bg-muted" />
                  <div className="h-3 w-1/2 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
