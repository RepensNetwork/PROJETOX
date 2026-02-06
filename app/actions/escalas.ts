"use server"

import { createClient } from "@/lib/supabase/server"
import type { Escala, Navio, Demanda, Membro } from "@/lib/types/database"
import { revalidatePath, unstable_cache, revalidateTag } from "next/cache"
import { insertAuditLog } from "@/lib/audit"

async function fetchEscalas(limit?: number): Promise<(Escala & { navio: Navio })[]> {
  const supabase = await createClient()
  const base = supabase
    .from("escalas")
    .select(`*, navio:navios(id, nome, companhia)`)
    .order("data_chegada", { ascending: false })
  const { data: escalas, error } = limit != null ? await base.limit(limit) : await base
  if (error) {
    console.error("Error fetching escalas:", error)
    return []
  }
  return escalas || []
}

export async function getEscalas(limit?: number): Promise<(Escala & { navio: Navio })[]> {
  const key = `escalas-${limit ?? "all"}`
  return unstable_cache(() => fetchEscalas(limit), [key], {
    revalidate: 45,
    tags: ["escalas"],
  })()
}

export async function getEscala(id: string): Promise<Escala | null> {
  const supabase = await createClient()

  const { data: escala, error } = await supabase
    .from("escalas")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching escala:", error)
    return null
  }

  return escala
}

export async function getEscalaWithDetails(id: string): Promise<(Escala & { 
  navio: Navio; 
  demandas: (Demanda & { responsavel: Membro | null })[] 
}) | null> {
  const supabase = await createClient()

  const { data: escala, error } = await supabase
    .from("escalas")
    .select(`
      *,
      navio:navios(*),
      demandas(*, responsavel:membros(*))
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching escala with details:", error)
    return null
  }

  return escala
}

export async function createEscala(data: {
  navio_id: string
  porto: string
  data_chegada: string
  data_saida: string
  status: Escala["status"]
  observacoes?: string
}): Promise<{ success: boolean; escala?: Escala; error?: string }> {
  const supabase = await createClient()

  const { data: escala, error } = await supabase
    .from("escalas")
    .insert({
      ...data,
      observacoes: data.observacoes || null,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating escala:", error)
    return { success: false, error: error.message }
  }

  if (!escala) {
    console.error("Error: escala is null after creation")
    return { success: false, error: "Falha ao criar escala. Banco de dados não conectado ou erro desconhecido." }
  }

  await insertAuditLog(supabase, {
    entity: "escalas",
    entity_id: escala.id,
    action: "create",
    old_values: null,
    new_values: escala as Record<string, unknown>,
  })
  revalidateTag("escalas")
  revalidatePath("/escalas")
  revalidatePath(`/escalas/${escala.id}`)
  revalidatePath("/dashboard")

  return { success: true, escala }
}

export async function updateEscala(
  id: string,
  data: {
    navio_id?: string
    porto?: string
    data_chegada?: string
    data_saida?: string
    status?: Escala["status"]
    observacoes?: string
  }
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: oldRow } = await supabase.from("escalas").select("*").eq("id", id).single()
  const updateData: any = {
    ...data,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from("escalas")
    .update(updateData)
    .eq("id", id)

  if (error) {
    console.error("Error updating escala:", error)
    return { success: false, error: error.message }
  }

  const oldValues: Record<string, unknown> = {}
  const newValues: Record<string, unknown> = {}
  for (const key of ["navio_id", "porto", "data_chegada", "data_saida", "status", "observacoes"] as const) {
    if (data[key] !== undefined && oldRow) {
      oldValues[key] = oldRow[key] ?? null
      newValues[key] = data[key] ?? null
    }
  }
  if (Object.keys(newValues).length > 0) {
    await insertAuditLog(supabase, {
      entity: "escalas",
      entity_id: id,
      action: "update",
      old_values: oldValues,
      new_values: newValues,
    })
  }
  revalidateTag("escalas")
  revalidatePath("/escalas")
  revalidatePath(`/escalas/${id}`)
  revalidatePath("/dashboard")

  return { success: true }
}

export async function deleteEscala(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: oldRow } = await supabase.from("escalas").select("*").eq("id", id).single()
  const { error } = await supabase
    .from("escalas")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error deleting escala:", error)
    return { success: false, error: error.message }
  }

  await insertAuditLog(supabase, {
    entity: "escalas",
    entity_id: id,
    action: "delete",
    old_values: oldRow as Record<string, unknown> ?? null,
    new_values: null,
  })
  revalidateTag("escalas")
  revalidatePath("/escalas")
  revalidatePath("/dashboard")

  return { success: true }
}
