"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload, Loader2, Save, ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export default function PerfilPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [membro, setMembro] = useState<any>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push("/login")
        return
      }

      const { data: membroData, error } = await supabase
        .from("membros")
        .select("*")
        .ilike("email", user.email)
        .single()

      if (error) {
        console.error("Error loading member:", error)
        setMessage({
          type: "error",
          text: "Sem permissão para acessar seus dados. Verifique o RLS no Supabase.",
        })
        return
      }

      if (membroData) {
        setMembro(membroData)
        setAvatarPreview(membroData.avatar_url)
      }
    } catch (error) {
      console.error("Error loading user:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Por favor, selecione apenas imagens" })
      return
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "A imagem deve ter no máximo 5MB" })
      return
    }

    setAvatarFile(file)
    
    // Criar preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    if (!membro) return

    setSaving(true)
    setMessage(null)

    try {
      const supabase = createClient()
      let avatarUrl = membro.avatar_url

      // Upload da imagem se houver
      if (avatarFile) {
        // Converter para base64 para armazenar diretamente
        // Em produção, considere usar Supabase Storage ou serviço externo
        const reader = new FileReader()
        avatarUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            // Usar data URL (base64) diretamente
            resolve(reader.result as string)
          }
          reader.onerror = reject
          reader.readAsDataURL(avatarFile)
        })
      }

      // Atualizar membro
      const { error: updateError } = await supabase
        .from("membros")
        .update({
          avatar_url: avatarUrl,
        })
        .eq("id", membro.id)

      if (updateError) {
        throw updateError
      }

      setMessage({ type: "success", text: "Foto atualizada com sucesso!" })
      setAvatarFile(null)
      router.refresh()
    } catch (error: any) {
      console.error("Error saving avatar:", error)
      setMessage({ 
        type: "error", 
        text: error.message || "Erro ao salvar foto. Tente novamente." 
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </main>
      </div>
    )
  }

  if (!membro) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-6">
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">Usuário não encontrado</p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Meu Perfil</h1>
            <p className="text-muted-foreground">
              Gerencie suas informações e foto de perfil
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Foto de Perfil</CardTitle>
            <CardDescription>
              Adicione ou atualize sua foto de perfil
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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

            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarPreview || undefined} />
                <AvatarFallback className="text-2xl">
                  {membro.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="avatar">Selecionar Imagem</Label>
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    disabled={saving}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground">
                    Formatos aceitos: JPG, PNG, GIF. Tamanho máximo: 5MB
                  </p>
                </div>

                <Button
                  onClick={handleSave}
                  disabled={!avatarFile || saving}
                >
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Foto
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
            <CardDescription>
              Seus dados cadastrais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={membro.nome} disabled />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={membro.email} disabled />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Input value={membro.ativo ? "Ativo" : "Inativo"} disabled />
            </div>
            {membro.is_admin && (
              <div className="space-y-2">
                <Label>Permissões</Label>
                <Input value="Administrador" disabled />
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
