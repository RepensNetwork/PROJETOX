import type { Demanda, Escala } from "@/lib/types/database"

export type TransporteLeg = {
  id: string
  label: string
  pickup_at?: string | null
  pickup_local?: string | null
  dropoff_local?: string | null
  status?: "pendente" | "concluido"
  modalidade?: "junto" | "separado" | null
  /** Número da viagem (informado na confirmação) — usado para agrupar no relatório. */
  grupo?: string | null
  /** Observação / voo — campo livre, separado do número da viagem. */
  observacao?: string | null
  concluido_em?: string | null
}

/** Horário padrão: buscar no hotel para levar ao terminal no dia da escala (embarques). */
const EMBARK_TERMINAL_PICKUP_TIME = "08:30"

/** Horário padrão: saída do terminal para aeroporto/hotel (desembarques). */
const DISEMBARK_TERMINAL_DEPARTURE_TIME = "11:00"

const normalizeText = (value?: string | null) =>
  (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()

const detectAirportLabel = (text: string) => {
  if (text.includes("fln")) return "Aeroporto Florianópolis"
  if (text.includes("nvt") || text.includes("navegantes")) return "Aeroporto Navegantes"
  if (text.includes("gru")) return "Aeroporto (GRU)"
  if (text.includes("airport") || text.includes("aeroporto")) return "Aeroporto"
  return "Aeroporto"
}

/** Retorna data da escala no dia (yyyy-mm-dd) e ISO do horário no Brasil (ex.: 08:30). */
function toPickupAtScaleDay(escala: Escala | undefined, timeHHMM: string): string | null {
  if (!escala?.data_chegada) return null
  const d = new Date(escala.data_chegada)
  if (Number.isNaN(d.getTime())) return null
  const [h, m] = timeHHMM.split(":").map(Number)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}T${String(h).padStart(2, "0")}:${String(m ?? 0).padStart(2, "0")}:00-03:00`
}

export const buildTransportLegs = (demanda: Demanda & { escala?: Escala }): TransporteLeg[] => {
  if (Array.isArray(demanda.transporte_legs) && demanda.transporte_legs.length > 0) {
    return demanda.transporte_legs as TransporteLeg[]
  }

  const text = normalizeText(demanda.descricao)
  const hasHotel = text.includes("hotel")
  const isEmbark = demanda.tipo === "embarque_passageiros"
  const isDisembark = demanda.tipo === "desembarque_passageiros"

  if (demanda.pickup_local || demanda.dropoff_local || demanda.pickup_at) {
    return [
      {
        id: `${demanda.id}-leg-1`,
        label: "Viagem",
        pickup_at: demanda.pickup_at || null,
        pickup_local: demanda.pickup_local || null,
        dropoff_local: demanda.dropoff_local || null,
        status: (demanda.transporte_status as TransporteLeg["status"]) || "pendente",
        modalidade: (demanda.transporte_modalidade as TransporteLeg["modalidade"]) || null,
        grupo: demanda.transporte_grupo || null,
        concluido_em: demanda.transporte_concluido_em || null,
      },
    ]
  }

  if ((isEmbark || isDisembark) && hasHotel) {
    const airport = detectAirportLabel(text)
    const escala = demanda.escala
    if (isEmbark) {
      const leg2PickupAt = toPickupAtScaleDay(escala, EMBARK_TERMINAL_PICKUP_TIME)
      return [
        {
          id: `${demanda.id}-leg-1`,
          label: "Aeroporto → Hotel",
          pickup_at: demanda.pickup_at || null,
          pickup_local: airport,
          dropoff_local: "Hotel (a confirmar)",
          status: "pendente",
        },
        {
          id: `${demanda.id}-leg-2`,
          label: "Hotel → Terminal",
          pickup_at: leg2PickupAt,
          pickup_local: "Hotel (a confirmar)",
          dropoff_local: "Terminal Marejada",
          status: "pendente",
        },
      ]
    }
    const leg1PickupAt = toPickupAtScaleDay(demanda.escala, DISEMBARK_TERMINAL_DEPARTURE_TIME)
    return [
      {
        id: `${demanda.id}-leg-1`,
        label: "Terminal → Hotel",
        pickup_at: leg1PickupAt,
        pickup_local: "Terminal",
        dropoff_local: "Hotel (a confirmar)",
        status: "pendente",
      },
      {
        id: `${demanda.id}-leg-2`,
        label: "Hotel → Aeroporto",
        pickup_at: null,
        pickup_local: "Hotel (a confirmar)",
        dropoff_local: airport,
        status: "pendente",
      },
    ]
  }

  if (demanda.tipo === "visita_medica") {
    return [
      {
        id: `${demanda.id}-leg-1`,
        label: "Hotel/Terminal → Clínica",
        pickup_local: "Hotel/Terminal",
        dropoff_local: "Clínica",
        status: "pendente",
      },
      {
        id: `${demanda.id}-leg-2`,
        label: "Clínica → Hotel/Terminal",
        pickup_local: "Clínica",
        dropoff_local: "Hotel/Terminal",
        status: "pendente",
      },
    ]
  }

  return [
    {
      id: `${demanda.id}-leg-1`,
      label: "Viagem",
      status: "pendente",
    },
  ]
}
