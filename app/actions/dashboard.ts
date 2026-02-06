"use server"

import { createClient } from "@/lib/supabase/server"
import { unstable_cache } from "next/cache"
import type { 
  DashboardStats, 
  Escala, 
  Demanda, 
  Membro,
  Navio 
} from "@/lib/types/database"
import { getDemandasForDashboard, getDemandasByResponsavel } from "@/app/actions/demandas"
import { getNavios } from "@/app/actions/navios"
import { getAlertas } from "@/app/actions/alertas"
import { getReservasHotel } from "@/app/actions/reservas"
import { getCurrentUser } from "@/app/actions/auth"

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient()
  const now = new Date().toISOString()

  const [
    resEscalas,
    resTotal,
    resPendentes,
    resEmAndamento,
    resConcluidas,
    resBloqueadas,
    resAtrasadas,
    resCriticas,
  ] = await Promise.all([
    supabase.from("escalas").select("*", { count: "exact", head: true }).in("status", ["planejada", "em_operacao"]),
    supabase.from("demandas").select("id", { count: "exact", head: true }),
    supabase.from("demandas").select("id", { count: "exact", head: true }).eq("status", "pendente"),
    supabase.from("demandas").select("id", { count: "exact", head: true }).eq("status", "em_andamento"),
    supabase.from("demandas").select("id", { count: "exact", head: true }).eq("status", "concluida"),
    supabase.from("demandas").select("id", { count: "exact", head: true }).eq("status", "aguardando_terceiro"),
    supabase.from("demandas").select("id", { count: "exact", head: true }).lt("prazo", now).neq("status", "concluida"),
    supabase.from("demandas").select("id", { count: "exact", head: true }).eq("prioridade", "urgente").neq("status", "concluida"),
  ])

  return {
    totalEscalasAtivas: resEscalas.count ?? 0,
    totalDemandas: resTotal.count ?? 0,
    demandasPendentes: resPendentes.count ?? 0,
    demandasEmAndamento: resEmAndamento.count ?? 0,
    demandasConcluidas: resConcluidas.count ?? 0,
    demandasBloqueadas: resBloqueadas.count ?? 0,
    demandasAtrasadas: resAtrasadas.count ?? 0,
    demandasCriticas: resCriticas.count ?? 0,
  }
}

export async function getActiveEscalas(): Promise<(Escala & { navio: Navio; demandas: Pick<Demanda, "id" | "titulo" | "status">[] })[]> {
  const supabase = await createClient()

  const { data: escalas, error } = await supabase
    .from("escalas")
    .select(`
      *,
      navio:navios(id, nome, companhia),
      demandas(id, titulo, status)
    `)
    .in("status", ["planejada", "em_operacao"])
    .order("data_chegada", { ascending: true })

  if (error) {
    console.error("Error fetching escalas:", error)
    return []
  }

  return escalas || []
}

export async function getUpcomingEscalas(): Promise<(Escala & { navio: Navio; demandas: Pick<Demanda, "id" | "titulo" | "status">[] })[]> {
  const supabase = await createClient()

  const { data: escalas, error } = await supabase
    .from("escalas")
    .select(`
      *,
      navio:navios(id, nome, companhia),
      demandas(id, titulo, status)
    `)
    .in("status", ["planejada", "em_operacao"])
    .order("data_chegada", { ascending: true })

  if (error) {
    console.error("Error fetching upcoming escalas:", error)
    return []
  }

  // Incluir escalas que chegam hoje/futuro OU que saem hoje/futuro (inclui em andamento:
  // chegada no passado + saída hoje/futuro = escala em curso)
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  startOfToday.setHours(0, 0, 0, 0)

  const filtered = (escalas || []).filter((escala) => {
    const chegada = new Date(escala.data_chegada)
    const saida = escala.data_saida ? new Date(escala.data_saida) : null
    const chegadaOk = chegada >= startOfToday
    const saidaOk = saida ? saida >= startOfToday : false
    return chegadaOk || saidaOk
  })

  // Ordenar pela escala mais próxima (data de chegada ascendente)
  filtered.sort((a, b) => new Date(a.data_chegada).getTime() - new Date(b.data_chegada).getTime())
  return filtered
}

export async function getRecentDemandas(): Promise<(Demanda & { escala: Escala & { navio: Navio }; responsavel: Membro | null })[]> {
  const supabase = await createClient()

  const { data: demandas, error } = await supabase
    .from("demandas")
    .select(`
      *,
      escala:escalas(*, navio:navios(*)),
      responsavel:membros(*)
    `)
    .neq("status", "concluida")
    .order("updated_at", { ascending: false })
    .limit(10)

  if (error) {
    console.error("Error fetching demandas:", error)
    return []
  }

  return demandas || []
}

export async function getUrgentDemandas(): Promise<(Demanda & { escala: Escala & { navio: Navio }; responsavel: Membro | null })[]> {
  const supabase = await createClient()

  const now = new Date().toISOString()

  const { data: demandas, error } = await supabase
    .from("demandas")
    .select(`
      *,
      escala:escalas(*, navio:navios(*)),
      responsavel:membros(*)
    `)
    .neq("status", "concluida")
    .or(`prioridade.eq.urgente,prioridade.eq.alta,prazo.lt.${now}`)
    .order("prazo", { ascending: true })
    .limit(5)

  if (error) {
    console.error("Error fetching urgent demandas:", error)
    return []
  }

  return demandas || []
}

