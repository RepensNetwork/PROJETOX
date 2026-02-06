import { Suspense } from "react"
import { Header } from "@/components/layout/header"
import { DashboardContent } from "./dashboard-content"
import { DashboardSkeleton } from "./dashboard-skeleton"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Mic, ArrowUpFromLine, ArrowDownToLine } from "lucide-react"

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
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="icon" className="shrink-0" title="Embarque">
              <Link href="/intake?tipo=embarque_passageiros">
                <ArrowUpFromLine className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="icon" className="shrink-0" title="Desembarque">
              <Link href="/intake?tipo=desembarque_passageiros">
                <ArrowDownToLine className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild className="gap-2">
              <Link href="/intake">
                <Mic className="h-4 w-4" />
                Criar demanda
              </Link>
            </Button>
          </div>
        </div>

        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardContent />
        </Suspense>
      </main>
    </div>
  )
}
