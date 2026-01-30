"use client"

import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"
import { getNotificacoes, marcarNotificacaoComoLida, marcarTodasNotificacoesComoLidas, limparTodasNotificacoes } from "@/app/actions/notificacoes"
import {
  getNotificacoesDemanda,
  marcarNotificacaoDemandaComoLida,
  marcarTodasNotificacoesDemandaComoLidas,
  limparTodasNotificacoesDemanda,
  type NotificacaoDemandaComDemanda,
} from "@/app/actions/notificacoes-demanda"
import { getAlertas, type AlertaComDemanda } from "@/app/actions/alertas"
import type { Notificacao } from "@/lib/types/database"
import { ClipboardList, Car } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"

type NotificationsData = {
  notificacoes: (Notificacao & { mensagem: any })[]
  notificacoesDemanda: NotificacaoDemandaComDemanda[]
  alertas: AlertaComDemanda[]
}

async function fetchNotifications(membroId: string): Promise<NotificationsData> {
  const [notificacoes, notificacoesDemanda, alertas] = await Promise.all([
    getNotificacoes(membroId),
    getNotificacoesDemanda(membroId),
    getAlertas(10),
  ])
  return { notificacoes, notificacoesDemanda, alertas }
}

interface NotificationBellProps {
  membroId: string
}

