import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { DemandaCategoria, DemandaPrioridade } from "@/lib/types/database"
import { revalidatePath } from "next/cache"

const validCategorias: DemandaCategoria[] = [
  "passageiros",
  "saude",
  "suprimentos",
  "abastecimento",
  "autoridades",
  "logistica",
  "processos_internos",
]

const validPrioridades: DemandaPrioridade[] = ["baixa", "media", "alta", "urgente"]

const normalizePrioridade = (value?: string | null): DemandaPrioridade => {
  if (!value) return "media"
  const normalized = value.toLowerCase()
  if (validPrioridades.includes(normalized as DemandaPrioridade)) {
    return normalized as DemandaPrioridade
  }
  return "media"
}

const buildDescricaoFromEmail = (email: {
  subject?: string | null
  from_name?: string | null
  from_email?: string | null
  received_at?: string | null
  body_clean_text?: string | null
}) => {
  const parts: string[] = []
  if (email.subject) {
    parts.push(`Assunto: ${email.subject}`)
  }
  const fromLabel = email.from_name || email.from_email
  if (fromLabel) {
    const extra = email.from_email && email.from_name ? ` <${email.from_email}>` : ""
    parts.push(`Remetente: ${fromLabel}${extra}`)
  }
  if (email.received_at) {
    parts.push(`Recebido em: ${new Date(email.received_at).toLocaleString("pt-BR")}`)
  }
  if (email.body_clean_text) {
    parts.push("\n" + email.body_clean_text.trim())
  }
  return parts.filter(Boolean).join("\n").trim()
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const emailIds = Array.isArray(body?.emailIds) ? body.emailIds.filter(Boolean) : []
  const navioId = body?.navioId as string | undefined
  const escalaId = body?.escalaId as string | undefined
  const categoria = body?.categoria as DemandaCategoria | undefined

  if (!emailIds.length || !navioId || !escalaId || !categoria) {
    return NextResponse.json(
      { success: false, error: "Selecione emails, navio, escala e categoria." },
      { status: 400 }
    )
  }

  if (!validCategorias.includes(categoria)) {
    return NextResponse.json({ success: false, error: "Categoria inválida." }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: navio, error: navioError } = await supabase
    .from("navios")
    .select("id, nome")
    .eq("id", navioId)
    .single()

  if (navioError || !navio) {
    return NextResponse.json({ success: false, error: "Navio não encontrado." }, { status: 400 })
  }

  const { data: emails, error: emailsError } = await supabase
    .from("emails")
    .select("*")
    .in("id", emailIds)

  if (emailsError) {
    return NextResponse.json({ success: false, error: emailsError.message }, { status: 500 })
  }

  let created = 0
  let skipped = 0
  let failed = 0

  for (const email of emails || []) {
    if (email.demanda_id) {
      skipped += 1
      continue
    }

    const titulo = email.subject?.trim() || "Demanda via inbox"
    const descricao = buildDescricaoFromEmail(email)
    const prioridade = normalizePrioridade(email.priority)

    const { data: demanda, error: demandaError } = await supabase
      .from("demandas")
      .insert({
        escala_id: escalaId,
        tipo: "outro",
        categoria,
        titulo,
        descricao,
        status: "pendente",
        prioridade,
        prazo: email.due_at || null,
      })
      .select("id")
      .single()

    if (demandaError || !demanda?.id) {
      failed += 1
      continue
    }

    await supabase
      .from("emails")
      .update({
        demanda_id: demanda.id,
        status: "assigned",
        navio_id: navio.id,
        ship: navio.nome,
      })
      .eq("id", email.id)

    await supabase.from("historico").insert({
      demanda_id: demanda.id,
      acao: "Demanda criada via inbox",
      detalhes: { origem: "email", email_id: email.id },
    })

    created += 1
  }

  if (created > 0) {
    revalidatePath("/emails")
    revalidatePath("/demandas")
    revalidatePath("/dashboard")
    revalidatePath("/sistema")
  }

  return NextResponse.json({ success: true, created, skipped, failed })
}
