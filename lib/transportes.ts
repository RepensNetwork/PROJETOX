import type { Demanda } from "@/lib/types/database"

export type TransporteLeg = {
  id: string
  label: string
  pickup_at?: string | null
  pickup_local?: string | null
  dropoff_local?: string | null
  status?: "pendente" | "concluido"
  modalidade?: "junto" | "separado" | null
  grupo?: string | null
  concluido_em?: string | null
}

const normalizeText = (value?: string | null) =>
  (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()

const detectAirportLabel = (text: string) => {
  if (text.includes("fln")) return "Aeroporto (FLN)"
  if (text.includes("nvt")) return "Aeroporto (NVT)"
  if (text.includes("gru")) return "Aeroporto (GRU)"
  if (text.includes("airport") || text.includes("aeroporto")) return "Aeroporto"
  return "Aeroporto"
}

export const buildTransportLegs = (demanda: Demanda): TransporteLeg[] => {
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
    if (isEmbark) {
      return [
        {
          id: `${demanda.id}-leg-1`,
          label: "Aeroporto → Hotel",
          pickup_local: airport,
          dropoff_local: "Hotel",
          status: "pendente",
        },
        {
          id: `${demanda.id}-leg-2`,
          label: "Hotel → Terminal",
          pickup_local: "Hotel",
          dropoff_local: "Terminal/Porto",
          status: "pendente",
        },
      ]
    }
    return [
      {
        id: `${demanda.id}-leg-1`,
        label: "Terminal → Hotel",
        pickup_local: "Terminal/Porto",
        dropoff_local: "Hotel",
        status: "pendente",
      },
      {
        id: `${demanda.id}-leg-2`,
        label: "Hotel → Aeroporto",
        pickup_local: "Hotel",
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
