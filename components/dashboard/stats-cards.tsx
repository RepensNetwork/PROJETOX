"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Ship, ClipboardList, Clock, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import type { DashboardStats, Escala, Demanda, Navio } from "@/lib/types/database"
import { EscalasPopup, DemandasPopup, NaviosPopup } from "./stats-card-popup"
import { cn } from "@/lib/utils"

interface StatsCardsProps {
  stats: DashboardStats
  escalas: (Escala & { navio: Navio; demandas?: Demanda[] })[]
  allDemandas: (Demanda & { escala: Escala & { navio: Navio }; responsavel: any })[]
  navios: Navio[]
}

export function StatsCards({ stats, escalas, allDemandas, navios }: StatsCardsProps) {
  const [escalasOpen, setEscalasOpen] = useState(false)
  const [demandasOpen, setDemandasOpen] = useState(false)
  const [alertasOpen, setAlertasOpen] = useState(false)
  const [concluidasOpen, setConcluidasOpen] = useState(false)

  const alertasDemandas = allDemandas.filter(d => {
    const now = new Date()
    const isAtrasada = d.prazo && new Date(d.prazo) < now && d.status !== "concluida"
    const isCritica = d.prioridade === "urgente" && d.status !== "concluida"
    const isBloqueada = d.status === "aguardando_terceiro"
    return isAtrasada || isCritica || isBloqueada
  })

  const concluidasDemandas = allDemandas.filter(d => d.status === "concluida")

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card 
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => setEscalasOpen(true)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximas Escalas</CardTitle>
            <Ship className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{escalas.length}</div>
            <p className="text-xs text-muted-foreground">
              Escalas agendadas mais próximas
            </p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => setDemandasOpen(true)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Demandas</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDemandas}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-warning" />
                {stats.demandasPendentes} pendentes
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-primary" />
                {stats.demandasEmAndamento} em andamento
              </span>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={cn(
            "border-destructive/50 cursor-pointer hover:bg-muted/50 transition-colors",
            (stats.demandasAtrasadas + stats.demandasCriticas + stats.demandasBloqueadas) === 0 && "opacity-50 cursor-not-allowed"
          )}
          onClick={() => {
            if (alertasDemandas.length > 0) {
              setAlertasOpen(true)
            }
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {stats.demandasAtrasadas + stats.demandasCriticas + stats.demandasBloqueadas}
            </div>
            <div className="flex flex-col gap-1 text-xs text-muted-foreground">
              {stats.demandasAtrasadas > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-destructive" />
                  {stats.demandasAtrasadas} atrasadas
                </span>
              )}
              {stats.demandasCriticas > 0 && (
                <span className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3 text-destructive" />
                  {stats.demandasCriticas} criticas
                </span>
              )}
              {stats.demandasBloqueadas > 0 && (
                <span className="flex items-center gap-1">
                  <XCircle className="h-3 w-3 text-destructive" />
                  {stats.demandasBloqueadas} bloqueadas
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card 
          className={cn(
            "border-success/50 cursor-pointer hover:bg-muted/50 transition-colors",
            stats.demandasConcluidas === 0 && "opacity-50 cursor-not-allowed"
          )}
          onClick={() => {
            if (concluidasDemandas.length > 0) {
              setConcluidasOpen(true)
            }
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.demandasConcluidas}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalDemandas > 0 
                ? `${Math.round((stats.demandasConcluidas / stats.totalDemandas) * 100)}% do total`
                : "Nenhuma demanda ainda"
              }
            </p>
          </CardContent>
        </Card>
      </div>

      <EscalasPopup 
        escalas={escalas} 
        open={escalasOpen} 
        onOpenChange={setEscalasOpen} 
      />

      <DemandasPopup 
        demandas={allDemandas} 
        open={demandasOpen} 
        onOpenChange={setDemandasOpen}
        title="Todas as Demandas"
        description="Lista completa de demandas cadastradas"
      />

      <DemandasPopup 
        demandas={alertasDemandas} 
        open={alertasOpen} 
        onOpenChange={setAlertasOpen}
        title="Alertas"
        description="Demandas atrasadas, críticas ou bloqueadas"
      />

      <DemandasPopup 
        demandas={concluidasDemandas} 
        open={concluidasOpen} 
        onOpenChange={setConcluidasOpen}
        title="Demandas Concluídas"
        description="Demandas finalizadas com sucesso"
      />
    </>
  )
}
