"use server"

import { createClient } from "@/lib/supabase/server"
import type { Demanda, Escala, Navio } from "@/lib/types/database"

export async function getTransportesDoDia(
  date?: string,
  tipo?: string
): Promise<(Demanda & { escala: Escala & { navio: Navio } })[]> {
  const supabase = await createClient()

  const transportTipos: Demanda["tipo"][] = [
    "embarque_passageiros",
    "desembarque_passageiros",
    "visita_medica",
    "reserva_hotel",
    "transporte_terrestre",
    "pickup_dropoff",
    "motorista",
    "veiculo",
  ]

  const toDateKey = (value: Date) => value.toISOString().slice(0, 10)
  const parseDescricaoDate = (descricao: string | null | undefined, fallbackYear: number) => {
    if (!descricao) return null
    const match = descricao.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/)
    if (!match) return null
    const day = Number(match[1])
    const month = Number(match[2]) - 1
    const rawYear = match[3]
    const year = rawYear ? Number(rawYear.length === 2 ? `20${rawYear}` : rawYear) : fallbackYear
    const parsed = new Date(year, month, day, 12, 0, 0)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }

  const parseDateInput = (value?: string | null) => {
    if (!value) return null
    const trimmed = value.trim()
    const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (isoMatch) {
      return new Date(`${trimmed}T00:00:00`)
    }
    const brMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
    if (brMatch) {
      const day = Number(brMatch[1])
      const month = Number(brMatch[2]) - 1
      const year = Number(brMatch[3])
      return new Date(year, month, day, 0, 0, 0)
    }
    return new Date(`${trimmed}T00:00:00`)
  }

  const selectedTipos = tipo
    ? tipo
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : []

  const filterTipos = selectedTipos.length > 0 ? selectedTipos : transportTipos

  if (date && ["all", "todos"].includes(date.toLowerCase())) {
    const { data, error } = await supabase
      .from("demandas")
      .select("*, escala:escalas(*, navio:navios(*))")
      .in("tipo", filterTipos)
      .order("pickup_at", { ascending: true })

    if (error) {
      console.error("Error fetching transportes:", error)
      return []
    }

    const items = data || []
    return items.sort((a, b) => {
      const aTime = a.pickup_at ? new Date(a.pickup_at).getTime() : new Date(a.escala?.data_chegada || 0).getTime()
      const bTime = b.pickup_at ? new Date(b.pickup_at).getTime() : new Date(b.escala?.data_chegada || 0).getTime()
      return aTime - bTime
    })
  }

  const baseDate = date ? parseDateInput(date) : new Date()
  if (!baseDate || Number.isNaN(baseDate.getTime())) {
    return []
  }

  const start = new Date(baseDate)
  start.setHours(0, 0, 0, 0)
  const end = new Date(baseDate)
  end.setHours(23, 59, 59, 999)

  const { data, error } = await supabase
    .from("demandas")
    .select("*, escala:escalas(*, navio:navios(*))")
    .in("tipo", filterTipos)
    .order("created_at", { ascending: false })
    .limit(500)

  if (error) {
    console.error("Error fetching transportes:", error)
    return []
  }

  const targetKey = toDateKey(baseDate)
  const filtered = (data || []).filter((item) => {
    if (item.pickup_at) {
      return toDateKey(new Date(item.pickup_at)) === targetKey
    }

    const escalaDate = item.escala?.data_chegada ? new Date(item.escala.data_chegada) : null
    const fallbackYear = escalaDate?.getFullYear() || baseDate.getFullYear()
    const descricaoDate = parseDescricaoDate(item.descricao, fallbackYear)
    if (descricaoDate) {
      return toDateKey(descricaoDate) === targetKey
    }

    if (item.prazo) {
      return toDateKey(new Date(item.prazo)) === targetKey
    }

    if (escalaDate) {
      return toDateKey(escalaDate) === targetKey
    }

    return false
  })

  return filtered.sort((a, b) => {
    const aTime = a.pickup_at ? new Date(a.pickup_at).getTime() : new Date(a.escala?.data_chegada || 0).getTime()
    const bTime = b.pickup_at ? new Date(b.pickup_at).getTime() : new Date(b.escala?.data_chegada || 0).getTime()
    return aTime - bTime
  })
}
