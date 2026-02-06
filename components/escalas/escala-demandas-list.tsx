"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, User, AlertTriangle, ChevronDown, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"
import type { Demanda, Membro } from "@/lib/types/database"
import { updateDemanda } from "@/app/actions/demandas"

const statusOptions: { value: Demanda["status"]; label: string }[] = [
  { value: "pendente", label: "Pendente" },
  { value: "em_andamento", label: "Em Andamento" },
  { value: "concluida", label: "Concluída" },
  { value: "aguardando_terceiro", label: "Aguardando Terceiro" },
  { value: "cancelada", label: "Cancelada" },
]

const statusColors: Record<Demanda["status"], string> = {
  pendente: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30",
  em_andamento: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
  concluida: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30",
  aguardando_terceiro: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30",
  cancelada: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/30",
}

const statusLabels: Record<Demanda["status"], string> = {
  pendente: "Pendente",
  em_andamento: "Em Andamento",
  concluida: "Concluída",
  aguardando_terceiro: "Aguardando Terceiro",
  cancelada: "Cancelada",
}

const prioridadeColors: Record<Demanda["prioridade"], string> = {
  baixa: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
  media: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  alta: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  urgente: "bg-red-500/10 text-red-600 dark:text-red-400",
}

const prioridadeLabels: Record<Demanda["prioridade"], string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  urgente: "Urgente",
}

export type DemandaComResponsavel = Demanda & { responsavel: Membro | null }

interface EscalaDemandasListProps {
  demandas: DemandaComResponsavel[]
}

export function EscalaDemandasList({ demandas }: EscalaDemandasListProps) {
  const router = useRouter()
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [localStatus, setLocalStatus] = useState<Record<string, Demanda["status"]>>({})

  const handleStatusChange = async (demandaId: string, newStatus: Demanda["status"]) => {
    setUpdatingId(demandaId)
    setLocalStatus((prev) => ({ ...prev, [demandaId]: newStatus }))
    try {
      await updateDemanda(demandaId, { status: newStatus })
      router.refresh()
    } finally {
      setUpdatingId(null)
    }
  }

  const priorityOrder: Record<Demanda["prioridade"], number> = {
    urgente: 0,
    alta: 1,
    media: 2,
    baixa: 3,
  }
  const sorted = [...demandas].sort(
    (a, b) => (priorityOrder[a.prioridade] ?? 3) - (priorityOrder[b.prioridade] ?? 3)
  )
  const now = new Date()

  return (
    <div className="space-y-3">
      {sorted.map((demanda) => {
        const displayStatus = localStatus[demanda.id] ?? demanda.status
        const isOverdue =
          demanda.prazo && new Date(demanda.prazo) < now && displayStatus !== "concluida"
        const isUpdating = updatingId === demanda.id

        return (
          <div
            key={demanda.id}
            className={`flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-accent/30 transition-colors ${
              isOverdue ? "border-destructive/50" : ""
            }`}
          >
            <Link href={`/demandas/${demanda.id}`} className="flex-1 min-w-0 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-medium text-sm leading-tight">{demanda.titulo}</h4>
                <Badge variant="outline" className={prioridadeColors[demanda.prioridade]}>
                  {prioridadeLabels[demanda.prioridade]}
                </Badge>
              </div>

              {demanda.descricao && (
                <p className="text-xs text-muted-foreground line-clamp-2">{demanda.descricao}</p>
              )}

              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-3">
                  {demanda.prazo && (
                    <span
                      className={`flex items-center gap-1 text-xs ${
                        isOverdue ? "text-destructive font-medium" : "text-muted-foreground"
                      }`}
                    >
                      {isOverdue && <AlertTriangle className="h-3 w-3" />}
                      <Clock className="h-3 w-3" />
                      {isOverdue
                        ? "Atrasada"
                        : format(new Date(demanda.prazo), "dd/MM HH:mm", { locale: ptBR })}
                    </span>
                  )}

                  {demanda.responsavel ? (
                    <div className="flex items-center gap-1">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={demanda.responsavel.avatar_url || undefined} />
                        <AvatarFallback className="text-[10px]">
                          {demanda.responsavel.nome
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">
                        {demanda.responsavel.nome.split(" ")[0]}
                      </span>
                    </div>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      Sem responsável
                    </span>
                  )}
                </div>
              </div>
            </Link>

            <div
              className="shrink-0"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`h-auto py-1.5 px-2.5 text-xs font-normal ${statusColors[displayStatus]} hover:opacity-90 border-current`}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <>
                        {statusLabels[displayStatus]}
                        <ChevronDown className="h-3.5 w-3.5 ml-1 opacity-70" />
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {statusOptions.map((opt) => (
                    <DropdownMenuItem
                      key={opt.value}
                      onClick={() => handleStatusChange(demanda.id, opt.value)}
                      disabled={displayStatus === opt.value}
                    >
                      {opt.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )
      })}
    </div>
  )
}
