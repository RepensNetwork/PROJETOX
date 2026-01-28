"use server"

import { createClient } from "@/lib/supabase/server"
import type { Notificacao, Membro, Mensagem } from "@/lib/types/database"
import { revalidatePath } from "next/cache"

export async function criarNotificacoes(
  mensagemId: string,
  escalaId: string,
  membrosMencionados: string[]
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  if (membrosMencionados.length === 0) {
    return { success: true }
  }

  const notificacoes = membrosMencionados.map(membroId => ({
    mensagem_id: mensagemId,
    membro_id: membroId,
    escala_id: escalaId,
    lida: false,
  }))

  const { error } = await supabase
    .from("notificacoes")
    .insert(notificacoes)

  if (error) {
    console.error("Error creating notificacoes:", error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/escalas/${escalaId}`)
  return { success: true }
}

export async function getNotificacoes(
  membroId: string,
  lidas?: boolean
): Promise<(Notificacao & { mensagem: Mensagem & { autor: Membro } })[]> {
  const supabase = await createClient()

  let query = supabase
    .from("notificacoes")
    .select(`
      *,
      mensagem:mensagens(*, autor:membros(*))
    `)
    .eq("membro_id", membroId)
    .order("created_at", { ascending: false })

  if (lidas !== undefined) {
    query = query.eq("lida", lidas)
  }

  const { data: notificacoes, error } = await query

  if (error) {
    console.error("Error fetching notificacoes:", error)
    return []
  }

  return (notificacoes || []).map(n => ({
    ...n,
    mensagem: (n as any).mensagem || null,
  }))
}

export async function marcarNotificacaoComoLida(
  notificacaoId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from("notificacoes")
    .update({
      lida: true,
      lida_em: new Date().toISOString(),
    })
    .eq("id", notificacaoId)

  if (error) {
    console.error("Error updating notificacao:", error)
    return { success: false, error: error.message }
  }

  // Revalidar para atualizar contadores
  const { data: notificacao } = await supabase
    .from("notificacoes")
    .select("escala_id")
    .eq("id", notificacaoId)
    .single()

  if (notificacao) {
    revalidatePath(`/escalas/${notificacao.escala_id}`)
  }

  return { success: true }
}

export async function marcarTodasNotificacoesComoLidas(
  membroId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from("notificacoes")
    .update({
      lida: true,
      lida_em: new Date().toISOString(),
    })
    .eq("membro_id", membroId)
    .eq("lida", false)

  if (error) {
    console.error("Error updating notificacoes:", error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function getContadorNotificacoesNaoLidas(
  membroId: string
): Promise<number> {
  const supabase = await createClient()

  const { count, error } = await supabase
    .from("notificacoes")
    .select("*", { count: "exact", head: true })
    .eq("membro_id", membroId)
    .eq("lida", false)

  if (error) {
    console.error("Error counting notificacoes:", error)
    return 0
  }

  return count || 0
}
