import { Suspense } from "react"
import { Header } from "@/components/layout/header"
import { MembrosContent } from "./membros-content"

function MembrosSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-40 rounded bg-muted animate-pulse" />
          <div className="h-4 w-72 mt-2 rounded bg-muted animate-pulse" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-36 rounded-lg bg-muted animate-pulse" />
          <div className="h-10 w-40 rounded-lg bg-muted animate-pulse" />
        </div>
      </div>
      <div className="rounded-xl border bg-card divide-y">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-4 flex gap-4 animate-pulse">
            <div className="h-5 w-28 rounded bg-muted" />
            <div className="h-5 w-48 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function MembrosPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 space-y-6">
        <Suspense fallback={<MembrosSkeleton />}>
          <MembrosContent />
        </Suspense>
      </main>
    </div>
  )
}
