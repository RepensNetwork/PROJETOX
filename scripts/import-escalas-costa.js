const fs = require("fs")
const path = require("path")
const { createClient } = require("@supabase/supabase-js")

const WORKSPACE_ROOT = path.resolve(__dirname, "..")
const DEFAULT_CSV_PATH = "C:\\Users\\mateu\\Downloads\\TEMPORADA COSTA CRUZEIROS 25-26.csv"

const loadEnvLocal = () => {
  const envPath = path.join(WORKSPACE_ROOT, ".env.local")
  if (!fs.existsSync(envPath)) return
  const raw = fs.readFileSync(envPath, "utf8")
  raw.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) return
    const eqIndex = trimmed.indexOf("=")
    if (eqIndex === -1) return
    const key = trimmed.slice(0, eqIndex).trim()
    let value = trimmed.slice(eqIndex + 1).trim()
    value = value.replace(/^"|"$/g, "")
    value = value.replace(/^'|'$/g, "")
    if (!process.env[key]) {
      process.env[key] = value
    }
  })
}

const normalizeHeader = (value) => value.trim().toLowerCase()

const parseDateTime = (dateRaw, timeRaw) => {
  const dateMatch = String(dateRaw || "").match(/(\d{2})\/(\d{2})\/(\d{4})/)
  if (!dateMatch) return null
  const [, dd, mm, yyyy] = dateMatch
  const timeMatch = String(timeRaw || "").match(/(\d{1,2}):(\d{2})/)
  const hour = timeMatch ? Number(timeMatch[1]) : 0
  const minute = timeMatch ? Number(timeMatch[2]) : 0
  const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd), hour, minute, 0)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

const parseCsv = (text) => {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0)
  if (lines.length === 0) return []
  const dataLines = lines.filter((line) => line.replace(/;/g, "").trim().length > 0)
  const headerLine = dataLines[0] || ""
  const headers = headerLine.split(";").map(normalizeHeader)
  return dataLines.slice(1).map((line) => {
    const values = line.split(";")
    const row = {}
    headers.forEach((header, index) => {
      row[header] = (values[index] || "").trim()
    })
    return row
  })
}

const buildObservacoes = (row) => {
  const parts = []
  if (row.voy) parts.push(`Voy: ${row.voy}`)
  if (row.procedencia) parts.push(`Procedência: ${row.procedencia}`)
  if (row.destino) parts.push(`Destino: ${row.destino}`)
  if (row["operação"] || row.operacao) parts.push(`Operação: ${row["operação"] || row.operacao}`)
  if (row.viagem) parts.push(`Viagem: ${row.viagem}`)
  return parts.join("\n")
}

const resolveCompanhia = (navioNome) => {
  const upper = String(navioNome || "").toUpperCase()
  if (upper.startsWith("COSTA")) return "Costa Cruzeiros"
  if (upper.startsWith("AIDA")) return "AIDA Cruises"
  return "Não informado"
}

const main = async () => {
  loadEnvLocal()
  const csvPath = process.argv[2] || DEFAULT_CSV_PATH
  const shouldCreateNavios = process.argv.includes("--create-missing-navios")
  if (!fs.existsSync(csvPath)) {
    console.error(`Arquivo não encontrado: ${csvPath}`)
    process.exit(1)
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) {
    console.error("Credenciais do Supabase não encontradas em .env.local.")
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data: navios, error: naviosError } = await supabase.from("navios").select("id, nome")
  if (naviosError) {
    console.error("Erro ao buscar navios:", naviosError.message)
    process.exit(1)
  }
  const navioMap = new Map((navios || []).map((navio) => [navio.nome.toLowerCase(), navio.id]))

  const content = fs.readFileSync(csvPath, "utf8")
  const rows = parseCsv(content)

  const buildPayload = (map) => {
    const missing = new Set()
    const data = rows
      .map((row) => {
        const navioNome = row.navio || ""
        const navioId = map.get(String(navioNome).toLowerCase())
        if (!navioId) {
          if (navioNome) missing.add(navioNome)
          return null
        }

        const dataChegada = parseDateTime(row["data de chegada"], row.chegada)
        const dataSaida = parseDateTime(row["data de chegada"], row.saida)
        if (!dataChegada) return null

        return {
          navio_id: navioId,
          porto: row.porto || "",
          data_chegada: dataChegada,
          data_saida: dataSaida,
          status: "planejada",
          observacoes: buildObservacoes(row) || null,
        }
      })
      .filter(Boolean)
    return { data, missing }
  }

  let { data: payload, missing: missingNavios } = buildPayload(navioMap)

  if (missingNavios.size > 0) {
    const missingList = Array.from(missingNavios)
    console.warn("Navios não encontrados:", missingList)
    if (shouldCreateNavios) {
      const newNavios = missingList.map((nome) => ({
        nome,
        companhia: resolveCompanhia(nome),
      }))
      const { data: created, error: createError } = await supabase.from("navios").insert(newNavios).select("id, nome")
      if (createError) {
        console.error("Erro ao criar navios:", createError.message)
        process.exit(1)
      }
      created?.forEach((navio) => {
        navioMap.set(navio.nome.toLowerCase(), navio.id)
      })
      const rebuilt = buildPayload(navioMap)
      payload = rebuilt.data
      missingNavios = rebuilt.missing
    }
  }

  let imported = 0
  const batchSize = 200
  for (let i = 0; i < payload.length; i += batchSize) {
    const batch = payload.slice(i, i + batchSize)
    const { error } = await supabase.from("escalas").insert(batch)
    if (error) {
      console.error("Erro ao inserir lote:", error.message)
      process.exit(1)
    }
    imported += batch.length
    console.log(`Importados: ${imported}/${payload.length}`)
  }

  console.log(`Importação concluída. Total: ${imported}`)
}

main().catch((error) => {
  console.error("Falha na importação:", error)
  process.exit(1)
})
