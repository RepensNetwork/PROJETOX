import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FinanceiroResumoCards } from "@/components/financeiro/financeiro-resumo-cards"
import { LancamentosTable } from "@/components/financeiro/lancamentos-table"
import { ComissoesTable } from "@/components/financeiro/comissoes-table"
import { getCachedFinanceiroResumo, getCachedLancamentos, getCachedComissoes } from "@/app/actions/financeiro"

export async function FinanceiroContent() {
  const [resumo, ultimosLancamentos, ultimasComissoes] = await Promise.all([
    getCachedFinanceiroResumo(),
    getCachedLancamentos({ limit: 8 }),
    getCachedComissoes({ limit: 5 }),
  ])

  return (
    <>
      <FinanceiroResumoCards resumo={resumo} />
      <div className="space-y-6">
        <div className="min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Comissões recentes</h2>
            <Button asChild variant="outline" size="sm">
              <Link href="/financeiro/comissoes">Ver todas</Link>
            </Button>
          </div>
          <ComissoesTable comissoes={ultimasComissoes} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Últimos lançamentos</h2>
            <Button asChild variant="outline" size="sm">
              <Link href="/financeiro/movimentacoes">Ver todos</Link>
            </Button>
          </div>
          <LancamentosTable lancamentos={ultimosLancamentos} showEscala />
        </div>
      </div>
    </>
  )
}
