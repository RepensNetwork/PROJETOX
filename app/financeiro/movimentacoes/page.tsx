import { Header } from "@/components/layout/header"
import { FinanceiroNav } from "@/components/financeiro/financeiro-nav"
import {
  getCachedLancamentos,
  getCachedCategoriasAll,
  getCachedContasAll,
  getCachedEscalasParaFinanceiro,
  syncAllReservasToFinanceiro,
} from "@/app/actions/financeiro"
import { MovimentacoesClient } from "./movimentacoes-client"

export const dynamic = "force-dynamic"

export default async function MovimentacoesPage() {
  syncAllReservasToFinanceiro().catch(() => {})
  const [lancamentos, categorias, contas, escalas] = await Promise.all([
    getCachedLancamentos({ limit: 300 }),
    getCachedCategoriasAll(),
    getCachedContasAll(),
    getCachedEscalasParaFinanceiro(),
  ])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Movimentações</h1>
          <p className="text-muted-foreground">
            Todos os lançamentos financeiros (receitas e despesas)
          </p>
        </div>

        <FinanceiroNav />

        <MovimentacoesClient
          lancamentos={lancamentos}
          categorias={categorias}
          contas={contas}
          escalas={escalas}
        />
      </main>
    </div>
  )
}
