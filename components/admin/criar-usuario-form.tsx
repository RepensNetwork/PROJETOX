"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Loader2, Save, Shield, UserPlus } from "lucide-react"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { createMembro } from "@/app/actions/membros"

const PAGE_OPTIONS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "intake", label: "Criar Demanda" },
  { key: "inbox", label: "Inbox" },
  { key: "transportes", label: "Transportes" },
  { key: "navios", label: "Navios" },
  { key: "escalas", label: "Escalas" },
  { key: "demandas", label: "Demandas" },
  { key: "membros", label: "Colaboradores" },
  { key: "perfil", label: "Meu Perfil" },
  { key: "sistema", label: "Sistema" },
  { key: "logs", label: "Logs" },
]

export function CriarUsuarioForm() {
  const [loading, setLoading] = useState(false)
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [ativo, setAtivo] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [allowedPages, setAllowedPages] = useState<string[]>([])
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const router = useRouter()

  const handleCreate = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const result = await createMembro({
        nome: nome.trim(),
        email: email.trim(),
        ativo,
        is_admin: isAdmin,
        allowed_pages: isAdmin ? null : allowedPages,
      })

      if (!result.success) {
        setMessage({ type: "error", text: result.error || "Erro ao criar usuário." })
        return
      }

      setMessage({ type: "success", text: "Usuário criado com sucesso! Redirecionando..." })
      if (result.id) {
        router.push(`/admin/usuarios/${result.id}`)
        router.refresh()
      } else {
        router.push("/admin/usuarios")
        router.refresh()
      }
    } catch (err) {
      console.error(err)
      setMessage({ type: "error", text: "Erro inesperado ao criar usuário." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"}>
          {message.type === "success" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome *</Label>
          <Input
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome completo"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-mail *</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@exemplo.com"
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground">
            O usuário fará login com este e-mail (Supabase Auth). Cadastre-o aqui para liberar acesso às telas.
          </p>
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg border">
          <div className="space-y-0.5">
            <Label htmlFor="ativo" className="text-base">
              Usuário ativo
            </Label>
            <p className="text-sm text-muted-foreground">Usuários inativos não podem acessar o sistema.</p>
          </div>
          <Switch id="ativo" checked={ativo} onCheckedChange={setAtivo} disabled={loading} />
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg border">
          <div className="space-y-0.5">
            <Label htmlFor="isAdmin" className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Administrador
            </Label>
            <p className="text-sm text-muted-foreground">Acesso total ao sistema e à administração.</p>
          </div>
          <Switch id="isAdmin" checked={isAdmin} onCheckedChange={setIsAdmin} disabled={loading} />
        </div>

        {!isAdmin && (
          <div className="rounded-lg border p-4 space-y-3">
            <p className="text-sm font-medium">Permissões de tela</p>
            <p className="text-xs text-muted-foreground">
              Escolha quais telas este usuário poderá ver no menu. Se não for admin, só verá as marcadas.
            </p>
            <div className="grid gap-2 md:grid-cols-2">
              {PAGE_OPTIONS.map((option) => (
                <label key={option.key} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowedPages.includes(option.key)}
                    onChange={(e) => {
                      setAllowedPages((prev) =>
                        e.target.checked ? [...prev, option.key] : prev.filter((k) => k !== option.key)
                      )
                    }}
                    disabled={loading}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-4">
        <Button
          onClick={handleCreate}
          disabled={loading || !nome.trim() || !email.trim()}
          className="flex-1"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <UserPlus className="mr-2 h-4 w-4" />
          Criar usuário
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/usuarios")} disabled={loading}>
          Cancelar
        </Button>
      </div>
    </div>
  )
}
