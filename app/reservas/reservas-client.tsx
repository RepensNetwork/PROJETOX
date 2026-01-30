"use client"

import { useState } from "react"
import Link from "next/link"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Hotel, Loader2, ExternalLink, Coffee, UtensilsCrossed, CheckCheck } from "lucide-react"
import type { ReservaItem, UpdateReservaHotelInput } from "@/lib/reservas"
import { getTripulanteNome } from "@/lib/reservas"
import { updateReservaHotel } from "@/app/actions/reservas"

interface ReservasClientProps {
  reservas: ReservaItem[]
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

export function ReservasClient({ reservas }: ReservasClientProps) {
  const [editing, setEditing] = useState<ReservaItem | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<UpdateReservaHotelInput>({})

  const openEdit = (r: ReservaItem) => {
    setEditing(r)
    setForm({
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
    const result = await updateReservaHotel(editing.id, form)
    setSaving(false)
    if (result.success) {
      setEditing(null)
      window.location.reload()
    }
  }

  if (reservas.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-12 text-center text-muted-foreground">
        <Hotel className="mx-auto h-12 w-12 opacity-50 mb-4" />
        <p>Nenhum tripulante com necessidade de hotel no momento.</p>
        <p className="text-sm mt-2">Crie demandas do tipo &quot;Reserva hotel&quot; e vincule ao tripulante (demanda principal).</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/demandas">Ver demandas</Link>
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium">Tripulante</th>
                <th className="text-left p-3 font-medium">Navio / Escala</th>
                <th className="text-left p-3 font-medium">Check-in</th>
                <th className="text-left p-3 font-medium">Check-out</th>
                <th className="text-right p-3 font-medium">Valor</th>
                <th className="text-center p-3 font-medium">Café</th>
                <th className="text-center p-3 font-medium">Almoço</th>
                <th className="text-center p-3 font-medium">Confirmado</th>
                <th className="w-10 p-3" />
              </tr>
            </thead>
            <tbody>
              {reservas.map((r) => (
                <tr key={r.id} className="border-b hover:bg-muted/30">
                  <td className="p-3 font-medium">{getTripulanteNome(r)}</td>
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
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>
                        Editar
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

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar reserva — {editing ? getTripulanteNome(editing) : ""}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
