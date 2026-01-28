import { NextResponse } from "next/server"
import { createDemanda } from "@/app/actions/demandas"

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)

  const escala_id = body?.escala_id
  const tipo = body?.tipo
  const categoria = body?.categoria
  const prioridade = body?.prioridade
  const titulo = body?.titulo
  const descricao = body?.descricao
  const prazo = body?.prazo

  if (!escala_id || !tipo || !categoria || !prioridade || !titulo) {
    return NextResponse.json(
      { success: false, error: "Campos obrigatórios ausentes para salvar a demanda." },
      { status: 400 }
    )
  }

  const result = await createDemanda({
    escala_id,
    tipo,
    categoria,
    titulo,
    descricao,
    status: "pendente",
    prioridade,
    prazo,
  })

  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 500 })
  }

  return NextResponse.json({ success: true, demanda: result.demanda })
}
