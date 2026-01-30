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
import { Car, Plus, Trash2, Loader2 } from "lucide-react"
import { buildTransportLegs } from "@/lib/transportes"
import type { Demanda, Escala, Navio } from "@/lib/types/database"
import { addTransportLeg, removeTransportLeg } from "@/app/actions/demandas"
import { DateTimePickerPopover } from "@/components/ui/datetime-picker-popover"

interface DemandaTransporteBlockProps {
  demanda: Demanda & { escala?: Escala & { navio: Navio } }
}

export function DemandaTransporteBlock({ demanda }: DemandaTransporteBlockProps) {
  const router = useRouter()
  const legs = buildTransportLegs({ ...demanda, escala: demanda.escala })

  const [addOpen, setAddOpen] = useState(false)
  const [removeLegId, setRemoveLegId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    label: "",
    pickup_at: null as string | null,
    pickup_local: "",
    dropoff_local: "",
  })

  const handleAdd = async () => {
    if (!form.label.trim()) return
    setSaving(true)
    const result = await addTransportLeg(demanda.id, {
      label: form.label.trim(),
      pickup_at: form.pickup_at || null,
      pickup_local: form.pickup_local.trim() || null,
      dropoff_local: form.dropoff_local.trim() || null,
    })
    setSaving(false)
    if (result.success) {
      setAddOpen(false)
      setForm({ label: "", pickup_at: null, pickup_local: "", dropoff_local: "" })
      router.refresh()
    }
  }

  const handleRemove = async (legId: string) => {
    setSaving(true)
    const result = await removeTransportLeg(demanda.id, legId)
    setSaving(false)
    if (result.success) {
      setRemoveLegId(null)
      router.refresh()
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Transporte
          </CardTitle>
          <CardDescription>
            Trechos de transporte desta demanda (tripulante). Adicione ou remova trechos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {legs.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              Nenhum trecho de transporte definido
            </p>
          ) : (
            <ul className="space-y-3">
              {legs.map((leg) => (
                <li
                  key={leg.id}
                  className="flex flex-wrap items-center gap-2 rounded-lg border p-3 text-sm"
                >
                  <span className="font-medium">{leg.label}</span>
                  {leg.pickup_local && (
                    <span className="text-muted-foreground">
                      {leg.pickup_local}
                      {leg.dropoff_local ? ` → ${leg.dropoff_local}` : ""}
                    </span>
                  )}
                  {leg.pickup_at && (
                    <span className="text-muted-foreground">
                      {format(new Date(leg.pickup_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </span>
                  )}
                  {leg.status && (
                    <Badge variant="outline" className="text-xs">
                      {leg.status === "concluido" ? "Concluído" : "Pendente"}
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-auto h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => setRemoveLegId(leg.id)}
                    title="Remover trecho"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
          <Button variant="outline" size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar trecho
          </Button>
        </CardContent>
      </Card>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar trecho de transporte</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="leg-label">Nome do trecho *</Label>
              <Input
                id="leg-label"
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                placeholder="Ex: Aeroporto → Hotel"
              />
            </div>
            <div>
              <Label>Data e hora (opcional)</Label>
              <DateTimePickerPopover
                value={form.pickup_at}
                onChange={(v) => setForm((f) => ({ ...f, pickup_at: v }))}
                placeholder="Escolher data/hora"
              />
            </div>
            <div>
              <Label htmlFor="leg-origem">Origem (opcional)</Label>
              <Input
                id="leg-origem"
                value={form.pickup_local}
                onChange={(e) => setForm((f) => ({ ...f, pickup_local: e.target.value }))}
                placeholder="Ex: Aeroporto GRU"
              />
            </div>
            <div>
              <Label htmlFor="leg-destino">Destino (opcional)</Label>
              <Input
                id="leg-destino"
                value={form.dropoff_local}
                onChange={(e) => setForm((f) => ({ ...f, dropoff_local: e.target.value }))}
                placeholder="Ex: Hotel"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAdd} disabled={saving || !form.label.trim()}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!removeLegId} onOpenChange={() => !saving && setRemoveLegId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover trecho?</AlertDialogTitle>
            <AlertDialogDescription>
              Este trecho será removido da demanda. Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => removeLegId && handleRemove(removeLegId)}
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
