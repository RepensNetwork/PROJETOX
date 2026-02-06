import { StatsCards } from "@/components/dashboard/stats-cards"
import { TeamOverview } from "@/components/dashboard/team-overview"
import { DashboardClient } from "./dashboard-client"
import {
  getCachedStats,
  getCachedUpcomingEscalas,
  getCachedNavios,
  getCachedMembros,
  getCachedDemandasForDashboard,
  getCachedRecentDemandas,
  getCachedUrgentDemandas,
  getCachedAlertas,
  getCachedReservasHotel,
  getCachedDemandasByResponsavel,
} from "@/app/actions/dashboard"
import { getCurrentUser } from "@/app/actions/auth"

const emptyStats = {
  totalEscalasAtivas: 0,
  totalDemandas: 0,
  demandasPendentes: 0,
  demandasEmAndamento: 0,
  demandasConcluidas: 0,
  demandasBloqueadas: 0,
  demandasAtrasadas: 0,
  demandasCriticas: 0,
}

export async function DashboardContent() {
  const currentUser = await getCurrentUser()
  const membroId = currentUser?.membro?.id ?? ""

  const [stats, escalas, recentDemandas, urgentDemandas, membros, allDemandas, navios, alertas, reservasHotel, myDemandas] =
    await Promise.all([
      getCachedStats().catch(() => emptyStats),
      getCachedUpcomingEscalas().catch(() => []),
      getCachedRecentDemandas().catch(() => []),
      getCachedUrgentDemandas().catch(() => []),
      getCachedMembros().catch(() => []),
      getCachedDemandasForDashboard().catch(() => []),
      getCachedNavios().catch(() => []),
      getCachedAlertas().catch(() => []),
      getCachedReservasHotel().catch(() => []),
      getCachedDemandasByResponsavel(membroId).catch(() => []),
    ])

  return (
    <>
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
        reservasHotel={reservasHotel}
      />

      <TeamOverview membros={membros} demandas={recentDemandas} />
    </>
  )
}
