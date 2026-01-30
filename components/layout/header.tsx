"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Ship, Calendar, ClipboardList, Menu, Users, LogOut, User, Shield, Mail, Mic, Car, ChevronDown, FolderOpen, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState, useEffect } from "react"
import { NotificationBell } from "@/components/notifications/notification-bell"
import { ThemeToggle } from "@/components/theme-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import type { Membro } from "@/lib/types/database"

type NavItem = { key: string; name: string; href: string; icon: React.ComponentType<{ className?: string }> }

const primaryNav: NavItem[] = [
  { key: "dashboard", name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
]

const operacoesNav: NavItem[] = [
  { key: "intake", name: "Criar Demanda", href: "/intake", icon: Mic },
  { key: "inbox", name: "Inbox", href: "/emails", icon: Mail },
  { key: "transportes", name: "Transportes", href: "/motorista", icon: Car },
  { key: "escalas", name: "Escalas", href: "/escalas", icon: Calendar },
  { key: "demandas", name: "Demandas", href: "/demandas", icon: ClipboardList },
]

const sistemaNav: NavItem[] = [
  { key: "navios", name: "Navios", href: "/navios", icon: Ship },
  { key: "membros", name: "Colaboradores", href: "/membros", icon: Users },
  { key: "logs", name: "Logs", href: "/logs", icon: Shield },
]

function canAccess(membro: Membro | null, itemKey: string): boolean {
  if (!membro) return false
  if (membro.is_admin) return true
  const allowed = Array.isArray(membro.allowed_pages) ? membro.allowed_pages : []
  return allowed.includes(itemKey)
}

function filterByAccess<T extends { key: string }>(membro: Membro | null, items: T[]): T[] {
  return items.filter((item) => canAccess(membro, item.key))
}

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [membro, setMembro] = useState<Membro | null>(null)
  const [loading, setLoading] = useState(true)
  type LembreteItem = { id: string; titulo: string; prioridade: string; prazo: string | null }
  const [lembretes, setLembretes] = useState<LembreteItem[]>([])
  const [lembretesLoading, setLembretesLoading] = useState(true)

  useEffect(() => {
    loadUser()
    loadLembretePrioridade()
  }, [])

  const loadUser = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user?.email) {
        const { data: membroData, error } = await supabase
          .from("membros")
          .select("*")
          .ilike("email", user.email)
          .single()

        if (error) {
          console.error("Error loading member:", error)
        } else if (membroData) {
          setMembro(membroData)
        }
      }
    } catch (error) {
      console.error("Error loading user:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const loadLembretePrioridade = async () => {
    try {
      const supabase = createClient()
      const { data: demandas, error } = await supabase
        .from("demandas")
        .select("id, titulo, prioridade, prazo, status")
        .neq("status", "concluida")

      if (error) {
        console.error("Error loading priority demand:", error)
        setLembretes([])
        return
      }

      if (!demandas || demandas.length === 0) {
        setLembretes([])
        return
      }

      const prioridadeOrdem: Record<string, number> = {
        urgente: 0,
        alta: 1,
        media: 2,
        baixa: 3,
      }

      const ordenadas = demandas
        .slice()
        .sort((a, b) => {
          const prioridadeA = prioridadeOrdem[a.prioridade] ?? 99
          const prioridadeB = prioridadeOrdem[b.prioridade] ?? 99
          if (prioridadeA !== prioridadeB) return prioridadeA - prioridadeB
          const prazoA = a.prazo ? new Date(a.prazo).getTime() : Number.MAX_SAFE_INTEGER
          const prazoB = b.prazo ? new Date(b.prazo).getTime() : Number.MAX_SAFE_INTEGER
          return prazoA - prazoB
        })
        .slice(0, 3)
        .map((d) => ({ id: d.id, titulo: d.titulo, prioridade: d.prioridade, prazo: d.prazo }))

      setLembretes(ordenadas)
    } catch (error) {
      console.error("Error loading priority demand:", error)
      setLembretes([])
    } finally {
      setLembretesLoading(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/dashboard" className="flex items-center mr-6">
          <span className="font-semibold text-lg hidden sm:inline-block">Asa Brokers</span>
        </Link>

        {/* Desktop Navigation: 3 principais + submenus */}
        <nav className="hidden md:flex items-center gap-1">
          {/* 1. Dashboard */}
          {filterByAccess(membro, primaryNav).map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link key={item.key} href={item.href}>
                <Button variant={isActive ? "secondary" : "ghost"} size="sm" className={cn("gap-2", isActive && "bg-secondary")}>
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Button>
              </Link>
            )
          })}

          {/* 2. Operações (submenu) */}
          {filterByAccess(membro, operacoesNav).length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={operacoesNav.some((i) => pathname === i.href || (i.href !== "/dashboard" && pathname.startsWith(i.href))) ? "secondary" : "ghost"}
                  size="sm"
                  className="gap-2"
                >
                  <FolderOpen className="h-4 w-4" />
                  Operações
                  <ChevronDown className="h-4 w-4 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52">
                {filterByAccess(membro, operacoesNav).map((item) => {
                  const Icon = item.icon
                  return (
                    <DropdownMenuItem key={item.key} asChild>
                      <Link href={item.href} className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {item.name}
                      </Link>
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* 3. Sistema (submenu) */}
          {filterByAccess(membro, sistemaNav).length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={sistemaNav.some((i) => pathname === i.href || pathname.startsWith(i.href)) ? "secondary" : "ghost"}
                  size="sm"
                  className="gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Sistema
                  <ChevronDown className="h-4 w-4 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52">
                {filterByAccess(membro, sistemaNav).map((item) => {
                  const Icon = item.icon
                  return (
                    <DropdownMenuItem key={item.key} asChild>
                      <Link href={item.href} className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {item.name}
                      </Link>
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>

        {/* Tema, Notificações e Perfil */}
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          {membro && <NotificationBell membroId={membro.id} />}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={membro?.avatar_url || undefined} />
                  <AvatarFallback>
                    {membro?.nome.split(" ").map(n => n[0]).join("").slice(0, 2) || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{membro?.nome || "Usuário"}</p>
                  <p className="text-xs leading-none text-muted-foreground">{membro?.email || ""}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/perfil">
                  <User className="mr-2 h-4 w-4" />
                  <span>Meu Perfil</span>
                </Link>
              </DropdownMenuItem>
              {membro?.is_admin && (
                <DropdownMenuItem asChild>
                  <Link href="/admin/usuarios">
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Administração</span>
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Navigation */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="flex items-center mb-6">
                <span className="font-semibold text-lg">Asa Brokers</span>
              </div>
              <nav className="flex flex-col gap-4">
                {/* Dashboard */}
                {filterByAccess(membro, primaryNav).map((item) => {
                  const isActive = pathname === item.href
                  const Icon = item.icon
                  return (
                    <Link key={item.key} href={item.href} onClick={() => setOpen(false)}>
                      <Button variant={isActive ? "secondary" : "ghost"} className={cn("w-full justify-start gap-2", isActive && "bg-secondary")}>
                        <Icon className="h-4 w-4" />
                        {item.name}
                      </Button>
                    </Link>
                  )
                })}
                {/* Operações */}
                {filterByAccess(membro, operacoesNav).length > 0 && (
                  <div className="space-y-1">
                    <p className="px-2 text-xs font-medium text-muted-foreground">Operações</p>
                    {filterByAccess(membro, operacoesNav).map((item) => {
                      const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
                      const Icon = item.icon
                      return (
                        <Link key={item.key} href={item.href} onClick={() => setOpen(false)}>
                          <Button variant={isActive ? "secondary" : "ghost"} size="sm" className={cn("w-full justify-start gap-2 pl-4", isActive && "bg-secondary")}>
                            <Icon className="h-4 w-4" />
                            {item.name}
                          </Button>
                        </Link>
                      )
                    })}
                  </div>
                )}
                {/* Sistema */}
                {filterByAccess(membro, sistemaNav).length > 0 && (
                  <div className="space-y-1">
                    <p className="px-2 text-xs font-medium text-muted-foreground">Sistema</p>
                    {filterByAccess(membro, sistemaNav).map((item) => {
                      const isActive = pathname === item.href || pathname.startsWith(item.href)
                      const Icon = item.icon
                      return (
                        <Link key={item.key} href={item.href} onClick={() => setOpen(false)}>
                          <Button variant={isActive ? "secondary" : "ghost"} size="sm" className={cn("w-full justify-start gap-2 pl-4", isActive && "bg-secondary")}>
                            <Icon className="h-4 w-4" />
                            {item.name}
                          </Button>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <div className="border-t border-border/60 bg-muted/50">
        <div className="container h-8 overflow-hidden flex items-center">
          <div className="animate-marquee whitespace-nowrap text-xs font-medium flex items-center gap-3">
            {lembretesLoading ? (
              <span className="text-muted-foreground">Carregando lembretes...</span>
            ) : lembretes.length === 0 ? (
              <span className="text-muted-foreground">Nenhuma demanda prioritária no momento</span>
            ) : (
              <>
                <span className="text-white font-semibold">Lembrete — </span>
                {lembretes.map((item, i) => {
                  const cores = ["text-red-500", "text-amber-400", "text-blue-400"] as const
                  const cor = cores[i % 3]
                  const prazoStr = item.prazo
                    ? new Date(item.prazo).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                    : ""
                  return (
                    <span key={item.id} className="inline-flex items-center gap-1 shrink-0">
                      {i > 0 && <span className="text-white font-semibold"> • </span>}
                      <Link
                        href={`/demandas/${item.id}`}
                        className="inline-flex items-center gap-1 hover:underline font-semibold"
                      >
                        <span className={cor}>{item.titulo}</span>
                        {prazoStr && <span className="text-white">({prazoStr})</span>}
                      </Link>
                    </span>
                  )
                })}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
