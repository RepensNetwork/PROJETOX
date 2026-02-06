"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ComissoesTable } from "@/components/financeiro/comissoes-table"
import { ComissaoFormDialog } from "@/components/financeiro/comissao-form-dialog"
import { getComissaoById } from "@/app/actions/financeiro"
import type { FinanceiroComissao } from "@/lib/types/database"
import type { Escala } from "@/lib/types/database"
import type { Navio } from "@/lib/types/database"
interface ComissoesClientProps {
  comissoes: FinanceiroComissao[]
  escalas: (Escala & { navio: Navio })[]
}

export function ComissoesClient({ comissoes, escalas }: ComissoesClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editComissao, setEditComissao] = useState<FinanceiroComissao | null>(null)

  const openCreate = () => {
    setEditComissao(null)
    setDialogOpen(true)
  }

  const handleEdit = async (id: string) => {
    const data = await getComissaoById(id)
    setEditComissao(data ?? null)
    setDialogOpen(true)
  }

  const escalasParaSelect = escalas.map((e) => ({
    id: e.id,
    porto: e.porto,
    data_chegada: e.data_chegada ?? "",
    navio: e.navio ?? { nome: "" },
  }))

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova comissão
        </Button>
      </div>

      <ComissoesTable comissoes={comissoes} onEdit={handleEdit} />

      <ComissaoFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        escalas={escalasParaSelect}
        edit={editComissao}
      />
    </>
  )
}
