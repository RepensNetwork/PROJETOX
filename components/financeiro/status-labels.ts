import type { LancamentoStatus, ComissaoStatus } from "@/lib/types/database"

const lancamentoMap: Record<LancamentoStatus, { label: string; variant: string }> = {
  rascunho: { label: "Rascunho", variant: "secondary" },
  previsto: { label: "Previsto", variant: "outline" },
  confirmado: { label: "Confirmado", variant: "primary" },
  liquidado: { label: "Liquidado", variant: "success" },
  cancelado: { label: "Cancelado", variant: "destructive" },
}

const comissaoMap: Record<ComissaoStatus, { label: string; variant: string }> = {
  pendente: { label: "Pendente", variant: "outline" },
  calculada: { label: "Calculada", variant: "primary" },
  faturada: { label: "Faturada", variant: "secondary" },
  paga: { label: "Paga", variant: "success" },
  cancelada: { label: "Cancelada", variant: "destructive" },
}

export function statusLabel(status: LancamentoStatus | ComissaoStatus): { label: string; variant: string } {
  if (status in lancamentoMap) return lancamentoMap[status as LancamentoStatus]
  if (status in comissaoMap) return comissaoMap[status as ComissaoStatus]
  return { label: String(status), variant: "default" }
}
