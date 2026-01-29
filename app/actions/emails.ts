"use server"

import { createClient } from "@/lib/supabase/server"
import type { EmailRegistro, Navio } from "@/lib/types/database"
import { revalidatePath } from "next/cache"
import { ImapFlow } from "imapflow"
import { simpleParser } from "mailparser"
import { htmlToText } from "html-to-text"

interface EmailFilters {
  navioId?: string | null
  topic?: string | null
  status?: string | null
  query?: string | null
  dateFrom?: string | null
  dateTo?: string | null
}

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()

const cleanEmailText = (value: string) => {
  const separators = [
    /-----original message-----/i,
    /^from:\s/mi,
    /^de:\s/mi,
    /^sent:\s/mi,
    /^enviado em:\s/mi,
    /^on .+ wrote:/mi,
    /^em .+ escreveu:/mi,
  ]

  let text = value.trim()
  for (const separator of separators) {
    const match = text.search(separator)
    if (match !== -1) {
      text = text.slice(0, match).trim()
    }
  }

  const signatureMarkers = [/^atenciosamente/i, /^best regards/i, /^regards/i]
  for (const marker of signatureMarkers) {
    const match = text.search(marker)
    if (match !== -1) {
      text = text.slice(0, match).trim()
    }
  }

  return text
}

const detectTopic = (value: string) => {
  const text = normalizeText(value)
  const topics: Array<{ topic: string; keywords: string[] }> = [
    { topic: "Medical Visit", keywords: ["medical", "medico", "dentist", "clinica", "clinic", "visita medica"] },
    { topic: "Embark/Disembark", keywords: ["embark", "desembarque", "embarkation", "sign on", "sign off"] },
    { topic: "Supplies/Provision", keywords: ["supplies", "provision", "delivery", "quote", "quotation", "orcamento"] },
    { topic: "Authorities", keywords: ["federal police", "receita", "authority", "immigration", "anvisa"] },
  ]

  for (const item of topics) {
    if (item.keywords.some((keyword) => text.includes(keyword))) {
      return item.topic
    }
  }

  return null
}

