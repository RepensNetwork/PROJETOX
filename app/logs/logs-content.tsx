import { getAuditLogs } from "@/app/actions/logs"
import type { AuditLog } from "@/lib/types/database"

const ENTITY_LABELS: Record<string, string> = {
  demandas: "Demanda",
  financeiro_lancamentos: "Financeiro — Lançamento",
  financeiro_comissoes: "Financeiro — Comissão",
  financeiro_categorias: "Financeiro — Categoria",
  membros: "Cadastro — Usuário",
  navios: "Cadastro — Navio",
  escalas: "Cadastro — Escala",
}

const ACTION_LABELS: Record<string, string> = {
  create: "Inclusão",
  update: "Alteração",
  delete: "Exclusão",
  update_leg: "Alteração de trecho (transporte)",
  confirm_leg: "Transporte concluído",
  undo_leg: "Transporte reativado",
}

function getEntityLabel(entity: string): string {
  return ENTITY_LABELS[entity] ?? entity
}

function getActionLabel(action: string): string {
  return ACTION_LABELS[action] ?? action
}

function shortId(id: string): string {
  if (id.length <= 12) return id
  return `${id.slice(0, 8)}…`
}

export async function LogsContent() {
  const logs = await getAuditLogs()

  return (
    <div className="rounded-xl border bg-card">
      {logs.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">Nenhum log encontrado.</div>
      ) : (
        <div className="divide-y">
          {logs.map((log: AuditLog) => (
            <div key={log.id} className="p-4 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="font-medium">
                    {getActionLabel(log.action)} — {getEntityLabel(log.entity)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ID: {shortId(log.entity_id)}
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
                  <pre className="whitespace-pre-wrap break-all text-muted-foreground">
                    {log.old_values ? JSON.stringify(log.old_values, null, 2) : "—"}
                  </pre>
                </div>
                <div className="rounded-md border bg-muted/30 p-2">
                  <p className="font-medium mb-1">Depois</p>
                  <pre className="whitespace-pre-wrap break-all text-muted-foreground">
                    {log.new_values ? JSON.stringify(log.new_values, null, 2) : "—"}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
