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
import { createEscala, updateEscala } from "@/app/actions/escalas"
import type { Escala, Navio } from "@/lib/types/database"

interface EscalaFormProps {
  escala?: Escala
  navios: Navio[]
  trigger?: React.ReactNode
  onSuccess?: () => void
}

const portos = [
  "Santos - SP",
  "Paranaguá - PR",
  "Rio Grande - RS",
  "Itajaí - SC",
  "Vitória - ES",
  "Rio de Janeiro - RJ",
  "Salvador - BA",
  "Recife - PE",
  "Fortaleza - CE",
  "Manaus - AM",
  "São Luís - MA",
  "Belém - PA",
  "Outro",
]

const statusOptions = [
  { value: "planejada", label: "Planejada" },
  { value: "em_operacao", label: "Em Operação" },
  { value: "concluida", label: "Concluída" },
  { value: "cancelada", label: "Cancelada" },
]

export function EscalaForm({ escala, navios, trigger, onSuccess }: EscalaFormProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const getDataString = (data: string | null | undefined): string => {
    if (!data) return ""
    try {
      const dataDate = new Date(data)
      if (!isNaN(dataDate.getTime())) {
        return dataDate.toISOString().slice(0, 16)
      }
    } catch (error) {
      console.error("Erro ao converter data:", error)
    }
    return ""
  }

  const [formData, setFormData] = useState({
    navio_id: escala?.navio_id || "",
    porto: escala?.porto || "",
    data_chegada: getDataString(escala?.data_chegada),
    data_saida: getDataString(escala?.data_saida),
    status: escala?.status || "planejada",
    observacoes: escala?.observacoes || "",
  })

  // Reset form when dialog opens/closes or escala changes
  React.useEffect(() => {
    if (open && escala) {
      // Validar e converter datas com segurança
      let dataChegadaStr = ""
      let dataSaidaStr = ""

      try {
        if (escala.data_chegada) {
          const dataChegada = new Date(escala.data_chegada)
          if (!isNaN(dataChegada.getTime())) {
            dataChegadaStr = dataChegada.toISOString().slice(0, 16)
          }
        }
      } catch (error) {
        console.error("Erro ao converter data_chegada:", error)
      }

      try {
        if (escala.data_saida) {
          const dataSaida = new Date(escala.data_saida)
          if (!isNaN(dataSaida.getTime())) {
            dataSaidaStr = dataSaida.toISOString().slice(0, 16)
          }
        }
      } catch (error) {
        console.error("Erro ao converter data_saida:", error)
      }

      setFormData({
        navio_id: escala.navio_id,
        porto: escala.porto,
        data_chegada: dataChegadaStr,
        data_saida: dataSaidaStr,
        status: escala.status,
        observacoes: escala.observacoes || "",
      })
    } else if (!open && !escala) {
      setFormData({
        navio_id: "",
        porto: "",
        data_chegada: "",
        data_saida: "",
        status: "planejada",
        observacoes: "",
      })
    }
  }, [open, escala])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validar que as datas não estão vazias
      if (!formData.data_chegada || formData.data_chegada.trim() === "") {
        alert("Por favor, preencha a data de chegada")
        setLoading(false)
        return
      }

      if (!formData.data_saida || formData.data_saida.trim() === "") {
        alert("Por favor, preencha a data de saída")
        setLoading(false)
        return
      }

      // Validar que as datas são válidas antes de converter
      let dataChegada: Date
      let dataSaida: Date

      try {
        dataChegada = new Date(formData.data_chegada)
        if (isNaN(dataChegada.getTime())) {
          throw new Error("Data de chegada inválida")
        }
      } catch (error) {
        alert("Data de chegada inválida. Por favor, verifique o formato.")
        setLoading(false)
        return
      }

      try {
        dataSaida = new Date(formData.data_saida)
        if (isNaN(dataSaida.getTime())) {
          throw new Error("Data de saída inválida")
        }
      } catch (error) {
        alert("Data de saída inválida. Por favor, verifique o formato.")
        setLoading(false)
        return
      }

      const data = {
        navio_id: formData.navio_id,
        porto: formData.porto,
        data_chegada: dataChegada.toISOString(),
        data_saida: dataSaida.toISOString(),
        status: formData.status as Escala["status"],
        observacoes: formData.observacoes || undefined,
      }

      const result = escala
        ? await updateEscala(escala.id, data)
        : await createEscala(data)

      if (result.success) {
        setOpen(false)
        router.refresh()
        onSuccess?.()
        if (!escala) {
          setFormData({
            navio_id: "",
            porto: "",
            data_chegada: "",
            data_saida: "",
            status: "planejada",
            observacoes: "",
          })
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen && !escala) {
      // Reset form when closing create dialog
      setFormData({
        navio_id: "",
        porto: "",
        data_chegada: "",
        data_saida: "",
        status: "planejada",
        observacoes: "",
      })
    }
  }

  return (
    <>
      {trigger ? (
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            {trigger}
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{escala ? "Editar Escala" : "Nova Escala"}</DialogTitle>
            <DialogDescription>
              {escala
                ? "Atualize as informações da escala."
                : "Preencha as informações da nova escala."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="navio_id">Navio *</Label>
              <Select
                value={formData.navio_id}
                onValueChange={(value) => setFormData({ ...formData, navio_id: value })}
                required
              >
                <SelectTrigger id="navio_id">
                  <SelectValue placeholder="Selecione um navio" />
                </SelectTrigger>
                <SelectContent>
                  {navios.map((navio) => (
                    <SelectItem key={navio.id} value={navio.id}>
                      {navio.nome} - {navio.companhia}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="porto">Porto *</Label>
              <Select
                value={formData.porto}
                onValueChange={(value) => setFormData({ ...formData, porto: value })}
                required
              >
                <SelectTrigger id="porto">
                  <SelectValue placeholder="Selecione um porto" />
                </SelectTrigger>
                <SelectContent>
                  {portos.map((porto) => (
                    <SelectItem key={porto} value={porto}>
                      {porto}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data_chegada">Data de Chegada *</Label>
                <Input
                  id="data_chegada"
                  type="datetime-local"
                  value={formData.data_chegada}
                  onChange={(e) => setFormData({ ...formData, data_chegada: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="data_saida">Data de Saída *</Label>
                <Input
                  id="data_saida"
                  type="datetime-local"
                  value={formData.data_saida}
                  onChange={(e) => setFormData({ ...formData, data_saida: e.target.value })}
                  required
                />
              </div>
            </div>

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
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                placeholder="Observações sobre a escala..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.navio_id || !formData.porto || !formData.data_chegada || !formData.data_saida}
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {escala ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
        </Dialog>
      ) : (
        <>
          <Button 
            type="button"
            onClick={() => setOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Escala
          </Button>
          <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>{escala ? "Editar Escala" : "Nova Escala"}</DialogTitle>
                  <DialogDescription>
                    {escala
                      ? "Atualize as informações da escala."
                      : "Preencha as informações da nova escala."}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="navio_id">Navio *</Label>
                    <Select
                      value={formData.navio_id}
                      onValueChange={(value) => setFormData({ ...formData, navio_id: value })}
                      required
                    >
                      <SelectTrigger id="navio_id">
                        <SelectValue placeholder="Selecione um navio" />
                      </SelectTrigger>
                      <SelectContent>
                        {navios.map((navio) => (
                          <SelectItem key={navio.id} value={navio.id}>
                            {navio.nome} - {navio.companhia}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="porto">Porto *</Label>
                    <Select
                      value={formData.porto}
                      onValueChange={(value) => setFormData({ ...formData, porto: value })}
                      required
                    >
                      <SelectTrigger id="porto">
                        <SelectValue placeholder="Selecione um porto" />
                      </SelectTrigger>
                      <SelectContent>
                        {portos.map((porto) => (
                          <SelectItem key={porto} value={porto}>
                            {porto}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="data_chegada">Data de Chegada *</Label>
                      <Input
                        id="data_chegada"
                        type="datetime-local"
                        value={formData.data_chegada}
                        onChange={(e) => setFormData({ ...formData, data_chegada: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="data_saida">Data de Saída *</Label>
                      <Input
                        id="data_saida"
                        type="datetime-local"
                        value={formData.data_saida}
                        onChange={(e) => setFormData({ ...formData, data_saida: e.target.value })}
                        required
                      />
                    </div>
                  </div>

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
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      id="observacoes"
                      value={formData.observacoes}
                      onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                      placeholder="Observações sobre a escala..."
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading || !formData.navio_id || !formData.porto || !formData.data_chegada || !formData.data_saida}
                  >
                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {escala ? "Salvar" : "Criar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </>
      )}
    </>
  )
}
