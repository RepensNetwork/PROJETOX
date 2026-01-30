"use server"

import { createClient } from "@/lib/supabase/server"
import type { Demanda } from "@/lib/types/database"
import type { ReservaItem, UpdateReservaHotelInput } from "@/lib/reservas"
import { revalidatePath } from "next/cache"

/** Lista apenas demandas tipo reserva_hotel (tripulantes que precisam de hotel) */
export async function getReservasHotel(): Promise<ReservaItem[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("demandas")
    .select(`
      *,
      escala:escalas(*, navio:navios(*))
    `)
    .eq("tipo", "reserva_hotel")
    .order("reserva_checkin", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching reservas hotel:", error)
    return []
  }

  const items = (data || []) as ReservaItem[]
  const paiIds = [...new Set(items.map((r) => r.demanda_pai_id).filter(Boolean))] as string[]
  if (paiIds.length > 0) {
    const { data: pais } = await supabase
      .from("demandas")
      .select("id, titulo")
      .in("id", paiIds)
    const paiMap = new Map((pais || []).map((p) => [p.id, p]))
    items.forEach((r) => {
      if (r.demanda_pai_id && paiMap.has(r.demanda_pai_id)) {
        r.demanda_pai = paiMap.get(r.demanda_pai_id) as Demanda
      }
    })
  }
  return items
}

export async function updateReservaHotel(
  demandaId: string,
  input: UpdateReservaHotelInput
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }
  if (input.reserva_hotel_nome !== undefined) payload.reserva_hotel_nome = input.reserva_hotel_nome || null
  if (input.reserva_hotel_endereco !== undefined) payload.reserva_hotel_endereco = input.reserva_hotel_endereco || null
  if (input.reserva_checkin !== undefined) payload.reserva_checkin = input.reserva_checkin || null
  if (input.reserva_checkout !== undefined) payload.reserva_checkout = input.reserva_checkout || null
  if (input.reserva_valor !== undefined) payload.reserva_valor = input.reserva_valor ?? null
  if (input.reserva_cafe_incluso !== undefined) payload.reserva_cafe_incluso = input.reserva_cafe_incluso ?? false
  if (input.reserva_almoco_incluso !== undefined) payload.reserva_almoco_incluso = input.reserva_almoco_incluso ?? false
  if (input.reserva_confirmado !== undefined) payload.reserva_confirmado = input.reserva_confirmado ?? false

  const { error } = await supabase
    .from("demandas")
    .update(payload)
    .eq("id", demandaId)
    .eq("tipo", "reserva_hotel")

  if (error) {
    console.error("Error updating reserva hotel:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/reservas")
  revalidatePath("/demandas")
  return { success: true }
}
