import { getTransportesDoDia } from "@/app/actions/transportes"
import dynamic from "next/dynamic"

const MotoristaClient = dynamic(
  () => import("@/app/motorista/motorista-client").then((m) => m.MotoristaClient),
  { ssr: false, loading: () => <div className="animate-pulse rounded-xl border bg-card p-6 h-48" /> }
)

interface MotoristaContentProps {
  dateForFetch: string
  defaultDate: string
  tipo?: string
}

export async function MotoristaContent({ dateForFetch, defaultDate, tipo }: MotoristaContentProps) {
  const transportes = await getTransportesDoDia(dateForFetch, tipo)
  return <MotoristaClient transportes={transportes} dataFiltro={defaultDate} />
}
