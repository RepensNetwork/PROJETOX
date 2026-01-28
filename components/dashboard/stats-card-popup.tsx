"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"
import { 
  Ship, 
  ClipboardList, 
  AlertTriangle, 
  CheckCircle,
  MapPin,
  Calendar,
  Clock,
  User,
  ExternalLink
} from "lucide-react"
import type { Escala, Demanda, Navio } from "@/lib/types/database"

interface EscalasPopupProps {
  escalas: (Escala & { navio: Navio })[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EscalasPopup({ escalas, open, onOpenChange }: EscalasPopupProps) {
  const statusColors: Record<Escala["status"], string> = {
    planejada: "bg-warning/10 text-warning-foreground border-warning/30",
    em_operacao: "bg-primary/10 text-primary border-primary/30",
    concluida: "bg-success/10 text-success border-success/30",
    cancelada: "bg-destructive/10 text-destructive border-destructive/30",
  }

  const statusLabels: Record<Escala["status"], string> = {
    planejada: "Planejada",
    em_operacao: "Em Operação",
    concluida: "Concluída",
    cancelada: "Cancelada",
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ship className="h-5 w-5" />
            Próximas Escalas
          </DialogTitle>
          <DialogDescription>
            Escalas futuras mais próximas ({escalas.length})
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {escalas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma escala futura encontrada
            </div>
          ) : (
            escalas.map((escala) => (
              <Link
                key={escala.id}
                href={`/escalas/${escala.id}`}
                className="block"
              >
                <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-2 rounded-lg bg-primary/20 border border-primary/30">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{escala.porto}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                        <Ship className="h-3.5 w-3.5" />
                        {escala.navio.nome}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3" />
                        Chegada: {format(new Date(escala.data_chegada), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        {escala.data_saida && (
                          <> • Saída: {format(new Date(escala.data_saida), "dd/MM/yyyy HH:mm", { locale: ptBR })}</>
                        )}
                      </div>
                    </div>
                    <Badge className={statusColors[escala.status]}>
                      {statusLabels[escala.status]}
                    </Badge>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface DemandasPopupProps {
  demandas: (Demanda & { escala: Escala & { navio: Navio }; responsavel: any })[]
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
}

export function DemandasPopup({ demandas, open, onOpenChange, title, description }: DemandasPopupProps) {
  const statusColors: Record<Demanda["status"], string> = {
    pendente: "bg-warning/10 text-warning-foreground border-warning/30",
    em_andamento: "bg-primary/10 text-primary border-primary/30",
    concluida: "bg-success/10 text-success border-success/30",
    aguardando_terceiro: "bg-muted text-muted-foreground border-muted/30",
    cancelada: "bg-destructive/10 text-destructive border-destructive/30",
  }

  const statusLabels: Record<Demanda["status"], string> = {
    pendente: "Pendente",
    em_andamento: "Em Andamento",
    concluida: "Concluída",
    aguardando_terceiro: "Aguardando Terceiro",
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {description} ({demandas.length})
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {demandas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma demanda encontrada
            </div>
          ) : (
            demandas.map((demanda) => {
              const isOverdue = demanda.prazo && 
                new Date(demanda.prazo) < new Date() && 
                demanda.status !== "concluida"

              return (
                <Link
                  key={demanda.id}
                  href={`/demandas/${demanda.id}`}
                  className="block"
                >
                  <div className={`flex items-start justify-between p-4 rounded-lg border transition-colors ${
                    isOverdue ? "bg-destructive/5 border-destructive/30" : "bg-muted/30 hover:bg-muted/50"
                  }`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {isOverdue && <AlertTriangle className="h-4 w-4 text-destructive" />}
                        <span className="font-semibold">{demanda.titulo}</span>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center gap-2">
                          <Ship className="h-3.5 w-3.5" />
                          {demanda.escala.navio.nome} - {demanda.escala.porto}
                        </div>
                        {demanda.prazo && (
                          <div className={`flex items-center gap-2 ${
                            isOverdue ? "text-destructive font-medium" : ""
                          }`}>
                            <Clock className="h-3.5 w-3.5" />
                            Prazo: {format(new Date(demanda.prazo), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                            {isOverdue && " (Atrasado)"}
                          </div>
                        )}
                        {demanda.responsavel && (
                          <div className="flex items-center gap-2">
                            <User className="h-3.5 w-3.5" />
                            {demanda.responsavel.nome}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <Badge className={statusColors[demanda.status]}>
                        {statusLabels[demanda.status]}
                      </Badge>
                      <Badge variant="outline" className={prioridadeColors[demanda.prioridade]}>
                        {prioridadeLabels[demanda.prioridade]}
                      </Badge>
                    </div>
                  </div>
                </Link>
              )
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface NaviosPopupProps {
  navios: Navio[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NaviosPopup({ navios, open, onOpenChange }: NaviosPopupProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ship className="h-5 w-5" />
            Navios Cadastrados
          </DialogTitle>
          <DialogDescription>
            Todos os navios da frota ({navios.length})
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {navios.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum navio cadastrado
            </div>
          ) : (
            navios.map((navio) => (
              <Link
                key={navio.id}
                href={`/navios/${navio.id}`}
                className="block"
              >
                <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-2 rounded-lg bg-primary/20 border border-primary/30">
                      <Ship className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{navio.nome}</div>
                      <div className="text-sm text-muted-foreground">
                        {navio.companhia}
                      </div>
                      {navio.observacoes && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {navio.observacoes}
                        </div>
                      )}
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
