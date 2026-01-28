"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, Check, CheckCheck } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"
import { getNotificacoes, marcarNotificacaoComoLida, marcarTodasNotificacoesComoLidas, getContadorNotificacoesNaoLidas } from "@/app/actions/notificacoes"
import type { Notificacao, Membro } from "@/lib/types/database"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface NotificationBellProps {
  membroId: string
}

export function NotificationBell({ membroId }: NotificationBellProps) {
  const [notificacoes, setNotificacoes] = useState<(Notificacao & { mensagem: any })[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const notificacoesNaoLidas = notificacoes.filter(n => !n.lida)
  const countNaoLidas = notificacoesNaoLidas.length

  useEffect(() => {
    loadNotificacoes()
    
    // Recarregar notificações a cada 30 segundos
    const interval = setInterval(loadNotificacoes, 30000)
    return () => clearInterval(interval)
  }, [membroId])

  const loadNotificacoes = async () => {
    try {
      const data = await getNotificacoes(membroId)
      setNotificacoes(data)
    } catch (error) {
      console.error("Error loading notificacoes:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarcarComoLida = async (notificacaoId: string, escalaId: string) => {
    try {
      await marcarNotificacaoComoLida(notificacaoId)
      setNotificacoes(notificacoes.map(n =>
        n.id === notificacaoId
          ? { ...n, lida: true, lida_em: new Date().toISOString() }
          : n
      ))
      router.push(`/escalas/${escalaId}`)
      setOpen(false)
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const handleMarcarTodasComoLidas = async () => {
    try {
      await marcarTodasNotificacoesComoLidas(membroId)
      setNotificacoes(notificacoes.map(n => ({
        ...n,
        lida: true,
        lida_em: new Date().toISOString(),
      })))
    } catch (error) {
      console.error("Error marking all as read:", error)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notificações</h3>
          {countNaoLidas > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarcarTodasComoLidas}
              className="text-xs"
            >
              Marcar todas como lidas
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Carregando...
            </div>
          ) : notificacoes.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Nenhuma notificação
            </div>
          ) : (
            <div className="divide-y">
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
