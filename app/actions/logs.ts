"use server"

import { createClient } from "@/lib/supabase/server"
import type { AuditLog } from "@/lib/types/database"

export async function getAuditLogs(limit = 200): Promise<AuditLog[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching audit logs:", error)
    return []
  }

  return data || []
}
