"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function importMembros(data: any[]): Promise<{ success: boolean; imported: number; errors?: string[] }> {
  const supabase = await createClient()
  const errors: string[] = []
  let imported = 0

  for (const row of data) {
    try {
      const nome = row.nome || row.name || ""
      const email = row.email || row.e_mail || ""
      const avatar_url = row.avatar_url || row.avatar || null

      if (!nome || !email) {
        errors.push(`Linha ${data.indexOf(row) + 2}: Nome e email são obrigatórios`)
        continue
      }

      const { error } = await supabase.from("membros").insert({
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        avatar_url: avatar_url?.trim() || null,
      })

      if (error) {
        errors.push(`Linha ${data.indexOf(row) + 2}: ${error.message}`)
      } else {
        imported++
      }
    } catch (error: any) {
      errors.push(`Linha ${data.indexOf(row) + 2}: ${error.message}`)
    }
  }

  if (imported > 0) {
    revalidatePath("/dashboard")
  }

  return {
    success: errors.length === 0,
    imported,
    errors: errors.length > 0 ? errors : undefined,
  }
}

export async function importNavios(data: any[]): Promise<{ success: boolean; imported: number; errors?: string[] }> {
  const supabase = await createClient()
  const errors: string[] = []
  let imported = 0

  for (const row of data) {
    try {
      const nome = row.nome || row.name || ""
      const companhia = row.companhia || row.company || ""
      const observacoes = row.observacoes || row.observations || row.obs || null

      if (!nome || !companhia) {
        errors.push(`Linha ${data.indexOf(row) + 2}: Nome e companhia são obrigatórios`)
        continue
      }

      const { error } = await supabase.from("navios").insert({
        nome: nome.trim(),
        companhia: companhia.trim(),
        observacoes: observacoes?.trim() || null,
      })

      if (error) {
        errors.push(`Linha ${data.indexOf(row) + 2}: ${error.message}`)
      } else {
        imported++
      }
    } catch (error: any) {
      errors.push(`Linha ${data.indexOf(row) + 2}: ${error.message}`)
    }
  }

  if (imported > 0) {
    revalidatePath("/navios")
    revalidatePath("/dashboard")
  }

  return {
    success: errors.length === 0,
    imported,
    errors: errors.length > 0 ? errors : undefined,
  }
}

export async function importEscalas(data: any[]): Promise<{ success: boolean; imported: number; errors?: string[] }> {
  const supabase = await createClient()
  const errors: string[] = []
  let imported = 0

  const parseDateTime = (dateValue: string, timeValue?: string) => {
    const dateMatch = String(dateValue || "").match(/(\d{2})\/(\d{2})\/(\d{4})/)
    if (dateMatch) {
      const [, dd, mm, yyyy] = dateMatch
      const timeMatch = String(timeValue || "").match(/(\d{1,2}):(\d{2})/)
      const hour = timeMatch ? Number(timeMatch[1]) : 0
      const minute = timeMatch ? Number(timeMatch[2]) : 0
      const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd), hour, minute, 0)
      return Number.isNaN(date.getTime()) ? null : date
    }
    const date = new Date(dateValue)
    return Number.isNaN(date.getTime()) ? null : date
  }

  // Primeiro, buscar todos os navios para mapear nome -> id
  const { data: navios } = await supabase.from("navios").select("id, nome")

  if (!navios || navios.length === 0) {
    return {
      success: false,
      imported: 0,
      errors: ["Nenhum navio cadastrado. Cadastre navios antes de importar escalas."],
    }
  }

  const navioMap = new Map(navios.map(n => [n.nome.toLowerCase(), n.id]))

  for (const row of data) {
    try {
      const navioNome = row.navio || row["navio"] || row.navio_nome || row.ship || ""
      const porto = row.porto || row["porto"] || row.port || ""
      const dataChegada =
        row.data_chegada ||
        row["data de chegada"] ||
        row.chegada ||
        row.arrival ||
        ""
      const dataSaida =
        row.data_saida ||
        row["data de saida"] ||
        row["data de saída"] ||
        row.saida ||
        row.departure ||
        ""
      const status = row.status || "planejada"
      const observacoes = row.observacoes || row.observations || row.obs || ""
      const voy = row.voy || row.voyage || ""
      const procedencia = row.procedencia || row["procedencia"] || row["procedência"] || row.origem || row.origin || ""
      const destino = row.destino || row["destino"] || row.destination || ""
      const operacao = row.operacao || row["operação"] || row["operacao"] || ""
      const viagem = row.viagem || row["viagem"] || ""
      const horaChegada = row.hora_chegada || row["hora chegada"] || row.chegada || ""
      const horaSaida = row.hora_saida || row["hora saida"] || row["hora saída"] || row.saida || ""

      if (!navioNome || !porto || !dataChegada) {
        errors.push(`Linha ${data.indexOf(row) + 2}: Navio, porto e data de chegada são obrigatórios`)
        continue
      }

      const navioId = navioMap.get(navioNome.trim().toLowerCase())
      if (!navioId) {
        errors.push(`Linha ${data.indexOf(row) + 2}: Navio "${navioNome}" não encontrado`)
        continue
      }

      let chegadaDate: Date
      let saidaDate: Date | null = null

      try {
        const parsed = parseDateTime(dataChegada, horaChegada)
        if (!parsed) throw new Error("Data de chegada inválida")
        chegadaDate = parsed
      } catch {
        errors.push(`Linha ${data.indexOf(row) + 2}: Data de chegada inválida`)
        continue
      }

      if (dataSaida || horaSaida) {
        const parsedSaida = parseDateTime(dataSaida || dataChegada, horaSaida)
        saidaDate = parsedSaida || null
      }

      const detalhes: string[] = []
      if (voy) detalhes.push(`Voy: ${String(voy).trim()}`)
      if (procedencia) detalhes.push(`Procedência: ${String(procedencia).trim()}`)
      if (destino) detalhes.push(`Destino: ${String(destino).trim()}`)
      if (operacao) detalhes.push(`Operação: ${String(operacao).trim()}`)
      if (viagem) detalhes.push(`Viagem: ${String(viagem).trim()}`)

      const observacoesFinal = [
        observacoes ? String(observacoes).trim() : "",
        detalhes.length > 0 ? detalhes.join("\n") : "",
      ]
        .filter(Boolean)
        .join("\n")

      const { error } = await supabase.from("escalas").insert({
        navio_id: navioId,
        porto: porto.trim(),
        data_chegada: chegadaDate.toISOString(),
        data_saida: saidaDate ? saidaDate.toISOString() : null,
        status: status.trim() as any,
        observacoes: observacoesFinal || null,
      })

      if (error) {
        errors.push(`Linha ${data.indexOf(row) + 2}: ${error.message}`)
      } else {
        imported++
      }
    } catch (error: any) {
      errors.push(`Linha ${data.indexOf(row) + 2}: ${error.message}`)
    }
  }

  if (imported > 0) {
    revalidatePath("/escalas")
    revalidatePath("/dashboard")
  }

  return {
    success: errors.length === 0,
    imported,
    errors: errors.length > 0 ? errors : undefined,
  }
}
