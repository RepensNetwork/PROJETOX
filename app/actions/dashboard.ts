"use server"

import { createClient } from "@/lib/supabase/server"
import type { 
  DashboardStats, 
  Escala, 
  Demanda, 
  Membro,
  Navio 
} from "@/lib/types/database"

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

export async function getMembros(): Promise<Membro[]> {
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
