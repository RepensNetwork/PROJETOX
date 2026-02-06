import { Header } from "@/components/layout/header"
import { FinanceiroNav } from "@/components/financeiro/financeiro-nav"
import {
  getLancamentos,
  getCategoriasAll,
  getContasAll,
  getEscalasParaFinanceiro,
  syncAllReservasToFinanceiro,
} from "@/app/actions/financeiro"
import { ContasPagarClient } from "./contas-pagar-client"

export default async function ContasPagarPage() {
  await syncAllReservasToFinanceiro()

  const [todosDespesa, categorias, contas, escalas] = await Promise.all([
    getLancamentos({ tipo: "despesa" }),
    getCategoriasAll(),
    getContasAll(),
    getEscalasParaFinanceiro(),
  ])

  const aPagar = todosDespesa.filter(
    (l) => l.status !== "liquidado" && l.status !== "cancelado"
  )

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contas a pagar</h1>
          <p className="text-muted-foreground">
            Despesas previstas e confirmadas aguardando pagamento
          </p>
        </div>

        <FinanceiroNav />

        <ContasPagarClient
          lancamentos={aPagar}
          categorias={categorias}
          contas={contas}
          escalas={escalas}
        />
      </main>
    </div>
  )
}
