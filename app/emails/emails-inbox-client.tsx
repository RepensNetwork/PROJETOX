"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { EmailRegistro, Escala, Navio } from "@/lib/types/database"

type EmailsInboxClientProps = {
  emails: (EmailRegistro & { navio?: Navio })[]
  navios: Navio[]
  escalas: (Escala & { navio: Navio })[]
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

const categoriaOptions = [
  { value: "passageiros", label: "Passageiros" },
  { value: "saude", label: "Saúde" },
  { value: "suprimentos", label: "Suprimentos" },
  { value: "abastecimento", label: "Abastecimento" },
  { value: "autoridades", label: "Autoridades" },
  { value: "logistica", label: "Logística" },
  { value: "processos_internos", label: "Processos Internos" },
]

export function EmailsInboxClient({ emails, navios, escalas }: EmailsInboxClientProps) {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [navioId, setNavioId] = useState("")
  const [escalaId, setEscalaId] = useState("")
  const [categoria, setCategoria] = useState("processos_internos")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const escalaOptions = useMemo(() => {
    if (!navioId) return []
    return escalas
      .filter((escala) => escala.navio.id === navioId)
      .slice()
      .sort((a, b) => new Date(a.data_chegada).getTime() - new Date(b.data_chegada).getTime())
  }, [escalas, navioId])

  const toggleEmail = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const toggleAll = () => {
    const selectable = emails.filter((email) => !email.demanda_id).map((email) => email.id)
    setSelectedIds((prev) => (prev.length === selectable.length ? [] : selectable))
  }

  const handleConfirm = async () => {
    setMessage(null)
    if (!selectedIds.length) {
      setMessage("Selecione ao menos um email.")
      return
    }
    if (!navioId || !escalaId || !categoria) {
      setMessage("Selecione navio, escala e categoria.")
      return
    }
    setLoading(true)
    try {
      const response = await fetch("/api/emails/confirm-demandas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailIds: selectedIds, navioId, escalaId, categoria }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setMessage(data.error || "Falha ao criar demandas.")
        return
      }
      const created = Number(data.created || 0)
      const skipped = Number(data.skipped || 0)
      const failed = Number(data.failed || 0)
      setMessage(`Criadas: ${created}. Ignoradas: ${skipped}. Falhas: ${failed}.`)
      setSelectedIds([])
      router.refresh()
    } catch (error) {
      const text = error instanceof Error ? error.message : "Falha de conexão."
      setMessage(text)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            {selectedIds.length} selecionado(s)
          </div>
          <Button type="button" variant="outline" onClick={toggleAll}>
            {selectedIds.length ? "Limpar seleção" : "Selecionar todos"}
          </Button>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Navio</label>
            <select
              value={navioId}
              onChange={(event) => {
                setNavioId(event.target.value)
                setEscalaId("")
              }}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Selecione</option>
              {navios.map((navio) => (
                <option key={navio.id} value={navio.id}>
                  {navio.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Escala</label>
            <select
              value={escalaId}
              onChange={(event) => setEscalaId(event.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              disabled={!navioId}
            >
              <option value="">{navioId ? "Selecione" : "Escolha um navio"}</option>
              {escalaOptions.map((escala) => (
                <option key={escala.id} value={escala.id}>
                  {escala.porto} • {new Date(escala.data_chegada).toLocaleDateString("pt-BR")}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Categoria</label>
            <select
              value={categoria}
              onChange={(event) => setCategoria(event.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {categoriaOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button type="button" onClick={handleConfirm} disabled={loading}>
              {loading ? "Criando..." : "Criar demandas"}
            </Button>
          </div>
        </div>
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
      </div>

      <div className="rounded-lg border bg-card">
        {emails.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Nenhum email encontrado. Verifique filtros e sincronização.
          </div>
        ) : (
          <div className="divide-y">
            {emails.map((email) => (
              <div key={email.id} className="p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4"
                    checked={selectedIds.includes(email.id)}
                    onChange={() => toggleEmail(email.id)}
                    disabled={Boolean(email.demanda_id)}
                  />
                  <div className="space-y-1">
                    <p className="font-medium">{email.subject || "Sem assunto"}</p>
                    <p className="text-sm text-muted-foreground">
                      {email.from_name || email.from_email || "Remetente desconhecido"}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {email.account_tag && <span>Conta: {email.account_tag}</span>}
                      {email.ship && <span>Navio: {email.ship}</span>}
                      {email.topic && <span>Tópico: {email.topic}</span>}
                      {email.received_at && (
                        <span>Recebido: {new Date(email.received_at).toLocaleString("pt-BR")}</span>
                      )}
                    </div>
                    {email.demanda_id && (
                      <p className="text-xs text-muted-foreground">Já vinculada a uma demanda.</p>
                    )}
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
    </div>
  )
}
