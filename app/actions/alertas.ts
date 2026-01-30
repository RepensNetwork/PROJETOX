"use server"

import { createClient } from "@/lib/supabase/server"
import type { Demanda, Escala, Navio } from "@/lib/types/database"
import { isTransporteTipo } from "@/lib/alertas"

export type TipoAlerta = "nova_demanda" | "novo_transporte"

export type AlertaComDemanda = {
  id: string
  tipo: TipoAlerta
  demanda_id: string
  created_at: string
  demanda?: Demanda & { escala?: Escala & { navio?: Navio } } | null
}

export async function criarAlertasParaDemanda(
  demandaId: string,
  tipoDemanda: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const rows: { tipo: TipoAlerta; demanda_id: string }[] = [
    { tipo: "nova_demanda", demanda_id: demandaId },
  ]
  if (isTransporteTipo(tipoDemanda)) {
    rows.push({ tipo: "novo_transporte", demanda_id: demandaId })
  }

  const { error } = await supabase.from("alertas").insert(rows)

  if (error) {
    console.error("Error creating alertas:", error)
    return { success: false, error: error.message }
  }
  return { success: true }
}

export async function getAlertas(limit = 15): Promise<AlertaComDemanda[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("alertas")
    .select(
      `
      id,
      tipo,
      demanda_id,
      created_at,
      demanda:demandas(*, escala:escalas(*, navio:navios(*)))
    `
    )
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching alertas:", error)
    return []
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    tipo: row.tipo,
    demanda_id: row.demanda_id,
    created_at: row.created_at,
    demanda: row.demanda ?? null,
  }))
}
