"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Hotel, Pencil, Trash2, Loader2, Check, X } from "lucide-react"
import type { Demanda } from "@/lib/types/database"
import type { UpdateReservaHotelInput } from "@/lib/reservas"
import { updateDemandaReserva, clearDemandaReserva } from "@/app/actions/demandas"
import { DateTimePickerPopover } from "@/components/ui/datetime-picker-popover"

interface DemandaReservaBlockProps {
  demanda: Demanda
}

const hasReserva = (d: Demanda) =>
  d.reserva_hotel_nome ?? d.reserva_hotel_endereco ?? d.reserva_checkin ?? d.reserva_checkout ?? d.reserva_valor != null

export function DemandaReservaBlock({ demanda }: DemandaReservaBlockProps) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [removeOpen, setRemoveOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<UpdateReservaHotelInput>({
    reserva_checkin: demanda.reserva_checkin ?? undefined,
    reserva_checkout: demanda.reserva_checkout ?? undefined,
    reserva_valor: demanda.reserva_valor ?? undefined,
    reserva_cafe_incluso: demanda.reserva_cafe_incluso ?? false,
    reserva_almoco_incluso: demanda.reserva_almoco_incluso ?? false,
    reserva_confirmado: demanda.reserva_confirmado ?? false,
  })

  const openEdit = () => {
    setForm({
      reserva_hotel_nome: demanda.reserva_hotel_nome ?? undefined,
      reserva_hotel_endereco: demanda.reserva_hotel_endereco ?? undefined,
      reserva_checkin: demanda.reserva_checkin ?? undefined,
      reserva_checkout: demanda.reserva_checkout ?? undefined,
      reserva_valor: demanda.reserva_valor ?? undefined,
      reserva_cafe_incluso: demanda.reserva_cafe_incluso ?? false,
      reserva_almoco_incluso: demanda.reserva_almoco_incluso ?? false,
      reserva_confirmado: demanda.reserva_confirmado ?? false,
    })
    setEditOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    const result = await updateDemandaReserva(demanda.id, form)
    setSaving(false)
    if (result.success) {
      setEditOpen(false)
      router.refresh()
    }
  }

  const handleRemove = async () => {
    setSaving(true)
    const result = await clearDemandaReserva(demanda.id)
    setSaving(false)
    if (result.success) {
      setRemoveOpen(false)
      router.refresh()
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hotel className="h-5 w-5" />
            Reserva (Hotel)
          </CardTitle>
          <CardDescription>
            Reserva de hotel vinculada a esta demanda (tripulante). Adicione, edite ou remova.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasReserva(demanda) ? (
            <div className="space-y-3">
              <div className="grid gap-2 text-sm">
                {demanda.reserva_hotel_nome && (
                  <p>
                    <span className="text-muted-foreground">Hotel:</span>{" "}
                    {demanda.reserva_hotel_nome}
                  </p>
                )}
                {demanda.reserva_hotel_endereco && (
                  <p>
                    <span className="text-muted-foreground">Endereço:</span>{" "}
                    <span className="whitespace-pre-wrap">{demanda.reserva_hotel_endereco}</span>
                  </p>
                )}
                {demanda.reserva_checkin && (
                  <p>
                    <span className="text-muted-foreground">Check-in:</span>{" "}
                    {format(new Date(demanda.reserva_checkin), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                )}
                {demanda.reserva_checkout && (
                  <p>
                    <span className="text-muted-foreground">Check-out:</span>{" "}
                    {format(new Date(demanda.reserva_checkout), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                )}
                {demanda.reserva_valor != null && (
                  <p>
                    <span className="text-muted-foreground">Valor:</span>{" "}
                    R$ {Number(demanda.reserva_valor).toLocaleString("pt-BR")}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  {demanda.reserva_cafe_incluso != null && (
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      {demanda.reserva_cafe_incluso ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                      Café
                    </span>
                  )}
                  {demanda.reserva_almoco_incluso != null && (
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      {demanda.reserva_almoco_incluso ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                      Almoço
                    </span>
                  )}
                  {demanda.reserva_confirmado != null && (
                    <Badge variant={demanda.reserva_confirmado ? "default" : "secondary"}>
                      {demanda.reserva_confirmado ? "Confirmado" : "Não confirmado"}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={openEdit}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar reserva
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setRemoveOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remover reserva
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground italic mb-3">
                Nenhuma reserva de hotel vinculada
              </p>
              <Button variant="outline" size="sm" onClick={openEdit}>
                <Hotel className="h-4 w-4 mr-2" />
                Adicionar reserva
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{hasReserva(demanda) ? "Editar reserva" : "Adicionar reserva"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="reserva-hotel-nome">Nome do hotel</Label>
              <Input
                id="reserva-hotel-nome"
                value={form.reserva_hotel_nome ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, reserva_hotel_nome: e.target.value.trim() || undefined }))
                }
                placeholder="Ex: Hotel Marejada"
              />
            </div>
            <div>
              <Label htmlFor="reserva-hotel-endereco">Endereço do hotel (onde fica)</Label>
              <Input
                id="reserva-hotel-endereco"
                value={form.reserva_hotel_endereco ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    reserva_hotel_endereco: e.target.value.trim() || undefined,
                  }))
                }
                placeholder="Rua, número, bairro, cidade"
              />
            </div>
            <div>
              <Label>Check-in</Label>
              <DateTimePickerPopover
                value={form.reserva_checkin ?? null}
                onChange={(v) => setForm((f) => ({ ...f, reserva_checkin: v ?? undefined }))}
                mode="date"
                placeholder="Data check-in"
              />
            </div>
            <div>
              <Label>Check-out</Label>
              <DateTimePickerPopover
                value={form.reserva_checkout ?? null}
                onChange={(v) => setForm((f) => ({ ...f, reserva_checkout: v ?? undefined }))}
                mode="date"
                placeholder="Data check-out"
              />
            </div>
            <div>
              <Label htmlFor="reserva-valor">Valor (R$)</Label>
              <Input
                id="reserva-valor"
                type="number"
                step="0.01"
                min={0}
                value={form.reserva_valor ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    reserva_valor: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
                placeholder="0,00"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Café incluso</Label>
              <Switch
                checked={form.reserva_cafe_incluso ?? false}
                onCheckedChange={(v) => setForm((f) => ({ ...f, reserva_cafe_incluso: v }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Almoço incluso</Label>
              <Switch
                checked={form.reserva_almoco_incluso ?? false}
                onCheckedChange={(v) => setForm((f) => ({ ...f, reserva_almoco_incluso: v }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Confirmado</Label>
              <Switch
                checked={form.reserva_confirmado ?? false}
                onCheckedChange={(v) => setForm((f) => ({ ...f, reserva_confirmado: v }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={removeOpen} onOpenChange={() => !saving && setRemoveOpen(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover reserva?</AlertDialogTitle>
            <AlertDialogDescription>
              Os dados de reserva de hotel serão removidos desta demanda. Essa ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleRemove}
              disabled={saving}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
