"use server"

import { createClient } from "@/lib/supabase/server"
import type { Demanda, Escala, Navio, Membro, Comentario, Historico } from "@/lib/types/database"
import { revalidatePath } from "next/cache"

export async function getDemandas(): Promise<(Demanda & { escala: Escala & { navio: Navio }; responsavel: Membro | null })[]> {
  const supabase = await createClient()

  const { data: demandas, error } = await supabase
    .from("demandas")
    .select(`
      *,
      escala:escalas(*, navio:navios(*)),
      responsavel:membros(*)
    `)
    .order("updated_at", { ascending: false })

  if (error) {
    console.error("Error fetching demandas:", error)
    return []
  }

  return demandas || []
}

export async function getDemanda(id: string): Promise<Demanda | null> {
  const supabase = await createClient()

  const { data: demanda, error } = await supabase
    .from("demandas")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching demanda:", error)
    return null
  }

  return demanda
}

export async function getDemandaWithDetails(id: string): Promise<(Demanda & { 
  escala: Escala & { navio: Navio }; 
  responsavel: Membro | null;
  comentarios: (Comentario & { membro: Membro | null })[];
  historico: (Historico & { membro: Membro | null })[];
}) | null> {
  const supabase = await createClient()

  const { data: demanda, error } = await supabase
    .from("demandas")
    .select(`
      *,
      escala:escalas(*, navio:navios(*)),
      responsavel:membros(*),
      comentarios(*, membro:membros(*)),
      historico(*, membro:membros(*))
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching demanda with details:", error)
    return null
  }

  return demanda
}

export async function createDemanda(data: {
  escala_id: string
  tipo: Demanda["tipo"]
  categoria: Demanda["categoria"]
  titulo: string
  descricao?: string
  pickup_at?: string | null
  pickup_local?: string | null
  dropoff_local?: string | null
  status: Demanda["status"]
  prioridade: Demanda["prioridade"]
  responsavel_id?: string
  prazo?: string
}): Promise<{ success: boolean; demanda?: Demanda; error?: string }> {
  try {
    console.log("createDemanda chamado com:", data)
    
    // Validações
    if (!data.escala_id || data.escala_id.trim() === "") {
      return { success: false, error: "Escala é obrigatória" }
    }
    
    if (!data.tipo) {
      return { success: false, error: "Tipo é obrigatório" }
    }
    
    if (!data.categoria) {
      return { success: false, error: "Categoria é obrigatória" }
    }
    
    if (!data.titulo || data.titulo.trim() === "") {
      return { success: false, error: "Título é obrigatório" }
    }

    const supabase = await createClient()

    const insertData = {
      escala_id: data.escala_id,
      tipo: data.tipo,
      categoria: data.categoria,
      titulo: data.titulo.trim(),
      descricao: data.descricao?.trim() || null,
      pickup_at: data.pickup_at || null,
      pickup_local: data.pickup_local?.trim() || null,
      dropoff_local: data.dropoff_local?.trim() || null,
      status: data.status,
      prioridade: data.prioridade,
      responsavel_id: data.responsavel_id || null,
      prazo: data.prazo || null,
    }

    console.log("Inserindo no banco:", insertData)

    const { data: demanda, error } = await supabase
      .from("demandas")
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error("Error creating demanda:", error)
      return { success: false, error: `Erro ao criar demanda: ${error.message}` }
    }

    if (!demanda) {
      console.error("Error: demanda is null after creation")
      return { success: false, error: "Falha ao criar demanda. Banco de dados não conectado ou erro desconhecido." }
    }

    console.log("Demanda criada com sucesso:", demanda)

    const {
      data: { user },
    } = await supabase.auth.getUser()
    const { data: membro } = await supabase
      .from("membros")
      .select("id, email")
      .eq("email", user?.email ?? "")
      .single()

    await supabase.from("audit_logs").insert({
      entity: "demandas",
      entity_id: demanda.id,
      action: "create",
      old_values: null,
      new_values: demanda,
      actor_id: membro?.id ?? null,
      actor_email: membro?.email ?? user?.email ?? null,
    })

    // Add to history
    try {
      await supabase.from("historico").insert({
        demanda_id: demanda.id,
        acao: "Demanda criada",
        detalhes: { titulo: demanda.titulo },
      })
    } catch (historyError) {
      console.warn("Erro ao adicionar histórico (não crítico):", historyError)
    }

    revalidatePath("/demandas")
    revalidatePath(`/demandas/${demanda.id}`)
    revalidatePath("/dashboard")

    return { success: true, demanda }
  } catch (error: any) {
    console.error("Erro inesperado em createDemanda:", error)
    return { success: false, error: error?.message || "Erro inesperado ao criar demanda" }
  }
}

export async function updateDemanda(
  id: string,
  data: {
    titulo?: string
    descricao?: string
    pickup_at?: string | null
    pickup_local?: string | null
    dropoff_local?: string | null
    status?: Demanda["status"]
    prioridade?: Demanda["prioridade"]
    responsavel_id?: string | null
    prazo?: string | null
  }
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  // Get current demanda for history
  const { data: currentDemanda } = await supabase
    .from("demandas")
    .select("*")
    .eq("id", id)
    .single()

  const { error } = await supabase
    .from("demandas")
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    console.error("Error updating demanda:", error)
    return { success: false, error: error.message }
  }

  const trackFields: Array<keyof typeof data> = [
    "titulo",
    "descricao",
    "pickup_at",
    "pickup_local",
    "dropoff_local",
    "status",
    "prioridade",
    "responsavel_id",
    "prazo",
  ]
  const oldValues: Record<string, unknown> = {}
  const newValues: Record<string, unknown> = {}
  for (const field of trackFields) {
    if (data[field] !== undefined && data[field] !== (currentDemanda as any)?.[field]) {
      oldValues[field] = (currentDemanda as any)?.[field] ?? null
      newValues[field] = data[field] ?? null
    }
  }

  if (Object.keys(newValues).length > 0) {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const { data: membro } = await supabase
      .from("membros")
      .select("id, email")
      .eq("email", user?.email ?? "")
      .single()

    await supabase.from("audit_logs").insert({
      entity: "demandas",
      entity_id: id,
      action: "update",
      old_values: oldValues,
      new_values: newValues,
      actor_id: membro?.id ?? null,
      actor_email: membro?.email ?? user?.email ?? null,
    })
  }

  // Add to history
  const changes: string[] = []
  if (data.status && data.status !== currentDemanda?.status) {
    changes.push(`Status alterado para ${data.status}`)
  }
  if (data.prioridade && data.prioridade !== currentDemanda?.prioridade) {
    changes.push(`Prioridade alterada para ${data.prioridade}`)
  }
  if (data.titulo && data.titulo !== currentDemanda?.titulo) {
    changes.push("Título alterado")
  }
  if (changes.length > 0) {
    await supabase.from("historico").insert({
      demanda_id: id,
      acao: changes.join(", "),
      detalhes: data,
    })
  }

  revalidatePath("/sistema")

  return { success: true }
}

export async function deleteDemanda(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from("demandas")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error deleting demanda:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/sistema")

  return { success: true }
}

export async function addComentario(
  demandaId: string,
  membroId: string,
  conteudo: string
): Promise<{ success: boolean; comentario?: Comentario; error?: string }> {
  const supabase = await createClient()

  const { data: comentario, error } = await supabase
    .from("comentarios")
    .insert({
      demanda_id: demandaId,
      membro_id: membroId,
      conteudo,
    })
    .select(`*, membro:membros(*)`)
    .single()

  if (error) {
    console.error("Error adding comentario:", error)
    return { success: false, error: error.message }
  }

  if (!comentario) {
    console.error("Error: comentario is null after creation")
    return { success: false, error: "Falha ao adicionar comentário. Banco de dados não conectado ou erro desconhecido." }
  }

  // Update demanda timestamp
  await supabase
    .from("demandas")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", demandaId)

  revalidatePath("/sistema")

  return { success: true, comentario: comentario as Comentario }
}

export async function getEscalasForSelect(): Promise<(Escala & { navio: Navio })[]> {
  const supabase = await createClient()

  const { data: escalas, error } = await supabase
    .from("escalas")
    .select(`
      *,
      navio:navios(*)
    `)
    .in("status", ["planejada", "em_operacao"])
    .order("data_chegada", { ascending: true })

  if (error) {
    console.error("Error fetching escalas for select:", error)
    return []
  }

  return escalas || []
}
