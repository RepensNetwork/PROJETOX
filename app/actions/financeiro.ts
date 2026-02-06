"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type {
  FinanceiroCategoria,
  FinanceiroConta,
  FinanceiroLancamento,
  FinanceiroComissao,
  FinanceiroResumo,
  Escala,
  Navio,
} from "@/lib/types/database"

const FINANCEIRO_PATH = "/financeiro"

// ——— Categorias ———
export async function getCategorias(tipo?: "receita" | "despesa"): Promise<FinanceiroCategoria[]> {
  const supabase = await createClient()
  let q = supabase
    .from("financeiro_categorias")
    .select("*")
    .eq("ativo", true)
  if (tipo) q = q.eq("tipo", tipo)
  const { data, error } = await q.order("nome")
  if (error) {
    console.error("getCategorias:", error)
    return []
  }
  return data ?? []
}

export async function getCategoriasAll(): Promise<FinanceiroCategoria[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("financeiro_categorias")
    .select("*")
    .order("tipo")
    .order("nome")
  if (error) {
    console.error("getCategoriasAll:", error)
    return []
  }
  return data ?? []
}

// ——— Contas ———
export async function getContas(): Promise<FinanceiroConta[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("financeiro_contas")
    .select("*")
    .eq("ativo", true)
    .order("nome")
  if (error) {
    console.error("getContas:", error)
    return []
  }
  return data ?? []
}

export async function getContasAll(): Promise<FinanceiroConta[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("financeiro_contas")
    .select("*")
    .order("nome")
  if (error) {
    console.error("getContasAll:", error)
    return []
  }
  return data ?? []
}

// ——— Lançamentos ———
const lancamentoSelect = `
  *,
  categoria:financeiro_categorias(*),
  conta:financeiro_contas(*),
  escala:escalas(id, porto, data_chegada, data_saida, navio:navios(id, nome, companhia)),
  demanda:demandas(id, titulo, status)
`

export async function getLancamentos(filters?: {
  tipo?: "receita" | "despesa"
  status?: string
  dataDe?: string
  dataAte?: string
  escalaId?: string
  limit?: number
}): Promise<FinanceiroLancamento[]> {
  const supabase = await createClient()
  let q = supabase.from("financeiro_lancamentos").select(lancamentoSelect)

  if (filters?.tipo) q = q.eq("tipo", filters.tipo)
  if (filters?.status) q = q.eq("status", filters.status)
  if (filters?.escalaId) q = q.eq("escala_id", filters.escalaId)
  if (filters?.dataDe) q = q.gte("data_vencimento", filters.dataDe)
  if (filters?.dataAte) q = q.lte("data_vencimento", filters.dataAte)

  q = q.order("data_vencimento", { ascending: false })
  if (filters?.limit) q = q.limit(filters.limit)

  const { data, error } = await q
  if (error) {
    console.error("getLancamentos:", error)
    return []
  }
  return data ?? []
}

export async function getLancamentoById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("financeiro_lancamentos")
    .select(lancamentoSelect)
    .eq("id", id)
    .single()
  if (error) {
    console.error("getLancamentoById:", error)
    return null
  }
  return data
}

export async function createLancamento(input: {
  conta_id?: string | null
  categoria_id?: string | null
  tipo: "receita" | "despesa"
  valor: number
  data_vencimento: string
  data_liquidacao?: string | null
  descricao?: string | null
  documento_ref?: string | null
  escala_id?: string | null
  demanda_id?: string | null
  status?: string
  observacoes?: string | null
}) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("financeiro_lancamentos")
    .insert({
      ...input,
      status: input.status ?? "previsto",
    })
    .select()
    .single()
  if (error) {
    console.error("createLancamento:", error)
    return { data: null, error: error.message }
  }
  revalidatePath(FINANCEIRO_PATH)
  revalidatePath("/financeiro/contas-receber")
  revalidatePath("/financeiro/contas-pagar")
  revalidatePath("/financeiro/movimentacoes")
  return { data, error: null }
}

export async function updateLancamento(
  id: string,
  input: Partial<{
    conta_id: string | null
    categoria_id: string | null
    tipo: "receita" | "despesa"
    valor: number
    data_vencimento: string
    data_liquidacao: string | null
    descricao: string | null
    documento_ref: string | null
    escala_id: string | null
    demanda_id: string | null
    status: string
    observacoes: string | null
  }>
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("financeiro_lancamentos")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()
  if (error) {
    console.error("updateLancamento:", error)
    return { data: null, error: error.message }
  }
  revalidatePath(FINANCEIRO_PATH)
  revalidatePath("/financeiro/contas-receber")
  revalidatePath("/financeiro/contas-pagar")
  revalidatePath("/financeiro/movimentacoes")
  return { data, error: null }
}

export async function deleteLancamento(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("financeiro_lancamentos").delete().eq("id", id)
  if (error) {
    console.error("deleteLancamento:", error)
    return { error: error.message }
  }
  revalidatePath(FINANCEIRO_PATH)
  revalidatePath("/financeiro/contas-receber")
  revalidatePath("/financeiro/contas-pagar")
  revalidatePath("/financeiro/movimentacoes")
  return { error: null }
}

