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
import { MoreHorizontal, Pencil, ExternalLink } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { FinanceiroComissao } from "@/lib/types/database"
import { formatMoney, formatDate } from "@/components/financeiro/formatters"
import { statusLabel } from "@/components/financeiro/status-labels"

interface ComissoesTableProps {
  comissoes: FinanceiroComissao[]
  onEdit?: (id: string) => void
}

export function ComissoesTable({ comissoes, onEdit }: ComissoesTableProps) {
  if (comissoes.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        Nenhuma comissão cadastrada.
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Escala / Navio</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead className="text-right">Valor bruto</TableHead>
            <TableHead className="text-right">%</TableHead>
            <TableHead className="text-right">Comissão</TableHead>
            <TableHead>Previsão</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {comissoes.map((c) => {
            const escala = c.escala as { navio?: { nome?: string }; porto?: string } | undefined
            const navioNome = escala?.navio?.nome ?? ""
            const porto = escala?.porto ?? ""
            return (
              <TableRow key={c.id}>
                <TableCell>
                  {c.escala_id ? (
                    <Link
                      href={`/escalas/${c.escala_id}`}
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      {navioNome} • {porto}
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>{c.descricao || "—"}</TableCell>
                <TableCell className="text-right font-mono">{formatMoney(c.valor_bruto)}</TableCell>
                <TableCell className="text-right">{c.percentual_comissao}%</TableCell>
                <TableCell className="text-right font-mono text-emerald-600">
                  {formatMoney(c.valor_comissao)}
                </TableCell>
                <TableCell>{formatDate(c.data_previsao)}</TableCell>
                <TableCell>
                  <Badge variant={statusLabel(c.status).variant as "default" | "secondary" | "outline" | "success" | "destructive"}>
                    {statusLabel(c.status).label}
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
                        <DropdownMenuItem onClick={() => onEdit(c.id)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
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
