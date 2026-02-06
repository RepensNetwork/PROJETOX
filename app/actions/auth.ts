"use server"

import { cache } from "react"
import { createClient } from "@/lib/supabase/server"
import type { Membro } from "@/lib/types/database"

export const getCurrentUser = cache(async (): Promise<{ user: any; membro: Membro | null } | null> => {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return null
  }

  // Buscar membro correspondente ao email do usuário
  const { data: membro, error: membroError } = await supabase
    .from("membros")
    .select("*")
    .eq("email", user.email)
    .single()

  if (membroError || !membro) {
    return { user, membro: null }
  }

  return { user, membro }
})

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
}
