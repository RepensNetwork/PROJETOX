"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DemandaForm } from "@/components/demandas/demanda-form"
import { Plus } from "lucide-react"
import type { Demanda, Escala, Navio, Membro } from "@/lib/types/database"

interface MotoristaNovaDemandaProps {
  escalas: (Escala & { navio: Navio })[]
  membros: Membro[]
}

export function MotoristaNovaDemanda({ escalas, membros }: MotoristaNovaDemandaProps) {
  const [open, setOpen] = useState(false)
  const [initialTipo, setInitialTipo] = useState<Demanda["tipo"]>("transporte_terrestre")

  const openForm = (tipo: Demanda["tipo"]) => {
    setInitialTipo(tipo)
    setOpen(true)
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="default"
        size="sm"
        onClick={() => openForm("transporte_terrestre")}
        className="gap-2"
      >
        <Plus className="h-4 w-4" />
        Nova demanda de transporte
      </Button>
      <DemandaForm
        escalas={escalas}
        membros={membros}
        open={open}
        onOpenChange={setOpen}
        initialTipo={initialTipo}
      />
    </div>
  )
}
