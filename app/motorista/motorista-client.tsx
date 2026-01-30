"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DateTimePickerPopover } from "@/components/ui/datetime-picker-popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Demanda, Escala, Navio } from "@/lib/types/database"
import { buildTransportLegs, type TransporteLeg } from "@/lib/transportes"
import { FileDown, CheckCheck } from "lucide-react"

type TransporteItem = Demanda & { escala: Escala & { navio: Navio } }

interface MotoristaClientProps {
  transportes: TransporteItem[]
  /** Data do filtro no formato dd/mm/yyyy ou "all" */
  dataFiltro?: string
}

const statusLabels: Record<string, string> = {
  pendente: "Pendente",
  concluido: "Concluído",
}

const statusClasses: Record<string, string> = {
  pendente: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  concluido: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
}

function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function parseDataFiltro(value?: string): string | null {
  if (!value || value.toLowerCase() === "all" || value.toLowerCase() === "todos") return null
  const m = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!m) return null
  const [, day, month, year] = m
  return `${year}-${month}-${day}`
}

export function MotoristaClient({ transportes, dataFiltro }: MotoristaClientProps) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [observacaoMap, setObservacaoMap] = useState<Record<string, string>>({})
  const [pickupMap, setPickupMap] = useState<Record<string, string>>({})
  const [pickupAtMap, setPickupAtMap] = useState<Record<string, string>>({})
  const [dropoffMap, setDropoffMap] = useState<Record<string, string>>({})
  const [showAll, setShowAll] = useState(false) // false = ocultar concluídos (padrão); true = mostrar todos
  const [message, setMessage] = useState<string | null>(null)
  const [expandLeg, setExpandLeg] = useState<string | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{
    demandaId: string
    legId: string
    tripulanteNome: string
    numeroViagem: string
    tempoTrajetoMin: string
  } | null>(null)
  const [pdfLoading, setPdfLoading] = useState(false)

  const formatDateTime = (value?: string | null) => {
    if (!value) return ""
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ""
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatTime = (value?: string | null) => {
    if (!value) return "—"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return "—"
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  }

  /** DD/MM para agrupar por data e não misturar dias (ex.: 31/01 vs 01/02). */
  const formatDateShort = (value?: string | null) => {
    if (!value) return ""
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ""
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
  }

  const parseDateTime = (value?: string) => {
    if (!value) return null
    const trimmed = value.trim()
    if (trimmed.includes("T") || /^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      const date = new Date(trimmed)
      return Number.isNaN(date.getTime()) ? null : date.toISOString()
    }
    const match = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/)
    if (!match) return null
    const [, day, month, year, hour, minute] = match
    const date = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), 0)
    return Number.isNaN(date.getTime()) ? null : date.toISOString()
  }

  /** Data/hora mais próxima para pré-preencher: da perna, ou hoje/amanhã 08:30 */
  const defaultPickupDate = (leg: TransporteLeg): Date => {
    if (leg.pickup_at) return new Date(leg.pickup_at)
    const now = new Date()
    const today0830 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 30, 0)
    if (now <= today0830) return today0830
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 8, 30, 0)
  }

  const targetDateKey = useMemo(() => parseDataFiltro(dataFiltro), [dataFiltro])

  /** Lista de { demanda, leg } para o dia (ou todas), e agrupamento por horário de saída */
  const { legsNoDia, porHorario, resumo } = useMemo(() => {
    const items = transportes || []
    const targetKey = targetDateKey
    type Entry = { demanda: TransporteItem; leg: TransporteLeg }
    const entries: Entry[] = []

    for (const demanda of items) {
      const legs = buildTransportLegs(demanda)
      for (const leg of legs) {
        if (targetKey) {
          const legDate = leg.pickup_at ? toDateKey(new Date(leg.pickup_at)) : null
          if (legDate !== targetKey) continue
        }
        entries.push({ demanda, leg })
      }
    }

    /** Agrupa por data + hora para não misturar 31/01 com 01/02 no mesmo bloco. */
    const porHorario: Record<string, Entry[]> = {}
    for (const entry of entries) {
      const leg = entry.leg
      let slot: string
      if (leg.pickup_at) {
        const d = formatDateShort(leg.pickup_at)
        const t = formatTime(leg.pickup_at)
        slot = d && t ? `${d} ${t}` : t || "A definir"
      } else {
        slot = "A definir"
      }
      if (!porHorario[slot]) porHorario[slot] = []
      porHorario[slot].push(entry)
    }
    const slots = Object.keys(porHorario).sort((a, b) => {
      if (a === "A definir") return 1
      if (b === "A definir") return -1
      const entriesA = porHorario[a]!
      const entriesB = porHorario[b]!
      const timeA = entriesA[0]?.leg.pickup_at ? new Date(entriesA[0].leg.pickup_at).getTime() : 0
      const timeB = entriesB[0]?.leg.pickup_at ? new Date(entriesB[0].leg.pickup_at).getTime() : 0
      return timeA - timeB
    })

    const pendentes = entries.filter((e) => (e.leg.status || "pendente") === "pendente").length
    const concluidas = entries.filter((e) => e.leg.status === "concluido").length

    return {
      legsNoDia: entries,
      porHorario: slots.map((slot) => ({ slot, entries: porHorario[slot]! })),
      resumo: { total: entries.length, pendentes, concluidas, viagens: slots.length },
    }
  }, [transportes, targetDateKey])

  const openConfirmDialog = (demandaId: string, legId: string, tripulanteNome: string) => {
    setConfirmDialog({
      demandaId,
      legId,
      tripulanteNome,
      numeroViagem: "",
      tempoTrajetoMin: "",
    })
  }

  const handleConfirmSubmit = async () => {
    if (!confirmDialog) return
    const numeroViagem = confirmDialog.numeroViagem.trim()
    if (!numeroViagem) {
      setMessage("Informe o número da viagem para confirmar.")
      return
    }
    setMessage(null)
    setLoadingId(confirmDialog.legId)
    try {
      const tempoMin = confirmDialog.tempoTrajetoMin.trim()
      const duracao_minutos = tempoMin ? (Number(tempoMin) || null) : undefined
      const response = await fetch("/api/transportes/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          demandaId: confirmDialog.demandaId,
          legId: confirmDialog.legId,
          grupo: numeroViagem,
          status: "concluido",
          ...(duracao_minutos != null && { duracao_minutos }),
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setMessage(data.error || "Falha ao confirmar transporte.")
        return
      }
      setMessage("Transporte confirmado.")
      setConfirmDialog(null)
      router.refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Falha de conexão.")
    } finally {
      setLoadingId(null)
    }
  }

  const handleSave = async (demandaId: string, legId: string) => {
    setMessage(null)
    setSavingId(legId)
    try {
      const response = await fetch("/api/transportes/update-leg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          demandaId,
          legId,
          pickup_at: parseDateTime(pickupAtMap[legId] || "") || null,
          pickup_local: pickupMap[legId] || null,
          dropoff_local: dropoffMap[legId] || null,
          observacao: observacaoMap[legId]?.trim() || null,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setMessage(data.error || "Falha ao salvar.")
        return
      }
      setMessage("Salvo.")
      setExpandLeg(null)
      router.refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Falha de conexão.")
    } finally {
      setSavingId(null)
    }
  }

  const handleUndo = async (id: string, legId: string) => {
    setMessage(null)
    setLoadingId(legId)
    try {
      const response = await fetch("/api/transportes/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demandaId: id, legId, action: "undo" }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setMessage(data.error || "Falha ao reativar.")
        return
      }
      setMessage("Reativado.")
      router.refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Falha de conexão.")
    } finally {
      setLoadingId(null)
    }
  }

  const concludedForReport = legsNoDia.filter((e) => e.leg.status === "concluido")
  const groupedReport = useMemo(() => {
    const acc: Record<string, typeof concludedForReport> = {}
    for (const entry of concludedForReport) {
      const key = entry.leg.grupo?.trim() || "Sem grupo"
      if (!acc[key]) acc[key] = []
      acc[key].push(entry)
    }
    return acc
  }, [concludedForReport])

  const handleGerarPDF = async () => {
    if (legsNoDia.length === 0) {
      setMessage("Nenhum transporte para gerar o PDF.")
      return
    }
    setMessage(null)
    setPdfLoading(true)
    try {
      const { gerarRelatorioTransportesPDF } = await import("@/lib/relatorio-transportes-pdf")
      await gerarRelatorioTransportesPDF({
        porHorario,
        resumo,
        dataFiltro: dataFiltro ?? undefined,
      })
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Erro ao gerar PDF.")
    } finally {
      setPdfLoading(false)
    }
  }

  const handleDownloadReport = () => {
    if (concludedForReport.length === 0) {
      setMessage("Nenhum transporte concluído para gerar relatório.")
      return
    }
    const header = [
      "Tripulante",
      "Demanda (ID)",
      "Navio",
      "Porto",
      "Viagem",
      "Nº viagem",
      "Origem",
      "Destino",
      "Concluído em",
      "Observação (voo/obs)",
    ]
    const rows = concludedForReport.map(({ demanda, leg }) => [
      demanda.titulo,
      demanda.id,
      demanda.escala?.navio?.nome || "",
      demanda.escala?.porto || "",
      leg.label,
      leg.grupo?.trim() || "",
      leg.pickup_local || "",
      leg.dropoff_local || "",
      leg.concluido_em ? new Date(leg.concluido_em).toLocaleString("pt-BR") : "",
      leg.observacao?.trim() || "",
    ])
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "relatorio-viagens-tripulantes.csv"
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      {message && (
        <p className="rounded-md border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">{message}</p>
      )}

      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Resumo do dia</h2>
            <p className="text-sm text-muted-foreground">
              {resumo.total} viagem(ns) em {resumo.viagens} horário(s) • {resumo.pendentes} pendente(s) •{" "}
              {resumo.concluidas} concluída(s)
            </p>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowAll((p) => !p)}>
              {showAll ? "Ocultar concluídos" : "Mostrar todos"}
            </Button>
            {resumo.concluidas > 0 && (
              <Button
                type="button"
                variant={showAll ? "secondary" : "outline"}
                size="sm"
                className="gap-1.5"
                onClick={() => setShowAll(true)}
                title={showAll ? "Concluídas visíveis" : "Ver concluídas"}
              >
                <CheckCheck className="h-4 w-4 text-success" />
                <span>Concluídas ({resumo.concluidas})</span>
              </Button>
            )}
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleGerarPDF}
              disabled={pdfLoading || legsNoDia.length === 0}
            >
              <FileDown className="h-4 w-4 mr-1.5" />
              {pdfLoading ? "Gerando PDF…" : "Gerar PDF"}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={handleDownloadReport}>
              Relatório viagens (CSV)
            </Button>
          </div>
        </div>
      </div>

      {legsNoDia.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
          Nenhum transporte no dia selecionado.
        </div>
      ) : (
        <div className="space-y-6">
          {porHorario.map(({ slot, entries }) => {
            const toShow = showAll ? entries : entries.filter((e) => (e.leg.status || "pendente") !== "concluido")
            if (toShow.length === 0) return null

            return (
              <section key={slot} className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <div className="bg-muted/60 px-4 py-3 border-b">
                  <h3 className="font-semibold text-foreground">
                    {slot === "A definir" ? "Viagem a definir" : slot.includes(" ") ? `Viagem em ${slot.split(" ")[0]} às ${slot.split(" ")[1]}` : `Viagem às ${slot}`}
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      ({toShow.length} {toShow.length === 1 ? "tripulante" : "tripulantes"})
                    </span>
                  </h3>
                </div>
                <ul className="divide-y">
                  {toShow.map(({ demanda, leg }) => {
                    const status = leg.status || "pendente"
                    const legKey = `${demanda.id}-${leg.id}`
                    const isExpanded = expandLeg === legKey
                    const origem = pickupMap[leg.id] ?? leg.pickup_local ?? "—"
                    const destino = dropoffMap[leg.id] ?? leg.dropoff_local ?? "—"
                    const obs = observacaoMap[leg.id] ?? leg.observacao ?? ""

                    return (
                      <li key={legKey} className="p-4">
                        <p className="font-medium text-foreground mb-2">
                          <Link
                            href={`/demandas/${demanda.id}`}
                            className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
                          >
                            {demanda.titulo}
                          </Link>
                        </p>
                        <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Transporte
                          </p>
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm text-foreground">
                                {origem} → {destino}
                              </p>
                              {obs && (
                                <p className="text-xs text-muted-foreground mt-0.5">Voo/obs: {obs}</p>
                              )}
                              {status === "concluido" && leg.grupo?.trim() && (
                                <p className="text-xs text-muted-foreground mt-0.5">Nº viagem: {leg.grupo.trim()}</p>
                              )}
                              {status === "concluido" && leg.duracao_minutos != null && (
                                <p className="text-xs text-muted-foreground mt-0.5">Tempo do trajeto: {leg.duracao_minutos} min</p>
                              )}
                              <div className="mt-1.5 flex items-center gap-2">
                                <Badge variant="outline" className={`text-xs ${statusClasses[status]}`}>
                                  {statusLabels[status]}
                                </Badge>
                                {leg.pickup_at && (
                                  <span className="text-xs text-muted-foreground">
                                    Busca: {formatDateTime(leg.pickup_at)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 shrink-0">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setExpandLeg(isExpanded ? null : legKey)}
                              >
                                {isExpanded ? "Fechar" : "Editar"}
                              </Button>
                              {status !== "concluido" && (
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() => openConfirmDialog(demanda.id, leg.id, demanda.titulo)}
                                  disabled={loadingId === leg.id}
                                >
                                  {loadingId === leg.id ? "..." : "Confirmar"}
                                </Button>
                              )}
                              {status === "concluido" && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUndo(demanda.id, leg.id)}
                                  disabled={loadingId === leg.id}
                                >
                                  Reativar
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="mt-4 rounded-lg border bg-muted/30 p-3 space-y-2">
                            <div className="grid gap-2 sm:grid-cols-2">
                              <div className="space-y-1">
                                <label htmlFor={`pickup-${leg.id}`} className="text-xs font-medium text-muted-foreground">
                                  Data e hora da busca
                                </label>
                                <DateTimePickerPopover
                                  id={`pickup-${leg.id}`}
                                  value={
                                    leg.id in pickupAtMap
                                      ? (pickupAtMap[leg.id] || null)
                                      : (leg.pickup_at || undefined)
                                  }
                                  defaultDate={defaultPickupDate(leg)}
                                  placeholder="Selecionar data e hora"
                                  onChange={(iso) =>
                                    setPickupAtMap((p) => ({ ...p, [leg.id]: iso ?? "" }))
                                  }
                                />
                              </div>
                              <input
                                placeholder="Origem"
                                value={pickupMap[leg.id] ?? leg.pickup_local ?? ""}
                                onChange={(e) => setPickupMap((p) => ({ ...p, [leg.id]: e.target.value }))}
                                className="h-9 rounded-md border bg-background px-2 text-sm"
                              />
                              <input
                                placeholder="Destino"
                                value={dropoffMap[leg.id] ?? leg.dropoff_local ?? ""}
                                onChange={(e) => setDropoffMap((p) => ({ ...p, [leg.id]: e.target.value }))}
                                className="h-9 rounded-md border bg-background px-2 text-sm sm:col-span-2"
                              />
                              <div className="space-y-1 sm:col-span-2">
                                <Label className="text-xs font-medium text-muted-foreground">
                                  Voo / observação
                                </Label>
                                <input
                                  placeholder="Voo, observação, etc."
                                  value={observacaoMap[leg.id] ?? leg.observacao ?? ""}
                                  onChange={(e) => setObservacaoMap((p) => ({ ...p, [leg.id]: e.target.value }))}
                                  className="h-9 w-full rounded-md border bg-background px-2 text-sm"
                                />
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() => handleSave(demanda.id, leg.id)}
                              disabled={savingId === leg.id}
                            >
                              {savingId === leg.id ? "Salvando..." : "Salvar"}
                            </Button>
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </section>
            )
          })}
        </div>
      )}

      {concludedForReport.length > 0 && (
        <div className="rounded-xl border bg-card p-4">
          <h3 className="font-semibold mb-2">Relatório por viagem (concluídos)</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Tripulantes agrupados pelo <strong>Nº viagem</strong> informado na confirmação.
          </p>
          <div className="space-y-2">
            {Object.entries(groupedReport).map(([grupo, items]) => (
              <div key={grupo} className="rounded-md border p-3 text-sm">
                <p className="font-medium text-muted-foreground mb-1.5">
                  Nº viagem: {grupo}
                </p>
                <ul className="space-y-1">
                  {items.map(({ demanda, leg }) => (
                    <li key={leg.id} className="text-foreground flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <Link
                        href={`/demandas/${demanda.id}`}
                        className="text-primary hover:underline"
                      >
                        {demanda.titulo}
                      </Link>
                      <span className="text-muted-foreground">
                        {leg.pickup_local || "—"} → {leg.dropoff_local || "—"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      <Dialog open={!!confirmDialog} onOpenChange={(open) => !open && setConfirmDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar transporte</DialogTitle>
          </DialogHeader>
          {confirmDialog && (
            <>
              <p className="text-sm text-muted-foreground">
                Tripulante: <strong>{confirmDialog.tripulanteNome}</strong>
              </p>
              <div className="space-y-2">
                <Label htmlFor="numero-viagem">
                  Número da viagem <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="numero-viagem"
                  placeholder="Ex.: 1, Viagem 1, Carro A"
                  value={confirmDialog.numeroViagem}
                  onChange={(e) =>
                    setConfirmDialog((p) => p ? { ...p, numeroViagem: e.target.value } : null)
                  }
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tempo-trajeto">
                  Tempo do trajeto (min)
                </Label>
                <Input
                  id="tempo-trajeto"
                  type="number"
                  min={1}
                  placeholder="Ex.: 45 — para identificar horas paradas"
                  value={confirmDialog.tempoTrajetoMin}
                  onChange={(e) =>
                    setConfirmDialog((p) => p ? { ...p, tempoTrajetoMin: e.target.value } : null)
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Quanto tempo levou todo o trajeto? Opcional; ajuda a identificar horas paradas.
                </p>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setConfirmDialog(null)}>
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirmSubmit}
                  disabled={!confirmDialog.numeroViagem.trim() || loadingId === confirmDialog.legId}
                >
                  {loadingId === confirmDialog.legId ? "Confirmando..." : "Confirmar"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
