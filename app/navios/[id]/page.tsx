import { notFound } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { NavioForm } from "@/components/navios/navio-form"
import { EscalasTable } from "@/components/escalas/escalas-table"
import { getNavioWithEscalas } from "@/app/actions/navios"
import { 
  Ship, 
  Building2,
  ArrowLeft,
  Pencil,
  Calendar,
  MapPin,
  Hash
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"
import type { Escala } from "@/lib/types/database"

interface NavioDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function NavioDetailPage({ params }: NavioDetailPageProps) {
  const { id } = await params
  const navio = await getNavioWithEscalas(id)

  if (!navio) {
    notFound()
  }

  const escalasAtivas = navio.escalas.filter(
    (e: Escala) => e.status === "planejada" || e.status === "em_operacao"
  )
  const escalasPassadas = navio.escalas.filter(
    (e: Escala) => e.status === "concluida" || e.status === "cancelada"
  )

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/navios">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
              <Ship className="h-6 w-6" />
              {navio.nome}
            </h1>
            <p className="text-muted-foreground">Detalhes e histórico de escalas</p>
          </div>
          <NavioForm 
            navio={navio}
            trigger={
              <Button variant="outline">
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </Button>
            }
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Informações do Navio
              </CardTitle>
              <CardDescription>Dados cadastrais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Companhia
                </h4>
                <p className="text-sm text-muted-foreground">{navio.companhia}</p>
              </div>
              {navio.observacoes && (
                <>
                  <div className="h-px bg-border" />
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      Observações
                    </h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {navio.observacoes}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
              <CardDescription>Estatísticas de escalas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-2xl font-bold">{navio.escalas.length}</p>
                  <p className="text-sm text-muted-foreground">Total de escalas</p>
                </div>
                <div className="h-px bg-border" />
                <div>
                  <p className="text-2xl font-bold">{escalasAtivas.length}</p>
                  <p className="text-sm text-muted-foreground">Escalas ativas</p>
                </div>
                <div className="h-px bg-border" />
                <div>
                  <p className="text-2xl font-bold">{escalasPassadas.length}</p>
                  <p className="text-sm text-muted-foreground">Escalas passadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {escalasAtivas.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Escalas Ativas</CardTitle>
              <CardDescription>Escalas planejadas ou em operação</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {escalasAtivas.map((escala: Escala) => (
                  <Link
                    key={escala.id}
                    href={`/escalas/${escala.id}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-primary/20 border border-primary/30">
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <span className="font-semibold text-base">
                            {escala.porto}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {format(new Date(escala.data_chegada), "dd/MM/yyyy", { locale: ptBR })}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(escala.data_chegada), "HH:mm", { locale: ptBR })}
                          </div>
                        </div>
                        <Badge className={
                          escala.status === "planejada" 
                            ? "bg-warning/10 text-warning-foreground border-warning/30"
                            : "bg-primary/10 text-primary border-primary/30"
                        }>
                          {escala.status === "planejada" ? "Planejada" : "Em Operação"}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {escalasPassadas.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Escalas</CardTitle>
              <CardDescription>Escalas concluídas ou canceladas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {escalasPassadas.map((escala: Escala) => (
                  <Link
                    key={escala.id}
                    href={`/escalas/${escala.id}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-muted border border-border">
                          <MapPin className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <span className="font-semibold text-base">
                            {escala.porto}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {format(new Date(escala.data_chegada), "dd/MM/yyyy", { locale: ptBR })}
                          </div>
                          {escala.data_saida && (
                            <div className="text-xs text-muted-foreground">
                              até {format(new Date(escala.data_saida), "dd/MM/yyyy", { locale: ptBR })}
                            </div>
                          )}
                        </div>
                        <Badge className={
                          escala.status === "concluida"
                            ? "bg-green-500/10 text-green-600 dark:text-green-400"
                            : "bg-gray-500/10 text-gray-600 dark:text-gray-400"
                        }>
                          {escala.status === "concluida" ? "Concluída" : "Cancelada"}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {navio.escalas.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Nenhuma escala registrada para este navio</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
