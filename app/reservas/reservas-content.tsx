import { getReservasHotel } from "@/app/actions/reservas"
import { ReservasClient } from "./reservas-client"

interface ReservasContentProps {
  dataInicio?: string
  dataFim?: string
}

export async function ReservasContent({ dataInicio, dataFim }: ReservasContentProps) {
  const reservas = await getReservasHotel({ dataInicio, dataFim })
  return (
    <ReservasClient
      reservas={reservas}
      filtroInicial={{ dataInicio, dataFim }}
    />
  )
}