export function NotificationBell({ membroId }: NotificationBellProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const { data, isLoading, mutate } = useSWR<NotificationsData>(
    membroId ? `notifications-${membroId}` : null,
    () => fetchNotifications(membroId),
    {
      refreshInterval: 30_000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5_000,
    }
  )

  const notificacoes = data?.notificacoes ?? []
  const notificacoesDemanda = data?.notificacoesDemanda ?? []
  const alertas = data?.alertas ?? []
  const loading = isLoading

  const countMensagensNaoLidas = notificacoes.filter((n) => !n.lida).length
  const countDemandasNaoLidas = notificacoesDemanda.filter((n) => !n.lida).length
  const countNaoLidas = countMensagensNaoLidas + countDemandasNaoLidas

  const revalidate = () => mutate(undefined, { revalidate: true })

  const handleMarcarComoLida = async (notificacaoId: string, escalaId: string) => {
    try {
      await marcarNotificacaoComoLida(notificacaoId)
      await mutate(
        (prev) =>
          prev
            ? {
                ...prev,
                notificacoes: prev.notificacoes.map((n) =>
                  n.id === notificacaoId ? { ...n, lida: true, lida_em: new Date().toISOString() } : n
                ),
              }
            : undefined,
        { revalidate: false }
      )
      router.push(`/escalas/${escalaId}`)
      setOpen(false)
    } catch (error) {
      console.error("Error marking notification as read:", error)
      revalidate()
    }
  }

  const handleMarcarDemandaComoLida = async (notificacaoId: string, demandaId: string) => {
    try {
      await marcarNotificacaoDemandaComoLida(notificacaoId)
      await mutate(
        (prev) =>
          prev
            ? {
                ...prev,
                notificacoesDemanda: prev.notificacoesDemanda.map((n) =>
                  n.id === notificacaoId ? { ...n, lida: true, lida_em: new Date().toISOString() } : n
                ),
              }
            : undefined,
        { revalidate: false }
      )
      router.push(`/demandas/${demandaId}`)
      setOpen(false)
    } catch (error) {
      console.error("Error marking demanda notification as read:", error)
      revalidate()
    }
  }

  const handleMarcarTodasComoLidas = async () => {
    try {
      await Promise.all([
        marcarTodasNotificacoesComoLidas(membroId),
        marcarTodasNotificacoesDemandaComoLidas(membroId),
      ])
      await mutate(
        (prev) =>
          prev
            ? {
                ...prev,
                notificacoes: prev.notificacoes.map((n) => ({ ...n, lida: true, lida_em: new Date().toISOString() })),
                notificacoesDemanda: prev.notificacoesDemanda.map((n) => ({ ...n, lida: true, lida_em: new Date().toISOString() })),
              }
            : undefined,
        { revalidate: false }
      )
    } catch (error) {
      console.error("Error marking all as read:", error)
      revalidate()
    }
  }

  const handleLimparTodas = async () => {
    try {
      await Promise.all([
        limparTodasNotificacoes(membroId),
        limparTodasNotificacoesDemanda(membroId),
      ])
      await mutate(
        (prev) =>
          prev ? { ...prev, notificacoes: [], notificacoesDemanda: [] } : undefined,
        { revalidate: false }
      )
    } catch (error) {
      console.error("Error clearing notifications:", error)
      revalidate()
    }
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) revalidate()
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {countNaoLidas > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {countNaoLidas > 9 ? "9+" : countNaoLidas}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b gap-2 flex-wrap">
          <h3 className="font-semibold">Notificações</h3>
          <div className="flex items-center gap-1">
            {countNaoLidas > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarcarTodasComoLidas}
                className="text-xs"
              >
                Marcar como lidas
              </Button>
            )}
            {(notificacoes.length > 0 || notificacoesDemanda.length > 0) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLimparTodas}
                className="text-xs text-muted-foreground hover:text-destructive"
                title="Excluir todas as notificações (menções e demandas atribuídas)"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Limpar
              </Button>
            )}
          </div>
        </div>
        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Carregando...
            </div>
          ) : notificacoes.length === 0 && notificacoesDemanda.length === 0 && alertas.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Nenhuma notificação
            </div>
          ) : (
            <div className="divide-y">
              {alertas.map((alerta) => (
                <Link
                  key={alerta.id}
                  href={`/demandas/${alerta.demanda_id}`}
                  onClick={() => setOpen(false)}
                >
                  <div className="p-4 hover:bg-accent transition-colors cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {alerta.tipo === "novo_transporte" ? (
                            <Car className="h-4 w-4 text-primary shrink-0" />
                          ) : (
                            <ClipboardList className="h-4 w-4 text-primary shrink-0" />
                          )}
                          <p className="text-sm font-medium line-clamp-2">
                            {alerta.tipo === "novo_transporte" ? "Novo transporte: " : "Nova demanda: "}
                            {alerta.demanda?.titulo || "Demanda"}
                          </p>
                        </div>
                        {alerta.demanda?.escala?.navio?.nome && (
                          <p className="text-xs text-muted-foreground">
                            {alerta.demanda.escala.navio.nome}
                            {alerta.demanda.escala.porto ? ` • ${alerta.demanda.escala.porto}` : ""}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(alerta.created_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
              {notificacoesDemanda.map((notif) => (
                <div
                  key={notif.id}
                  className={cn(
                    "p-4 hover:bg-accent transition-colors cursor-pointer",
                    !notif.lida && "bg-primary/5"
                  )}
                  onClick={() => handleMarcarDemandaComoLida(notif.id, notif.demanda_id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {notif.lida ? (
                          <CheckCheck className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        )}
                        <p className="text-sm font-medium line-clamp-2">
                          Você foi atribuído à demanda: {notif.demanda?.titulo || "Demanda"}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notif.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {notificacoes.map((notificacao) => (
                <div
                  key={notificacao.id}
                  className={cn(
                    "p-4 hover:bg-accent transition-colors cursor-pointer",
                    !notificacao.lida && "bg-primary/5"
                  )}
                  onClick={() => {
                    if (notificacao.escala_id) {
                      handleMarcarComoLida(notificacao.id, notificacao.escala_id)
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {notificacao.lida ? (
                          <CheckCheck className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        )}
                        <p className="text-sm font-medium line-clamp-2">
                          {notificacao.mensagem?.autor?.nome || "Alguém"} mencionou você
                        </p>
                      </div>
                      {notificacao.mensagem?.conteudo && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {notificacao.mensagem.conteudo}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(
                          new Date(notificacao.created_at),
                          { addSuffix: true, locale: ptBR }
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
