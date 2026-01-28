import { Header } from "@/components/layout/header"
import { DemandasTable } from "@/components/demandas/demandas-table"
import { DemandaForm } from "@/components/demandas/demanda-form"
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Demandas</h1>
            <p className="text-muted-foreground">
              Gerencie todas as demandas das escalas
            </p>
          </div>
          <DemandaForm escalas={escalas} membros={membros} />
        </div>

        <DemandasTable demandas={demandas} escalas={escalas} membros={membros} />
      </main>
    </div>
  )
}
