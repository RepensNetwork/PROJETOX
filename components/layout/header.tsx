"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Ship, Calendar, ClipboardList, Menu, Users, LogOut, User, Shield, Mail, Mic, Car } from "lucide-react"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState, useEffect } from "react"
import { NotificationBell } from "@/components/notifications/notification-bell"
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

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Gravar Demanda", href: "/intake", icon: Mic },
  { name: "Inbox", href: "/emails", icon: Mail },
  { name: "Transportes", href: "/motorista", icon: Car },
  { name: "Navios", href: "/navios", icon: Ship },
  { name: "Escalas", href: "/escalas", icon: Calendar },
  { name: "Demandas", href: "/demandas", icon: ClipboardList },
  { name: "Colaboradores", href: "/membros", icon: Users },
]

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [membro, setMembro] = useState<Membro | null>(null)
  const [loading, setLoading] = useState(true)
  const [lembretePrioridade, setLembretePrioridade] = useState<string>("Carregando demanda prioritária...")

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
        setLembretePrioridade("Nenhuma demanda prioritária no momento")
        return
      }

      if (!demandas || demandas.length === 0) {
        setLembretePrioridade("Nenhuma demanda prioritária no momento")
        return
      }

      const prioridadeOrdem: Record<string, number> = {
        urgente: 0,
        alta: 1,
        media: 2,
        baixa: 3,
      }

      const demandaPrioritaria = demandas
        .slice()
        .sort((a, b) => {
          const prioridadeA = prioridadeOrdem[a.prioridade] ?? 99
          const prioridadeB = prioridadeOrdem[b.prioridade] ?? 99
          if (prioridadeA !== prioridadeB) return prioridadeA - prioridadeB

          const prazoA = a.prazo ? new Date(a.prazo).getTime() : Number.MAX_SAFE_INTEGER
          const prazoB = b.prazo ? new Date(b.prazo).getTime() : Number.MAX_SAFE_INTEGER
          return prazoA - prazoB
        })[0]

      if (demandaPrioritaria?.titulo) {
        setLembretePrioridade(`Demanda prioritária: ${demandaPrioritaria.titulo}`)
      } else {
        setLembretePrioridade("Nenhuma demanda prioritária no momento")
      }
    } catch (error) {
      console.error("Error loading priority demand:", error)
      setLembretePrioridade("Nenhuma demanda prioritária no momento")
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/dashboard" className="flex items-center mr-6">
          <span className="font-semibold text-lg hidden sm:inline-block">Asa Brokers</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/dashboard" && pathname.startsWith(item.href))
            const Icon = item.icon

            return (
              <Link key={item.name} href={item.href}>
                <Button 
                  variant={isActive ? "secondary" : "ghost"} 
                  size="sm"
                  className={cn(
                    "gap-2",
                    isActive && "bg-secondary"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* Notificações e Perfil */}
        <div className="ml-auto flex items-center gap-2">
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
              <div className="flex items-center mb-8">
                <span className="font-semibold text-lg">Asa Brokers</span>
              </div>
              <nav className="flex flex-col gap-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || 
                    (item.href !== "/dashboard" && pathname.startsWith(item.href))
                  const Icon = item.icon

                  return (
                    <Link 
                      key={item.name} 
                      href={item.href}
                      onClick={() => setOpen(false)}
                    >
                      <Button 
                        variant={isActive ? "secondary" : "ghost"} 
                        className={cn(
                          "w-full justify-start gap-2",
                          isActive && "bg-secondary"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {item.name}
                      </Button>
                    </Link>
                  )
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="container h-8 overflow-hidden flex items-center">
          <div className="animate-marquee whitespace-nowrap text-xs text-warning-foreground font-medium">
            Lembrete mais importante: {lembretePrioridade}
          </div>
        </div>
      </div>
    </header>
  )
}
