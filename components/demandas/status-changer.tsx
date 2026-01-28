"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { updateDemanda } from "@/app/actions/demandas"
import { Loader2, Circle, PlayCircle, CheckCircle, XCircle, Clock } from "lucide-react"
import type { Demanda } from "@/lib/types/database"
import { cn } from "@/lib/utils"

interface StatusChangerProps {
  demandaId: string
  currentStatus: Demanda["status"]
}

const statusOptions: { value: Demanda["status"]; label: string; icon: typeof Circle; color: string }[] = [
  { value: "pendente", label: "Pendente", icon: Circle, color: "text-warning" },
  { value: "em_andamento", label: "Em Andamento", icon: PlayCircle, color: "text-primary" },
  { value: "concluida", label: "Concluída", icon: CheckCircle, color: "text-success" },
  { value: "aguardando_terceiro", label: "Aguardando Terceiro", icon: Clock, color: "text-muted-foreground" },
  { value: "cancelada", label: "Cancelada", icon: XCircle, color: "text-destructive" },
]

export function StatusChanger({ demandaId, currentStatus }: StatusChangerProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<Demanda["status"] | null>(null)

  const handleStatusChange = async (status: Demanda["status"]) => {
    if (status === currentStatus) return
    setLoading(status)

    try {
      await updateDemanda(demandaId, { status })
      router.refresh()
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {statusOptions.map((option) => {
        const Icon = option.icon
        const isActive = currentStatus === option.value
        const isLoading = loading === option.value

        return (
          <Button
            key={option.value}
            variant={isActive ? "secondary" : "ghost"}
            className={cn(
              "justify-start",
              isActive && "bg-secondary"
            )}
            onClick={() => handleStatusChange(option.value)}
            disabled={loading !== null}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Icon className={cn("h-4 w-4 mr-2", option.color)} />
            )}
            {option.label}
          </Button>
        )
      })}
    </div>
  )
}