const extractDueAt = (value: string) => {
  const text = normalizeText(value)
  const now = new Date()

  if (text.includes("hoje") || text.includes("today")) {
    return now
  }

  if (text.includes("amanha") || text.includes("tomorrow")) {
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow
  }

  const dateMatch = text.match(/\b(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?\b/)
  if (dateMatch) {
    const day = Number(dateMatch[1])
    const month = Number(dateMatch[2]) - 1
    const year = dateMatch[3] ? Number(dateMatch[3]) : now.getFullYear()
    const date = new Date(year, month, day)

    const timeMatch = text.match(/\b(\d{1,2})[h:](\d{2})\b/)
    if (timeMatch) {
      date.setHours(Number(timeMatch[1]), Number(timeMatch[2]), 0, 0)
    }

    if (!Number.isNaN(date.getTime())) {
      return date
    }
  }

  return null
}

const detectNavio = (navios: Navio[], content: string) => {
  const text = normalizeText(content)
  for (const navio of navios) {
    const normalized = normalizeText(navio.nome)
    if (normalized && text.includes(normalized)) {
      return { navioId: navio.id, ship: navio.nome }
    }
  }
  return { navioId: null, ship: null }
}

const inferPrioridade = (content: string) => {
  const text = normalizeText(content)
  if (text.includes("urgente") || text.includes("urgent") || text.includes("asap") || text.includes("imediato")) {
    return "urgente"
  }
  if (text.includes("alta") || text.includes("high")) return "alta"
  if (text.includes("baixa") || text.includes("low")) return "baixa"
  return "media"
}

const isAuthFailedError = (error: unknown) => {
  if (!error || typeof error !== "object") return false
  const anyError = error as {
    authenticationFailed?: boolean
    responseText?: string
    serverResponseCode?: string
  }
  if (anyError.authenticationFailed) return true
  if (anyError.serverResponseCode === "AUTHENTICATIONFAILED") return true
  if (anyError.responseText?.toLowerCase().includes("authentication failed")) return true
  return false
}

const createImapClient = (params: {
  host: string
  port: number
  secure: boolean
  user: string
  password: string
  authMethod?: "LOGIN"
}) => {
  return new ImapFlow({
    host: params.host,
    port: params.port,
    secure: params.secure,
    auth: { user: params.user, pass: params.password },
    authMethod: params.authMethod,
  })
}

const connectImapWithFallbacks = async (params: {
  host: string
  port: number
  secure: boolean
  user: string
  password: string
}) => {
  const userCandidates = [params.user]
  if (params.user.includes("@")) {
    userCandidates.push(params.user.split("@")[0])
  }

  const attempts: Array<{ user: string; authMethod?: "LOGIN" }> = []
  for (const user of userCandidates) {
    attempts.push({ user })
    attempts.push({ user, authMethod: "LOGIN" })
  }

  let lastError: unknown = null
  for (const attempt of attempts) {
    const client = createImapClient({
      host: params.host,
      port: params.port,
      secure: params.secure,
      user: attempt.user,
      password: params.password,
      authMethod: attempt.authMethod,
    })
    try {
      await client.connect()
      return client
    } catch (error) {
      lastError = error
      await client.logout().catch(() => null)
      if (!isAuthFailedError(error)) {
        throw error
      }
    }
  }

  throw lastError
}

type ImapAccount = {
  host: string
  port: number
  secure: boolean
  mailbox: string
  fetchLimit: number
  user: string
  password: string
  tag: string
}

const parseMaskedPassword = (value?: string | null) => {
  if (!value) return null
  const trimmed = value.trim()
  if (trimmed.startsWith("***") && trimmed.endsWith("***") && trimmed.length > 6) {
    return trimmed.slice(3, -3)
  }
  return trimmed
}

const parseCommaList = (value?: string | null) => {
  if (!value) return []
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}

const parseBoolean = (value: unknown, fallback: boolean) => {
  if (typeof value === "boolean") return value
  if (typeof value === "string") {
    if (value.toLowerCase() === "false") return false
    if (value.toLowerCase() === "true") return true
  }
  return fallback
}

const parseNumber = (value: unknown, fallback: number) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const resolveImapAccounts = (): ImapAccount[] => {
  const defaultHost = process.env.IMAP_HOST || ""
  const defaultPort = Number(process.env.IMAP_PORT || "993")
  const defaultSecure = process.env.IMAP_SECURE !== "false"
  const defaultMailbox = process.env.IMAP_MAILBOX || "INBOX"
  const defaultFetchLimit = Number(process.env.IMAP_FETCH_COUNT || "30")

  const buildAccount = (raw: any): ImapAccount | null => {
    const user = String(raw?.user || "").trim()
    const password = parseMaskedPassword(raw?.password)
    const host = String(raw?.host || defaultHost || "").trim()
    if (!host || !user || !password) return null
    const port = parseNumber(raw?.port, defaultPort)
    const secure = parseBoolean(raw?.secure, defaultSecure)
    const mailbox = String(raw?.mailbox || defaultMailbox || "INBOX").trim()
    const fetchLimit = parseNumber(raw?.fetchLimit, defaultFetchLimit)
    const tag = String(raw?.tag || user).trim() || user
    return { host, port, secure, mailbox, fetchLimit, user, password, tag }
  }

  const jsonConfig = process.env.IMAP_ACCOUNTS
  if (jsonConfig) {
    try {
      const parsed = JSON.parse(jsonConfig)
      if (Array.isArray(parsed)) {
        return parsed.map(buildAccount).filter(Boolean) as ImapAccount[]
      }
    } catch (error) {
      console.error("IMAP_ACCOUNTS inválido (JSON).", error)
    }
  }

  const users = parseCommaList(process.env.IMAP_USERS)
  const passwords = parseCommaList(process.env.IMAP_PASSWORDS)
  const tags = parseCommaList(process.env.IMAP_TAGS)
  if (users.length > 0 && passwords.length > 0) {
    return users
      .map((user, index) =>
        buildAccount({
          user,
          password: passwords[index] || "",
          tag: tags[index] || user,
        })
      )
      .filter(Boolean) as ImapAccount[]
  }

  const singleUser = process.env.IMAP_USER
  const singlePassword = parseMaskedPassword(process.env.IMAP_PASSWORD)
  if (singleUser && singlePassword && defaultHost) {
    const account = buildAccount({ user: singleUser, password: singlePassword })
    return account ? [account] : []
  }

  return []
}

export async function getEmails(filters: EmailFilters = {}): Promise<(EmailRegistro & { navio?: Navio })[]> {
  const supabase = await createClient()

  let query = supabase
    .from("emails")
    .select("*, navio:navios(*)")
    .order("received_at", { ascending: false })
    .limit(200)

  if (filters.navioId) {
    query = query.eq("navio_id", filters.navioId)
  }

  if (filters.topic) {
    query = query.eq("topic", filters.topic)
  }

  if (filters.status) {
    query = query.eq("status", filters.status)
  }

  if (filters.query) {
    query = query.or(
      `subject.ilike.%${filters.query}%,from_name.ilike.%${filters.query}%,from_email.ilike.%${filters.query}%`
    )
  }

  if (filters.dateFrom) {
    query = query.gte("received_at", filters.dateFrom)
  }

  if (filters.dateTo) {
    query = query.lte("received_at", filters.dateTo)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching emails:", error)
    return []
  }

  return data || []
}

export async function syncEmailsImap(): Promise<{
  success: boolean
  imported: number
  fetched?: number
  failed?: number
  error?: string
  message?: string
}> {
  const graphTenantId = process.env.GRAPH_TENANT_ID
  const graphClientId = process.env.GRAPH_CLIENT_ID
  const graphClientSecret = process.env.GRAPH_CLIENT_SECRET
  const graphUser = process.env.GRAPH_USER
  const graphFetchCount = Number(process.env.GRAPH_FETCH_COUNT || "30")

  const graphConfigured = Boolean(graphTenantId && graphClientId && graphClientSecret && graphUser)

  const imapAccounts = resolveImapAccounts()
  const imapConfigured = imapAccounts.length > 0

  if (imapConfigured) {
    let imported = 0
    let fetched = 0
    let failed = 0
    const errors: string[] = []

    for (const account of imapAccounts) {
      const result = await syncEmailsImapInternal({
        host: account.host,
        user: account.user,
        password: account.password,
        port: account.port,
        secure: account.secure,
        mailbox: account.mailbox,
        fetchLimit: account.fetchLimit,
        accountTag: account.tag,
      })
      imported += result.imported
      fetched += result.fetched ?? 0
      failed += result.failed ?? 0
      if (!result.success && result.error) {
        errors.push(`[${account.tag}] ${result.error}`)
      }
    }

    if (errors.length > 0 && imported === 0) {
      return { success: false, imported, fetched, failed, error: errors.join(" | ") }
    }

    const message = errors.length > 0 ? `Algumas contas falharam: ${errors.join(" | ")}` : undefined
    return { success: true, imported, fetched, failed, message }
  }

  if (graphConfigured) {
    return await syncEmailsGraph({
      tenantId: graphTenantId,
      clientId: graphClientId,
      clientSecret: graphClientSecret,
      user: graphUser,
      fetchCount: graphFetchCount,
    })
  }

  if (!imapConfigured) {
    if (graphConfigured) {
      return {
        success: false,
        imported: 0,
        error: "Falha no Graph e IMAP não configurado no .env.local",
      }
    }
    return { success: false, imported: 0, error: "Graph/IMAP não configurado no .env.local" }
  }

  return { success: false, imported: 0, error: "IMAP/Graph não configurado no .env.local" }
}

async function syncEmailsImapInternal({
  host,
  user,
  password,
  port,
  secure,
  mailbox,
  fetchLimit,
  accountTag,
}: {
  host: string
  user: string
  password: string
  port: number
  secure: boolean
  mailbox: string
  fetchLimit: number
  accountTag: string
}): Promise<{
  success: boolean
  imported: number
  fetched?: number
  failed?: number
  error?: string
  message?: string
}> {
  const supabase = await createClient()
  const { data: navios } = await supabase.from("navios").select("id, nome")
  const navioList = navios || []

  let imported = 0
  let failed = 0
  let fetched = 0
  let firstErrorMessage: string | null = null
  let client: ImapFlow | null = null

  try {
    client = await connectImapWithFallbacks({ host, port, secure, user, password })
    const lock = await client.getMailboxLock(mailbox)
    try {
      const all = await client.search({ all: true })
      const uids = all.slice(-fetchLimit)
      fetched = uids.length

      for await (const message of client.fetch(uids, { uid: true, source: true })) {
        if (!message.source) continue
        const parsed = await simpleParser(message.source)
        const rawHtml = parsed.html ? String(parsed.html) : null
        const text = parsed.text ? String(parsed.text) : rawHtml ? htmlToText(rawHtml) : ""
        const cleanText = cleanEmailText(text)
        const subject = parsed.subject || ""
        const from = parsed.from?.value?.[0]
        const receivedAt = parsed.date ? parsed.date.toISOString() : new Date().toISOString()
        const searchContent = `${subject}\n${cleanText}`
        const { navioId, ship } = detectNavio(navioList, searchContent)
        const topic = detectTopic(searchContent)
        const dueAt = extractDueAt(searchContent)
        const prioridade = inferPrioridade(searchContent)

        const attachments = parsed.attachments?.map((item) => ({
          filename: item.filename || null,
          contentType: item.contentType || null,
          size: item.size || null,
        }))

        const { error } = await supabase.from("emails").upsert({
          provider: "imap",
          provider_id: String(message.uid),
          thread_id: parsed.messageId || null,
          from_name: from?.name || null,
          from_email: from?.address || null,
          subject,
          received_at: receivedAt,
          body_raw_html: rawHtml,
          body_clean_text: cleanText,
          navio_id: navioId,
          ship,
          topic,
          due_at: dueAt ? dueAt.toISOString() : null,
          status: "new",
          priority: prioridade,
          account_tag: accountTag,
          attachments: attachments && attachments.length > 0 ? attachments : null,
        }, { onConflict: "provider,provider_id,account_tag" })

        if (error) {
          failed += 1
          if (!firstErrorMessage) firstErrorMessage = error.message
          console.error("Erro ao salvar email no Supabase:", error)
          continue
        }

        imported += 1

      }
    } finally {
      lock.release()
    }
  } catch (error: any) {
    console.error("Error syncing emails:", error)
    return { success: false, imported, fetched, failed, error: error.message }
  } finally {
    if (client) {
      await client.logout().catch(() => null)
    }
  }

  if (failed > 0 && imported === 0) {
    return {
      success: false,
      imported,
      fetched,
      failed,
      error: `Falha ao salvar emails no Supabase: ${firstErrorMessage || "erro desconhecido"}`,
    }
  }

  if (imported > 0) {
    revalidatePath("/emails")
  }
  const message =
    fetched === 0
      ? `Nenhum email encontrado na mailbox ${mailbox}.`
      : imported === 0
        ? "Nenhum email novo encontrado."
        : undefined

  return { success: true, imported, fetched, failed, message }
}


async function syncEmailsGraph({
  tenantId,
  clientId,
  clientSecret,
  user,
  fetchCount,
}: {
  tenantId: string
  clientId: string
  clientSecret: string
  user: string
  fetchCount: number
}): Promise<{
  success: boolean
  imported: number
  fetched?: number
  failed?: number
  error?: string
  message?: string
}> {
  const supabase = await createClient()
  const { data: navios } = await supabase.from("navios").select("id, nome")
  const navioList = navios || []

  let imported = 0
  let failed = 0
  let fetched = 0
  let firstErrorMessage: string | null = null

  try {
    const tokenResponse = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        scope: "https://graph.microsoft.com/.default",
        grant_type: "client_credentials",
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      return { success: false, imported, error: `Graph token error: ${errorText}` }
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token as string

    const messagesResponse = await fetch(
      `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(user)}/mailFolders/Inbox/messages` +
        `?$top=${fetchCount}&$orderby=receivedDateTime desc`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!messagesResponse.ok) {
      const errorText = await messagesResponse.text()
      return { success: false, imported, error: `Graph messages error: ${errorText}` }
    }

    const messagesData = await messagesResponse.json()
    const messages = messagesData.value || []
    fetched = messages.length

    for (const message of messages) {
      const subject = message.subject || ""
      const from = message.from?.emailAddress
      const receivedAt = message.receivedDateTime || new Date().toISOString()
      const rawHtml = message.body?.contentType === "html" ? message.body?.content : null
      const text = rawHtml ? htmlToText(String(rawHtml)) : String(message.body?.content || "")
      const cleanText = cleanEmailText(text)
      const searchContent = `${subject}\n${cleanText}`
      const { navioId, ship } = detectNavio(navioList, searchContent)
      const topic = detectTopic(searchContent)
      const dueAt = extractDueAt(searchContent)
      const prioridade = inferPrioridade(searchContent)

      const { error } = await supabase.from("emails").upsert({
        provider: "graph",
        provider_id: message.id,
        thread_id: message.conversationId || null,
        from_name: from?.name || null,
        from_email: from?.address || null,
        subject,
        received_at: receivedAt,
        body_raw_html: rawHtml,
        body_clean_text: cleanText,
        navio_id: navioId,
        ship,
        topic,
        due_at: dueAt ? dueAt.toISOString() : null,
        status: "new",
        priority: prioridade,
        account_tag: "graph",
        attachments: message.hasAttachments ? [{ hasAttachments: true }] : null,
      }, { onConflict: "provider,provider_id,account_tag" })

      if (error) {
        failed += 1
        if (!firstErrorMessage) firstErrorMessage = error.message
        console.error("Erro ao salvar email no Supabase:", error)
        continue
      }

      imported += 1

    }
  } catch (error: any) {
    console.error("Error syncing Graph emails:", error)
    return { success: false, imported, fetched, failed, error: error.message }
  }

  if (failed > 0 && imported === 0) {
    return {
      success: false,
      imported,
      fetched,
      failed,
      error: `Falha ao salvar emails no Supabase: ${firstErrorMessage || "erro desconhecido"}`,
    }
  }

  if (imported > 0) {
    revalidatePath("/emails")
  }
  const message =
    fetched === 0
      ? "Nenhum email encontrado na Inbox do Microsoft Graph."
      : imported === 0
        ? "Nenhum email novo encontrado."
        : undefined

  return { success: true, imported, fetched, failed, message }
}
