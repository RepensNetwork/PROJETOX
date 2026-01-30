"use server"

import { createClient } from "@/lib/supabase/server"
import type { Membro } from "@/lib/types/database"
import { revalidatePath } from "next/cache"

export interface CreateMembroInput {
  nome: string
  email: string
  ativo?: boolean
  is_admin?: boolean
  allowed_pages?: string[] | null
}

export async function createMembro(
  input: CreateMembroInput
): Promise<{ success: boolean; error?: string; id?: string }> {
  const nome = input.nome?.trim()
  const email = input.email?.trim().toLowerCase()

  if (!nome || !email) {
    return { success: false, error: "Nome e e-mail são obrigatórios." }
  }

  const supabase = await createClient()

  const { data: existing } = await supabase
    .from("membros")
    .select("id")
    .eq("email", email)
    .maybeSingle()

  if (existing) {
    return { success: false, error: "Já existe um usuário com este e-mail." }
  }

  const { data: novo, error } = await supabase
    .from("membros")
    .insert({
      nome,
      email,
      ativo: input.ativo ?? true,
      is_admin: input.is_admin ?? false,
      allowed_pages: input.is_admin ? null : (input.allowed_pages ?? []),
    })
    .select("id")
    .single()

  if (error) {
    console.error("Error creating membro:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/usuarios")
  revalidatePath("/admin/usuarios/novo")
  return { success: true, id: novo?.id }
}
