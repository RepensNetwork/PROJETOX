import { Header } from "@/components/layout/header"
import { IntakeClient } from "@/app/intake/intake-client"
import { getEscalasForSelect } from "@/app/actions/demandas"

export default async function IntakePage() {
  const escalas = await getEscalasForSelect()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Registrar Demanda</h1>
          <p className="text-muted-foreground">
            Envie texto ou áudio e gere a tarefa estruturada automaticamente
          </p>
        </div>
        <IntakeClient escalas={escalas} />
      </main>
    </div>
  )
}
