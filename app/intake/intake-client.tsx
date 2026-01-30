"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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

type Mode = "text" | "audio"

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
  { value: "passageiros", label: "Tripulantes" },
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
  const [mode, setMode] = useState<Mode>("text")
  const [text, setText] = useState("")
  const [taskJson, setTaskJson] = useState<string>("")
  const [loadingFormat, setLoadingFormat] = useState(false)
  const [formatError, setFormatError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [navioId, setNavioId] = useState("")
  const [escalaId, setEscalaId] = useState("")
  const [tipo, setTipo] = useState("outro")
  const [categoria, setCategoria] = useState("processos_internos")
  const [prioridade, setPrioridade] = useState("media")
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [transcribing, setTranscribing] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [transcribeError, setTranscribeError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const recordMimeTypeRef = useRef<string>("audio/webm;codecs=opus")

  const getSupportedMimeType = () => {
    if (typeof MediaRecorder === "undefined") return null
    const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"]
    return candidates.find((type) => MediaRecorder.isTypeSupported?.(type)) || ""
  }

  useEffect(() => {
    try {
      const raw = localStorage.getItem("intakeDraft_v1")
      if (!raw) return
      const draft = JSON.parse(raw) as Partial<{
        mode: Mode
        text: string
        taskJson: string
        transcript: string
        navioId: string
        escalaId: string
        tipo: string
        categoria: string
        prioridade: string
      }>
      if (draft.mode) setMode(draft.mode)
      if (draft.text) setText(draft.text)
      if (draft.taskJson) setTaskJson(draft.taskJson)
      if (draft.transcript) setTranscript(draft.transcript)
      if (draft.navioId) setNavioId(draft.navioId)
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
      mode,
      text,
      taskJson,
      transcript,
      navioId,
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
  }, [mode, text, taskJson, transcript, navioId, escalaId, tipo, categoria, prioridade])

  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

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

  const navioOptions = useMemo(() => {
    const map = new Map<string, string>()
    escalas.forEach((escala) => {
      if (!map.has(escala.navio.id)) {
        map.set(escala.navio.id, escala.navio.nome)
      }
    })
    return Array.from(map.entries())
      .map(([id, nome]) => ({ id, nome }))
      .sort((a, b) => a.nome.localeCompare(b.nome))
  }, [escalas])

  const escalasFiltradas = useMemo(() => {
    if (!navioId) return []
    const now = new Date()
    return escalas
      .filter((escala) => escala.navio.id === navioId)
      .filter((escala) => {
        const chegada = new Date(escala.data_chegada)
        if (Number.isNaN(chegada.getTime())) return false
        return chegada >= now
      })
      .slice()
      .sort((a, b) => new Date(b.data_chegada).getTime() - new Date(a.data_chegada).getTime())
  }, [escalas, navioId])

  const formatEscalaLabel = (escala: Escala) => {
    const date = new Date(escala.data_chegada)
    const dateLabel = Number.isNaN(date.getTime())
      ? ""
      : date.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
    return dateLabel ? `${escala.porto} • ${dateLabel}` : escala.porto
  }

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

  const buildTitulo = (task: TaskPayload) => {
    if (task.title && task.title.trim()) return task.title.trim()
    const descricao = buildDescricao(task)
    const firstLine = descricao.split("\n").find((line) => line.trim().length > 0) || ""
    return firstLine.slice(0, 120).trim() || "Demanda"
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
    if (!navioId) {
      setSaveError("Selecione um navio para salvar a demanda.")
      return
    }
    if (!escalaId) {
      setSaveError("Selecione uma escala para salvar a demanda.")
      return
    }
    setSaving(true)

    const payload = {
      escala_id: escalaId,
      tipo,
      categoria,
      prioridade,
      titulo: buildTitulo(parsedTask),
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
      setMode("text")
      setText("")
      setTaskJson("")
      setNavioId("")
      setEscalaId("")
      setTipo("outro")
      setCategoria("processos_internos")
      setPrioridade("media")
      setIsRecording(false)
      setAudioBlob(null)
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
      setAudioUrl(null)
      setTranscript("")
      setTranscribeError(null)
      setFormatError(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha de conexão ao salvar."
      setSaveError(message)
    } finally {
      setSaving(false)
    }
  }

  const formatInput = async (input: string) => {
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

  const handleFormat = async () => {
    const input = text.trim()
    await formatInput(input)
  }

  const startRecording = async () => {
    setTranscribeError(null)
    setTranscript("")
    setAudioBlob(null)
    setAudioUrl(null)
    resetFormat()

    try {
      const supportedType = getSupportedMimeType()
      if (supportedType === null) {
        setTranscribeError("Este navegador não suporta gravação de áudio. Use a opção de texto.")
        return
      }
      if (!supportedType) {
        setTranscribeError("Formato de áudio não suportado neste navegador. Use a opção de texto.")
        return
      }
      recordMimeTypeRef.current = supportedType

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream

      const recorder = new MediaRecorder(stream, { mimeType: supportedType })
      chunksRef.current = []

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recordMimeTypeRef.current || supportedType })
        setAudioBlob(blob)
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
      }

      recorder.start()
      mediaRecorderRef.current = recorder
      setIsRecording(true)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível acessar o microfone."
      setTranscribeError(message)
    }
  }

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current
    if (!recorder) return
    recorder.stop()
    setIsRecording(false)
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      mediaStreamRef.current = null
    }
  }

  const handleTranscribe = async () => {
    if (!audioBlob) {
      setTranscribeError("Grave um áudio antes de transcrever.")
      return
    }

    setTranscribing(true)
    setTranscribeError(null)
    resetFormat()

    const formData = new FormData()
    const filename = audioBlob.type?.includes("mp4") ? "audio.mp4" : "audio.webm"
    formData.append("file", new File([audioBlob], filename, { type: audioBlob.type || "audio/webm" }))

    try {
      const response = await fetch("/api/intake/audio", {
        method: "POST",
        body: formData,
      })
      const { data, rawText } = await parseJsonResponse<{ transcript?: string; error?: string }>(response)

      if (!response.ok) {
        setTranscribeError(
          data?.error ||
            `Falha ao transcrever áudio. Status ${response.status}. ${
              rawText ? rawText.slice(0, 200) : "Resposta inválida."
            }`
        )
        return
      }

      const newTranscript = data?.transcript || ""
      setTranscript(newTranscript)
      setText(newTranscript)
      await formatInput(newTranscript.trim())
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha de conexão ao transcrever."
      setTranscribeError(message)
    } finally {
      setTranscribing(false)
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

  const handleSelectNavio = (value: string) => {
    setNavioId(value)
    setEscalaId("")
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Entrada</CardTitle>
          <CardDescription>Informe texto ou áudio para registrar a demanda</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={mode === "text" ? "default" : "outline"}
              onClick={() => setMode("text")}
            >
              Texto
            </Button>
            <Button
              type="button"
              variant={mode === "audio" ? "default" : "outline"}
              onClick={() => setMode("audio")}
            >
              Áudio
            </Button>
          </div>

          {mode === "text" && (
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
          )}

          {mode === "audio" && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 items-center">
                <Button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  variant={isRecording ? "destructive" : "default"}
                >
                  {isRecording ? "Parar gravação" : "Gravar áudio"}
                </Button>
                <Badge variant="outline">
                  {isRecording ? "Gravando..." : audioBlob ? "Gravação pronta" : "Aguardando"}
                </Badge>
              </div>

              {audioUrl && (
                <audio controls src={audioUrl} className="w-full">
                  Seu navegador não suporta reprodução de áudio.
                </audio>
              )}

              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={handleTranscribe} disabled={transcribing || !audioBlob}>
                  {transcribing ? "Transcrevendo..." : "Transcrever e gerar preview"}
                </Button>
                <Button type="button" variant="outline" onClick={resetFormat} disabled={transcribing}>
                  Limpar preview
                </Button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Transcrição</label>
                <Textarea
                  rows={6}
                  value={transcript}
                  onChange={(event) => setTranscript(event.target.value)}
                  placeholder="A transcrição aparecerá aqui após o áudio."
                />
              </div>
            </div>
          )}

          {formatError && <p className="text-sm text-destructive">{formatError}</p>}
          {transcribeError && <p className="text-sm text-destructive">{transcribeError}</p>}
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
              <Label htmlFor="navio">Navio *</Label>
              <Select value={navioId} onValueChange={handleSelectNavio}>
                <SelectTrigger id="navio">
                  <SelectValue placeholder="Selecione um navio" />
                </SelectTrigger>
                <SelectContent>
                  {navioOptions.map((navio) => (
                    <SelectItem key={navio.id} value={navio.id}>
                      {navio.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="escala">Escala *</Label>
              <Select value={escalaId} onValueChange={setEscalaId} disabled={!navioId}>
                <SelectTrigger id="escala">
                  <SelectValue placeholder={navioId ? "Selecione uma escala" : "Selecione um navio"} />
                </SelectTrigger>
                <SelectContent>
                  {escalasFiltradas.map((escala) => (
                    <SelectItem key={escala.id} value={escala.id}>
                      {formatEscalaLabel(escala)}
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

            <Button type="button" onClick={handleSave} disabled={saving || !taskJson || !navioId || !escalaId}>
              {saving ? "Salvando..." : "Salvar tarefa"}
            </Button>
          </div>
          <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground min-h-[240px] overflow-auto">
            {parsedTask ? (
              <div className="space-y-2 text-foreground">
                <p className="text-xs uppercase text-muted-foreground">Observação</p>
                <pre className="whitespace-pre-wrap text-sm">{buildDescricao(parsedTask)}</pre>
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
