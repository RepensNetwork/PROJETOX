"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DemandaForm } from "@/components/demandas/demanda-form"
import { LogIn, LogOut, Plus } from "lucide-react"
import type { Demanda, Escala, Navio, Membro } from "@/lib/types/database"

interface DemandasPageActionsProps {
  escalas: (Escala & { navio: Navio })[]
  membros: Membro[]
}

export function DemandasPageActions({ escalas, membros }: DemandasPageActionsProps) {
  const [open, setOpen] = useState(false)
  const [initialTipo, setInitialTipo] = useState<Demanda["tipo"] | undefined>(undefined)

  const openWithTipo = (tipo: Demanda["tipo"] | undefined) => {
    setInitialTipo(tipo)
    setOpen(true)
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="default"
        size="sm"
        onClick={() => openWithTipo("embarque_passageiros")}
        className="gap-2"
      >
        <LogIn className="h-4 w-4" />
        Novo embarque
      </Button>
      <Button
        variant="default"
        size="sm"
        onClick={() => openWithTipo("desembarque_passageiros")}
        className="gap-2"
      >
        <LogOut className="h-4 w-4" />
        Novo desembarque
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => openWithTipo(undefined)}
        className="gap-2"
      >
        <Plus className="h-4 w-4" />
        Outra demanda
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
