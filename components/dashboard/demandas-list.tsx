"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  ClipboardList, 
  Clock, 
  AlertTriangle, 
  User,
  Ship
} from "lucide-react"
import type { Demanda, Escala, Navio, Membro } from "@/lib/types/database"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"

interface DemandasListProps {
  demandas: (Demanda & { escala: Escala & { navio: Navio }; responsavel: Membro | null })[]
  title: string
  description: string
  emptyMessage?: string
  showUrgent?: boolean
}

const statusColors: Record<Demanda["status"], string> = {
  pendente: "bg-warning/10 text-warning-foreground border-warning/30",
  em_andamento: "bg-primary/10 text-primary border-primary/30",
  aguardando_terceiro: "bg-muted text-muted-foreground border-muted/30",
  concluida: "bg-success/10 text-success border-success/30",
  cancelada: "bg-destructive/10 text-destructive border-destructive/30",
}

const statusLabels: Record<Demanda["status"], string> = {
  pendente: "Pendente",
  em_andamento: "Em Andamento",
  aguardando_terceiro: "Aguardando Terceiro",
  concluida: "Concluída",
  cancelada: "Cancelada",
}

const prioridadeColors: Record<Demanda["prioridade"], string> = {
  baixa: "bg-muted text-muted-foreground",
  media: "bg-primary/10 text-primary",
  alta: "bg-warning/10 text-warning-foreground",
  urgente: "bg-destructive text-destructive-foreground",
}

const prioridadeLabels: Record<Demanda["prioridade"], string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  urgente: "Urgente",
}

export function DemandasList({ 
  demandas, 
  title, 
  description, 
  emptyMessage = "Nenhuma demanda encontrada",
  showUrgent = false 
}: DemandasListProps) {
  const now = new Date()

  return (
    <Card className={showUrgent ? "border-destructive/30" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {showUrgent ? (
            <AlertTriangle className="h-5 w-5 text-destructive" />
          ) : (
            <ClipboardList className="h-5 w-5" />
          )}
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {demandas.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {emptyMessage}
          </p>
        ) : (
          <div className="space-y-3">
            {demandas.map((demanda) => {
              const isOverdue = demanda.prazo && 
                new Date(demanda.prazo) < now && 
                demanda.status !== "concluida"

              return (
                <Link 
                  key={demanda.id} 
                  href={`/demandas/${demanda.id}`}
                  className="block"
                >
                  <div className={`flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors ${
                    isOverdue ? "border-destructive/50" : ""
                  }`}>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-sm leading-tight truncate">
                          {demanda.titulo}
                        </h4>
                        <Badge variant="outline" className={prioridadeColors[demanda.prioridade]}>
                          {prioridadeLabels[demanda.prioridade]}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Ship className="h-3 w-3" />
                        <span className="truncate">
                          {demanda.escala.navio.nome} - {demanda.escala.porto}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="outline" className={`text-xs ${statusColors[demanda.status]}`}>
                          {statusLabels[demanda.status]}
                        </Badge>

                        <div className="flex items-center gap-2">
                          {demanda.prazo && (
                            <span className={`flex items-center gap-1 text-xs ${
                              isOverdue ? "text-destructive font-medium" : "text-muted-foreground"
                            }`}>
                              <Clock className="h-3 w-3" />
                              {isOverdue ? "Atrasada" : formatDistanceToNow(new Date(demanda.prazo), {
                                addSuffix: true,
                                locale: ptBR
                              })}
                            </span>
                          )}

                          {demanda.responsavel ? (
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={demanda.responsavel.avatar_url || undefined} />
                              <AvatarFallback className="text-[10px]">
                                {demanda.responsavel.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <User className="h-3 w-3" />
                              Sem responsável
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
