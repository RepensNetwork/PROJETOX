import { Header } from "@/components/layout/header"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { TeamOverview } from "@/components/dashboard/team-overview"
import { DashboardClient } from "./dashboard-client"
import { 
  getDashboardStats, 
  getUpcomingEscalas, 
  getRecentDemandas,
  getUrgentDemandas,
  getMembros 
} from "@/app/actions/dashboard"
import { getDemandas, getDemandasByResponsavel } from "@/app/actions/demandas"
import { getNavios } from "@/app/actions/navios"
import { getAlertas } from "@/app/actions/alertas"
import { getCurrentUser } from "@/app/actions/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Mic } from "lucide-react"

export default async function DashboardPage() {
  // Verificar autenticação (não bloquear acesso ao dashboard)
  const currentUser = await getCurrentUser()
  const membroId = currentUser?.membro?.id ?? null
  try {
    const [stats, escalas, recentDemandas, urgentDemandas, membros, allDemandas, navios, myDemandas, alertas] = await Promise.all([
      getDashboardStats().catch(() => ({
        totalEscalasAtivas: 0,
        totalDemandas: 0,
        demandasPendentes: 0,
        demandasEmAndamento: 0,
        demandasConcluidas: 0,
        demandasBloqueadas: 0,
        demandasAtrasadas: 0,
        demandasCriticas: 0,
      })),
      getUpcomingEscalas().catch(() => []),
      getRecentDemandas().catch(() => []),
      getUrgentDemandas().catch(() => []),
      getMembros().catch(() => []),
      getDemandas().catch(() => []),
      getNavios().catch(() => []),
      membroId ? getDemandasByResponsavel(membroId).catch(() => []) : Promise.resolve([]),
      getAlertas(10).catch(() => []),
    ])

    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-6 space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">
                Visão geral das operações portuárias
              </p>
            </div>
            <Button asChild className="gap-2">
              <Link href="/intake">
                <Mic className="h-4 w-4" />
                Criar demanda
              </Link>
            </Button>
          </div>

          <StatsCards 
            stats={stats} 
            escalas={escalas}
            allDemandas={allDemandas}
            navios={navios}
          />

          <DashboardClient
            escalas={escalas}
            urgentDemandas={urgentDemandas}
            recentDemandas={recentDemandas}
            allDemandas={allDemandas}
            myDemandas={myDemandas}
            alertas={alertas}
            membros={membros}
            navios={navios}
          />

          <TeamOverview membros={membros} demandas={recentDemandas} />
        </main>
      </div>
    )
  } catch (error) {
    console.error("Error rendering dashboard:", error)
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-6">
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
            <h1 className="text-2xl font-bold text-destructive mb-2">Erro ao carregar dashboard</h1>
            <p className="text-muted-foreground">
              Ocorreu um erro ao carregar os dados. Verifique a conexão com o banco de dados.
            </p>
          </div>
        </main>
      </div>
    )
  }
}
