import { notFound } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { EscalaForm } from "@/components/escalas/escala-form"
import { DemandaForm } from "@/components/demandas/demanda-form"
import { EscalaChat } from "@/components/chat/escala-chat"
import { getEscalaWithDetails } from "@/app/actions/escalas"
import { getNavios } from "@/app/actions/navios"
import { getMembros } from "@/app/actions/dashboard"
import { getMensagens } from "@/app/actions/mensagens"
import { getCurrentUser } from "@/app/actions/auth"
import { redirect } from "next/navigation"
import { 
  Ship, 
  MapPin, 
  Calendar,
  ArrowLeft,
  Pencil,
  Clock,
  User,
  FileText,
  AlertTriangle,
  Plus
} from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"
import type { Demanda, Escala } from "@/lib/types/database"

interface EscalaDetailPageProps {
  params: Promise<{ id: string }>
}

const statusColors: Record<Escala["status"], string> = {
  planejada: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  em_operacao: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  concluida: "bg-green-500/10 text-green-600 dark:text-green-400",
  cancelada: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
}

const statusLabels: Record<Escala["status"], string> = {
  planejada: "Planejada",
  em_operacao: "Em Operação",
  concluida: "Concluída",
  cancelada: "Cancelada",
}

const demandaStatusColors: Record<Demanda["status"], string> = {
  pendente: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30",
  em_andamento: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
  concluida: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30",
  aguardando_terceiro: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30",
  cancelada: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/30",
}

const demandaStatusLabels: Record<Demanda["status"], string> = {
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

export default async function EscalaDetailPage({ params }: EscalaDetailPageProps) {
  const { id } = await params
  
  // Verificar autenticação
  const currentUser = await getCurrentUser()
  if (!currentUser || !currentUser.membro) {
    redirect("/login")
  }

  const [escala, navios, membros, mensagens] = await Promise.all([
    getEscalaWithDetails(id),
    getNavios(),
    getMembros(),
    getMensagens(id),
  ])

  if (!escala) {
    notFound()
  }

  const membroAtual = currentUser.membro

  const now = new Date()
  const demandasPendentes = escala.demandas.filter(d => d.status === "pendente")
  const demandasEmAndamento = escala.demandas.filter(d => d.status === "em_andamento")
  const demandasConcluidas = escala.demandas.filter(d => d.status === "concluida")
  const demandasBloqueadas = escala.demandas.filter(d => d.status === "aguardando_terceiro")
  
  const progressPercent = escala.demandas.length > 0 
    ? (demandasConcluidas.length / escala.demandas.length) * 100 
    : 0

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/escalas">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">
                {escala.navio.nome}
              </h1>
              <Badge className={statusColors[escala.status]}>
                {statusLabels[escala.status]}
              </Badge>
            </div>
            <p className="text-muted-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {escala.porto}
            </p>
          </div>
          <EscalaForm 
            escala={escala} 
            navios={navios}
            trigger={
              <Button variant="outline">
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </Button>
            }
          />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Chegada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {format(new Date(escala.data_chegada), "dd/MM/yy", { locale: ptBR })}
              </p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(escala.data_chegada), "HH:mm", { locale: ptBR })} - 
                {escala.status === "planejada" && (
                  <span className="ml-1">
                    {formatDistanceToNow(new Date(escala.data_chegada), { addSuffix: true, locale: ptBR })}
                  </span>
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Saída
              </CardTitle>
            </CardHeader>
            <CardContent>
              {escala.data_saida ? (
                <>
                  <p className="text-2xl font-bold">
                    {format(new Date(escala.data_saida), "dd/MM/yy", { locale: ptBR })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(escala.data_saida), "HH:mm", { locale: ptBR })}
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground">Não definido</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Ship className="h-4 w-4" />
                Navio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link 
                href={`/navios/${escala.navio.id}`}
                className="text-lg font-semibold hover:underline"
              >
                {escala.navio.nome}
              </Link>
              <p className="text-sm text-muted-foreground">
                {escala.navio.companhia || ""}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Demandas
                </CardTitle>
                <CardDescription>
                  {escala.demandas.length} demanda{escala.demandas.length !== 1 ? 's' : ''} registrada{escala.demandas.length !== 1 ? 's' : ''}
                </CardDescription>
              </div>
              <DemandaForm 
                escalaId={escala.id} 
                membros={membros}
                trigger={
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Demanda
                  </Button>
                }
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {escala.demandas.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progresso geral</span>
                  <span className="font-medium">{Math.round(progressPercent)}%</span>
                </div>
                <Progress value={progressPercent} className="h-2" />
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-yellow-500" />
                    {demandasPendentes.length} pendentes
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    {demandasEmAndamento.length} em andamento
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    {demandasConcluidas.length} concluídas
                  </span>
                  {demandasBloqueadas.length > 0 && (
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-orange-500" />
                      {demandasBloqueadas.length} bloqueadas
                    </span>
                  )}
                </div>
              </div>
            )}

            {escala.demandas.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Nenhuma demanda registrada para esta escala
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {escala.demandas
                  .sort((a, b) => {
                    const priorityOrder: Record<Demanda["prioridade"], number> = { urgente: 0, alta: 1, media: 2, baixa: 3 }
                    return (priorityOrder[a.prioridade] || 3) - (priorityOrder[b.prioridade] || 3)
                  })
                  .map((demanda) => {
                    const isOverdue = demanda.prazo && 
                      new Date(demanda.prazo) < now && 
                      demanda.status !== "concluida"

                    return (
                      <Link 
                        key={demanda.id} 
                        href={`/demandas/${demanda.id}`}
                        className="block"
                      >
                        <div className={`flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors ${
                          isOverdue ? "border-destructive/50" : ""
                        }`}>
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-medium text-sm leading-tight">
                                {demanda.titulo}
                              </h4>
                              <Badge variant="outline" className={prioridadeColors[demanda.prioridade]}>
                                {prioridadeLabels[demanda.prioridade]}
                              </Badge>
                            </div>

                            {demanda.descricao && (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {demanda.descricao}
                              </p>
                            )}

                            <div className="flex items-center justify-between gap-2 pt-1">
                              <Badge variant="outline" className={`text-xs ${demandaStatusColors[demanda.status]}`}>
                                {demandaStatusLabels[demanda.status]}
                              </Badge>

                              <div className="flex items-center gap-3">
                                {demanda.prazo && (
                                  <span className={`flex items-center gap-1 text-xs ${
                                    isOverdue ? "text-destructive font-medium" : "text-muted-foreground"
                                  }`}>
                                    {isOverdue && <AlertTriangle className="h-3 w-3" />}
                                    <Clock className="h-3 w-3" />
                                    {isOverdue 
                                      ? "Atrasada" 
                                      : format(new Date(demanda.prazo), "dd/MM HH:mm", { locale: ptBR })
                                    }
                                  </span>
                                )}

                                {demanda.responsavel ? (
                                  <div className="flex items-center gap-1">
                                    <Avatar className="h-5 w-5">
                                      <AvatarImage src={demanda.responsavel.avatar_url || undefined} />
                                      <AvatarFallback className="text-[10px]">
                                        {demanda.responsavel.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
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
                          </div>
                        </div>
                      </Link>
                    )
                  })}
              </div>
            )}
          </CardContent>
        </Card>

        {escala.observacoes && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {escala.observacoes}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Chat Interno */}
        {membroAtual ? (
          <EscalaChat
            escalaId={escala.id}
            membroAtual={membroAtual}
            mensagensIniciais={mensagens}
            todosMembros={membros}
          />
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <p>É necessário ter membros cadastrados para usar o chat.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
