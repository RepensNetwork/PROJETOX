import { Header } from "@/components/layout/header"
import { FinanceiroNav } from "@/components/financeiro/financeiro-nav"
import { getLancamentos } from "@/app/actions/financeiro"
import { ContasReceberClient } from "./contas-receber-client"
import { getCategoriasAll, getContasAll, getEscalasParaFinanceiro } from "@/app/actions/financeiro"

export default async function ContasReceberPage() {
  const [todosReceita, categorias, contas, escalas] = await Promise.all([
    getLancamentos({ tipo: "receita" }),
    getCategoriasAll(),
    getContasAll(),
    getEscalasParaFinanceiro(),
  ])

  const aReceber = todosReceita.filter(
    (l) => l.status !== "liquidado" && l.status !== "cancelado"
  )

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contas a receber</h1>
          <p className="text-muted-foreground">
            Receitas previstas e confirmadas aguardando recebimento
          </p>
        </div>

        <FinanceiroNav />

        <ContasReceberClient
          lancamentos={aReceber}
          categorias={categorias}
          contas={contas}
          escalas={escalas}
        />
      </main>
    </div>
  )
}
