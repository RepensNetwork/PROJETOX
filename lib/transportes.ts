import type { Demanda } from "@/lib/types/database"

export type TransporteLeg = {
  id: string
  label: string
  pickup_at: string | null
  pickup_local: string | null
  dropoff_local: string | null
  status: "pendente" | "concluido"
  observacao?: string | null
  grupo?: string | null
  concluido_em?: string | null
  duracao_minutos?: number | null
}

type DemandaLike = Pick<
  Demanda,
  "id" | "titulo" | "pickup_at" | "pickup_local" | "dropoff_local" | "transporte_legs"
> & { escala?: { data_chegada?: string } }

function isLegShape(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function normalizeLeg(leg: unknown, demandaId: string, index: number): TransporteLeg {
  if (!isLegShape(leg)) {
    return {
      id: `${demandaId}-leg-${index}`,
      label: "Trecho",
      pickup_at: null,
      pickup_local: null,
      dropoff_local: null,
      status: "pendente",
      observacao: null,
    }
  }
  const id = typeof leg.id === "string" ? leg.id : `${demandaId}-leg-${index}`
  const label = typeof leg.label === "string" ? leg.label : "Trecho"
  const status =
    leg.status === "concluido" || leg.status === "pendente" ? leg.status : "pendente"
  const pickup_at = typeof leg.pickup_at === "string" ? leg.pickup_at : null
  const pickup_local = typeof leg.pickup_local === "string" ? leg.pickup_local : null
  const dropoff_local = typeof leg.dropoff_local === "string" ? leg.dropoff_local : null
  const observacao = typeof leg.observacao === "string" ? leg.observacao : null
  const grupo = typeof leg.grupo === "string" ? leg.grupo : null
  const concluido_em = typeof leg.concluido_em === "string" ? leg.concluido_em : null
  const duracao_minutos =
    typeof leg.duracao_minutos === "number" && !Number.isNaN(leg.duracao_minutos)
      ? leg.duracao_minutos
      : null
  return {
    id,
    label,
    pickup_at,
    pickup_local,
    dropoff_local,
    status,
    observacao,
    grupo,
    concluido_em,
    duracao_minutos,
  }
}

/**
 * Constrói a lista de trechos (legs) de transporte a partir de uma demanda.
 * Se a demanda já tiver transporte_legs, normaliza e retorna; caso contrário
 * gera um único leg a partir de pickup_at, pickup_local e dropoff_local.
 */
export function buildTransportLegs(demanda: DemandaLike): TransporteLeg[] {
  const raw = demanda.transporte_legs
  if (Array.isArray(raw) && raw.length > 0) {
    return raw.map((item, index) => normalizeLeg(item, demanda.id, index))
  }

  const id = `${demanda.id}-leg-0`
  return [
    {
      id,
      label: demanda.titulo?.trim() || "Trecho",
      pickup_at: demanda.pickup_at ?? null,
      pickup_local: demanda.pickup_local ?? null,
      dropoff_local: demanda.dropoff_local ?? null,
      status: "pendente",
      observacao: null,
    },
  ]
}
