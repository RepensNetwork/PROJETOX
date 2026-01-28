import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { getEmails } from "@/app/actions/emails"
import { getNavios } from "@/app/actions/navios"
import { Mail, RefreshCw } from "lucide-react"
import { SyncEmailsForm } from "@/app/emails/sync-emails-form"

interface EmailsPageProps {
  searchParams?: {
    navio?: string
    topic?: string
    status?: string
    q?: string
    from?: string
    to?: string
  }
}

const statusColors: Record<string, string> = {
  new: "bg-warning/10 text-warning-foreground border-warning/30",
  triaged: "bg-primary/10 text-primary border-primary/30",
  assigned: "bg-muted text-muted-foreground border-muted/30",
  done: "bg-success/10 text-success border-success/30",
}

const statusLabels: Record<string, string> = {
  new: "Novo",
  triaged: "Triado",
  assigned: "Atribuído",
  done: "Concluído",
}

export default async function EmailsPage({ searchParams }: EmailsPageProps) {
  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  const syncConfigured = Boolean(
    (process.env.GRAPH_TENANT_ID &&
      process.env.GRAPH_CLIENT_ID &&
      process.env.GRAPH_CLIENT_SECRET &&
      process.env.GRAPH_USER) ||
      (process.env.IMAP_HOST && process.env.IMAP_USER && process.env.IMAP_PASSWORD)
  )

  const navios = await getNavios()
  const emails = await getEmails({
    navioId: searchParams?.navio || null,
    topic: searchParams?.topic || null,
    status: searchParams?.status || null,
    query: searchParams?.q || null,
    dateFrom: searchParams?.from || null,
    dateTo: searchParams?.to || null,
  })

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Inbox
            </h1>
            <p className="text-muted-foreground">
              E-mails normalizados e prontos para virar demandas
            </p>
          </div>
          <SyncEmailsForm icon={<RefreshCw className="h-4 w-4" />} />
        </div>

        <form method="get" className="rounded-lg border bg-card p-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="navio">Navio</Label>
              <select
                id="navio"
                name="navio"
                defaultValue={searchParams?.navio || ""}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Todos</option>
                {navios.map((navio) => (
                  <option key={navio.id} value={navio.id}>
                    {navio.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="topic">Tópico</Label>
              <Input id="topic" name="topic" defaultValue={searchParams?.topic || ""} placeholder="Medical Visit" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                defaultValue={searchParams?.status || ""}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Todos</option>
                <option value="new">Novo</option>
                <option value="triaged">Triado</option>
                <option value="assigned">Atribuído</option>
                <option value="done">Concluído</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="q">Busca</Label>
              <Input id="q" name="q" defaultValue={searchParams?.q || ""} placeholder="Assunto ou remetente" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="from">Recebido de</Label>
              <Input id="from" name="from" type="date" defaultValue={searchParams?.from || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="to">Recebido até</Label>
              <Input id="to" name="to" type="date" defaultValue={searchParams?.to || ""} />
            </div>
            <div className="flex items-end gap-2">
              <Button type="submit">Aplicar filtros</Button>
              <Button type="button" variant="outline" asChild>
                <a href="/emails">Limpar</a>
              </Button>
            </div>
          </div>
        </form>

        {!supabaseConfigured && (
          <div className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning-foreground">
            Supabase não configurado. Defina `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` no
            `.env.local` para carregar os emails.
          </div>
        )}
        {supabaseConfigured && !syncConfigured && (
          <div className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning-foreground">
            Sincronização não configurada. Defina as variáveis IMAP ou Microsoft Graph no `.env.local` para importar
            emails.
          </div>
        )}

        <div className="rounded-lg border bg-card">
          {emails.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Nenhum email encontrado. Verifique filtros e sincronização.
            </div>
          ) : (
            <div className="divide-y">
              {emails.map((email) => (
                <div key={email.id} className="p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">{email.subject || "Sem assunto"}</p>
                    <p className="text-sm text-muted-foreground">
                      {email.from_name || email.from_email || "Remetente desconhecido"}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {email.ship && <span>Navio: {email.ship}</span>}
                      {email.topic && <span>Tópico: {email.topic}</span>}
                      {email.received_at && <span>Recebido: {new Date(email.received_at).toLocaleString("pt-BR")}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={statusColors[email.status] || ""}>
                      {statusLabels[email.status] || email.status}
                    </Badge>
                    {email.due_at && (
                      <Badge variant="outline">
                        Prazo: {new Date(email.due_at).toLocaleString("pt-BR")}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
