import { notFound } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { DemandaForm } from "@/components/demandas/demanda-form"
import { StatusChanger } from "@/components/demandas/status-changer"
import { AssignResponsavel } from "@/components/demandas/assign-responsavel"
import { getDemandaWithDetails, getEscalasForSelect } from "@/app/actions/demandas"
import { getMembros } from "@/app/actions/dashboard"
import { DemandaTransporteBlock } from "@/components/demandas/demanda-transporte-block"
import { DemandaReservaBlock } from "@/components/demandas/demanda-reserva-block"
import { 
  Ship, 
  MapPin, 
  ArrowLeft,
  Pencil,
  Clock,
  AlertTriangle,
  MessageSquare,
  History
} from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"
import type { Demanda } from "@/lib/types/database"

interface DemandaDetailPageProps {
  params: Promise<{ id: string }>
}

const statusColors: Record<Demanda["status"], string> = {
  pendente: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  em_andamento: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  concluida: "bg-green-500/10 text-green-600 dark:text-green-400",
  aguardando_terceiro: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  cancelada: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
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

/** Tipos de demanda que são tripulante: exibem Transporte e Reserva na própria página. */
const TIPOS_TRIPULANTE: Demanda["tipo"][] = [
  "embarque_passageiros",
  "desembarque_passageiros",
  "transporte_terrestre",
]

export default async function DemandaDetailPage({ params }: DemandaDetailPageProps) {
  const { id } = await params
  const [demanda, escalas, membros] = await Promise.all([
    getDemandaWithDetails(id),
    getEscalasForSelect(),
    getMembros(),
  ])

  if (!demanda) {
    notFound()
  }

  const now = new Date()
  const isOverdue = demanda.prazo && 
    new Date(demanda.prazo) < now && 
    demanda.status !== "concluida"

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/demandas">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight">
                {demanda.titulo}
              </h1>
              <Badge className={statusColors[demanda.status]}>
                {statusLabels[demanda.status]}
              </Badge>
              <Badge variant="outline" className={prioridadeColors[demanda.prioridade]}>
                {prioridadeLabels[demanda.prioridade]}
              </Badge>
              {isOverdue && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Atrasada
                </Badge>
              )}
            </div>
            <Link 
              href={`/escalas/${demanda.escala.id}`}
              className="text-muted-foreground flex items-center gap-2 hover:underline mt-1"
            >
              <Ship className="h-4 w-4" />
              {demanda.escala.navio.nome} - {demanda.escala.porto}
            </Link>
          </div>
          <DemandaForm 
            demanda={demanda} 
            escalas={escalas}
            membros={membros}
            trigger={
              <Button variant="outline">
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </Button>
            }
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Detalhes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {demanda.descricao ? (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Descrição</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {demanda.descricao}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    Nenhuma descrição fornecida
                  </p>
                )}

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Escala</h4>
                    <Link 
                      href={`/escalas/${demanda.escala.id}`}
                      className="flex items-center gap-2 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <Ship className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{demanda.escala.navio.nome}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {demanda.escala.porto}
                        </p>
                      </div>
                    </Link>
                  </div>

                  <AssignResponsavel
                    demandaId={demanda.id}
                    responsavelAtual={demanda.responsavel ?? null}
                    membros={membros}
                  />
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Prazo:</span>
                    {demanda.prazo ? (
                      <p className={`font-medium flex items-center gap-1 ${
                        isOverdue ? "text-destructive" : ""
                      }`}>
                        <Clock className="h-4 w-4" />
                        {format(new Date(demanda.prazo), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        {isOverdue && " (Atrasada)"}
                      </p>
                    ) : (
                      <p className="text-muted-foreground">Não definido</p>
                    )}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Última atualização:</span>
                    <p className="font-medium">
                      {formatDistanceToNow(new Date(demanda.updated_at), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {TIPOS_TRIPULANTE.includes(demanda.tipo) && (
              <>
                <DemandaTransporteBlock demanda={demanda} />
                <DemandaReservaBlock demanda={demanda} />
              </>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Comentários
                </CardTitle>
                <CardDescription>
                  {demanda.comentarios.length} comentário{demanda.comentarios.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {demanda.comentarios.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum comentário ainda
                  </p>
                ) : (
                  <div className="space-y-4">
                    {demanda.comentarios
                      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                      .map((comentario) => (
                        <div key={comentario.id} className="flex gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={comentario.membro?.avatar_url || undefined} />
                            <AvatarFallback className="text-xs">
                              {comentario.membro?.nome.split(" ").map(n => n[0]).join("").slice(0, 2) || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">
                                {comentario.membro?.nome || "Usuário desconhecido"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(comentario.created_at), { 
                                  addSuffix: true, 
                                  locale: ptBR 
                                })}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                              {comentario.conteudo}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Alterar Status</CardTitle>
              </CardHeader>
              <CardContent>
                <StatusChanger demandaId={demanda.id} currentStatus={demanda.status} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <History className="h-4 w-4" />
                  Histórico
                </CardTitle>
              </CardHeader>
              <CardContent>
                {demanda.historico.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma atividade registrada
                  </p>
                ) : (
                  <div className="space-y-3">
                    {demanda.historico
                      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                      .slice(0, 10)
                      .map((item) => (
                        <div key={item.id} className="flex gap-2 text-sm">
                          <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-muted-foreground" />
                          <div>
                            <p className="text-muted-foreground">
                              {item.acao}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(item.created_at), { 
                                addSuffix: true, 
                                locale: ptBR 
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
