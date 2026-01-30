import { Header } from "@/components/layout/header"
import { DemandasTable } from "@/components/demandas/demandas-table"
import { DemandasPageActions } from "@/app/demandas/demandas-page-actions"
import { getDemandas, getEscalasForSelect } from "@/app/actions/demandas"
import { getMembros } from "@/app/actions/dashboard"

export default async function DemandasPage() {
  const [demandas, escalas, membros] = await Promise.all([
    getDemandas(),
    getEscalasForSelect(),
    getMembros(),
  ])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Demandas</h1>
            <p className="text-muted-foreground">
              Tripulantes (embarque/desembarque) e outras demandas das escalas
            </p>
          </div>
          <DemandasPageActions escalas={escalas} membros={membros} />
        </div>

        <DemandasTable demandas={demandas} escalas={escalas} membros={membros} />
      </main>
    </div>
  )
}
