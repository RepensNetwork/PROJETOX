"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { LancamentosTable } from "@/components/financeiro/lancamentos-table"
import { LancamentoFormDialog } from "@/components/financeiro/lancamento-form-dialog"
import {
  getLancamentoById,
  updateLancamento,
  deleteLancamento,
} from "@/app/actions/financeiro"
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

type EscalaOption = { id: string; porto: string; data_chegada: string; navio: { nome: string } }

interface ContasReceberClientProps {
  lancamentos: FinanceiroLancamento[]
  categorias: FinanceiroCategoria[]
  contas: FinanceiroConta[]
  escalas: EscalaOption[]
}

export function ContasReceberClient({
  lancamentos,
  categorias,
  contas,
  escalas,
}: ContasReceberClientProps) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editLancamento, setEditLancamento] = useState<FinanceiroLancamento | null>(null)

  const handleEdit = async (id: string) => {
    const data = await getLancamentoById(id)
    setEditLancamento(data ?? null)
    setEditId(id)
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
    setEditId(null)
    setDialogOpen(true)
  }

  const categoriasReceita = categorias.filter((c) => c.tipo === "receita")
  const escalasParaSelect = escalas.map((e) => ({
    id: e.id,
    porto: e.porto,
    data_chegada: (e as { data_chegada?: string }).data_chegada ?? "",
    navio: (e as { navio?: { nome: string } }).navio ?? { nome: "" },
  }))

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova receita
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
        categorias={categoriasReceita.length ? categoriasReceita : categorias}
        contas={contas}
        escalas={escalasParaSelect}
        edit={editLancamento}
        defaultTipo="receita"
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
