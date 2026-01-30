import { Header } from "@/components/layout/header"
import { getAuditLogs } from "@/app/actions/logs"

export default async function LogsPage() {
  const logs = await getAuditLogs()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Logs de auditoria</h1>
          <p className="text-muted-foreground">Registros de alterações com valores antigos e novos</p>
        </div>

        <div className="rounded-lg border bg-card">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">Nenhum log encontrado.</div>
          ) : (
            <div className="divide-y">
              {logs.map((log) => (
                <div key={log.id} className="p-4 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-medium">{log.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {log.entity} • {log.entity_id}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {log.actor_email || "Usuário desconhecido"} •{" "}
                        {new Date(log.created_at).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2 text-xs">
                    <div className="rounded-md border bg-muted/30 p-2">
                      <p className="font-medium mb-1">Antes</p>
                      <pre className="whitespace-pre-wrap text-muted-foreground">
                        {log.old_values ? JSON.stringify(log.old_values, null, 2) : "—"}
                      </pre>
                    </div>
                    <div className="rounded-md border bg-muted/30 p-2">
                      <p className="font-medium mb-1">Depois</p>
                      <pre className="whitespace-pre-wrap text-muted-foreground">
                        {log.new_values ? JSON.stringify(log.new_values, null, 2) : "—"}
                      </pre>
                    </div>
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
