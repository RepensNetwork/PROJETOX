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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createComissao, updateComissao } from "@/app/actions/financeiro"
import type { FinanceiroComissao } from "@/lib/types/database"

type EscalaOption = { id: string; porto: string; data_chegada: string; navio: { nome: string } }

interface ComissaoFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  escalas: EscalaOption[]
  edit?: FinanceiroComissao | null
}

export function ComissaoFormDialog({
  open,
  onOpenChange,
  escalas,
  edit,
}: ComissaoFormDialogProps) {
  const router = useRouter()
  const [escalaId, setEscalaId] = useState("")
  const [descricao, setDescricao] = useState("")
  const [valorBruto, setValorBruto] = useState("")
  const [percentual, setPercentual] = useState("")
  const [dataPrevisao, setDataPrevisao] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (open) {
      if (edit) {
        setEscalaId(edit.escala_id)
        setDescricao(edit.descricao ?? "")
        setValorBruto(String(edit.valor_bruto))
        setPercentual(String(edit.percentual_comissao))
        setDataPrevisao(edit.data_previsao?.slice(0, 10) ?? "")
      } else {
        setEscalaId("")
        setDescricao("")
        setValorBruto("")
        setPercentual("")
        setDataPrevisao("")
      }
      setError("")
    }
  }, [open, edit])

  const valorBrutoNum = parseFloat(valorBruto.replace(",", "."))
  const percentualNum = parseFloat(percentual.replace(",", "."))
  const valorComissao = !isNaN(valorBrutoNum) && !isNaN(percentualNum)
    ? (valorBrutoNum * percentualNum) / 100
    : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!escalaId) {
      setError("Selecione uma escala.")
      return
    }
    if (isNaN(valorBrutoNum) || valorBrutoNum < 0) {
      setError("Valor bruto inválido.")
      return
    }
    if (isNaN(percentualNum) || percentualNum < 0 || percentualNum > 100) {
      setError("Percentual inválido (0-100).")
      return
    }
    setSaving(true)
    try {
      if (edit) {
        const res = await updateComissao(edit.id, {
          descricao: descricao || null,
          valor_bruto: valorBrutoNum,
          percentual_comissao: percentualNum,
          data_previsao: dataPrevisao || null,
        })
        if (res.error) setError(res.error)
        else {
          onOpenChange(false)
          router.refresh()
        }
      } else {
        const res = await createComissao({
          escala_id: escalaId,
          descricao: descricao || null,
          valor_bruto: valorBrutoNum,
          percentual_comissao: percentualNum,
          data_previsao: dataPrevisao || null,
        })
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{edit ? "Editar comissão" : "Nova comissão"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Escala *</Label>
            <Select value={escalaId} onValueChange={setEscalaId} disabled={!!edit}>
              <SelectTrigger><SelectValue placeholder="Selecione a escala" /></SelectTrigger>
              <SelectContent>
                {escalas.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.navio?.nome ?? "Navio"} • {e.porto} • {e.data_chegada?.slice(0, 10)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Descrição</Label>
            <Input
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Comissão agenciamento escala"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Valor bruto (R$) *</Label>
              <Input
                type="text"
                placeholder="0,00"
                value={valorBruto}
                onChange={(e) => setValorBruto(e.target.value)}
              />
            </div>
            <div>
              <Label>% Comissão *</Label>
              <Input
                type="text"
                placeholder="0"
                value={percentual}
                onChange={(e) => setPercentual(e.target.value)}
              />
            </div>
          </div>
          <div className="rounded-md bg-muted p-3 text-sm">
            <span className="text-muted-foreground">Valor da comissão: </span>
            <span className="font-semibold text-emerald-600">
              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valorComissao)}
            </span>
          </div>
          <div>
            <Label>Data previsão recebimento</Label>
            <Input
              type="date"
              value={dataPrevisao}
              onChange={(e) => setDataPrevisao(e.target.value)}
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
