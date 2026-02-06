"use client"

import { useEffect, useState } from "react"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { TeamOverview } from "@/components/dashboard/team-overview"
import { DashboardClient } from "./dashboard-client"
import { DashboardSkeleton } from "./dashboard-skeleton"
import { getDashboardDataFirst, getDashboardDataRest } from "@/app/actions/dashboard"

type FirstData = Awaited<ReturnType<typeof getDashboardDataFirst>>
type RestData = Awaited<ReturnType<typeof getDashboardDataRest>>

export function DashboardShell() {
  const [first, setFirst] = useState<FirstData | null>(null)
  const [rest, setRest] = useState<RestData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setError(null)
    getDashboardDataFirst()
      .then((data) => {
        if (!cancelled) setFirst(data)
        return data.membroId
      })
      .then((membroId) => getDashboardDataRest(membroId))
      .then((data) => {
        if (!cancelled) setRest(data)
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message ?? "Erro ao carregar dashboard")
      })
    return () => { cancelled = true }
  }, [])

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
        {error}
      </div>
    )
  }

  if (!first) {
    return <DashboardSkeleton />
  }

  return (
    <>
      <StatsCards
        stats={first.stats}
        escalas={first.escalas}
        allDemandas={first.allDemandas}
        navios={first.navios}
      />

      {!rest ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-64 rounded-xl bg-muted/50 animate-pulse" />
          <div className="h-64 rounded-xl bg-muted/50 animate-pulse" />
        </div>
      ) : (
        <>
          <DashboardClient
            escalas={first.escalas}
            urgentDemandas={rest.urgentDemandas}
            recentDemandas={rest.recentDemandas}
            allDemandas={first.allDemandas}
            myDemandas={rest.myDemandas}
            alertas={rest.alertas}
            membros={rest.membros}
            navios={first.navios}
            reservasHotel={rest.reservasHotel}
          />
          <TeamOverview membros={rest.membros} demandas={rest.recentDemandas} />
        </>
      )}
    </>
  )
}
