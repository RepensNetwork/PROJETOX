import type { Demanda, Escala, Navio } from "@/lib/types/database"

export type ReservaItem = Demanda & {
  escala: Escala & { navio: Navio }
  demanda_pai?: Demanda | null
}

/** Nome do tripulante: da demanda pai (se sub-demanda) ou do título da própria demanda */
export function getTripulanteNome(reserva: ReservaItem): string {
  if (reserva.demanda_pai?.titulo) return reserva.demanda_pai.titulo
  return reserva.titulo
}

export type UpdateReservaHotelInput = {
  reserva_checkin?: string | null
  reserva_checkout?: string | null
  reserva_valor?: number | null
  reserva_cafe_incluso?: boolean | null
  reserva_almoco_incluso?: boolean | null
  reserva_confirmado?: boolean | null
}
