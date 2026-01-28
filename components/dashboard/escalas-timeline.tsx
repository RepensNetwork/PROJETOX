"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Ship, MapPin, Calendar, Anchor } from "lucide-react"
import type { Escala, Navio, Demanda } from "@/lib/types/database"
import { formatDistanceToNow, format } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"

interface EscalasTimelineProps {
  escalas: (Escala & { navio: Navio; demandas: Demanda[] })[]
}

const statusColors: Record<Escala["status"], string> = {
  planejada: "bg-warning text-warning-foreground",
  em_operacao: "bg-primary text-primary-foreground",
  concluida: "bg-success text-success-foreground",
  cancelada: "bg-destructive text-destructive-foreground",
}

const statusLabels: Record<Escala["status"], string> = {
  planejada: "Planejada",
  em_operacao: "Em Operação",
  concluida: "Concluída",
  cancelada: "Cancelada",
}

export function EscalasTimeline({ escalas }: EscalasTimelineProps) {
  if (escalas.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ship className="h-5 w-5" />
            Próximas Escalas
          </CardTitle>
          <CardDescription>Escalas futuras mais próximas</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhuma escala futura encontrada
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ship className="h-5 w-5" />
          Próximas Escalas
        </CardTitle>
        <CardDescription>Escalas futuras mais próximas</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {escalas.map((escala) => {
          const demandasConcluidas = escala.demandas.filter(d => d.status === "concluida").length
          const totalDemandas = escala.demandas.length
          const progressPercent = totalDemandas > 0 ? (demandasConcluidas / totalDemandas) * 100 : 0

          return (
            <Link 
              key={escala.id} 
              href={`/escalas/${escala.id}`}
              className="block"
            >
              <div className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Anchor className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold leading-none">
                        {escala.navio.nome}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {escala.navio.companhia}
                      </p>
                    </div>
                    <Badge className={statusColors[escala.status]}>
                      {statusLabels[escala.status]}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {escala.porto}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Chegada: {format(new Date(escala.data_chegada), "dd/MM HH:mm")}
                      {escala.data_saida && ` • Saída: ${format(new Date(escala.data_saida), "dd/MM HH:mm")}`}
                    </span>
                  </div>

                  {totalDemandas > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          Progresso das demandas
                        </span>
                        <span className="font-medium">
                          {demandasConcluidas}/{totalDemandas}
                        </span>
                      </div>
                      <Progress value={progressPercent} className="h-1.5" />
                    </div>
                  )}

                  {escala.status === "planejada" && (
                    <p className="text-xs text-muted-foreground">
                      Chegada {formatDistanceToNow(new Date(escala.data_chegada), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </CardContent>
    </Card>
  )
}
