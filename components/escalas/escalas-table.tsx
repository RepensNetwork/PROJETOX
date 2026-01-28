"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Calendar, MoreHorizontal, Eye, Pencil, Trash2, Ship, MapPin } from "lucide-react"
import { deleteEscala } from "@/app/actions/escalas"
import { EscalaForm } from "./escala-form"
import type { Escala, Navio } from "@/lib/types/database"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"

interface EscalasTableProps {
  escalas: (Escala & { navio: Navio })[]
  navios: Navio[]
}

const statusColors: Record<Escala["status"], string> = {
  planejada: "bg-warning/10 text-warning-foreground border-warning/30",
  em_operacao: "bg-primary/10 text-primary border-primary/30",
  concluida: "bg-success/10 text-success border-success/30",
  cancelada: "bg-destructive/10 text-destructive border-destructive/30",
}

const statusLabels: Record<Escala["status"], string> = {
  planejada: "Planejada",
  em_operacao: "Em Operação",
  concluida: "Concluída",
  cancelada: "Cancelada",
}

export function EscalasTable({ escalas, navios }: EscalasTableProps) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)

    try {
      await deleteEscala(deleteId)
      router.refresh()
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  if (escalas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">Nenhuma escala cadastrada</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Comece adicionando uma escala ao sistema.
        </p>
        <EscalaForm navios={navios} />
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Navio</TableHead>
              <TableHead>Porto</TableHead>
              <TableHead>Chegada</TableHead>
              <TableHead>Saída</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {escalas.map((escala) => (
              <TableRow key={escala.id}>
                <TableCell>
                  <Link 
                    href={`/escalas/${escala.id}`}
                    className="font-medium hover:underline flex items-center gap-2"
                  >
                    <Ship className="h-4 w-4 text-muted-foreground" />
                    {escala.navio.nome}
                  </Link>
                </TableCell>
                <TableCell>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    {escala.porto}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="flex items-center gap-1 text-sm">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    {format(new Date(escala.data_chegada), "dd/MM/yy HH:mm", { locale: ptBR })}
                  </span>
                </TableCell>
                <TableCell>
                  {escala.data_saida ? (
                    <span className="text-sm">
                      {format(new Date(escala.data_saida), "dd/MM/yy HH:mm", { locale: ptBR })}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusColors[escala.status]}>
                    {statusLabels[escala.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Abrir menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/escalas/${escala.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver detalhes
                        </Link>
                      </DropdownMenuItem>
                      <EscalaForm
                        escala={escala}
                        navios={navios}
                        trigger={
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                        }
                      />
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onSelect={() => setDeleteId(escala.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir escala?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Todas as demandas
              associadas a esta escala também serão excluídas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
