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
import { Ship, MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react"
import { deleteNavio } from "@/app/actions/navios"
import { NavioForm } from "./navio-form"
import type { Navio } from "@/lib/types/database"

interface NaviosTableProps {
  navios: Navio[]
}

export function NaviosTable({ navios }: NaviosTableProps) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)

    try {
      await deleteNavio(deleteId)
      router.refresh()
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  if (navios.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Ship className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">Nenhum navio cadastrado</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Comece adicionando um navio ao sistema.
        </p>
        <NavioForm />
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Companhia</TableHead>
              <TableHead>Observações</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {navios.map((navio) => (
              <TableRow key={navio.id}>
                <TableCell>
                  <Link 
                    href={`/navios/${navio.id}`}
                    className="font-medium hover:underline flex items-center gap-2"
                  >
                    <Ship className="h-4 w-4 text-muted-foreground" />
                    {navio.nome}
                  </Link>
                </TableCell>
                <TableCell>
                  {navio.companhia}
                </TableCell>
                <TableCell className="text-muted-foreground max-w-md truncate">
                  {navio.observacoes || "-"}
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
                        <Link href={`/navios/${navio.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver detalhes
                        </Link>
                      </DropdownMenuItem>
                      <NavioForm
                        navio={navio}
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
                        onSelect={() => setDeleteId(navio.id)}
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
            <AlertDialogTitle>Excluir navio?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Todas as escalas e demandas
              associadas a este navio também serão excluídas.
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