// ——— Comissões ———
export async function getComissoes(filters?: {
  status?: string
  escalaId?: string
  limit?: number
}): Promise<FinanceiroComissao[]> {
  const supabase = await createClient()
  let q = supabase
    .from("financeiro_comissoes")
    .select(`
      *,
      escala:escalas(id, porto, data_chegada, data_saida, navio:navios(id, nome, companhia))
    `)
  if (filters?.status) q = q.eq("status", filters.status)
  if (filters?.escalaId) q = q.eq("escala_id", filters.escalaId)
  q = q.order("data_previsao", { ascending: false, nullsFirst: false })
  if (filters?.limit) q = q.limit(filters.limit)
  const { data, error } = await q
  if (error) {
    console.error("getComissoes:", error)
    return []
  }
  return data ?? []
}

export async function getComissaoById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("financeiro_comissoes")
    .select(`
      *,
      escala:escalas(id, porto, data_chegada, navio:navios(id, nome, companhia))
    `)
    .eq("id", id)
    .single()
  if (error) {
    console.error("getComissaoById:", error)
    return null
  }
  return data
}

export async function createComissao(input: {
  escala_id: string
  descricao?: string | null
  valor_bruto: number
  percentual_comissao: number
  data_previsao?: string | null
}) {
  const valor_comissao = (input.valor_bruto * input.percentual_comissao) / 100
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("financeiro_comissoes")
    .insert({
      ...input,
      valor_comissao,
      status: "calculada",
    })
    .select()
    .single()
  if (error) {
    console.error("createComissao:", error)
    return { data: null, error: error.message }
  }
  revalidatePath(FINANCEIRO_PATH)
  revalidatePath("/financeiro/comissoes")
  return { data, error: null }
}

export async function updateComissao(
  id: string,
  input: Partial<{
    descricao: string | null
    valor_bruto: number
    percentual_comissao: number
    status: string
    data_previsao: string | null
    data_recebimento: string | null
    lancamento_id: string | null
  }>
) {
  const supabase = await createClient()
  const updates: Record<string, unknown> = { ...input, updated_at: new Date().toISOString() }
  if (input?.valor_bruto != null && input?.percentual_comissao != null) {
    updates.valor_comissao = (input.valor_bruto * input.percentual_comissao) / 100
  }
  const { data, error } = await supabase
    .from("financeiro_comissoes")
    .update(updates)
    .eq("id", id)
    .select()
    .single()
  if (error) {
    console.error("updateComissao:", error)
    return { data: null, error: error.message }
  }
  revalidatePath(FINANCEIRO_PATH)
  revalidatePath("/financeiro/comissoes")
  return { data, error: null }
}

// ——— Resumo (dashboard) ———
export async function getFinanceiroResumo(periodo?: { de: string; ate: string }): Promise<FinanceiroResumo> {
  const supabase = await createClient()
  const hoje = new Date().toISOString().slice(0, 10)

  const defaultResumo: FinanceiroResumo = {
    totalReceitas: 0,
    totalDespesas: 0,
    saldoPeriodo: 0,
    aReceber: 0,
    aPagar: 0,
    receitasLidadas: 0,
    despesasLidadas: 0,
  }

  let qReceitas = supabase
    .from("financeiro_lancamentos")
    .select("valor, status, data_vencimento, data_liquidacao")
    .eq("tipo", "receita")
    .neq("status", "cancelado")
  let qDespesas = supabase
    .from("financeiro_lancamentos")
    .select("valor, status, data_vencimento, data_liquidacao")
    .eq("tipo", "despesa")
    .neq("status", "cancelado")

  if (periodo?.de) {
    qReceitas = qReceitas.gte("data_vencimento", periodo.de)
    qDespesas = qDespesas.gte("data_vencimento", periodo.de)
  }
  if (periodo?.ate) {
    qReceitas = qReceitas.lte("data_vencimento", periodo.ate)
    qDespesas = qDespesas.lte("data_vencimento", periodo.ate)
  }

  const [rRec, rDes] = await Promise.all([qReceitas, qDespesas])
  const receitas = rRec.data ?? []
  const despesas = rDes.data ?? []

  let totalReceitas = 0,
    totalDespesas = 0,
    receitasLidadas = 0,
    despesasLidadas = 0,
    aReceber = 0,
    aPagar = 0

  for (const r of receitas) {
    totalReceitas += Number(r.valor)
    if (r.status === "liquidado") receitasLidadas += Number(r.valor)
    else if (r.status !== "cancelado") aReceber += Number(r.valor)
  }
  for (const d of despesas) {
    totalDespesas += Number(d.valor)
    if (d.status === "liquidado") despesasLidadas += Number(d.valor)
    else if (d.status !== "cancelado") aPagar += Number(d.valor)
  }

  return {
    totalReceitas,
    totalDespesas,
    saldoPeriodo: totalReceitas - totalDespesas,
    aReceber,
    aPagar,
    receitasLidadas,
    despesasLidadas,
  }
}

