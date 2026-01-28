import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Users } from "lucide-react"
import type { Membro, Demanda, Escala, Navio } from "@/lib/types/database"

interface TeamOverviewProps {
  membros: Membro[]
  demandas: (Demanda & { escala: Escala & { navio: Navio }; responsavel: Membro | null })[]
}

export function TeamOverview({ membros, demandas }: TeamOverviewProps) {
  const getMembroStats = (membroId: string) => {
    const membroDemandas = demandas.filter(d => d.responsavel?.id === membroId)
    return {
      total: membroDemandas.length,
      pendentes: membroDemandas.filter(d => d.status === "pendente").length,
      emAndamento: membroDemandas.filter(d => d.status === "em_andamento").length,
      concluidas: membroDemandas.filter(d => d.status === "concluida").length,
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Equipe
        </CardTitle>
        <CardDescription>Distribuição de demandas por membro</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {membros.map((membro) => {
            const stats = getMembroStats(membro.id)

            return (
              <div key={membro.id} className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={membro.avatar_url || undefined} />
                  <AvatarFallback>
                    {membro.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-none truncate">
                    {membro.nome}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {membro.email}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {stats.pendentes > 0 && (
                    <Badge variant="outline" className="bg-warning/10 text-warning-foreground border-warning/30 text-xs">
                      {stats.pendentes}
                    </Badge>
                  )}
                  {stats.emAndamento > 0 && (
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs">
                      {stats.emAndamento}
                    </Badge>
                  )}
                  {stats.total === 0 && (
                    <span className="text-xs text-muted-foreground">Livre</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
