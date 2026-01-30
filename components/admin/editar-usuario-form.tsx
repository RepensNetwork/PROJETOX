"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Save, Shield, Upload, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import type { Membro } from "@/lib/types/database"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"

interface EditarUsuarioFormProps {
  membro: Membro
}

export function EditarUsuarioForm({ membro }: EditarUsuarioFormProps) {
  const [loading, setLoading] = useState(false)
  const [nome, setNome] = useState(membro.nome)
  const [email, setEmail] = useState(membro.email)
  const [ativo, setAtivo] = useState(membro.ativo)
  const [isAdmin, setIsAdmin] = useState(membro.is_admin || false)
  const [allowedPages, setAllowedPages] = useState<string[]>(membro.allowed_pages || [])
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(membro.avatar_url ?? null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Selecione apenas imagens (JPG, PNG, etc.)." })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "A imagem deve ter no máximo 5MB." })
      return
    }
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
    setMessage(null)
  }

  const handleRemovePhoto = () => {
    setAvatarFile(null)
    setAvatarPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const pageOptions = [
    { key: "dashboard", label: "Dashboard" },
    { key: "inbox", label: "Inbox" },
    { key: "transportes", label: "Transportes" },
    { key: "navios", label: "Navios" },
    { key: "escalas", label: "Escalas" },
    { key: "demandas", label: "Demandas" },
    { key: "membros", label: "Colaboradores" },
    { key: "intake", label: "Criar Demanda" },
    { key: "perfil", label: "Meu Perfil" },
    { key: "sistema", label: "Sistema" },
    { key: "logs", label: "Logs" },
  ]

  const handleSave = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const supabase = createClient()

      let avatarUrl: string | null = avatarPreview
      if (avatarFile) {
        avatarUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(avatarFile)
        })
      }

      const { error } = await supabase
        .from("membros")
        .update({
          nome: nome.trim(),
          email: email.trim(),
          ativo,
          is_admin: isAdmin,
          allowed_pages: isAdmin ? null : allowedPages,
          avatar_url: avatarUrl,
        })
        .eq("id", membro.id)

      if (error) {
        throw error
      }

      setMessage({ type: "success", text: "Usuário atualizado com sucesso!" })
      setAvatarFile(null)
      setAvatarPreview(avatarUrl)
      router.refresh()
    } catch (error: any) {
      console.error("Error updating user:", error)
      setMessage({ 
        type: "error", 
        text: error.message || "Erro ao atualizar usuário" 
      })
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
        <div className="rounded-lg border p-4 space-y-3">
          <p className="text-sm font-medium">Foto de perfil</p>
          <div className="flex flex-wrap items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={avatarPreview ?? undefined} />
              <AvatarFallback className="text-xl">
                {membro.nome.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
                disabled={loading}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
              >
                <Upload className="h-4 w-4 mr-2" />
                Escolher foto
              </Button>
              {(avatarPreview || membro.avatar_url) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={handleRemovePhoto}
                  disabled={loading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remover foto
                </Button>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            JPG, PNG ou GIF. Máximo 5MB.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="nome">Nome</Label>
          <Input
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg border">
          <div className="space-y-0.5">
            <Label htmlFor="ativo" className="text-base">Usuário Ativo</Label>
            <p className="text-sm text-muted-foreground">
              Usuários inativos não podem fazer login
            </p>
          </div>
          <Switch
            id="ativo"
            checked={ativo}
            onCheckedChange={setAtivo}
            disabled={loading}
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg border">
          <div className="space-y-0.5">
            <Label htmlFor="isAdmin" className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Administrador
            </Label>
            <p className="text-sm text-muted-foreground">
              Acesso total ao sistema e administração
            </p>
          </div>
          <Switch
            id="isAdmin"
            checked={isAdmin}
            onCheckedChange={setIsAdmin}
            disabled={loading}
          />
        </div>

        {!isAdmin && (
          <div className="rounded-lg border p-4 space-y-3">
            <p className="text-sm font-medium">Permissões de tela</p>
            <div className="grid gap-2 md:grid-cols-2">
              {pageOptions.map((option) => (
                <label key={option.key} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={allowedPages.includes(option.key)}
                    onChange={(event) => {
                      setAllowedPages((prev) =>
                        event.target.checked
                          ? [...prev, option.key]
                          : prev.filter((item) => item !== option.key)
                      )
                    }}
                    disabled={loading}
                  />
                  {option.label}
                </label>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Usuários não-admin só enxergam as telas marcadas.
            </p>
          </div>
        )}

        <div className="pt-4 border-t space-y-2">
          <p className="text-sm font-medium">Informações do Sistema</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">ID:</span>
              <p className="font-mono text-xs">{membro.id}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Cadastrado em:</span>
              <p>{format(new Date(membro.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button
          onClick={handleSave}
          disabled={loading || !nome.trim() || !email.trim()}
          className="flex-1"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          Salvar Alterações
        </Button>
      </div>
    </div>
  )
}
