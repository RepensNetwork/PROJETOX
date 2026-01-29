import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { buildTransportLegs, type TransporteLeg } from "@/lib/transportes"

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)

  const demandaId = body?.demandaId as string | undefined
  const legId = body?.legId as string | undefined
  const pickup_at = body?.pickup_at as string | undefined
  const pickup_local = body?.pickup_local as string | undefined
  const dropoff_local = body?.dropoff_local as string | undefined
  const label = body?.label as string | undefined

  if (!demandaId || !legId) {
    return NextResponse.json({ success: false, error: "demandaId e legId obrigatórios" }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: demanda, error: demandaError } = await supabase
    .from("demandas")
    .select("*")
    .eq("id", demandaId)
    .single()

  if (demandaError || !demanda) {
    return NextResponse.json({ success: false, error: "Demanda não encontrada" }, { status: 404 })
  }

  const legs = buildTransportLegs(demanda)
  const updatedLegs = legs.map((leg) => {
    if (leg.id !== legId) return leg
    return {
      ...leg,
      label: label ?? leg.label,
      pickup_at: pickup_at ?? leg.pickup_at ?? null,
      pickup_local: pickup_local ?? leg.pickup_local ?? null,
      dropoff_local: dropoff_local ?? leg.dropoff_local ?? null,
    } satisfies TransporteLeg
  })

  const primaryLeg = updatedLegs[0]
  const updateData: Record<string, unknown> = {
    transporte_legs: updatedLegs,
  }

  if (primaryLeg?.id === legId) {
    updateData.pickup_at = primaryLeg.pickup_at ?? null
    updateData.pickup_local = primaryLeg.pickup_local ?? null
    updateData.dropoff_local = primaryLeg.dropoff_local ?? null
  }

  const { error } = await supabase.from("demandas").update(updateData).eq("id", demandaId)

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  revalidatePath("/motorista")

  return NextResponse.json({ success: true })
}
