"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Loader2, Trash2, Hotel } from "lucide-react"
import { DateTimePickerPopover } from "@/components/ui/datetime-picker-popover"
import { createDemanda, updateDemanda } from "@/app/actions/demandas"
import { getMembros } from "@/app/actions/dashboard"
import { EscalaSelectWithCalendar } from "@/components/demandas/escala-select-with-calendar"
import { buildTransportLegs } from "@/lib/transportes"
import type { Demanda, Escala, Navio, Membro } from "@/lib/types/database"

/** Retorna o id da escala cuja data_chegada está mais próxima de hoje (prioriza futuras). */
function getClosestEscalaId(escalas: (Escala & { navio: Navio })[]): string | null {
  if (!escalas.length) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayTime = today.getTime()
  const withTime = escalas.map((e) => {
    const d = e.data_chegada ? new Date(e.data_chegada.slice(0, 10)) : new Date(NaN)
    d.setHours(0, 0, 0, 0)
    return { escala: e, time: d.getTime() }
  }).filter((x) => !isNaN(x.time))
  if (!withTime.length) return escalas[0]?.id ?? null
  const future = withTime.filter((x) => x.time >= todayTime)
  const toPick = future.length > 0 ? future : withTime
  const sorted = future.length > 0
    ? [...toPick].sort((a, b) => a.time - b.time)
    : [...toPick].sort((a, b) => b.time - a.time)
  return sorted[0]?.escala.id ?? null
}

type TransportLegForm = {
  id: string
  pickup_at: string
  pickup_local: string
  dropoff_local: string
}

const TIPOS_TRIPULANTE: Demanda["tipo"][] = [
  "embarque_passageiros",
  "desembarque_passageiros",
  "transporte_terrestre",
]

