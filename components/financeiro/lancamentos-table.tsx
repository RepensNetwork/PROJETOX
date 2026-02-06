"use client"

import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash2, ExternalLink } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { FinanceiroLancamento } from "@/lib/types/database"
import { formatMoney, formatDate } from "@/components/financeiro/formatters"
import { statusLabel } from "@/components/financeiro/status-labels"

interface LancamentosTableProps {
  lancamentos: FinanceiroLancamento[]
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onLiquidar?: (id: string) => void
  showEscala?: boolean
}

export function LancamentosTable({
  lancamentos,
  onEdit,
  onDelete,
  onLiquidar,
  showEscala = true,
}: LancamentosTableProps) {
  if (lancamentos.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        Nenhum lançamento encontrado.
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vencimento</TableHead>
            <TableHead>Descrição</TableHead>
            {showEscala && <TableHead>Escala / Navio</TableHead>}
            <TableHead>Categoria</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {lancamentos.map((l) => {
            const escala = l.escala as { navio?: { nome?: string }; porto?: string } | undefined
            const navioNome = escala?.navio?.nome ?? ""
            const porto = escala?.porto ?? ""
            return (
              <TableRow key={l.id}>
                <TableCell className="whitespace-nowrap">{formatDate(l.data_vencimento)}</TableCell>
                <TableCell>
                  <div className="font-medium">{l.descricao || "—"}</div>
                  {l.documento_ref && (
                    <div className="text-xs text-muted-foreground">{l.documento_ref}</div>
                  )}
                </TableCell>
                {showEscala && (
                  <TableCell>
                    {l.escala_id ? (
                      <Link
                        href={`/escalas/${l.escala_id}`}
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        {navioNome} • {porto}
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                )}
                <TableCell>
                  {l.categoria ? (
                    <span
                      className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle"
                      style={{ backgroundColor: (l.categoria as { cor?: string }).cor ?? "#6366f1" }}
                    />
                  ) : null}
                  {(l.categoria as { nome?: string })?.nome ?? "—"}
                </TableCell>
                <TableCell className="text-right font-mono">
                  <span className={l.tipo === "receita" ? "text-emerald-600" : "text-rose-600"}>
                    {l.tipo === "receita" ? "+" : "-"} {formatMoney(l.valor)}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={statusLabel(l.status).variant as "default" | "secondary" | "outline" | "success" | "destructive"}>
                    {statusLabel(l.status).label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Ações</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(l.id)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                      )}
                      {onLiquidar && l.status !== "liquidado" && l.status !== "cancelado" && (
                        <DropdownMenuItem onClick={() => onLiquidar(l.id)}>
                          Marcar como liquidado
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => onDelete(l.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
