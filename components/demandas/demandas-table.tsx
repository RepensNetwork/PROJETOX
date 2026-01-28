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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { 
  ClipboardList, 
  MoreHorizontal, 
  Eye, 
  Pencil, 
  Trash2, 
  Ship, 
  Clock,
  AlertTriangle,
  User
} from "lucide-react"
import { deleteDemanda } from "@/app/actions/demandas"
import { DemandaForm } from "./demanda-form"
import type { Demanda, Escala, Navio, Membro } from "@/lib/types/database"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"

interface DemandasTableProps {
  demandas: (Demanda & { escala: Escala & { navio: Navio }; responsavel: Membro | null })[]
  escalas: (Escala & { navio: Navio })[]
  membros: Membro[]
}

const statusColors: Record<Demanda["status"], string> = {
  pendente: "bg-warning/10 text-warning-foreground border-warning/30",
  em_andamento: "bg-primary/10 text-primary border-primary/30",
  concluida: "bg-success/10 text-success border-success/30",
  aguardando_terceiro: "bg-muted text-muted-foreground border-muted/30",
  cancelada: "bg-destructive/10 text-destructive border-destructive/30",
}

const statusLabels: Record<Demanda["status"], string> = {
  pendente: "Pendente",
  em_andamento: "Em Andamento",
  concluida: "Concluída",
  aguardando_terceiro: "Aguardando Terceiro",
  cancelada: "Cancelada",
}

const prioridadeColors: Record<Demanda["prioridade"], string> = {
  baixa: "bg-muted text-muted-foreground",
  media: "bg-primary/10 text-primary",
  alta: "bg-warning/10 text-warning-foreground",
  urgente: "bg-destructive text-destructive-foreground",
}

const prioridadeLabels: Record<Demanda["prioridade"], string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  urgente: "Urgente",
}

export function DemandasTable({ demandas, escalas, membros }: DemandasTableProps) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const now = new Date()

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)

    try {
      await deleteDemanda(deleteId)
      router.refresh()
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  if (demandas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">Nenhuma demanda cadastrada</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Comece adicionando uma demanda ao sistema.
        </p>
        <DemandaForm escalas={escalas} membros={membros} />
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Escala</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Prazo</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {demandas.map((demanda) => {
              const isOverdue = demanda.prazo && 
                new Date(demanda.prazo) < now && 
                demanda.status !== "concluida"

              return (
                <TableRow key={demanda.id} className={isOverdue ? "bg-destructive/5" : ""}>
                  <TableCell>
                    <Link 
                      href={`/demandas/${demanda.id}`}
                      className="font-medium hover:underline flex items-center gap-2"
                    >
                      {isOverdue && <AlertTriangle className="h-4 w-4 text-destructive" />}
                      {demanda.titulo}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link 
                      href={`/escalas/${demanda.escala_id}`}
                      className="flex items-center gap-1 text-sm hover:underline"
                    >
                      <Ship className="h-3.5 w-3.5 text-muted-foreground" />
                      {demanda.escala.navio.nome} - {demanda.escala.porto}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[demanda.status]}>
                      {statusLabels[demanda.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={prioridadeColors[demanda.prioridade]}>
                      {prioridadeLabels[demanda.prioridade]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {demanda.prazo ? (
                      <span className={`flex items-center gap-1 text-sm ${
                        isOverdue ? "text-destructive font-medium" : "text-muted-foreground"
                      }`}>
                        <Clock className="h-3.5 w-3.5" />
                        {format(new Date(demanda.prazo), "dd/MM/yy HH:mm", { locale: ptBR })}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {demanda.responsavel ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={demanda.responsavel.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">
                            {demanda.responsavel.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{demanda.responsavel.nome.split(" ")[0]}</span>
                      </div>
                    ) : (
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <User className="h-3.5 w-3.5" />
                        Sem responsável
                      </span>
                    )}
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
                          <Link href={`/demandas/${demanda.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver detalhes
                          </Link>
                        </DropdownMenuItem>
                        <DemandaForm
                          demanda={demanda}
                          escalas={escalas}
                          membros={membros}
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
                          onSelect={() => setDeleteId(demanda.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir demanda?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Todos os comentários e histórico
              associados a esta demanda também serão excluídos.
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
