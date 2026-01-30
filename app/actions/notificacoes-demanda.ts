"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { NotificacaoDemanda, Demanda, Escala, Navio } from "@/lib/types/database"

export async function criarNotificacaoDemanda(
  demandaId: string,
  membroId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase.from("notificacoes_demanda").insert({
    demanda_id: demandaId,
    membro_id: membroId,
    lida: false,
  })

  if (error) {
    console.error("Error creating notificacao demanda:", error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/demandas/${demandaId}`)
  revalidatePath("/dashboard")
  return { success: true }
}

export type NotificacaoDemandaComDemanda = NotificacaoDemanda & {
  demanda?: Demanda & { escala?: Escala & { navio?: Navio } }
}

export async function getNotificacoesDemanda(
  membroId: string,
  lidas?: boolean
): Promise<NotificacaoDemandaComDemanda[]> {
  const supabase = await createClient()

  let query = supabase
    .from("notificacoes_demanda")
    .select(`
      *,
      demanda:demandas(*, escala:escalas(*, navio:navios(*)))
    `)
    .eq("membro_id", membroId)
    .order("created_at", { ascending: false })

  if (lidas !== undefined) {
    query = query.eq("lida", lidas)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching notificacoes demanda:", error)
    return []
  }

  return (data || []).map((n: any) => ({
    ...n,
    demanda: n.demanda ?? null,
  }))
}

export async function marcarNotificacaoDemandaComoLida(
  notificacaoId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from("notificacoes_demanda")
    .update({
      lida: true,
      lida_em: new Date().toISOString(),
    })
    .eq("id", notificacaoId)

  if (error) {
    console.error("Error updating notificacao demanda:", error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function marcarTodasNotificacoesDemandaComoLidas(
  membroId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from("notificacoes_demanda")
    .update({
      lida: true,
      lida_em: new Date().toISOString(),
    })
    .eq("membro_id", membroId)
    .eq("lida", false)

  if (error) {
    console.error("Error updating notificacoes demanda:", error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function getContadorNotificacoesDemandaNaoLidas(
  membroId: string
): Promise<number> {
  const supabase = await createClient()

  const { count, error } = await supabase
    .from("notificacoes_demanda")
    .select("*", { count: "exact", head: true })
    .eq("membro_id", membroId)
    .eq("lida", false)

  if (error) {
    console.error("Error counting notificacoes demanda:", error)
    return 0
  }

  return count ?? 0
}

export async function limparTodasNotificacoesDemanda(
  membroId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from("notificacoes_demanda")
    .delete()
    .eq("membro_id", membroId)

  if (error) {
    console.error("Error clearing notificacoes demanda:", error)
    return { success: false, error: error.message }
  }

  return { success: true }
}
