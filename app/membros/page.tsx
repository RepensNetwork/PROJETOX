import { Header } from "@/components/layout/header"
import { getMembros } from "@/app/actions/dashboard"
import { CSVImporter } from "@/components/import/csv-importer"
import { importMembros } from "@/app/actions/import"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default async function MembrosPage() {
  const membros = await getMembros()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Colaboradores</h1>
            <p className="text-muted-foreground">
              Gerencie os membros da equipe
            </p>
          </div>
          <div className="flex gap-2">
            <CSVImporter
              title="Importar Colaboradores"
              description="Importe colaboradores a partir de um arquivo CSV"
              onImport={importMembros}
              exampleHeaders={["nome", "email", "avatar_url"]}
              exampleRow={["João Silva", "joao@example.com", "https://example.com/avatar.jpg"]}
              exampleRows={[
                ["João Silva", "joao@example.com", "https://example.com/avatar.jpg"],
                ["Maria Santos", "maria@example.com", ""],
                ["Pedro Costa", "pedro@example.com", "https://example.com/pedro.jpg"]
              ]}
            />
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Colaborador
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Avatar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {membros.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    Nenhum colaborador cadastrado
                  </TableCell>
                </TableRow>
              ) : (
                membros.map((membro) => (
                  <TableRow key={membro.id}>
                    <TableCell className="font-medium">{membro.nome}</TableCell>
                    <TableCell>{membro.email}</TableCell>
                    <TableCell>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={membro.avatar_url || undefined} />
                        <AvatarFallback>
                          {membro.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  )
}
