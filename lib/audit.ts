"use server"

import type { SupabaseClient } from "@supabase/supabase-js"

export type AuditPayload = {
  entity: string
  entity_id: string
  action: string
  old_values?: Record<string, unknown> | null
  new_values?: Record<string, unknown> | null
}

/** Obtém o actor (membro) atual a partir do Supabase auth e da tabela membros. */
export async function getAuditActor(supabase: SupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data: membro } = await supabase
    .from("membros")
    .select("id, email")
    .eq("email", user?.email ?? "")
    .single()
  return {
    actor_id: membro?.id ?? null,
    actor_email: membro?.email ?? user?.email ?? null,
  }
}

/** Insere um registro em audit_logs com o usuário atual como actor. Não falha a operação principal se o log falhar. */
export async function insertAuditLog(
  supabase: SupabaseClient,
  payload: AuditPayload
): Promise<void> {
  try {
    const { actor_id, actor_email } = await getAuditActor(supabase)
    await supabase.from("audit_logs").insert({
      entity: payload.entity,
      entity_id: payload.entity_id,
      action: payload.action,
      old_values: payload.old_values ?? null,
      new_values: payload.new_values ?? null,
      actor_id,
      actor_email,
    })
  } catch (e) {
    console.warn("Audit log insert failed (non-fatal):", e)
  }
}
