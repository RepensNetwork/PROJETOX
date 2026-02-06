"use client"

import * as React from "react"
import {
  format,
  addMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  parseISO,
  startOfDay,
  isWithinInterval,
} from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { Escala, Navio } from "@/lib/types/database"

type EscalaWithNavio = Escala & { navio: Navio }

function toDate(s: string): Date {
  const d = typeof s === "string" && s.length >= 10 ? parseISO(s.slice(0, 10)) : new Date(NaN)
  return isNaN(d.getTime()) ? new Date(NaN) : startOfDay(d)
}

/** Retorna escalas que incluem o dia `day` (entre data_chegada e data_saida). */
function getEscalasForDay(escalas: EscalaWithNavio[], day: Date): EscalaWithNavio[] {
  const d = startOfDay(day)
  return escalas.filter((e) => {
    const chegada = toDate(e.data_chegada)
    const saida = toDate(e.data_saida)
    if (isNaN(chegada.getTime()) || isNaN(saida.getTime())) return false
    return isWithinInterval(d, { start: chegada, end: saida })
  })
}


interface EscalaCalendarPickerProps {
  escalas: EscalaWithNavio[]
  value?: string
  onSelect: (escalaId: string) => void
  className?: string
  /** Oculta o texto "Buscar escala pela data..." (útil dentro de popover). */
  hideLabel?: boolean
}

export function EscalaCalendarPicker({
  escalas,
  value,
  onSelect,
  className,
  hideLabel,
}: EscalaCalendarPickerProps) {
  const [month, setMonth] = React.useState(() => {
    if (escalas.length > 0) {
      const first = toDate(escalas[0]!.data_chegada)
      if (!isNaN(first.getTime())) return startOfMonth(first)
    }
    return startOfMonth(new Date())
  })
  const [choiceDayEscalas, setChoiceDayEscalas] = React.useState<EscalaWithNavio[] | null>(null)

  const days = eachDayOfInterval({
    start: startOfMonth(month),
    end: endOfMonth(month),
  })
  const firstDay = startOfMonth(month).getDay()
  const emptySlots = firstDay

  const selectedEscala = value ? escalas.find((e) => e.id === value) : null

  const handleDayClick = (day: Date, dayEscalas: EscalaWithNavio[]) => {
    if (dayEscalas.length === 1) {
      onSelect(dayEscalas[0]!.id)
      setChoiceDayEscalas(null)
    } else {
      setChoiceDayEscalas(dayEscalas)
    }
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className={className}>
        {!hideLabel && (
          <p className="text-sm font-medium text-muted-foreground mb-2">
            Buscar escala pela data (passe o mouse para ver o navio)
          </p>
        )}
        <div className="rounded-lg border p-3 bg-muted/30">
        <div className="flex items-center justify-between gap-2 mb-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setMonth((m) => addMonths(m, -1))}
          >
            ‹
          </Button>
          <span className="text-sm font-medium capitalize">
            {format(month, "MMMM yyyy", { locale: ptBR })}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setMonth((m) => addMonths(m, 1))}
          >
            ›
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-0.5 text-center text-xs">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
            <div key={d} className="py-1 text-muted-foreground font-medium">
              {d}
            </div>
          ))}
          {Array.from({ length: emptySlots }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {days.map((day) => {
            const dayEscalas = getEscalasForDay(escalas, day)
            const hasEscalas = dayEscalas.length > 0
            const isSelected = value && dayEscalas.some((e) => e.id === value)
            const isToday = isSameDay(day, new Date())

            return (
              <div
                key={day.toISOString()}
                className="relative flex flex-col items-center justify-center min-h-[36px]"
              >
                {hasEscalas ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => handleDayClick(day, dayEscalas)}
                        className={cn(
                          "h-8 w-8 rounded-md text-sm transition-colors w-full",
                          isSelected && "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2",
                          !isSelected && hasEscalas && "hover:bg-primary/20 bg-primary/10",
                          isToday && !isSelected && "ring-1 ring-muted-foreground/50"
                        )}
                      >
                        {format(day, "d")}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[280px] p-3 text-left bg-popover text-popover-foreground border shadow-md">
                      <div className="space-y-2">
                        <p className="font-medium text-foreground">
                          {format(day, "EEEE, d 'de' MMMM", { locale: ptBR })}
                        </p>
                        {dayEscalas.map((e) => (
                          <div key={e.id} className="text-xs">
                            <span className="font-semibold">{e.navio?.nome ?? "—"}</span>
                            {" – "}
                            {e.porto}
                            <br />
                            <span className="text-muted-foreground">
                              Chegada {format(toDate(e.data_chegada), "dd/MM/yyyy", { locale: ptBR })} · Saída {format(toDate(e.data_saida), "dd/MM/yyyy", { locale: ptBR })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <span
                    className={cn(
                      "h-8 w-8 flex items-center justify-center rounded-md text-sm text-muted-foreground/60",
                      isToday && "ring-1 ring-muted-foreground/30"
                    )}
                  >
                    {format(day, "d")}
                  </span>
                )}
              </div>
            )
          })}
        </div>
        {choiceDayEscalas && choiceDayEscalas.length > 1 && (
          <div className="mt-3 pt-3 border-t space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Escolha a escala:</p>
            <div className="flex flex-wrap gap-1">
              {choiceDayEscalas.map((e) => (
                <Button
                  key={e.id}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    onSelect(e.id)
                    setChoiceDayEscalas(null)
                  }}
                >
                  {e.navio?.nome ?? "—"} – {e.porto}
                </Button>
              ))}
            </div>
          </div>
        )}
        {selectedEscala && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Selecionado: <strong>{selectedEscala.navio?.nome}</strong> – {selectedEscala.porto}
          </p>
        )}
      </div>
    </div>
    </TooltipProvider>
  )
}
