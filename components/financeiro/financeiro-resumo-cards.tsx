"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Wallet, ArrowDownToLine, ArrowUpFromLine, CircleDollarSign } from "lucide-react"
import type { FinanceiroResumo } from "@/lib/types/database"
import { cn } from "@/lib/utils"

function formatMoney(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

interface FinanceiroResumoCardsProps {
  resumo: FinanceiroResumo
  className?: string
}

export function FinanceiroResumoCards({ resumo, className }: FinanceiroResumoCardsProps) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6", className)}>
      <Card className="border-emerald-500/30 bg-emerald-500/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Receitas (período)</CardTitle>
          <TrendingUp className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatMoney(resumo.totalReceitas)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Liquidado: {formatMoney(resumo.receitasLidadas)}
          </p>
        </CardContent>
      </Card>

      <Card className="border-rose-500/30 bg-rose-500/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Despesas (período)</CardTitle>
          <TrendingDown className="h-4 w-4 text-rose-500" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold text-rose-600 dark:text-rose-400">
            {formatMoney(resumo.totalDespesas)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Pago: {formatMoney(resumo.despesasLidadas)}
          </p>
        </CardContent>
      </Card>

      <Card className={cn(
        "border-primary/40",
        resumo.saldoPeriodo >= 0 ? "bg-primary/5" : "bg-destructive/5"
      )}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Saldo do período</CardTitle>
          <Wallet className={cn(
            "h-4 w-4",
            resumo.saldoPeriodo >= 0 ? "text-primary" : "text-destructive"
          )} />
        </CardHeader>
        <CardContent>
          <div className={cn(
            "text-xl font-bold",
            resumo.saldoPeriodo >= 0 ? "text-primary" : "text-destructive"
          )}>
            {formatMoney(resumo.saldoPeriodo)}
          </div>
        </CardContent>
      </Card>

      <Link href="/financeiro/contas-receber">
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors border-emerald-500/20 h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">A receber</CardTitle>
            <ArrowDownToLine className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatMoney(resumo.aReceber)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Ver contas a receber →</p>
          </CardContent>
        </Card>
      </Link>

      <Link href="/financeiro/contas-pagar">
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors border-rose-500/20 h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">A pagar</CardTitle>
            <ArrowUpFromLine className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-rose-600 dark:text-rose-400">
              {formatMoney(resumo.aPagar)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Ver contas a pagar →</p>
          </CardContent>
        </Card>
      </Link>

      <Link href="/financeiro/comissoes">
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Comissões</CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">Por escala</div>
            <p className="text-xs text-muted-foreground mt-1">Agenciamento →</p>
          </CardContent>
        </Card>
      </Link>
    </div>
  )
}
