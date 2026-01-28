"use client"

import { useMemo, useState } from "react"
import type { Demanda, Escala, Membro, Navio } from "@/lib/types/database"
import { EscalasTimeline } from "@/components/dashboard/escalas-timeline"
import { DemandasClient } from "./demandas-client"
import { DashboardFilters } from "@/components/dashboard/dashboard-filters"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface DashboardClientProps {
  escalas: (Escala & { navio: Navio; demandas: Demanda[] })[]
  urgentDemandas: (Demanda & { escala: Escala & { navio: Navio }; responsavel: Membro | null })[]
  recentDemandas: (Demanda & { escala: Escala & { navio: Navio }; responsavel: Membro | null })[]
  allDemandas: (Demanda & { escala: Escala & { navio: Navio }; responsavel: Membro | null })[]
  membros: Membro[]
  navios: Navio[]
}

const toDateKey = (value?: string | null) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function DashboardClient({
  escalas,
  urgentDemandas,
  recentDemandas,
  allDemandas,
  membros,
  navios,
}: DashboardClientProps) {
  const [navioId, setNavioId] = useState<string | null>(null)
  const [dateFilter, setDateFilter] = useState<string | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [dialogType, setDialogType] = useState<"hotel" | "transporte" | "embarque" | "tripulantes">("hotel")

  const todayKey = useMemo(() => toDateKey(new Date().toISOString()), [])

  const upcomingEscalas = useMemo(() => {
    const filtered = escalas.filter((escala) => {
      const escalaNavioId = escala.navio?.id ?? escala.navio_id
      const matchesNavio = !navioId || escalaNavioId === navioId
      const escalaDateKey = toDateKey(escala.data_chegada)
      const matchesDate = !dateFilter || (escalaDateKey && escalaDateKey === dateFilter)
      return matchesNavio && matchesDate
    })

    return filtered
      .slice()
      .sort((a, b) => new Date(a.data_chegada).getTime() - new Date(b.data_chegada).getTime())
      .slice(0, 2)
  }, [escalas, navioId, dateFilter])

  const applyDemandaFilters = (
    demandas: (Demanda & { escala: Escala & { navio: Navio }; responsavel: Membro | null })[]
  ) => {
    return demandas.filter((demanda) => {
      const demandaNavioId = demanda.escala?.navio?.id ?? demanda.escala?.navio_id
      const matchesNavio = !navioId || demandaNavioId === navioId
      const baseDate = demanda.prazo ?? demanda.escala?.data_chegada
      const demandaDateKey = toDateKey(baseDate || null)
      const matchesDate = !dateFilter || (demandaDateKey && demandaDateKey === dateFilter)
      return matchesNavio && matchesDate
    })
  }

  const demandasHoje = useMemo(() => {
    if (!todayKey) return []
    return allDemandas.filter((demanda) => {
      const baseDate = demanda.prazo ?? demanda.escala?.data_chegada
      return toDateKey(baseDate || null) === todayKey
    })
  }, [allDemandas, todayKey])

  const filteredUrgentDemandas = useMemo(() => applyDemandaFilters(urgentDemandas), [urgentDemandas, navioId, dateFilter])
  const filteredRecentDemandas = useMemo(() => applyDemandaFilters(recentDemandas), [recentDemandas, navioId, dateFilter])
  const filteredDemandasHoje = useMemo(() => applyDemandaFilters(demandasHoje), [demandasHoje, navioId, dateFilter])

  const hotelDemandas = useMemo(
    () =>
      applyDemandaFilters(
        allDemandas.filter((demanda) => demanda.tipo === "reserva_hotel")
      ),
    [allDemandas, navioId, dateFilter]
  )
  const transporteDemandas = useMemo(
    () =>
      applyDemandaFilters(
        allDemandas.filter((demanda) => demanda.tipo === "transporte_terrestre")
      ),
    [allDemandas, navioId, dateFilter]
  )
  const embarqueDesembarqueDemandas = useMemo(
    () =>
      applyDemandaFilters(
        allDemandas.filter(
          (demanda) => demanda.tipo === "embarque_passageiros" || demanda.tipo === "desembarque_passageiros"
        )
      ),
    [allDemandas, navioId, dateFilter]
  )
  const tripulantesDemandas = useMemo(
    () =>
      applyDemandaFilters(
        allDemandas.filter((demanda) => demanda.tipo === "controle_listas")
      ),
    [allDemandas, navioId, dateFilter]
  )

  const dialogTitle =
    dialogType === "hotel"
      ? "Reservas de hotel"
      : dialogType === "transporte"
        ? "Transportes terrestres"
        : dialogType === "embarque"
          ? "Embarques e desembarques"
          : "Tripulantes"
  const dialogList =
    dialogType === "hotel"
      ? hotelDemandas
      : dialogType === "transporte"
        ? transporteDemandas
        : dialogType === "embarque"
          ? embarqueDesembarqueDemandas
          : tripulantesDemandas

  return (
    <div className="space-y-6">
      <DashboardFilters
        navios={navios}
        navioId={navioId}
        dateFilter={dateFilter}
        onNavioChange={setNavioId}
        onDateChange={setDateFilter}
        onClear={() => {
          setNavioId(null)
          setDateFilter(null)
        }}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card
          role="button"
          tabIndex={0}
          onClick={() => {
            setDialogType("hotel")
            setOpenDialog(true)
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault()
              setDialogType("hotel")
              setOpenDialog(true)
            }
          }}
          className="cursor-pointer transition hover:border-primary/50"
        >
          <CardHeader>
            <CardTitle>Reservas de hotel</CardTitle>
            <CardDescription>Demandas de hospedagem</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{hotelDemandas.length}</p>
          </CardContent>
        </Card>

        <Card
          role="button"
          tabIndex={0}
          onClick={() => {
            setDialogType("transporte")
            setOpenDialog(true)
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault()
              setDialogType("transporte")
              setOpenDialog(true)
            }
          }}
          className="cursor-pointer transition hover:border-primary/50"
        >
          <CardHeader>
            <CardTitle>Transportes</CardTitle>
            <CardDescription>Demandas de transporte terrestre</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{transporteDemandas.length}</p>
          </CardContent>
        </Card>

        <Card
          role="button"
          tabIndex={0}
          onClick={() => {
            setDialogType("embarque")
            setOpenDialog(true)
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault()
              setDialogType("embarque")
              setOpenDialog(true)
            }
          }}
          className="cursor-pointer transition hover:border-primary/50"
        >
          <CardHeader>
            <CardTitle>Embarques e desembarques</CardTitle>
            <CardDescription>Demandas de passageiros</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{embarqueDesembarqueDemandas.length}</p>
          </CardContent>
        </Card>

        <Card
          role="button"
          tabIndex={0}
          onClick={() => {
            setDialogType("tripulantes")
            setOpenDialog(true)
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault()
              setDialogType("tripulantes")
              setOpenDialog(true)
            }
          }}
          className="cursor-pointer transition hover:border-primary/50"
        >
          <CardHeader>
            <CardTitle>Tripulantes</CardTitle>
            <CardDescription>Demandas de controle de listas</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{tripulantesDemandas.length}</p>
          </CardContent>
        </Card>
      </div>

      <EscalasTimeline escalas={upcomingEscalas} />

      <DemandasClient
        urgentDemandas={filteredUrgentDemandas}
        recentDemandas={filteredRecentDemandas}
        todayDemandas={filteredDemandasHoje}
        membros={membros}
      />

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>
              Clique em uma demanda para ver detalhes na página de demandas.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {dialogList.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma demanda encontrada.</p>
            ) : (
              <div className="divide-y rounded-lg border">
                {dialogList.slice(0, 10).map((demanda) => (
                  <div key={demanda.id} className="p-3">
                    <p className="font-medium">{demanda.titulo}</p>
                    <p className="text-xs text-muted-foreground">
                      {demanda.escala?.navio?.nome || "Navio"} • {demanda.escala?.porto || "Porto"}
                    </p>
                    {demanda.prazo && (
                      <p className="text-xs text-muted-foreground">
                        Prazo: {new Date(demanda.prazo).toLocaleString("pt-BR")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
