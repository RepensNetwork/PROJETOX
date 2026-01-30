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
import { Plus, Loader2 } from "lucide-react"
import { DateTimePickerPopover } from "@/components/ui/datetime-picker-popover"
import { createDemanda, updateDemanda } from "@/app/actions/demandas"
import type { Demanda, Escala, Navio, Membro } from "@/lib/types/database"

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
  })

  // Atualizar escala_id quando escalaId mudar
  React.useEffect(() => {
    if (escalaId && !demanda) {
      setFormData(prev => ({ ...prev, escala_id: escalaId }))
    }
  }, [escalaId, demanda])

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

      let pickupAtISO: string | undefined = undefined
      if (formData.pickup_at && formData.pickup_at.trim() !== "") {
        try {
          const pickupDate = new Date(formData.pickup_at)
          if (isNaN(pickupDate.getTime())) {
            alert("Data de busca inválida. Por favor, verifique o formato.")
            setLoading(false)
            return
          }
          pickupAtISO = pickupDate.toISOString()
        } catch (error) {
          alert("Erro ao processar data de busca. Por favor, verifique o formato.")
          setLoading(false)
          return
        }
      }

      const data = {
        escala_id: escalaId || formData.escala_id,
        tipo: formData.tipo as Demanda["tipo"],
        categoria: formData.categoria as Demanda["categoria"],
        titulo: formData.titulo.trim(),
        descricao: formData.descricao?.trim() || undefined,
        pickup_at: pickupAtISO,
        pickup_local: formData.pickup_local?.trim() || undefined,
        dropoff_local: formData.dropoff_local?.trim() || undefined,
        status: formData.status as Demanda["status"],
        prioridade: formData.prioridade as Demanda["prioridade"],
        responsavel_id: formData.responsavel_id || undefined,
        prazo: prazoISO,
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
          })
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
                <Select
                  value={formData.escala_id}
                  onValueChange={(value) => setFormData({ ...formData, escala_id: value })}
                  required
                >
                  <SelectTrigger id="escala_id">
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pickup_at">Horário de busca</Label>
                    <DateTimePickerPopover
                      id="pickup_at"
                      value={formData.pickup_at || undefined}
                      placeholder="Selecionar data e hora"
                      onChange={(iso) => setFormData({ ...formData, pickup_at: iso ?? "" })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pickup_local">Local de busca</Label>
                    <Input
                      id="pickup_local"
                      value={formData.pickup_local}
                      onChange={(e) => setFormData({ ...formData, pickup_local: e.target.value })}
                      placeholder="Origem / local de pickup"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dropoff_local">Destino</Label>
                  <Input
                    id="dropoff_local"
                    value={formData.dropoff_local}
                    onChange={(e) => setFormData({ ...formData, dropoff_local: e.target.value })}
                    placeholder="Destino / local de entrega"
                  />
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
                value={formData.responsavel_id}
                onValueChange={(value) => setFormData({ ...formData, responsavel_id: value === "none" ? "" : value })}
              >
                <SelectTrigger id="responsavel_id">
                  <SelectValue placeholder="Selecione um responsável" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem responsável</SelectItem>
                  {membros.map((membro) => (
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
