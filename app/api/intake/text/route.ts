import { NextResponse } from "next/server"
import OpenAI from "openai"
import { TaskSchema } from "@/lib/taskSchema"

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()

const normalizeCategory = (value?: string) => {
  if (!value) return "Outro"
  const text = normalizeText(value)
  if (text.includes("operacao")) return "Operacao"
  if (text.includes("financeiro")) return "Financeiro"
  if (text.includes("comercial")) return "Comercial"
  if (text === "ti" || text.includes("tecnologia")) return "TI"
  if (text.includes("compras")) return "Compras"
  return "Outro"
}

const normalizePriority = (value?: string) => {
  if (!value) return "medium"
  const text = normalizeText(value)
  if (text.includes("urgente") || text.includes("urgent")) return "urgent"
  if (text.includes("alta") || text.includes("high")) return "high"
  if (text.includes("media") || text.includes("medium")) return "medium"
  if (text.includes("baixa") || text.includes("low")) return "low"
  return "medium"
}

const normalizeDueDate = (value?: string) => {
  if (!value) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString().slice(0, 10)
}

const normalizeSubtasks = (value: unknown) => {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      if (typeof item === "string") {
        return { title: item, owner: null }
      }
      if (item && typeof item === "object" && "title" in item) {
        const title = String((item as any).title || "").trim()
        const owner = (item as any).owner ?? null
        return title ? { title, owner } : null
      }
      return null
    })
    .filter(Boolean) as Array<{ title: string; owner: string | null }>
}

const normalizeTask = (raw: any) => {
  const title = String(raw?.title || raw?.titulo || raw?.subject || "").trim()
  const description = String(raw?.description || raw?.descricao || raw?.body || "").trim()
  return {
    title,
    description,
    context: raw?.context ?? raw?.contexto ?? null,
    requester: raw?.requester ?? raw?.solicitante ?? null,
    project: raw?.project ?? raw?.projeto ?? null,
    category: normalizeCategory(raw?.category ?? raw?.categoria),
    priority: normalizePriority(raw?.priority ?? raw?.prioridade),
    due_date: normalizeDueDate(raw?.due_date ?? raw?.dueDate ?? raw?.prazo ?? raw?.deadline),
    tags: Array.isArray(raw?.tags) ? raw.tags.map(String) : [],
    subtasks: normalizeSubtasks(raw?.subtasks ?? raw?.subtarefas),
    questions: Array.isArray(raw?.questions) ? raw.questions.map(String) : [],
    assumptions: Array.isArray(raw?.assumptions) ? raw.assumptions.map(String) : [],
  }
}

const buildFallbackTask = (inputText: string) => {
  const cleaned = inputText.trim()
  const firstLine = cleaned.split("\n").find((line) => line.trim().length > 0) || ""
  const title = firstLine.slice(0, 120).trim() || "Nova demanda"
  const description = cleaned || "Sem descrição fornecida."
  return {
    title,
    description,
    context: null,
    requester: null,
    project: null,
    category: "Outro",
    priority: "medium",
    due_date: null,
    tags: [],
    subtasks: [],
    questions: cleaned ? [] : ["Informe uma descrição da demanda"],
    assumptions: [],
  }
}

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY não configurada" }, { status: 500 })
  }

  const body = await req.json().catch(() => null)
  const text = body?.text

  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "text obrigatório" }, { status: 400 })
  }

  const system = `
Você é um assistente de operações. Converta a entrada em uma tarefa no formato JSON exato.
Regras:
- Retorne APENAS JSON válido.
- Se faltar informação (data, nome, projeto), use null e preencha questions[].
- Não invente datas.
- title curto e objetivo.
- category deve ser uma das: Operacao, Financeiro, Comercial, TI, Compras, Outro
- priority: low|medium|high|urgent
- due_date: "YYYY-MM-DD" ou null
`.trim()

  const user = `Entrada do usuário:\n${text}`

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const assistantId = process.env.OPENAI_ASSISTANT_ID || process.env.OPENAI_API_ASSISTANT_ID

    let content = ""

    if (assistantId) {
      try {
        const thread = await openai.beta.threads.create()
        await openai.beta.threads.messages.create(thread.id, {
          role: "user",
          content: `${system}\n\n${user}`,
        })
        await openai.beta.threads.runs.createAndPoll(thread.id, {
          assistant_id: assistantId,
        })
        const messages = await openai.beta.threads.messages.list(thread.id, {
          order: "desc",
          limit: 10,
        })
        const assistantMessage = messages.data.find((message) => message.role === "assistant")
        const textContent = assistantMessage?.content?.find((item) => item.type === "text")
        content = (textContent as any)?.text?.value || ""
      } catch (assistantError) {
        console.warn("Falha ao usar Assistant, usando fallback:", assistantError)
      }
    }

    let parsed: unknown = undefined
    if (content) {
      try {
        parsed = JSON.parse(content)
      } catch {
        // Se o Assistant respondeu fora do JSON, usar fallback abaixo
        parsed = undefined
      }
    }

    if (!parsed) {
      const resp = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        temperature: 0.2,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
      })
      content = resp.choices[0]?.message?.content ?? "{}"
      try {
        parsed = JSON.parse(content)
      } catch {
        return NextResponse.json(
          { error: "JSON inválido retornado pelo modelo", raw: content },
          { status: 500 }
        )
      }
    }

    const normalized = normalizeTask(parsed)
    const task = TaskSchema.safeParse(normalized)
    if (task.success) {
      return NextResponse.json({ task: task.data })
    }

    const fallback = buildFallbackTask(text)
    const fallbackTask = TaskSchema.safeParse(fallback)
    if (!fallbackTask.success) {
      return NextResponse.json(
        { error: "Schema inválido", details: task.error.flatten(), raw: parsed, normalized },
        { status: 500 }
      )
    }

    return NextResponse.json({ task: fallbackTask.data })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao gerar tarefa"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