// Escalas próximas (para vincular lançamentos/comissões)
export async function getEscalasParaFinanceiro(): Promise<(Escala & { navio: Navio })[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("escalas")
    .select("*, navio:navios(id, nome, companhia)")
    .order("data_chegada", { ascending: false })
    .limit(100)
  if (error) {
    console.error("getEscalasParaFinanceiro:", error)
    return []
  }
  return data ?? []
}

// ——— Sincronização Reserva Hotel → Despesa (Hospedagem) ———
const CATEGORIA_HOSPEDAGEM_NOME = "Hospedagem"

/** Retorna o id da categoria "Hospedagem" (despesa). */
export async function getCategoriaHospedagemId(): Promise<string | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("financeiro_categorias")
    .select("id")
    .eq("tipo", "despesa")
    .ilike("nome", CATEGORIA_HOSPEDAGEM_NOME)
    .eq("ativo", true)
    .limit(1)
    .maybeSingle()
  if (error) {
    console.error("getCategoriaHospedagemId:", error)
    return null
  }
  return data?.id ?? null
}

/** Busca lançamento de despesa de hospedagem já vinculado a esta demanda (para reserva hotel). */
async function getLancamentoReservaByDemandaId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  demandaId: string,
  categoriaId: string
): Promise<FinanceiroLancamento | null> {
  const { data, error } = await supabase
    .from("financeiro_lancamentos")
    .select(lancamentoSelect)
    .eq("demanda_id", demandaId)
    .eq("tipo", "despesa")
    .eq("categoria_id", categoriaId)
    .neq("status", "cancelado")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) return null
  return data as FinanceiroLancamento | null
}

/**
 * Sincroniza a reserva de hotel da demanda com o financeiro: cria ou atualiza uma despesa
 * de categoria "Hospedagem" quando há reserva_valor; cancela a despesa quando o valor é removido.
 */
export async function syncDespesaReservaHotel(
  demandaId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: demanda, error: demandaError } = await supabase
    .from("demandas")
    .select("id, titulo, escala_id, reserva_valor, reserva_hotel_nome, reserva_checkin, reserva_checkout")
    .eq("id", demandaId)
    .single()

  if (demandaError || !demanda) {
    return { success: true }
  }

  const valor = demanda.reserva_valor != null ? Number(demanda.reserva_valor) : null
  const hasValor = typeof valor === "number" && valor > 0

  const categoriaId = await getCategoriaHospedagemId()
  if (!categoriaId) {
    return { success: true }
  }

  const existing = await getLancamentoReservaByDemandaId(supabase, demandaId, categoriaId)

  if (hasValor) {
    const descricao =
      [demanda.reserva_hotel_nome, demanda.titulo].filter(Boolean).join(" — ") ||
      `Reserva hotel (demanda ${demandaId.slice(0, 8)})`
    const dataVencimento =
      demanda.reserva_checkout || demanda.reserva_checkin || new Date().toISOString().slice(0, 10)

    if (existing) {
      const { error } = await supabase
        .from("financeiro_lancamentos")
        .update({
          valor,
          descricao,
          data_vencimento: dataVencimento,
          updated_at: new Date().toISOString(),
          status: "previsto",
        })
        .eq("id", existing.id)
      if (error) {
        console.error("syncDespesaReservaHotel update:", error)
        return { success: false, error: error.message }
      }
    } else {
      const { error } = await supabase.from("financeiro_lancamentos").insert({
        categoria_id: categoriaId,
        tipo: "despesa",
        valor,
        data_vencimento: dataVencimento,
        descricao,
        documento_ref: "reserva_hotel",
        escala_id: demanda.escala_id ?? null,
        demanda_id: demandaId,
        status: "previsto",
      })
      if (error) {
        console.error("syncDespesaReservaHotel insert:", error)
        return { success: false, error: error.message }
      }
    }
  } else if (existing) {
    await supabase
      .from("financeiro_lancamentos")
      .update({
        status: "cancelado",
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
  }

  revalidatePath(FINANCEIRO_PATH)
  revalidatePath("/financeiro/contas-pagar")
  revalidatePath("/financeiro/movimentacoes")
  revalidatePath("/demandas")
  revalidatePath(`/demandas/${demandaId}`)
  revalidatePath("/reservas")
  return { success: true }
}

/**
 * Sincroniza todas as demandas que têm custo de reserva de hotel (reserva_valor)
 * com o financeiro, criando as despesas que ainda não existem.
 * Chamar ao abrir o financeiro para garantir que os custos das reservas apareçam.
 */
export async function syncAllReservasToFinanceiro(): Promise<void> {
  const supabase = await createClient()
  const { data: demandas, error } = await supabase
    .from("demandas")
    .select("id")
    .not("reserva_valor", "is", null)
    .gt("reserva_valor", 0)

  if (error || !demandas?.length) return
  for (const d of demandas) {
    await syncDespesaReservaHotel(d.id)
  }
}