async function fetchMembros(): Promise<Membro[]> {
  const supabase = await createClient()
  const { data: membros, error } = await supabase
    .from("membros")
    .select("*")
    .order("nome", { ascending: true })
  if (error) {
    console.error("Error fetching membros:", error)
    return []
  }
  return membros || []
}

export async function getMembros(): Promise<Membro[]> {
  return unstable_cache(fetchMembros, ["membros-list"], {
    revalidate: 60,
    tags: ["membros"],
  })()
}

export async function updateDemandaStatus(
  demandaId: string, 
  status: Demanda["status"]
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from("demandas")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", demandaId)

  if (error) {
    console.error("Error updating demanda:", error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

// ——— Cache único: tudo em ~200ms quando cache quente ———
const CACHE_DASH = 30
export const getCachedStats = unstable_cache(getDashboardStats, ["dashboard-stats"], {
  revalidate: CACHE_DASH,
  tags: ["dashboard"],
})
export const getCachedUpcomingEscalas = unstable_cache(getUpcomingEscalas, ["dashboard-escalas"], {
  revalidate: CACHE_DASH,
  tags: ["dashboard"],
})
export const getCachedNavios = unstable_cache(getNavios, ["dashboard-navios"], {
  revalidate: 60,
  tags: ["dashboard"],
})
export const getCachedMembros = getMembros
export const getCachedDemandasForDashboard = unstable_cache(
  () => getDemandasForDashboard(500),
  ["dashboard-demandas"],
  { revalidate: CACHE_DASH, tags: ["dashboard"] }
)
export const getCachedRecentDemandas = unstable_cache(getRecentDemandas, ["dashboard-recent-demandas"], {
  revalidate: CACHE_DASH,
  tags: ["dashboard"],
})
export const getCachedUrgentDemandas = unstable_cache(getUrgentDemandas, ["dashboard-urgent-demandas"], {
  revalidate: CACHE_DASH,
  tags: ["dashboard"],
})
export const getCachedAlertas = unstable_cache(() => getAlertas(5), ["dashboard-alertas"], {
  revalidate: CACHE_DASH,
  tags: ["dashboard"],
})
export const getCachedReservasHotel = unstable_cache(
  () => getReservasHotel(undefined, 50),
  ["dashboard-reservas"],
  { revalidate: CACHE_DASH, tags: ["dashboard"] }
)

export async function getCachedDemandasByResponsavel(membroId: string) {
  if (!membroId || membroId.trim() === "") return []
  return unstable_cache(
    () => getDemandasByResponsavel(membroId),
    ["dashboard-my-demandas", membroId],
    { revalidate: CACHE_DASH, tags: ["dashboard"] }
  )()
}

/** Primeiro bloco: stats + escalas + navios + demandas (cache) + currentUser. Rápido quando cache quente. */
export async function getDashboardDataFirst(): Promise<{
  stats: DashboardStats
  escalas: (Escala & { navio: Navio; demandas?: Pick<Demanda, "id" | "titulo" | "status">[] })[]
  allDemandas: (Demanda & { escala: Escala & { navio: Navio }; responsavel: Membro | null })[]
  navios: Navio[]
  membroId: string
}> {
  const [stats, escalas, navios, allDemandas, currentUser] = await Promise.all([
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
    getCachedNavios().catch(() => []),
    getCachedDemandasForDashboard().catch(() => []),
    getCurrentUser(),
  ])
  return {
    stats: stats ?? {
      totalEscalasAtivas: 0,
      totalDemandas: 0,
      demandasPendentes: 0,
      demandasEmAndamento: 0,
      demandasConcluidas: 0,
      demandasBloqueadas: 0,
      demandasAtrasadas: 0,
      demandasCriticas: 0,
    },
    escalas: escalas ?? [],
    allDemandas: allDemandas ?? [],
    navios: navios ?? [],
    membroId: currentUser?.membro?.id ?? "",
  }
}

/** Segundo bloco: alertas, reservas, demandas recentes/urgentes/minhas. Carrega após o primeiro. */
export async function getDashboardDataRest(membroId: string): Promise<{
  recentDemandas: (Demanda & { escala: Escala & { navio: Navio }; responsavel: Membro | null })[]
  urgentDemandas: (Demanda & { escala: Escala & { navio: Navio }; responsavel: Membro | null })[]
  membros: Membro[]
  alertas: Awaited<ReturnType<typeof getAlertas>>
  reservasHotel: Awaited<ReturnType<typeof getReservasHotel>>
  myDemandas: (Demanda & { escala: Escala & { navio: Navio }; responsavel: Membro | null })[]
}> {
  const [recentDemandas, urgentDemandas, membros, alertas, reservasHotel, myDemandas] = await Promise.all([
    getRecentDemandas(),
    getUrgentDemandas(),
    getMembros(),
    getAlertas(5),
    getReservasHotel(undefined, 50),
    membroId ? getDemandasByResponsavel(membroId) : Promise.resolve([]),
  ])
  return {
    recentDemandas: recentDemandas ?? [],
    urgentDemandas: urgentDemandas ?? [],
    membros: membros ?? [],
    alertas: alertas ?? [],
    reservasHotel: reservasHotel ?? [],
    myDemandas: myDemandas ?? [],
  }
}
