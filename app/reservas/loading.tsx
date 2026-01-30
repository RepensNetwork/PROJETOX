import { Header } from "@/components/layout/header"
import { PageLoadingSkeleton } from "@/components/ui/page-loading-skeleton"

export default function ReservasLoading() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 space-y-6">
        <div>
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="h-4 w-72 mt-2 bg-muted rounded animate-pulse" />
        </div>
        <PageLoadingSkeleton />
      </main>
    </div>
  )
}
