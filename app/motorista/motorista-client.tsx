"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Demanda, Escala, Navio } from "@/lib/types/database"
import { buildTransportLegs } from "@/lib/transportes"

type TransporteItem = Demanda & { escala: Escala & { navio: Navio } }

interface MotoristaClientProps {
  transportes: TransporteItem[]
}

const statusLabels: Record<string, string> = {
  pendente: "Pendente",
  concluido: "Concluído",
}

const statusClasses: Record<string, string> = {
  pendente: "bg-warning/10 text-warning-foreground border-warning/30",
  concluido: "bg-success/10 text-success-foreground border-success/30",
}

export function MotoristaClient({ transportes }: MotoristaClientProps) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [modalidadeMap, setModalidadeMap] = useState<Record<string, string>>({})
  const [grupoMap, setGrupoMap] = useState<Record<string, string>>({})
  const [pickupMap, setPickupMap] = useState<Record<string, string>>({})
  const [pickupAtMap, setPickupAtMap] = useState<Record<string, string>>({})
  const [dropoffMap, setDropoffMap] = useState<Record<string, string>>({})
  const [showAll, setShowAll] = useState(true)
  const [message, setMessage] = useState<string | null>(null)

  const formatDateTime = (value?: string | null) => {
    if (!value) return ""
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ""
    return date.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
  }

  const parseDateTime = (value?: string) => {
    if (!value) return null
    const trimmed = value.trim()
    const match = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/)
    if (!match) return null
    const day = Number(match[1])
    const month = Number(match[2]) - 1
    const year = Number(match[3])
    const hour = Number(match[4])
    const minute = Number(match[5])
    const date = new Date(year, month, day, hour, minute, 0)
    if (Number.isNaN(date.getTime())) return null
    return date.toISOString()
  }

  const items = useMemo(() => transportes || [], [transportes])

  const handleConfirm = async (id: string, legId: string) => {
    setMessage(null)
    setLoadingId(legId)
    try {
      const response = await fetch("/api/transportes/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          demandaId: id,
          legId,
          modalidade: modalidadeMap[legId] || null,
          grupo: grupoMap[legId] || null,
          status: "concluido",
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setMessage(data.error || "Falha ao atualizar transporte.")
        return
      }
      setMessage("Transporte confirmado com sucesso.")
      router.refresh()
    } catch (error) {
      const text = error instanceof Error ? error.message : "Falha de conexão."
      setMessage(text)
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
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setMessage(data.error || "Falha ao salvar transporte.")
        return
      }
      setMessage("Endereços atualizados.")
      router.refresh()
    } catch (error) {
      const text = error instanceof Error ? error.message : "Falha de conexão."
      setMessage(text)
    } finally {
      setSavingId(null)
    }
  }

  const concludedLegs = items.flatMap((item) =>
    buildTransportLegs(item)
      .filter((leg) => leg.status === "concluido")
      .map((leg) => ({ demanda: item, leg }))
  )

  const totalLegs = items.reduce((sum, item) => sum + buildTransportLegs(item).length, 0)
  const pendingLegs = totalLegs - concludedLegs.length
  const uniqueDemandas = new Set(items.map((item) => item.id)).size

  const groupedReport = concludedLegs.reduce<Record<string, typeof concludedLegs>>((acc, item) => {
    const key = item.leg.grupo?.trim() || "Sem grupo"
    acc[key] = acc[key] || []
    acc[key].push(item)
    return acc
  }, {})

  const handleDownloadReport = () => {
    if (concludedLegs.length === 0) {
      setMessage("Nenhum transporte concluído para gerar relatório.")
      return
    }
    const header = ["Demanda", "Navio", "Porto", "Viagem", "Origem", "Destino", "Concluído em", "Modalidade", "Grupo"]
    const rows = concludedLegs.map(({ demanda, leg }) => [
      demanda.titulo,
      demanda.escala?.navio?.nome || "",
      demanda.escala?.porto || "",
      leg.label,
      leg.pickup_local || "",
      leg.dropoff_local || "",
      leg.concluido_em ? new Date(leg.concluido_em).toLocaleString("pt-BR") : "",
      leg.modalidade || "",
      leg.grupo || "",
    ])
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "relatorio-transportes-concluidos.csv"
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleUndo = async (id: string, legId: string) => {
    setMessage(null)
    setLoadingId(legId)
    try {
      const response = await fetch("/api/transportes/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          demandaId: id,
          legId,
          action: "undo",
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setMessage(data.error || "Falha ao reativar transporte.")
        return
      }
      setMessage("Transporte reativado.")
      router.refresh()
    } catch (error) {
      const text = error instanceof Error ? error.message : "Falha de conexão."
      setMessage(text)
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="space-y-4">
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
      <div className="rounded-lg border bg-card p-4">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span>Demandas: {uniqueDemandas}</span>
          <span>Viagens: {totalLegs}</span>
          <span>Pendentes: {pendingLegs}</span>
          <span>Concluídas: {concludedLegs.length}</span>
        </div>
      </div>
      <div className="rounded-lg border bg-card">
        {items.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Nenhum transporte encontrado para o dia selecionado.
          </div>
        ) : (
          <div className="divide-y">
            {items.map((item) => {
              const legs = buildTransportLegs(item)
              return (
                <div key={item.id} className="p-4 flex flex-col gap-4">
                  <div className="space-y-1">
                    <p className="font-medium">{item.titulo}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.escala?.navio?.nome || "Navio não informado"} • {item.escala?.porto || "Porto"}
                    </p>
                    {item.escala?.data_chegada && (
                      <p className="text-xs text-muted-foreground">
                        Escala: {new Date(item.escala.data_chegada).toLocaleString("pt-BR")}
                      </p>
                    )}
                  </div>
                  <div className="grid gap-3">
                    {legs.filter((leg) => showAll || leg.status !== "concluido").map((leg) => {
                      const status = leg.status || "pendente"
                      return (
                        <div key={leg.id} className="rounded-md border p-3 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{leg.label}</p>
                            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                              {leg.pickup_at && (
                                <span>Busca: {new Date(leg.pickup_at).toLocaleString("pt-BR")}</span>
                              )}
                              {!leg.pickup_at && <span>Busca: a definir</span>}
                              {leg.pickup_local && <span>Origem: {leg.pickup_local}</span>}
                              {leg.dropoff_local && <span>Destino: {leg.dropoff_local}</span>}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 min-w-[260px]">
                            <Badge variant="outline" className={statusClasses[status] || ""}>
                              {statusLabels[status] || status}
                            </Badge>
                            <div className="grid gap-2">
                              <input
                                type="text"
                                inputMode="numeric"
                                placeholder="dd/mm/aaaa hh:mm"
                                value={pickupAtMap[leg.id] ?? formatDateTime(leg.pickup_at)}
                                onChange={(event) =>
                                  setPickupAtMap((prev) => ({ ...prev, [leg.id]: event.target.value }))
                                }
                                className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                              />
                              <input
                                value={pickupMap[leg.id] ?? leg.pickup_local ?? ""}
                                onChange={(event) =>
                                  setPickupMap((prev) => ({ ...prev, [leg.id]: event.target.value }))
                                }
                                className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                                placeholder="Origem"
                              />
                              <input
                                value={dropoffMap[leg.id] ?? leg.dropoff_local ?? ""}
                                onChange={(event) =>
                                  setDropoffMap((prev) => ({ ...prev, [leg.id]: event.target.value }))
                                }
                                className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                                placeholder="Destino"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleSave(item.id, leg.id)}
                                disabled={savingId === leg.id}
                              >
                                {savingId === leg.id ? "Salvando..." : "Salvar endereços"}
                              </Button>
                              <input
                                value={grupoMap[leg.id] ?? leg.grupo ?? ""}
                                onChange={(event) =>
                                  setGrupoMap((prev) => ({ ...prev, [leg.id]: event.target.value }))
                                }
                                className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                                placeholder="Nº da viagem / observação"
                              />
                              <Button
                                type="button"
                                onClick={() => handleConfirm(item.id, leg.id)}
                                disabled={loadingId === leg.id || status === "concluido"}
                              >
                                {status === "concluido"
                                  ? "Concluído"
                                  : loadingId === leg.id
                                    ? "Confirmando..."
                                    : "Confirmar concluído"}
                              </Button>
                              {status === "concluido" && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  onClick={() => handleUndo(item.id, leg.id)}
                                  disabled={loadingId === leg.id}
                                >
                                  Reativar
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-card p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-medium">Relatório de transportes concluídos</p>
            <p className="text-sm text-muted-foreground">{concludedLegs.length} viagem(ns) concluída(s)</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAll((prev) => !prev)}
            >
              {showAll ? "Ocultar concluídos" : "Mostrar todos"}
            </Button>
            <Button type="button" variant="outline" onClick={handleDownloadReport}>
              Baixar CSV
            </Button>
          </div>
        </div>
        {concludedLegs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma viagem concluída no filtro atual.</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(groupedReport).map(([group, items]) => (
              <div key={group} className="rounded-md border p-3">
                <p className="text-sm font-medium">Nº da viagem: {group}</p>
                <p className="text-xs text-muted-foreground">{items.length} tripulante(s)</p>
                <div className="divide-y">
                  {items.map(({ demanda, leg }) => (
                    <div key={`${demanda.id}-${leg.id}`} className="py-2 text-xs">
                      <p className="font-medium">{demanda.titulo}</p>
                      <p className="text-muted-foreground">
                        {demanda.escala?.navio?.nome || "Navio"} • {demanda.escala?.porto || "Porto"} • {leg.label}
                      </p>
                      <p className="text-muted-foreground">
                        {leg.pickup_local || "Origem"} → {leg.dropoff_local || "Destino"} •{" "}
                        {leg.concluido_em ? new Date(leg.concluido_em).toLocaleString("pt-BR") : "Concluído"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
