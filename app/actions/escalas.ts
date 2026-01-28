"use server"

import { createClient } from "@/lib/supabase/server"
import type { Escala, Navio, Demanda, Membro } from "@/lib/types/database"
import { revalidatePath } from "next/cache"

export async function getEscalas(): Promise<(Escala & { navio: Navio })[]> {
  const supabase = await createClient()

  const { data: escalas, error } = await supabase
    .from("escalas")
    .select(`
      *,
      navio:navios(*)
    `)
    .order("data_chegada", { ascending: false })

  if (error) {
    console.error("Error fetching escalas:", error)
    return []
  }

  return escalas || []
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

  revalidatePath("/escalas")
  revalidatePath(`/escalas/${id}`)
  revalidatePath("/dashboard")

  return { success: true }
}

export async function deleteEscala(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from("escalas")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error deleting escala:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/escalas")
  revalidatePath("/dashboard")

  return { success: true }
}
