import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { buildTransportLegs, type TransporteLeg } from "@/lib/transportes"

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)

  const demandaId = body?.demandaId as string | undefined
  const legId = body?.legId as string | undefined
  const grupo = body?.grupo as string | undefined
  const status = body?.status as string | undefined
  const action = body?.action as string | undefined
  const duracao_minutos = body?.duracao_minutos as number | undefined

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
    const next: TransporteLeg = {
      ...leg,
      status:
        action === "undo"
          ? "pendente"
          : (status as TransporteLeg["status"]) || "concluido",
      concluido_em: action === "undo" ? null : new Date().toISOString(),
    }
    if (grupo !== undefined) next.grupo = grupo || null
    if (action === "undo") next.duracao_minutos = null
    else if (duracao_minutos !== undefined) next.duracao_minutos = duracao_minutos == null || Number.isNaN(Number(duracao_minutos)) ? null : Number(duracao_minutos)
    return next
  })

  const allDone = updatedLegs.every((leg) => leg.status === "concluido")

  const { error } = await supabase
    .from("demandas")
    .update({
      transporte_legs: updatedLegs,
      transporte_status: allDone ? "concluido" : "pendente",
      transporte_concluido_em: allDone ? new Date().toISOString() : null,
    })
    .eq("id", demandaId)

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  const oldLeg = legs.find((leg) => leg.id === legId) || null
  const newLeg = updatedLegs.find((leg) => leg.id === legId) || null

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
    entity_id: demandaId,
    action: action === "undo" ? "undo_leg" : "confirm_leg",
    old_values: oldLeg,
    new_values: newLeg,
    actor_id: membro?.id ?? null,
    actor_email: membro?.email ?? user?.email ?? null,
  })

  await supabase.from("historico").insert({
    demanda_id: demandaId,
    acao: action === "undo" ? "Transporte reativado" : "Transporte concluído",
    detalhes: { grupo: grupo || null, leg_id: legId },
  })

  revalidatePath("/motorista")

  return NextResponse.json({ success: true })
}
