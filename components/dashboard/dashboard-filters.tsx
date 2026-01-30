"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { DateTimePickerPopover } from "@/components/ui/datetime-picker-popover"
import { Filter, Ship, X } from "lucide-react"
import type { Navio } from "@/lib/types/database"

interface DashboardFiltersProps {
  navios: Navio[]
  navioId: string | null
  dateFilter: string | null
  onNavioChange: (navioId: string | null) => void
  onDateChange: (date: string | null) => void
  onClear: () => void
}

export function DashboardFilters({
  navios,
  navioId,
  dateFilter,
  onNavioChange,
  onDateChange,
  onClear,
}: DashboardFiltersProps) {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[220px] space-y-2">
            <Label htmlFor="filter-navio" className="text-sm text-muted-foreground">
              Filtrar por navio
            </Label>
            <Select
              value={navioId || "todos"}
              onValueChange={(value) => onNavioChange(value === "todos" ? null : value)}
            >
              <SelectTrigger id="filter-navio">
                <SelectValue placeholder="Todos os navios" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Todos os navios
                  </div>
                </SelectItem>
                {navios.map((navio) => (
                  <SelectItem key={navio.id} value={navio.id}>
                    <div className="flex items-center gap-2">
                      <Ship className="h-4 w-4" />
                      {navio.nome}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="min-w-[200px] space-y-2">
            <Label htmlFor="filter-date" className="text-sm text-muted-foreground">
              Filtrar por data
            </Label>
            <DateTimePickerPopover
              id="filter-date"
              mode="date"
              value={dateFilter ? new Date(dateFilter + "T12:00:00").toISOString() : undefined}
              placeholder="Selecionar data"
              onChange={(iso) => onDateChange(iso ? iso.slice(0, 10) : null)}
            />
          </div>

          <Button
            variant="ghost"
            onClick={onClear}
            disabled={!navioId && !dateFilter}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Limpar filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
