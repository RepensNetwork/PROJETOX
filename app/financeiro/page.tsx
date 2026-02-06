import { Header } from "@/components/layout/header"
import { FinanceiroNav } from "@/components/financeiro/financeiro-nav"
import { FinanceiroResumoCards } from "@/components/financeiro/financeiro-resumo-cards"
import { getFinanceiroResumo, getLancamentos, getComissoes, syncAllReservasToFinanceiro } from "@/app/actions/financeiro"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { LancamentosTable } from "@/components/financeiro/lancamentos-table"
import { ComissoesTable } from "@/components/financeiro/comissoes-table"

export default async function FinanceiroPage() {
  await syncAllReservasToFinanceiro()

  const [resumo, ultimosLancamentos, ultimasComissoes] = await Promise.all([
    getFinanceiroResumo(),
    getLancamentos({ limit: 8 }),
    getComissoes({ limit: 5 }),
  ])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Financeiro</h1>
            <p className="text-muted-foreground">
              Contas a receber, a pagar, comissões e fluxo de caixa — agenciamento marítimo
            </p>
          </div>
        </div>

        <FinanceiroNav />

        <FinanceiroResumoCards resumo={resumo} />

        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Últimos lançamentos</h2>
              <Button asChild variant="outline" size="sm">
                <Link href="/financeiro/movimentacoes">Ver todos</Link>
              </Button>
            </div>
            <LancamentosTable lancamentos={ultimosLancamentos} showEscala />
          </div>
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Comissões recentes</h2>
              <Button asChild variant="outline" size="sm">
                <Link href="/financeiro/comissoes">Ver todas</Link>
              </Button>
            </div>
            <ComissoesTable comissoes={ultimasComissoes} />
          </div>
        </div>
      </main>
    </div>
  )
}
