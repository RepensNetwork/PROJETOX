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
import { Plus, Loader2 } from "lucide-react"
import { createNavio, updateNavio } from "@/app/actions/navios"
import type { Navio } from "@/lib/types/database"

interface NavioFormProps {
  navio?: Navio
  trigger?: React.ReactNode
  onSuccess?: () => void
}

export function NavioForm({ navio, trigger, onSuccess }: NavioFormProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome: navio?.nome || "",
    companhia: navio?.companhia || "",
    observacoes: navio?.observacoes || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = {
        nome: formData.nome,
        companhia: formData.companhia,
        observacoes: formData.observacoes || undefined,
      }

      const result = navio
        ? await updateNavio(navio.id, data)
        : await createNavio(data)

      if (result.success) {
        setOpen(false)
        router.refresh()
        onSuccess?.()
        if (!navio) {
          setFormData({ nome: "", companhia: "", observacoes: "" })
        }
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Navio
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{navio ? "Editar Navio" : "Novo Navio"}</DialogTitle>
            <DialogDescription>
              {navio
                ? "Atualize as informações do navio."
                : "Preencha as informações do novo navio."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Navio *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Costa Diadema"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companhia">Companhia *</Label>
              <Input
                id="companhia"
                value={formData.companhia}
                onChange={(e) => setFormData({ ...formData, companhia: e.target.value })}
                placeholder="Ex: Costa Cruzeiros"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                placeholder="Observações adicionais sobre o navio..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !formData.nome || !formData.companhia}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {navio ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
