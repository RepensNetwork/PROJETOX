"use server"

import { createClient } from "@/lib/supabase/server"
import type { Navio, Escala } from "@/lib/types/database"
import { revalidatePath } from "next/cache"

export async function getNavios(): Promise<Navio[]> {
  const supabase = await createClient()

  const { data: navios, error } = await supabase
    .from("navios")
    .select("*")
    .order("nome", { ascending: true })

  if (error) {
    console.error("Error fetching navios:", error)
    return []
  }

  return navios || []
}

export async function getNavio(id: string): Promise<Navio | null> {
  const supabase = await createClient()

  const { data: navio, error } = await supabase
    .from("navios")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching navio:", error)
    return null
  }

  return navio
}

export async function getNavioWithEscalas(id: string): Promise<(Navio & { escalas: Escala[] }) | null> {
  const supabase = await createClient()

  const { data: navio, error } = await supabase
    .from("navios")
    .select(`
      *,
      escalas(*)
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching navio with escalas:", error)
    return null
  }

  return navio
}

export async function createNavio(data: {
  nome: string
  companhia: string
  observacoes?: string
}): Promise<{ success: boolean; navio?: Navio; error?: string }> {
  const supabase = await createClient()

  const { data: navio, error } = await supabase
    .from("navios")
    .insert(data)
    .select()
    .single()

  if (error) {
    console.error("Error creating navio:", error)
    return { success: false, error: error.message }
  }

  if (!navio) {
    console.error("Error: navio is null after creation")
    return { success: false, error: "Falha ao criar navio. Banco de dados não conectado ou erro desconhecido." }
  }

  revalidatePath("/navios")
  revalidatePath(`/navios/${navio.id}`)
  revalidatePath("/dashboard")

  return { success: true, navio }
}

export async function updateNavio(
  id: string,
  data: {
    nome?: string
    companhia?: string
    observacoes?: string
  }
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const updateData: any = {
    ...data,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from("navios")
    .update(updateData)
    .eq("id", id)

  if (error) {
    console.error("Error updating navio:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/navios")
  revalidatePath(`/navios/${id}`)
  revalidatePath("/dashboard")

  return { success: true }
}

export async function deleteNavio(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from("navios")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error deleting navio:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/navios")
  revalidatePath("/dashboard")

  return { success: true }
}
