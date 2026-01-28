"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Escala, Navio } from "@/lib/types/database"

type TaskResponse = {
  task?: unknown
  error?: string
  details?: unknown
  raw?: unknown
}

type TaskPayload = {
  title?: string
  description?: string
  context?: string | null
  requester?: string | null
  project?: string | null
  category?: string
  priority?: string
  due_date?: string | null
  tags?: string[]
  subtasks?: Array<{ title: string; owner?: string | null }>
  questions?: string[]
  assumptions?: string[]
}

interface IntakeClientProps {
  escalas: (Escala & { navio: Navio })[]
}

const tipoOptions = [
  { value: "embarque_passageiros", label: "Embarque de Passageiros" },
  { value: "desembarque_passageiros", label: "Desembarque de Passageiros" },
  { value: "controle_listas", label: "Controle de Listas" },
  { value: "suporte_especial", label: "Suporte Especial" },
  { value: "visita_medica", label: "Visita Médica" },
  { value: "atendimento_emergencial", label: "Atendimento Emergencial" },
  { value: "documentacao_medica", label: "Documentação Médica" },
  { value: "orcamento_produtos", label: "Orçamento de Produtos" },
  { value: "compra", label: "Compra" },
  { value: "entrega_bordo", label: "Entrega a Bordo" },
  { value: "confirmacao_recebimento", label: "Confirmação de Recebimento" },
  { value: "abastecimento_agua", label: "Abastecimento de Água" },
  { value: "combustivel", label: "Combustível" },
  { value: "controle_horarios", label: "Controle de Horários" },
  { value: "policia_federal", label: "Polícia Federal" },
  { value: "receita_federal", label: "Receita Federal" },
  { value: "mapa", label: "Mapa" },
  { value: "port_authority", label: "Port Authority" },
  { value: "reserva_hotel", label: "Reserva de Hotel" },
  { value: "transporte_terrestre", label: "Transporte Terrestre" },
  { value: "motorista", label: "Motorista" },
  { value: "veiculo", label: "Veículo" },
  { value: "pickup_dropoff", label: "Pickup/Dropoff" },
  { value: "checklist_padrao", label: "Checklist Padrão" },
  { value: "relatorio", label: "Relatório" },
  { value: "documento_obrigatorio", label: "Documento Obrigatório" },
  { value: "procedimento_repetitivo", label: "Procedimento Repetitivo" },
  { value: "outro", label: "Outro" },
]

const categoriaOptions = [
  { value: "passageiros", label: "Passageiros" },
  { value: "saude", label: "Saúde" },
  { value: "suprimentos", label: "Suprimentos" },
  { value: "abastecimento", label: "Abastecimento" },
  { value: "autoridades", label: "Autoridades" },
  { value: "logistica", label: "Logística" },
  { value: "processos_internos", label: "Processos Internos" },
]

const prioridadeOptions = [
  { value: "baixa", label: "Baixa" },
  { value: "media", label: "Média" },
  { value: "alta", label: "Alta" },
  { value: "urgente", label: "Urgente" },
]

