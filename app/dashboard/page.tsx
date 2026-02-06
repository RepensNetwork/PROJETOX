import { Suspense } from "react"
import { Header } from "@/components/layout/header"
import { DashboardContent } from "./dashboard-content"
import { DashboardSkeleton } from "./dashboard-skeleton"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Mic } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Visão geral das operações portuárias
            </p>
          </div>
          <Button asChild className="gap-2">
            <Link href="/intake">
              <Mic className="h-4 w-4" />
              Criar demanda
            </Link>
          </Button>
        </div>

        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardContent />
        </Suspense>
      </main>
    </div>
  )
}
