"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ArrowDownToLine, ArrowUpFromLine, Move, Percent } from "lucide-react"
import { cn } from "@/lib/utils"

const items = [
  { href: "/financeiro", label: "Visão geral", icon: LayoutDashboard },
  { href: "/financeiro/contas-receber", label: "Contas a receber", icon: ArrowDownToLine },
  { href: "/financeiro/contas-pagar", label: "Contas a pagar", icon: ArrowUpFromLine },
  { href: "/financeiro/movimentacoes", label: "Movimentações", icon: Move },
  { href: "/financeiro/comissoes", label: "Comissões", icon: Percent },
]

export function FinanceiroNav() {
  const pathname = usePathname()
  return (
    <nav className="flex flex-wrap gap-1 border-b pb-4 mb-6">
      {items.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/financeiro" && pathname.startsWith(item.href))
        const Icon = item.icon
        return (
          <Link key={item.href} href={item.href}>
            <span
              className={cn(
                "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
