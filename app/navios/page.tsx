import { Suspense } from "react"
import { Header } from "@/components/layout/header"
import { NaviosContent } from "./navios-content"

function NaviosSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-32 rounded bg-muted animate-pulse" />
          <div className="h-4 w-64 mt-2 rounded bg-muted animate-pulse" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-28 rounded-lg bg-muted animate-pulse" />
          <div className="h-10 w-24 rounded-lg bg-muted animate-pulse" />
        </div>
      </div>
      <div className="rounded-xl border bg-card divide-y">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-4 flex gap-4 animate-pulse">
            <div className="h-5 w-32 rounded bg-muted" />
            <div className="h-5 w-40 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function NaviosPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 space-y-6">
        <Suspense fallback={<NaviosSkeleton />}>
          <NaviosContent />
        </Suspense>
      </main>
    </div>
  )
}
