import { Header } from "@/components/layout/header"
import { FinanceiroNav } from "@/components/financeiro/financeiro-nav"
import { getComissoes, getEscalasParaFinanceiro } from "@/app/actions/financeiro"
import { ComissoesClient } from "./comissoes-client"

export default async function ComissoesPage() {
  const [comissoes, escalas] = await Promise.all([
    getComissoes(),
    getEscalasParaFinanceiro(),
  ])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Comissões</h1>
          <p className="text-muted-foreground">
            Comissões de agenciamento por escala
          </p>
        </div>

        <FinanceiroNav />

        <ComissoesClient comissoes={comissoes} escalas={escalas} />
      </main>
    </div>
  )
}
