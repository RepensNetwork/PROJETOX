import { Suspense } from "react"
import { Header } from "@/components/layout/header"
import { FinanceiroNav } from "@/components/financeiro/financeiro-nav"
import { syncAllReservasToFinanceiro } from "@/app/actions/financeiro"
import { FinanceiroContent } from "./financeiro-content"

export default function FinanceiroPage() {
  syncAllReservasToFinanceiro().catch(() => {})

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-[1600px] py-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Financeiro</h1>
            <p className="text-muted-foreground">
              Contas a receber, a pagar, comissões e fluxo de caixa — agenciamento marítimo
            </p>
          </div>
        </div>

        <FinanceiroNav />

        <Suspense
          fallback={
            <div className="space-y-6 animate-pulse">
              <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-24 rounded-xl bg-muted" />
                ))}
              </div>
              <div className="h-48 rounded-xl bg-muted" />
              <div className="h-64 rounded-xl bg-muted" />
            </div>
          }
        >
          <FinanceiroContent />
        </Suspense>
      </main>
    </div>
  )
}
