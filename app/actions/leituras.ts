"use server"

import { createClient } from "@/lib/supabase/server"
import type { LeituraMensagem, Membro } from "@/lib/types/database"
import { revalidatePath } from "next/cache"

export async function marcarMensagemComoLida(
  mensagemId: string,
  membroId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  // Verificar se já existe leitura
  const { data: existe } = await supabase
    .from("mensagem_leituras")
    .select("id")
    .eq("mensagem_id", mensagemId)
    .eq("membro_id", membroId)
    .single()

  if (existe) {
    // Atualizar timestamp
    const { error } = await supabase
      .from("mensagem_leituras")
      .update({ lida_em: new Date().toISOString() })
      .eq("id", existe.id)

    if (error) {
      console.error("Error updating leitura:", error)
      return { success: false, error: error.message }
    }
  } else {
    // Criar nova leitura
    const { error } = await supabase
      .from("mensagem_leituras")
      .insert({
        mensagem_id: mensagemId,
        membro_id: membroId,
      })

    if (error) {
      console.error("Error creating leitura:", error)
      return { success: false, error: error.message }
    }
  }

  // Buscar escala_id para revalidar
  const { data: mensagem } = await supabase
    .from("mensagens")
    .select("escala_id")
    .eq("id", mensagemId)
    .single()

  if (mensagem) {
    revalidatePath(`/escalas/${mensagem.escala_id}`)
  }

  return { success: true }
}

export async function getLeiturasMensagem(
  mensagemId: string
): Promise<(LeituraMensagem & { membro: Membro })[]> {
  const supabase = await createClient()

  const { data: leituras, error } = await supabase
    .from("mensagem_leituras")
    .select(`
      *,
      membro:membros(*)
    `)
    .eq("mensagem_id", mensagemId)
    .order("lida_em", { ascending: false })

  if (error) {
    console.error("Error fetching leituras:", error)
    return []
  }

  return (leituras || []).map(l => ({
    ...l,
    membro: (l as any).membro || null,
  }))
}

export async function marcarTodasMensagensComoLidas(
  escalaId: string,
  membroId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  // Buscar todas as mensagens da escala que ainda não foram lidas
  const { data: mensagens } = await supabase
    .from("mensagens")
    .select("id")
    .eq("escala_id", escalaId)

  if (!mensagens || mensagens.length === 0) {
    return { success: true }
  }

  const mensagemIds = mensagens.map(m => m.id)

  // Buscar leituras existentes
  const { data: leiturasExistentes } = await supabase
    .from("mensagem_leituras")
    .select("mensagem_id")
    .eq("membro_id", membroId)
    .in("mensagem_id", mensagemIds)

  const lidasIds = new Set(leiturasExistentes?.map(l => l.mensagem_id) || [])

  // Criar leituras para mensagens não lidas
  const novasLeituras = mensagemIds
    .filter(id => !lidasIds.has(id))
    .map(mensagemId => ({
      mensagem_id: mensagemId,
      membro_id: membroId,
    }))

  if (novasLeituras.length > 0) {
    const { error } = await supabase
      .from("mensagem_leituras")
      .insert(novasLeituras)

    if (error) {
      console.error("Error creating leituras:", error)
      return { success: false, error: error.message }
    }
  }

  revalidatePath(`/escalas/${escalaId}`)
  return { success: true }
}
