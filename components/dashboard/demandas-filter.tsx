"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Filter, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Membro } from "@/lib/types/database"

interface DemandasFilterProps {
  membros: Membro[]
  responsavelId: string | null
  onFilterChange: (responsavelId: string | null) => void
}

export function DemandasFilter({ membros, responsavelId, onFilterChange }: DemandasFilterProps) {
  const [open, setOpen] = useState(false)

  const responsavelSelecionado = responsavelId 
    ? membros.find(m => m.id === responsavelId)
    : null

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="filter-responsavel" className="text-sm text-muted-foreground">
        Filtrar por responsável:
      </Label>
      <Select
        value={responsavelId || "todos"}
        onValueChange={(value) => {
          onFilterChange(value === "todos" ? null : value)
        }}
      >
        <SelectTrigger id="filter-responsavel" className="w-[200px]">
          <SelectValue placeholder="Todos os responsáveis" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Todos os responsáveis
            </div>
          </SelectItem>
          {membros.map((membro) => (
            <SelectItem key={membro.id} value={membro.id}>
              {membro.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {responsavelSelecionado && (
        <Badge variant="secondary" className="gap-2">
          {responsavelSelecionado.nome}
          <button
            onClick={() => onFilterChange(null)}
            className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}
    </div>
  )
}