export function IntakeClient({ escalas }: IntakeClientProps) {
  const [text, setText] = useState("")
  const [taskJson, setTaskJson] = useState<string>("")
  const [loadingFormat, setLoadingFormat] = useState(false)
  const [formatError, setFormatError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [escalaId, setEscalaId] = useState("")
  const [tipo, setTipo] = useState("outro")
  const [categoria, setCategoria] = useState("processos_internos")
  const [prioridade, setPrioridade] = useState("media")

  useEffect(() => {
    try {
      const raw = localStorage.getItem("intakeDraft_v1")
      if (!raw) return
      const draft = JSON.parse(raw) as Partial<{
        text: string
        taskJson: string
        escalaId: string
        tipo: string
        categoria: string
        prioridade: string
      }>
      if (draft.text) setText(draft.text)
      if (draft.taskJson) setTaskJson(draft.taskJson)
      if (draft.escalaId) setEscalaId(draft.escalaId)
      if (draft.tipo) setTipo(draft.tipo)
      if (draft.categoria) setCategoria(draft.categoria)
      if (draft.prioridade) setPrioridade(draft.prioridade)
    } catch (error) {
      console.warn("Falha ao restaurar rascunho:", error)
    }
  }, [])

  useEffect(() => {
    const payload = {
      text,
      taskJson,
      escalaId,
      tipo,
      categoria,
      prioridade,
    }
    try {
      localStorage.setItem("intakeDraft_v1", JSON.stringify(payload))
    } catch (error) {
      console.warn("Falha ao salvar rascunho:", error)
    }
  }, [text, taskJson, escalaId, tipo, categoria, prioridade])

  const resetFormat = () => {
    setTaskJson("")
    setFormatError(null)
    setSaveError(null)
    setSaveSuccess(null)
  }

  const parseJsonResponse = async <T,>(response: Response): Promise<{ data?: T; rawText?: string }> => {
    const text = await response.text()
    if (!text) return { data: undefined, rawText: "" }
    try {
      return { data: JSON.parse(text) as T, rawText: text }
    } catch {
      return { data: undefined, rawText: text }
    }
  }

  const parsedTask = useMemo(() => {
    if (!taskJson) return null
    try {
      return JSON.parse(taskJson) as TaskPayload
    } catch {
      return null
    }
  }, [taskJson])

  const buildDescricao = (task: TaskPayload) => {
    const parts: string[] = []
    if (task.description) parts.push(task.description.trim())
    const extras: string[] = []
    if (task.context) extras.push(`Contexto: ${task.context}`)
    if (task.requester) extras.push(`Solicitante: ${task.requester}`)
    if (task.project) extras.push(`Projeto: ${task.project}`)
    if (task.tags && task.tags.length > 0) extras.push(`Tags: ${task.tags.join(", ")}`)
    if (task.questions && task.questions.length > 0) extras.push(`Perguntas: ${task.questions.join(" | ")}`)
    if (task.assumptions && task.assumptions.length > 0) extras.push(`Suposições: ${task.assumptions.join(" | ")}`)
    if (task.subtasks && task.subtasks.length > 0) {
      const items = task.subtasks.map((item) => `- ${item.title}${item.owner ? ` (${item.owner})` : ""}`)
      extras.push(`Subtarefas:\n${items.join("\n")}`)
    }
    if (extras.length > 0) {
      parts.push(extras.join("\n"))
    }
    return parts.join("\n\n").trim()
  }

  const getPrazoFromTask = (task: TaskPayload) => {
    if (!task.due_date) return undefined
    const date = new Date(`${task.due_date}T12:00:00`)
    if (Number.isNaN(date.getTime())) return undefined
    return date.toISOString()
  }

  const handleSave = async () => {
    setSaveError(null)
    setSaveSuccess(null)

    if (!taskJson || !parsedTask) {
      setSaveError("Gere o preview da tarefa antes de salvar.")
      return
    }
    if (!escalaId) {
      setSaveError("Selecione uma escala para salvar a demanda.")
      return
    }
    if (!parsedTask.title) {
      setSaveError("A tarefa não possui título válido.")
      return
    }

    setSaving(true)

    const payload = {
      escala_id: escalaId,
      tipo,
      categoria,
      prioridade,
      titulo: parsedTask.title,
      descricao: buildDescricao(parsedTask),
      prazo: getPrazoFromTask(parsedTask),
    }

    try {
      const response = await fetch("/api/intake/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const { data, rawText } = await parseJsonResponse<{ success?: boolean; error?: string }>(response)

      if (!response.ok || !data?.success) {
        setSaveError(
          data?.error ||
            `Falha ao salvar a demanda. Status ${response.status}. ${
              rawText ? rawText.slice(0, 200) : "Resposta inválida."
            }`
        )
        return
      }

      setSaveSuccess("Demanda criada com sucesso.")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha de conexão ao salvar."
      setSaveError(message)
    } finally {
      setSaving(false)
    }
  }

  const handleFormat = async () => {
    const input = text.trim()
    if (!input) {
      setFormatError("Digite ou cole um texto antes de formatar.")
      return
    }

    setLoadingFormat(true)
    setFormatError(null)

    try {
      const response = await fetch("/api/intake/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      })

      const { data, rawText } = await parseJsonResponse<TaskResponse>(response)
      if (!response.ok) {
        setFormatError(
          data?.error ||
            `Falha ao formatar a tarefa. Status ${response.status}. ${
              rawText ? rawText.slice(0, 200) : "Resposta inválida."
            }`
        )
        setTaskJson("")
        return
      }

      setTaskJson(JSON.stringify(data?.task ?? {}, null, 2))
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha de conexão ao formatar."
      setFormatError(message)
    } finally {
      setLoadingFormat(false)
    }
  }

  const handlePaste = async () => {
    setFormatError(null)
    try {
      const clipboardText = await navigator.clipboard.readText()
      if (!clipboardText.trim()) {
        setFormatError("A área de transferência está vazia.")
        return
      }
      setText(clipboardText)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível acessar a área de transferência."
      setFormatError(message)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Entrada</CardTitle>
          <CardDescription>Cole o texto do email para registrar a demanda</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Textarea
              rows={8}
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Cole o email aqui com o máximo de detalhes possível..."
            />
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={handlePaste}>
                Colar
              </Button>
              <Button type="button" onClick={handleFormat} disabled={loadingFormat}>
                {loadingFormat ? "Formatando..." : "Formatar com IA"}
              </Button>
              <Button type="button" variant="outline" onClick={resetFormat}>
                Limpar preview
              </Button>
            </div>
          </div>

          {formatError && <p className="text-sm text-destructive">{formatError}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preview da tarefa</CardTitle>
          <CardDescription>Veja a descrição formatada antes de salvar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3">
            <div className="space-y-2">
              <Label htmlFor="escala">Escala *</Label>
              <Select value={escalaId} onValueChange={setEscalaId}>
                <SelectTrigger id="escala">
                  <SelectValue placeholder="Selecione uma escala" />
                </SelectTrigger>
                <SelectContent>
                  {escalas.map((escala) => (
                    <SelectItem key={escala.id} value={escala.id}>
                      {escala.navio.nome} - {escala.porto}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo</Label>
                <Select value={tipo} onValueChange={setTipo}>
                  <SelectTrigger id="tipo">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tipoOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Select value={categoria} onValueChange={setCategoria}>
                  <SelectTrigger id="categoria">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriaOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prioridade">Prioridade</Label>
              <Select value={prioridade} onValueChange={setPrioridade}>
                <SelectTrigger id="prioridade">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {prioridadeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="button" onClick={handleSave} disabled={saving || !taskJson || !escalaId}>
              {saving ? "Salvando..." : "Salvar tarefa"}
            </Button>
          </div>
          <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground min-h-[240px] overflow-auto">
            {parsedTask ? (
              <div className="space-y-3 text-foreground">
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Título</p>
                  <p className="text-sm">{parsedTask.title || "Sem título"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Descrição</p>
                  <pre className="whitespace-pre-wrap text-sm">{buildDescricao(parsedTask)}</pre>
                </div>
              </div>
            ) : (
              <p>O preview aparecerá aqui depois de formatar.</p>
            )}
          </div>
          {saveError && <p className="text-sm text-destructive">{saveError}</p>}
          {saveSuccess && <p className="text-sm text-foreground">{saveSuccess}</p>}
        </CardContent>
      </Card>
    </div>
  )
}
