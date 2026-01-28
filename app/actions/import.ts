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
      const navioNome = row.navio || row.navio_nome || row.ship || ""
      const porto = row.porto || row.port || ""
      const dataChegada = row.data_chegada || row.chegada || row.arrival || ""
      const dataSaida = row.data_saida || row.saida || row.departure || ""
      const status = row.status || "planejada"
      const observacoes = row.observacoes || row.observations || row.obs || null

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
        chegadaDate = new Date(dataChegada)
        if (isNaN(chegadaDate.getTime())) {
          throw new Error("Data de chegada inválida")
        }
      } catch {
        errors.push(`Linha ${data.indexOf(row) + 2}: Data de chegada inválida`)
        continue
      }

      if (dataSaida) {
        try {
          saidaDate = new Date(dataSaida)
          if (isNaN(saidaDate.getTime())) {
            saidaDate = null
          }
        } catch {
          saidaDate = null
        }
      }

      const { error } = await supabase.from("escalas").insert({
        navio_id: navioId,
        porto: porto.trim(),
        data_chegada: chegadaDate.toISOString(),
        data_saida: saidaDate ? saidaDate.toISOString() : null,
        status: status.trim() as any,
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
    revalidatePath("/escalas")
    revalidatePath("/dashboard")
  }

  return {
    success: errors.length === 0,
    imported,
    errors: errors.length > 0 ? errors : undefined,
  }
}