interface DemandaFormProps {
  demanda?: Demanda
  escalaId?: string
  escalas?: (Escala & { navio: Navio })[]
  membros: Membro[]
  trigger?: React.ReactNode
  onSuccess?: () => void
  /** Abre o formulário com tipo já selecionado (ex.: embarque/desembarque). */
  initialTipo?: Demanda["tipo"]
  /** Modo controlado: controla abertura do diálogo pelo pai. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const statusOptions = [
  { value: "pendente", label: "Pendente" },
  { value: "em_andamento", label: "Em Andamento" },
  { value: "concluida", label: "Concluída" },
  { value: "aguardando_terceiro", label: "Aguardando Terceiro" },
  { value: "cancelada", label: "Cancelada" },
]

const prioridadeOptions = [
  { value: "baixa", label: "Baixa" },
  { value: "media", label: "Média" },
  { value: "alta", label: "Alta" },
  { value: "urgente", label: "Urgente" },
]

const tipoOptions = [
  { value: "embarque_passageiros", label: "Embarque de Tripulantes" },
  { value: "desembarque_passageiros", label: "Desembarque de Tripulantes" },
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

export function DemandaForm({
  demanda,
  escalaId,
  escalas,
  membros,
  trigger,
  onSuccess,
  initialTipo,
  open: openProp,
  onOpenChange: onOpenChangeProp,
}: DemandaFormProps) {
  const router = useRouter()
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = openProp !== undefined
  const open = isControlled ? openProp : internalOpen
  const setOpen = isControlled ? (onOpenChangeProp ?? (() => {})) : setInternalOpen
  const [loading, setLoading] = useState(false)
  const [membrosList, setMembrosList] = useState<Membro[]>(membros)

  React.useEffect(() => {
    setMembrosList(membros)
  }, [membros])

  React.useEffect(() => {
    if (open && membrosList.length === 0) {
      getMembros().then((list) => list?.length ? setMembrosList(list) : null)
    }
  }, [open, membrosList.length])
  const getIsoOrEmpty = (value: string | null | undefined): string => {
    if (!value) return ""
    try {
      const date = new Date(value)
      if (!isNaN(date.getTime())) return date.toISOString()
    } catch (error) {
      console.error("Erro ao converter data:", error)
    }
    return ""
  }

  const [formData, setFormData] = useState({
    escala_id: demanda?.escala_id || escalaId || "",
    tipo: demanda?.tipo || "outro",
    categoria: demanda?.categoria || "processos_internos",
    titulo: demanda?.titulo || "",
    descricao: demanda?.descricao || "",
    status: demanda?.status || "pendente",
    prioridade: demanda?.prioridade || "media",
    responsavel_id: demanda?.responsavel_id || "",
    prazo: getIsoOrEmpty(demanda?.prazo),
    pickup_at: getIsoOrEmpty(demanda?.pickup_at),
    pickup_local: demanda?.pickup_local || "",
    dropoff_local: demanda?.dropoff_local || "",
    reserva_hotel_nome: demanda?.reserva_hotel_nome || "",
    reserva_hotel_endereco: demanda?.reserva_hotel_endereco || "",
    reserva_checkin: getIsoOrEmpty(demanda?.reserva_checkin),
    reserva_checkout: getIsoOrEmpty(demanda?.reserva_checkout),
    reserva_valor: demanda?.reserva_valor != null ? String(demanda.reserva_valor) : "",
  })

  const initialLegs: TransportLegForm[] = demanda
    ? buildTransportLegs(demanda).map((leg) => ({
        id: leg.id,
        pickup_at: leg.pickup_at ?? "",
        pickup_local: leg.pickup_local ?? "",
        dropoff_local: leg.dropoff_local ?? "",
      }))
    : [{ id: "new-leg-0", pickup_at: "", pickup_local: "", dropoff_local: "" }]
  const [transportLegs, setTransportLegs] = useState<TransportLegForm[]>(initialLegs)

  // Atualizar escala_id quando escalaId mudar
  React.useEffect(() => {
    if (escalaId && !demanda) {
      setFormData(prev => ({ ...prev, escala_id: escalaId }))
    }
  }, [escalaId, demanda])

  React.useEffect(() => {
    if (!open) return
    if (demanda) {
      setTransportLegs(
        buildTransportLegs(demanda).map((leg) => ({
          id: leg.id,
          pickup_at: leg.pickup_at ?? "",
          pickup_local: leg.pickup_local ?? "",
          dropoff_local: leg.dropoff_local ?? "",
        }))
      )
    } else {
      setTransportLegs([{ id: "new-leg-0", pickup_at: "", pickup_local: "", dropoff_local: "" }])
    }
  }, [open, demanda])

  // Ao abrir o diálogo (nova demanda), pré-selecionar a escala mais próxima
  React.useEffect(() => {
    if (!open || demanda || escalaId) return
    if (escalas && escalas.length > 0) {
      const closestId = getClosestEscalaId(escalas)
      if (closestId) {
        setFormData((prev) => ({ ...prev, escala_id: closestId }))
      }
    }
  }, [open, demanda, escalaId, escalas])

  // Ao abrir o diálogo (nova demanda), preencher tipo/categoria conforme initialTipo
  React.useEffect(() => {
    if (!open || demanda) return
    if (initialTipo) {
      const categoria =
        initialTipo === "embarque_passageiros" || initialTipo === "desembarque_passageiros"
          ? "passageiros"
          : "logistica"
      setFormData((prev) => ({ ...prev, tipo: initialTipo, categoria }))
    } else {
      setFormData((prev) => ({ ...prev, tipo: "outro", categoria: "processos_internos" }))
    }
  }, [open, demanda, initialTipo])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validações
      if (!formData.titulo || formData.titulo.trim() === "") {
        alert("Por favor, preencha o título da demanda.")
        setLoading(false)
        return
      }

      if (!escalaId && (!formData.escala_id || formData.escala_id.trim() === "")) {
        alert("Por favor, selecione uma escala.")
        setLoading(false)
        return
      }

      if (!formData.tipo || formData.tipo.trim() === "") {
        alert("Por favor, selecione o tipo da demanda.")
        setLoading(false)
        return
      }

      if (!formData.categoria || formData.categoria.trim() === "") {
        alert("Por favor, selecione a categoria da demanda.")
        setLoading(false)
        return
      }

      // Validar data de prazo se fornecida
      let prazoISO: string | undefined = undefined
      if (formData.prazo && formData.prazo.trim() !== "") {
        try {
          const prazoDate = new Date(formData.prazo)
          if (isNaN(prazoDate.getTime())) {
            alert("Data de prazo inválida. Por favor, verifique o formato.")
            setLoading(false)
            return
          }
          prazoISO = prazoDate.toISOString()
        } catch (error) {
          alert("Erro ao processar data de prazo. Por favor, verifique o formato.")
          setLoading(false)
          return
        }
      }

      const demandaId = demanda?.id ?? `temp-${Date.now()}`
      const legsForSubmit = transportLegs.map((leg, index) => {
        let pickupAtISO: string | null = null
        if (leg.pickup_at?.trim()) {
          try {
            const d = new Date(leg.pickup_at)
            if (!isNaN(d.getTime())) pickupAtISO = d.toISOString()
          } catch {
            // ignore
          }
        }
        return {
          id: leg.id.startsWith("new-leg-") ? `${demandaId}-leg-${index}` : leg.id,
          label: `Trecho ${index + 1}`,
          pickup_at: pickupAtISO,
          pickup_local: leg.pickup_local?.trim() || null,
          dropoff_local: leg.dropoff_local?.trim() || null,
          status: "pendente" as const,
        }
      })

      const firstLeg = legsForSubmit[0]
      const pickupAtISO = firstLeg?.pickup_at ?? undefined
      const pickup_local = firstLeg?.pickup_local ?? undefined
      const dropoff_local = firstLeg?.dropoff_local ?? undefined

      let reserva_checkin_iso: string | undefined
      let reserva_checkout_iso: string | undefined
      if (showTransporte && formData.reserva_checkin?.trim()) {
        try {
          const d = new Date(formData.reserva_checkin)
          reserva_checkin_iso = !isNaN(d.getTime()) ? d.toISOString() : undefined
        } catch {
          reserva_checkin_iso = undefined
        }
      }
      if (showTransporte && formData.reserva_checkout?.trim()) {
        try {
          const d = new Date(formData.reserva_checkout)
          reserva_checkout_iso = !isNaN(d.getTime()) ? d.toISOString() : undefined
        } catch {
          reserva_checkout_iso = undefined
        }
      }
      const reserva_valor_num =
        showTransporte && formData.reserva_valor?.trim()
          ? parseFloat(formData.reserva_valor.replace(",", "."))
          : undefined
      const reservaValorOk =
        reserva_valor_num === undefined || (!Number.isNaN(reserva_valor_num) && reserva_valor_num >= 0)

      const data = {
        escala_id: escalaId || formData.escala_id,
        tipo: formData.tipo as Demanda["tipo"],
        categoria: formData.categoria as Demanda["categoria"],
        titulo: formData.titulo.trim(),
        descricao: formData.descricao?.trim() || undefined,
        pickup_at: pickupAtISO,
        pickup_local,
        dropoff_local,
        status: formData.status as Demanda["status"],
        prioridade: formData.prioridade as Demanda["prioridade"],
        responsavel_id: formData.responsavel_id || undefined,
        prazo: prazoISO,
        transporte_legs: showTransporte ? legsForSubmit : undefined,
        ...(showTransporte && {
          reserva_hotel_nome: formData.reserva_hotel_nome?.trim() || undefined,
          reserva_hotel_endereco: formData.reserva_hotel_endereco?.trim() || undefined,
          reserva_checkin: reserva_checkin_iso,
          reserva_checkout: reserva_checkout_iso,
          reserva_valor: reservaValorOk && reserva_valor_num !== undefined ? reserva_valor_num : undefined,
        }),
      }

      console.log("Enviando demanda:", data)

      const result = demanda
        ? await updateDemanda(demanda.id, data)
        : await createDemanda(data)

      console.log("Resultado:", result)

      if (result.success) {
        setOpen(false)
        router.refresh()
        onSuccess?.()
        if (!demanda) {
          setFormData({
            escala_id: escalaId || "",
            tipo: "outro",
            categoria: "processos_internos",
            titulo: "",
            descricao: "",
            status: "pendente",
            prioridade: "media",
            responsavel_id: "",
            prazo: "",
            pickup_at: "",
            pickup_local: "",
            dropoff_local: "",
            reserva_hotel_nome: "",
            reserva_hotel_endereco: "",
            reserva_checkin: "",
            reserva_checkout: "",
            reserva_valor: "",
          })
          setTransportLegs([{ id: "new-leg-0", pickup_at: "", pickup_local: "", dropoff_local: "" }])
        }
      } else {
        alert(result.error || "Erro ao salvar demanda. Verifique o console para mais detalhes.")
        console.error("Erro ao salvar demanda:", result.error)
      }
    } catch (error) {
      console.error("Erro inesperado:", error)
      alert("Erro inesperado ao salvar demanda. Verifique o console para mais detalhes.")
    } finally {
      setLoading(false)
    }
  }

  const showTransporte = TIPOS_TRIPULANTE.includes(formData.tipo as Demanda["tipo"])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          {trigger || (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Demanda
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{demanda ? "Editar Demanda" : "Nova Demanda"}</DialogTitle>
            <DialogDescription>
              {demanda
                ? "Atualize as informações da demanda."
                : "Preencha as informações da nova demanda."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {!escalaId && escalas && escalas.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="escala_id">Escala *</Label>
                <EscalaSelectWithCalendar
                  escalas={escalas}
                  value={formData.escala_id}
                  onSelect={(id) => setFormData({ ...formData, escala_id: id })}
                  id="escala_id"
                  required
                />
              </div>
            )}
            {!escalaId && (!escalas || escalas.length === 0) && (
              <div className="rounded-lg border border-warning/50 bg-warning/10 p-4">
                <p className="text-sm text-warning-foreground">
                  ⚠️ Nenhuma escala disponível. Crie uma escala primeiro antes de adicionar demandas.
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo *</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                  required
                >
                  <SelectTrigger id="tipo">
                    <SelectValue placeholder="Selecione o tipo" />
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
                <Label htmlFor="categoria">Categoria *</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                  required
                >
                  <SelectTrigger id="categoria">
                    <SelectValue placeholder="Selecione a categoria" />
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
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Título da demanda"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descrição detalhada da demanda..."
                rows={3}
              />
            </div>

            {showTransporte && (
              <div className="rounded-md border bg-muted/30 p-3 space-y-3">
                <p className="text-xs font-medium text-muted-foreground">
                  Transporte (opcional) — motorista e hotel podem ser definidos na página da demanda
                </p>
                {transportLegs.map((leg, index) => (
                  <div key={leg.id} className="space-y-3 rounded border bg-background/50 p-3">
                    {transportLegs.length > 1 && (
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() =>
                            setTransportLegs((prev) => prev.filter((l) => l.id !== leg.id))
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Horário de busca</Label>
                        <DateTimePickerPopover
                          value={leg.pickup_at || undefined}
                          placeholder="Selecionar data e hora"
                          onChange={(iso) =>
                            setTransportLegs((prev) =>
                              prev.map((l) =>
                                l.id === leg.id ? { ...l, pickup_at: iso ?? "" } : l
                              )
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Local de busca</Label>
                        <Input
                          value={leg.pickup_local}
                          onChange={(e) =>
                            setTransportLegs((prev) =>
                              prev.map((l) =>
                                l.id === leg.id ? { ...l, pickup_local: e.target.value } : l
                              )
                            )
                          }
                          placeholder="Origem / local de pickup"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Destino</Label>
                      <Input
                        value={leg.dropoff_local}
                        onChange={(e) =>
                          setTransportLegs((prev) =>
                            prev.map((l) =>
                              l.id === leg.id ? { ...l, dropoff_local: e.target.value } : l
                            )
                          )
                        }
                        placeholder="Destino / local de entrega"
                      />
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  onClick={() =>
                    setTransportLegs((prev) => [
                      ...prev,
                      {
                        id: `new-leg-${Date.now()}`,
                        pickup_at: "",
                        pickup_local: "",
                        dropoff_local: "",
                      },
                    ])
                  }
                >
                  <Plus className="h-4 w-4" />
                  Adicionar mais um transporte
                </Button>
              </div>
            )}

            {showTransporte && (
              <div className="rounded-md border bg-muted/30 p-3 space-y-3">
                <p className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                  <Hotel className="h-4 w-4" />
                  Reserva de Hotel (opcional)
                </p>
                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="reserva_hotel_nome">Nome do hotel</Label>
                    <Input
                      id="reserva_hotel_nome"
                      value={formData.reserva_hotel_nome}
                      onChange={(e) => setFormData({ ...formData, reserva_hotel_nome: e.target.value })}
                      placeholder="Ex.: Hotel Itajaí Tur"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reserva_hotel_endereco">Endereço do hotel</Label>
                    <Input
                      id="reserva_hotel_endereco"
                      value={formData.reserva_hotel_endereco}
                      onChange={(e) => setFormData({ ...formData, reserva_hotel_endereco: e.target.value })}
                      placeholder="Onde fica o hotel"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Check-in</Label>
                      <DateTimePickerPopover
                        mode="date"
                        value={formData.reserva_checkin || undefined}
                        placeholder="Data check-in"
                        onChange={(iso) => setFormData({ ...formData, reserva_checkin: iso ?? "" })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Check-out</Label>
                      <DateTimePickerPopover
                        mode="date"
                        value={formData.reserva_checkout || undefined}
                        placeholder="Data check-out"
                        onChange={(iso) => setFormData({ ...formData, reserva_checkout: iso ?? "" })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reserva_valor">Valor (R$)</Label>
                    <Input
                      id="reserva_valor"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.reserva_valor}
                      onChange={(e) => setFormData({ ...formData, reserva_valor: e.target.value })}
                      placeholder="0,00"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prioridade">Prioridade</Label>
                <Select
                  value={formData.prioridade}
                  onValueChange={(value) => setFormData({ ...formData, prioridade: value })}
                >
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsavel_id">Responsável</Label>
              <Select
                value={formData.responsavel_id || "none"}
                onValueChange={(value) => setFormData({ ...formData, responsavel_id: value === "none" ? "" : value })}
              >
                <SelectTrigger id="responsavel_id">
                  <SelectValue placeholder="Selecione um responsável" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem responsável</SelectItem>
                  {membrosList.map((membro) => (
                    <SelectItem key={membro.id} value={membro.id}>
                      {membro.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prazo">Prazo</Label>
              <DateTimePickerPopover
                id="prazo"
                value={formData.prazo || undefined}
                placeholder="Selecionar data e hora"
                onChange={(iso) => setFormData({ ...formData, prazo: iso ?? "" })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={
                loading || 
                !formData.titulo?.trim() || 
                !formData.tipo ||
                !formData.categoria ||
                (!escalaId && (!formData.escala_id || formData.escala_id.trim() === ""))
              }
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {demanda ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
