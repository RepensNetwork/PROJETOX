import { notFound, redirect } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { getMembros } from "@/app/actions/dashboard"
import { getCurrentUser } from "@/app/actions/auth"
import { Shield, ArrowLeft, User, Mail, Calendar } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"
import { EditarUsuarioForm } from "@/components/admin/editar-usuario-form"

interface AdminUsuarioDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function AdminUsuarioDetailPage({ params }: AdminUsuarioDetailPageProps) {
  const { id } = await params
  
  // Verificar autenticação e permissões de admin
  const currentUser = await getCurrentUser()
  
  if (!currentUser || !currentUser.membro) {
    redirect("/login")
  }

  if (!currentUser.membro.is_admin) {
    notFound()
  }

  const membros = await getMembros()
  const membro = membros.find(m => m.id === id)

  if (!membro) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/usuarios">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <User className="h-6 w-6" />
              Editar Usuário
            </h1>
            <p className="text-muted-foreground">
              Gerenciar informações do usuário
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Foto de Perfil</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Avatar className="h-32 w-32">
                <AvatarImage src={membro.avatar_url || undefined} />
                <AvatarFallback className="text-3xl">
                  {membro.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </AvatarFallback>
              </Avatar>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Informações do Usuário</CardTitle>
              <CardDescription>
                Dados cadastrais e permissões
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EditarUsuarioForm membro={membro} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
