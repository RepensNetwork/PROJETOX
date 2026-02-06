"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createLancamento, updateLancamento } from "@/app/actions/financeiro"
import type { FinanceiroLancamento, FinanceiroCategoria, FinanceiroConta } from "@/lib/types/database"

type FormData = {
  conta_id: string
  categoria_id: string
  tipo: "receita" | "despesa"
  valor: string
  data_vencimento: string
  data_liquidacao: string
  descricao: string
  documento_ref: string
  status: string
  observacoes: string
}

const emptyForm: FormData = {
  conta_id: "",
  categoria_id: "",
  tipo: "receita",
  valor: "",
  data_vencimento: new Date().toISOString().slice(0, 10),
  data_liquidacao: "",
  descricao: "",
  documento_ref: "",
  status: "previsto",
  observacoes: "",
}

interface LancamentoFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categorias: FinanceiroCategoria[]
  contas: FinanceiroConta[]
  escalas: { id: string; porto: string; data_chegada: string; navio: { nome: string } }[]
  edit?: FinanceiroLancamento | null
  defaultTipo?: "receita" | "despesa"
  defaultEscalaId?: string
}

export function LancamentoFormDialog({
  open,
  onOpenChange,
  categorias,
  contas,
  escalas,
  edit,
  defaultTipo = "receita",
  defaultEscalaId,
}: LancamentoFormDialogProps) {
  const router = useRouter()
  const [form, setForm] = useState<FormData>(emptyForm)
  const [escalaId, setEscalaId] = useState(defaultEscalaId ?? "")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const categoriasFiltradas = categorias.filter((c) => c.tipo === form.tipo)

  useEffect(() => {
    if (open) {
      if (edit) {
        setForm({
          conta_id: edit.conta_id ?? "",
          categoria_id: edit.categoria_id ?? "",
          tipo: edit.tipo,
          valor: String(edit.valor),
          data_vencimento: edit.data_vencimento?.slice(0, 10) ?? "",
          data_liquidacao: edit.data_liquidacao?.slice(0, 10) ?? "",
          descricao: edit.descricao ?? "",
          documento_ref: edit.documento_ref ?? "",
          status: edit.status,
          observacoes: edit.observacoes ?? "",
        })
        setEscalaId(edit.escala_id ?? "")
      } else {
        setForm({
          ...emptyForm,
          tipo: defaultTipo,
          data_vencimento: new Date().toISOString().slice(0, 10),
        })
        setEscalaId(defaultEscalaId ?? "")
      }
      setError("")
    }
  }, [open, edit, defaultTipo, defaultEscalaId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    const valor = parseFloat(form.valor.replace(",", "."))
    if (isNaN(valor) || valor <= 0) {
      setError("Valor inválido.")
      return
    }
    if (!form.data_vencimento) {
      setError("Informe a data de vencimento.")
      return
    }
    setSaving(true)
    try {
      const payload = {
        conta_id: form.conta_id || null,
        categoria_id: form.categoria_id || null,
        tipo: form.tipo,
        valor,
        data_vencimento: form.data_vencimento,
        data_liquidacao: form.data_liquidacao || null,
        descricao: form.descricao || null,
        documento_ref: form.documento_ref || null,
        escala_id: escalaId || null,
        status: form.status,
        observacoes: form.observacoes || null,
      }
      if (edit) {
        const res = await updateLancamento(edit.id, { ...payload, demanda_id: null })
        if (res.error) setError(res.error)
        else {
          onOpenChange(false)
          router.refresh()
        }
      } else {
        const res = await createLancamento(payload)
        if (res.error) setError(res.error)
        else {
          onOpenChange(false)
          router.refresh()
        }
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{edit ? "Editar lançamento" : "Novo lançamento"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tipo</Label>
              <Select
                value={form.tipo}
                onValueChange={(v: "receita" | "despesa") => setForm((f) => ({ ...f, tipo: v, categoria_id: "" }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="receita">Receita</SelectItem>
                  <SelectItem value="despesa">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Categoria</Label>
              <Select
                value={form.categoria_id}
                onValueChange={(v) => setForm((f) => ({ ...f, categoria_id: v }))}
              >
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {categoriasFiltradas.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Valor (R$)</Label>
              <Input
                type="text"
                placeholder="0,00"
                value={form.valor}
                onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))}
              />
            </div>
            <div>
              <Label>Vencimento</Label>
              <Input
                type="date"
                value={form.data_vencimento}
                onChange={(e) => setForm((f) => ({ ...f, data_vencimento: e.target.value }))}
              />
            </div>
          </div>
          {form.status === "liquidado" && (
            <div>
              <Label>Data liquidação</Label>
              <Input
                type="date"
                value={form.data_liquidacao}
                onChange={(e) => setForm((f) => ({ ...f, data_liquidacao: e.target.value }))}
              />
            </div>
          )}
          <div>
            <Label>Descrição</Label>
            <Input
              value={form.descricao}
              onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
              placeholder="Ex: Comissão escala Costa 123"
            />
          </div>
          <div>
            <Label>Documento / Referência</Label>
            <Input
              value={form.documento_ref}
              onChange={(e) => setForm((f) => ({ ...f, documento_ref: e.target.value }))}
              placeholder="NF, fatura, etc."
            />
          </div>
          <div>
            <Label>Escala (opcional)</Label>
            <Select
              value={escalaId || "__none__"}
              onValueChange={(v) => setEscalaId(v === "__none__" ? "" : v)}
            >
              <SelectTrigger><SelectValue placeholder="Nenhuma" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Nenhuma</SelectItem>
                {escalas.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.navio?.nome ?? "Navio"} • {e.porto} • {e.data_chegada?.slice(0, 10)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Conta (opcional)</Label>
            <Select
              value={form.conta_id || "__none__"}
              onValueChange={(v) => setForm((f) => ({ ...f, conta_id: v === "__none__" ? "" : v }))}
            >
              <SelectTrigger><SelectValue placeholder="Nenhuma" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Nenhuma</SelectItem>
                {contas.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="rascunho">Rascunho</SelectItem>
                <SelectItem value="previsto">Previsto</SelectItem>
                <SelectItem value="confirmado">Confirmado</SelectItem>
                <SelectItem value="liquidado">Liquidado</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Observações</Label>
            <Textarea
              value={form.observacoes}
              onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
              rows={2}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Salvando…" : edit ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
