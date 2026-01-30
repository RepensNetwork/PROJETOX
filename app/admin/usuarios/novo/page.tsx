import { notFound, redirect } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/app/actions/auth"
import { ArrowLeft, UserPlus } from "lucide-react"
import Link from "next/link"
import { CriarUsuarioForm } from "@/components/admin/criar-usuario-form"

export default async function AdminNovoUsuarioPage() {
  const currentUser = await getCurrentUser()

  if (!currentUser || !currentUser.membro) {
    redirect("/login")
  }

  if (!currentUser.membro.is_admin) {
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
              <UserPlus className="h-6 w-6" />
              Novo usuário
            </h1>
            <p className="text-muted-foreground">
              Cadastre um usuário e defina as permissões de tela
            </p>
          </div>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Dados e permissões</CardTitle>
            <CardDescription>
              Preencha nome e e-mail. Se não for administrador, marque as telas que o usuário poderá acessar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CriarUsuarioForm />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
