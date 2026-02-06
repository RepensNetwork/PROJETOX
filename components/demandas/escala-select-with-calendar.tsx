"use client"

import * as React from "react"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"
import { ChevronDown } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { Escala, Navio } from "@/lib/types/database"

function formatEscalaDate(chegada: string, saida: string): string {
  try {
    const c = chegada?.slice(0, 10) ? parseISO(chegada.slice(0, 10)) : null
    const s = saida?.slice(0, 10) ? parseISO(saida.slice(0, 10)) : null
    if (c && !isNaN(c.getTime())) {
      if (s && !isNaN(s.getTime()) && c.getTime() !== s.getTime()) {
        return `${format(c, "dd/MM/yyyy", { locale: ptBR })} – ${format(s, "dd/MM/yyyy", { locale: ptBR })}`
      }
      return format(c, "dd/MM/yyyy", { locale: ptBR })
    }
  } catch {
    // ignore
  }
  return "—"
}

type EscalaWithNavio = Escala & { navio: Navio }

interface EscalaSelectWithCalendarProps {
  escalas: EscalaWithNavio[]
  value: string
  onSelect: (escalaId: string) => void
  id?: string
  required?: boolean
}

export function EscalaSelectWithCalendar({
  escalas,
  value,
  onSelect,
  id = "escala_id",
  required,
}: EscalaSelectWithCalendarProps) {
  const [open, setOpen] = React.useState(false)
  const selectedEscala = value ? escalas.find((e) => e.id === value) : null

  const handleSelect = (escalaId: string) => {
    onSelect(escalaId)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          className={cn(
            "flex h-10 w-full min-w-0 items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-left"
          )}
          aria-required={required}
          aria-invalid={required && !value}
        >
          <span className={cn("flex items-center min-w-0", selectedEscala ? "text-foreground" : "text-muted-foreground")}>
            {selectedEscala ? (
              <>
                <span className="truncate min-w-0">{selectedEscala.navio?.nome ?? "—"} – {selectedEscala.porto}</span>
                <span className="text-muted-foreground font-normal shrink-0 ml-1">
                  · {formatEscalaDate(selectedEscala.data_chegada, selectedEscala.data_saida)}
                </span>
              </>
            ) : (
              "Selecione uma escala"
            )}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-popover text-popover-foreground" align="start">
        <div className="p-2 max-h-[85vh] overflow-auto">
          <ScrollArea className="h-[280px] rounded-md border p-2 min-w-[320px]">
            <div className="space-y-0.5">
              {escalas.map((escala) => (
                <button
                  key={escala.id}
                  type="button"
                  onClick={() => handleSelect(escala.id)}
                  className={cn(
                    "w-full rounded px-2 py-2 text-left text-sm hover:bg-accent flex items-center justify-between gap-3",
                    value === escala.id && "bg-primary/15 text-primary font-medium"
                  )}
                >
                  <span className="truncate">
                    {escala.navio?.nome ?? "—"} – {escala.porto}
                  </span>
                  <span className="text-muted-foreground text-xs shrink-0">
                    {formatEscalaDate(escala.data_chegada, escala.data_saida)}
                  </span>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  )
}
