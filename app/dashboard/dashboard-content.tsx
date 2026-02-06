import { unstable_cache } from "next/cache"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { TeamOverview } from "@/components/dashboard/team-overview"
import { DashboardClient } from "./dashboard-client"
import {
  getDashboardStats,
  getUpcomingEscalas,
  getRecentDemandas,
  getUrgentDemandas,
  getMembros,
} from "@/app/actions/dashboard"
import { getDemandasForDashboard, getDemandasByResponsavel } from "@/app/actions/demandas"
import { getNavios } from "@/app/actions/navios"
import { getAlertas } from "@/app/actions/alertas"
import { getReservasHotel } from "@/app/actions/reservas"
import { getCurrentUser } from "@/app/actions/auth"

const CACHE_STATS = 45
const CACHE_REF = 60

const getCachedStats = unstable_cache(getDashboardStats, ["dashboard-stats"], { revalidate: CACHE_STATS })
const getCachedUpcomingEscalas = unstable_cache(getUpcomingEscalas, ["dashboard-escalas"], { revalidate: CACHE_STATS })
const getCachedNavios = unstable_cache(getNavios, ["dashboard-navios"], { revalidate: CACHE_REF })
const getCachedMembros = unstable_cache(getMembros, ["dashboard-membros"], { revalidate: CACHE_REF })

export async function DashboardContent() {
  const currentUser = await getCurrentUser()
  const membroId = currentUser?.membro?.id ?? ""

  const [stats, escalas, recentDemandas, urgentDemandas, membros, allDemandas, navios, alertas, reservasHotel, myDemandas] =
    await Promise.all([
      getCachedStats().catch(() => ({
        totalEscalasAtivas: 0,
        totalDemandas: 0,
        demandasPendentes: 0,
        demandasEmAndamento: 0,
        demandasConcluidas: 0,
        demandasBloqueadas: 0,
        demandasAtrasadas: 0,
        demandasCriticas: 0,
      })),
      getCachedUpcomingEscalas().catch(() => []),
      getRecentDemandas().catch(() => []),
      getUrgentDemandas().catch(() => []),
      getCachedMembros().catch(() => []),
      getDemandasForDashboard(100).catch(() => []),
      getCachedNavios().catch(() => []),
      getAlertas(5).catch(() => []),
      getReservasHotel(undefined, 50).catch(() => []),
      getDemandasByResponsavel(membroId).catch(() => []),
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
