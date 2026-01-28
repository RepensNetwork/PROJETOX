"use server"

import { createClient } from "@/lib/supabase/server"
import type { Mensagem, Membro, Escala, Mencao } from "@/lib/types/database"
import { revalidatePath } from "next/cache"
import { criarNotificacoes } from "./notificacoes"

export async function getMensagens(escalaId: string): Promise<(Mensagem & { autor: Membro; mencoes?: any[] })[]> {
  const supabase = await createClient()

  const { data: mensagens, error } = await supabase
    .from("mensagens")
    .select(`
      *,
      autor:membros(*),
      mencoes:mensagem_mencoes(*, membro:membros(*))
    `)
    .eq("escala_id", escalaId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching mensagens:", error)
    return []
  }

  // Mapear para garantir que a estrutura está correta
  return (mensagens || []).map(m => ({
    ...m,
    autor: (m as any).autor || null,
    mencoes: (m as any).mencoes || [],
  }))
}

// Extrair menções do texto (formato @nome ou @id)
function extrairMencoes(conteudo: string, membros: Membro[]): string[] {
  const mencoes: string[] = []
  const regex = /@(\w+)/g
  const matches = conteudo.matchAll(regex)
  
  for (const match of matches) {
    const mencionado = match[1]
    // Tentar encontrar por nome ou ID
    const membro = membros.find(m => 
      m.nome.toLowerCase().includes(mencionado.toLowerCase()) ||
      m.id === mencionado ||
      m.email.toLowerCase().includes(mencionado.toLowerCase())
    )
    if (membro && !mencoes.includes(membro.id)) {
      mencoes.push(membro.id)
    }
  }
  
  return mencoes
}

export async function sendMensagem(
  escalaId: string,
  membroId: string,
  conteudo: string,
  todosMembros?: Membro[]
): Promise<{ success: boolean; mensagem?: Mensagem & { autor: Membro }; error?: string }> {
  const supabase = await createClient()

  if (!conteudo || conteudo.trim() === "") {
    return { success: false, error: "A mensagem não pode estar vazia" }
  }

  // Buscar todos os membros se não foram fornecidos
  let membros = todosMembros
  if (!membros) {
    const { data: membrosData } = await supabase
      .from("membros")
      .select("*")
    membros = membrosData || []
  }

  // Extrair menções do conteúdo
  const membrosMencionados = extrairMencoes(conteudo, membros || [])

  const { data: mensagem, error } = await supabase
    .from("mensagens")
    .insert({
      escala_id: escalaId,
      membro_id: membroId,
      conteudo: conteudo.trim(),
    })
    .select(`
      *,
      autor:membros(*)
    `)
    .single()

  // Se a query não trouxe o autor, buscar separadamente
  if (mensagem && !(mensagem as any).autor) {
    const { data: autor } = await supabase
      .from("membros")
      .select("*")
      .eq("id", membroId)
      .single()
    
    if (autor) {
      (mensagem as any).autor = autor
    }
  }

  if (error) {
    console.error("Error sending mensagem:", error)
    return { success: false, error: error.message }
  }

  // Salvar menções
  if (membrosMencionados.length > 0 && mensagem) {
    const mencoes = membrosMencionados.map(membroId => ({
      mensagem_id: mensagem.id,
      membro_id: membroId,
    }))

    await supabase
      .from("mensagem_mencoes")
      .insert(mencoes)

    // Criar notificações para os mencionados
    await criarNotificacoes(mensagem.id, escalaId, membrosMencionados)
  }

  revalidatePath(`/escalas/${escalaId}`)
  return { success: true, mensagem }
}

export async function updateMensagem(
  mensagemId: string,
  conteudo: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  if (!conteudo || conteudo.trim() === "") {
    return { success: false, error: "A mensagem não pode estar vazia" }
  }

  const { error } = await supabase
    .from("mensagens")
    .update({
      conteudo: conteudo.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", mensagemId)

  if (error) {
    console.error("Error updating mensagem:", error)
    return { success: false, error: error.message }
  }

  // Revalidar a página da escala
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

export async function deleteMensagem(
  mensagemId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  // Buscar escala_id antes de deletar para revalidar
  const { data: mensagem } = await supabase
    .from("mensagens")
    .select("escala_id")
    .eq("id", mensagemId)
    .single()

  const { error } = await supabase
    .from("mensagens")
    .delete()
    .eq("id", mensagemId)

  if (error) {
    console.error("Error deleting mensagem:", error)
    return { success: false, error: error.message }
  }

  if (mensagem) {
    revalidatePath(`/escalas/${mensagem.escala_id}`)
  }

  return { success: true }
}
