"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { LancamentosTable } from "@/components/financeiro/lancamentos-table"
import { LancamentoFormDialog } from "@/components/financeiro/lancamento-form-dialog"
import { getLancamentoById, updateLancamento, deleteLancamento } from "@/app/actions/financeiro"
import type { FinanceiroLancamento, FinanceiroCategoria, FinanceiroConta } from "@/lib/types/database"
import { useRouter } from "next/navigation"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

type EscalaOption = { id: string; porto: string; data_chegada: string; navio: { nome: string } }

interface MovimentacoesClientProps {
  lancamentos: FinanceiroLancamento[]
  categorias: FinanceiroCategoria[]
  contas: FinanceiroConta[]
  escalas: EscalaOption[]
}

export function MovimentacoesClient({
  lancamentos: initialLancamentos,
  categorias,
  contas,
  escalas,
}: MovimentacoesClientProps) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editLancamento, setEditLancamento] = useState<FinanceiroLancamento | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [filtroTipo, setFiltroTipo] = useState<string>("todos")

  const lancamentos =
    filtroTipo === "todos"
      ? initialLancamentos
      : initialLancamentos.filter((l) => l.tipo === filtroTipo)

  const handleEdit = async (id: string) => {
    const data = await getLancamentoById(id)
    setEditLancamento(data ?? null)
    setDialogOpen(true)
  }

  const handleLiquidar = async (id: string) => {
    await updateLancamento(id, {
      status: "liquidado",
      data_liquidacao: new Date().toISOString().slice(0, 10),
    })
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    await deleteLancamento(id)
    setDeleteId(null)
    router.refresh()
  }

  const openCreate = () => {
    setEditLancamento(null)
    setDialogOpen(true)
  }

  const escalasParaSelect = escalas.map((e) => ({
    id: e.id,
    porto: e.porto,
    data_chegada: (e as { data_chegada?: string }).data_chegada ?? "",
    navio: (e as { navio?: { nome: string } }).navio ?? { nome: "" },
  }))

  return (
    <>
      <div className="flex flex-wrap items-end gap-4 mb-4">
        <div className="flex-1 min-w-[180px]">
          <Label className="text-xs text-muted-foreground">Filtrar por tipo</Label>
          <Select value={filtroTipo} onValueChange={setFiltroTipo}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="receita">Receitas</SelectItem>
              <SelectItem value="despesa">Despesas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo lançamento
        </Button>
      </div>

      <LancamentosTable
        lancamentos={lancamentos}
        showEscala
        onEdit={handleEdit}
        onDelete={(id) => setDeleteId(id)}
        onLiquidar={handleLiquidar}
      />

      <LancamentoFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        categorias={categorias}
        contas={contas}
        escalas={escalasParaSelect}
        edit={editLancamento}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir lançamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
