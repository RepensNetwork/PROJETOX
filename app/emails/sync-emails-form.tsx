"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SyncEmailsButton } from "@/app/emails/sync-emails-button"
import type { ReactNode } from "react"

interface SyncEmailsFormProps {
  icon?: ReactNode
}

type SyncEmailsState = {
  status: "idle" | "loading" | "success" | "error"
  imported?: number
  message?: string
}

export function SyncEmailsForm({ icon }: SyncEmailsFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [state, setState] = useState<SyncEmailsState>({ status: "idle" })

  const handleSync = async () => {
    if (loading) return
    setLoading(true)
    setState({ status: "loading", message: "Sincronizando..." })

    try {
      const response = await fetch("/api/emails/sync", { method: "POST" })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        setState({
          status: "error",
          imported: data.imported ?? 0,
          message: data.error || "Falha ao sincronizar emails.",
        })
        return
      }

      if ((data.imported ?? 0) === 0) {
        setState({
          status: "success",
          imported: 0,
          message: "Nenhum email novo encontrado.",
        })
      } else {
        setState({
          status: "success",
          imported: data.imported,
          message: `Importados ${data.imported} email(s).`,
        })
      }

      router.refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha de conexão ao sincronizar."
      setState({ status: "error", message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <SyncEmailsButton icon={icon} loading={loading} onClick={handleSync}>
        Sincronizar emails
      </SyncEmailsButton>
      {state.status !== "idle" && state.message && (
        <p
          className={
            state.status === "error"
              ? "text-xs text-destructive"
              : "text-xs text-muted-foreground"
          }
          role={state.status === "error" ? "alert" : "status"}
        >
          {state.message}
        </p>
      )}
    </div>
  )
}
