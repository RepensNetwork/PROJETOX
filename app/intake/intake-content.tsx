import { getEscalasForSelect } from "@/app/actions/demandas"
import dynamic from "next/dynamic"

const IntakeClient = dynamic(
  () => import("@/app/intake/intake-client").then((m) => m.IntakeClient),
  { loading: () => <div className="animate-pulse rounded-xl border bg-card p-6 h-48 space-y-3"><div className="h-4 w-1/3 rounded bg-muted" /><div className="h-24 rounded bg-muted" /></div> }
)

type Props = { tipoInicial?: string }

export async function IntakeContent({ tipoInicial }: Props) {
  const escalas = await getEscalasForSelect()
  return <IntakeClient escalas={escalas} tipoInicial={tipoInicial} />
}
