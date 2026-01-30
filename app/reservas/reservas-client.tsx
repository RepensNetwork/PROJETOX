"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Hotel, Loader2, ExternalLink, Coffee, UtensilsCrossed, CheckCheck, Trash2, FileDown, Printer, Filter } from "lucide-react"
import type { ReservaItem, UpdateReservaHotelInput } from "@/lib/reservas"
import type { FiltroReservas } from "@/app/actions/reservas"
import { getTripulanteNome } from "@/lib/reservas"
import { updateDemandaReserva, clearDemandaReserva } from "@/app/actions/demandas"
import { gerarRelatorioReservasPDF } from "@/lib/relatorio-reservas-pdf"

interface ReservasClientProps {
  reservas: ReservaItem[]
  filtroInicial?: FiltroReservas
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "—"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return "—"
  return format(d, "dd/MM/yyyy", { locale: ptBR })
}

function formatCurrency(value: number | null | undefined): string {
  if (value == null || value === undefined) return "—"
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value))
}

export function ReservasClient({ reservas, filtroInicial }: ReservasClientProps) {
  const router = useRouter()
  const [editing, setEditing] = useState<ReservaItem | null>(null)
  const [removing, setRemoving] = useState<ReservaItem | null>(null)
  const [saving, setSaving] = useState(false)
  const [removeError, setRemoveError] = useState<string | null>(null)
  const [gerandoPdf, setGerandoPdf] = useState(false)
  const [form, setForm] = useState<UpdateReservaHotelInput>({})
  const [dataInicio, setDataInicio] = useState(filtroInicial?.dataInicio ?? "")
  const [dataFim, setDataFim] = useState(filtroInicial?.dataFim ?? "")

  const openEdit = (r: ReservaItem) => {
    setEditing(r)
    setForm({
      reserva_hotel_nome: r.reserva_hotel_nome ?? undefined,
      reserva_hotel_endereco: r.reserva_hotel_endereco ?? undefined,
      reserva_checkin: r.reserva_checkin ?? undefined,
      reserva_checkout: r.reserva_checkout ?? undefined,
      reserva_valor: r.reserva_valor ?? undefined,
      reserva_cafe_incluso: r.reserva_cafe_incluso ?? false,
      reserva_almoco_incluso: r.reserva_almoco_incluso ?? false,
      reserva_confirmado: r.reserva_confirmado ?? false,
    })
  }

  const handleSave = async () => {
    if (!editing) return
    setSaving(true)
    const result = await updateDemandaReserva(editing.id, form)
    setSaving(false)
    if (result.success) {
      setEditing(null)
      router.refresh()
    }
  }

  const handleRemove = async () => {
    if (!removing) return
    setSaving(true)
    setRemoveError(null)
    const result = await clearDemandaReserva(removing.id)
    setSaving(false)
    if (result.success) {
      setRemoving(null)
      router.refresh()
    } else {
      setRemoveError(result.error ?? "Não foi possível remover a reserva.")
    }
  }

  const aplicarFiltro = () => {
    const params = new URLSearchParams()
    if (dataInicio) params.set("dataInicio", dataInicio)
    if (dataFim) params.set("dataFim", dataFim)
    router.push(`/reservas${params.toString() ? `?${params.toString()}` : ""}`)
  }

  const limparFiltro = () => {
    setDataInicio("")
    setDataFim("")
    router.push("/reservas")
  }

  const exportarCSV = () => {
    const headers = [
      "Tripulante",
      "Hotel",
      "Endereço",
      "Navio/Escala",
      "Check-in",
      "Check-out",
      "Valor (R$)",
      "Café",
      "Almoço",
      "Confirmado",
    ]
    const rows = reservas.map((r) => [
      getTripulanteNome(r),
      r.reserva_hotel_nome ?? "",
      r.reserva_hotel_endereco ?? "",
      `${r.escala?.navio?.nome ?? ""} / ${r.escala?.porto ?? ""}`,
      formatDate(r.reserva_checkin),
      formatDate(r.reserva_checkout),
      r.reserva_valor != null ? String(r.reserva_valor) : "",
      r.reserva_cafe_incluso ? "Sim" : "Não",
      r.reserva_almoco_incluso ? "Sim" : "Não",
      r.reserva_confirmado ? "Sim" : "Não",
    ])
    const csv = [headers.join(";"), ...rows.map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";"))].join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `reservas-hotel-${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const gerarPdfRelatorio = async () => {
    setGerandoPdf(true)
    try {
      await gerarRelatorioReservasPDF({
        reservas,
        dataInicio: filtroInicial?.dataInicio,
        dataFim: filtroInicial?.dataFim,
      })
    } finally {
      setGerandoPdf(false)
    }
  }

  if (reservas.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-12 text-center text-muted-foreground">
        <Hotel className="mx-auto h-12 w-12 opacity-50 mb-4" />
        {filtroInicial?.dataInicio || filtroInicial?.dataFim ? (
          <>
            <p>Nenhuma reserva encontrada no período selecionado.</p>
            <Button variant="outline" className="mt-4" onClick={limparFiltro}>
              Limpar filtro
            </Button>
          </>
        ) : (
          <>
            <p>Nenhum tripulante com necessidade de hotel no momento.</p>
            <p className="text-sm mt-2">Crie demandas do tipo &quot;Reserva hotel&quot; ou vincule reserva às demandas de tripulante.</p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/demandas">Ver demandas</Link>
            </Button>
          </>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="hidden print:block text-lg font-semibold mb-4">
        Relatório de Reservas (Hotel) — {format(new Date(), "dd/MM/yyyy", { locale: ptBR })}
      </div>
      <div className="rounded-lg border bg-card p-4 space-y-4 print:border-0 print:p-0">
        <div className="flex flex-wrap items-end gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <Label htmlFor="data-inicio" className="text-muted-foreground text-sm">Data início</Label>
            <Input
              id="data-inicio"
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-40"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="data-fim" className="text-muted-foreground text-sm">Data fim</Label>
            <Input
              id="data-fim"
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="w-40"
            />
          </div>
          <Button variant="outline" size="sm" onClick={aplicarFiltro}>
            <Filter className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
          {(filtroInicial?.dataInicio || filtroInicial?.dataFim) && (
            <Button variant="ghost" size="sm" onClick={limparFiltro}>
              Limpar filtro
            </Button>
          )}
          <div className="flex-1" />
          <Button variant="outline" size="sm" onClick={exportarCSV}>
            <FileDown className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={gerarPdfRelatorio}
            disabled={gerandoPdf}
            title={`Gerar PDF com as ${reservas.length} reserva(s) exibidas nesta página`}
          >
            {gerandoPdf ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Printer className="h-4 w-4 mr-2" />}
            Gerar PDF ({reservas.length})
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium">Tripulante</th>
                <th className="text-left p-3 font-medium">Hotel</th>
                <th className="text-left p-3 font-medium">Navio / Escala</th>
                <th className="text-left p-3 font-medium">Check-in</th>
                <th className="text-left p-3 font-medium">Check-out</th>
                <th className="text-right p-3 font-medium">Valor</th>
                <th className="text-center p-3 font-medium">Café</th>
                <th className="text-center p-3 font-medium">Almoço</th>
                <th className="text-center p-3 font-medium">Confirmado</th>
                <th className="w-10 p-3 print:hidden" />
              </tr>
            </thead>
            <tbody>
              {reservas.map((r) => (
                <tr key={r.id} className="border-b hover:bg-muted/30">
                  <td className="p-3 font-medium">{getTripulanteNome(r)}</td>
                  <td className="p-3">
                    {r.reserva_hotel_nome ? (
                      <span title={r.reserva_hotel_endereco ?? undefined}>
                        {r.reserva_hotel_nome}
                        {r.reserva_hotel_endereco && (
                          <span className="block text-xs text-muted-foreground truncate max-w-[200px]" title={r.reserva_hotel_endereco}>
                            {r.reserva_hotel_endereco}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {r.escala?.navio?.nome ?? "—"} / {r.escala?.porto ?? "—"}
                  </td>
                  <td className="p-3">{formatDate(r.reserva_checkin)}</td>
                  <td className="p-3">{formatDate(r.reserva_checkout)}</td>
                  <td className="p-3 text-right">{formatCurrency(r.reserva_valor)}</td>
                  <td className="p-3 text-center">
                    {r.reserva_cafe_incluso ? (
                      <Coffee className="h-4 w-4 text-primary inline-block" aria-label="Café incluso" />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {r.reserva_almoco_incluso ? (
                      <UtensilsCrossed className="h-4 w-4 text-primary inline-block" aria-label="Almoço incluso" />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {r.reserva_confirmado ? (
                      <Badge className="bg-success/15 text-success border-success/30">
                        <CheckCheck className="h-3.5 w-3.5 mr-1 inline" />
                        Sim
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Pendente</Badge>
                    )}
                  </td>
                  <td className="p-3 print:hidden">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          setRemoveError(null)
                          setRemoving(r)
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Excluir
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/demandas/${r.id}`} aria-label="Abrir demanda">
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AlertDialog open={!!removing} onOpenChange={(open) => !open && !saving && (setRemoving(null), setRemoveError(null))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover reserva?</AlertDialogTitle>
            <AlertDialogDescription>
              Os dados de reserva de hotel serão removidos desta demanda
              {removing ? ` (${getTripulanteNome(removing)})` : ""}. A demanda continuará existindo; apenas a reserva será desvinculada.
            </AlertDialogDescription>
            {removeError && (
              <p className="text-destructive text-sm font-medium">{removeError}</p>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async (e) => {
                e.preventDefault()
                await handleRemove()
              }}
              disabled={saving}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Remover reserva
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar reserva — {editing ? getTripulanteNome(editing) : ""}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Nome do hotel</Label>
              <Input
                placeholder="Ex: Hotel Marejada"
                value={form.reserva_hotel_nome ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, reserva_hotel_nome: e.target.value.trim() || undefined }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Endereço do hotel (onde fica)</Label>
              <Input
                placeholder="Rua, número, bairro, cidade"
                value={form.reserva_hotel_endereco ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    reserva_hotel_endereco: e.target.value.trim() || undefined,
                  }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Check-in</Label>
                <Input
                  type="date"
                  value={form.reserva_checkin ? String(form.reserva_checkin).slice(0, 10) : ""}
                  onChange={(e) => setForm((f) => ({ ...f, reserva_checkin: e.target.value || undefined }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Check-out</Label>
                <Input
                  type="date"
                  value={form.reserva_checkout ? String(form.reserva_checkout).slice(0, 10) : ""}
                  onChange={(e) => setForm((f) => ({ ...f, reserva_checkout: e.target.value || undefined }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={form.reserva_valor ?? ""}
                onChange={(e) => {
                  const v = e.target.value ? Number(e.target.value) : undefined
                  setForm((f) => ({ ...f, reserva_valor: v }))
                }}
              />
            </div>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <Switch
                  checked={form.reserva_cafe_incluso ?? false}
                  onCheckedChange={(checked) =>
                    setForm((f) => ({ ...f, reserva_cafe_incluso: !!checked }))
                  }
                />
                <span>Café incluso</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Switch
                  checked={form.reserva_almoco_incluso ?? false}
                  onCheckedChange={(checked) =>
                    setForm((f) => ({ ...f, reserva_almoco_incluso: !!checked }))
                  }
                />
                <span>Almoço incluso</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Switch
                  checked={form.reserva_confirmado ?? false}
                  onCheckedChange={(checked) =>
                    setForm((f) => ({ ...f, reserva_confirmado: !!checked }))
                  }
                />
                <span>Hotel confirmado</span>
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
