"use client"

import { Button } from "@/components/ui/button"
import type { ReactNode } from "react"

interface SyncEmailsButtonProps {
  children: ReactNode
  icon?: ReactNode
  loading?: boolean
  onClick?: () => void
}

export function SyncEmailsButton({ children, icon, loading = false, onClick }: SyncEmailsButtonProps) {
  return (
    <Button type="button" className="gap-2" disabled={loading} aria-busy={loading} onClick={onClick}>
      {icon}
      {loading ? "Sincronizando..." : children}
    </Button>
  )
}
