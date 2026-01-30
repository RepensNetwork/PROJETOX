import dynamic from "next/dynamic"
import { Header } from "@/components/layout/header"
import { getEscalasForSelect } from "@/app/actions/demandas"

const IntakeClient = dynamic(
  () => import("@/app/intake/intake-client").then((m) => m.IntakeClient),
  { loading: () => <div className="animate-pulse rounded-lg border bg-card p-6 space-y-3"><div className="h-4 w-1/3 rounded bg-muted" /><div className="h-24 rounded bg-muted" /></div> }
)

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
