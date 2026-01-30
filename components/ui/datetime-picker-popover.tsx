"use client"

import * as React from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, isSameMonth, isSameDay, setHours, setMinutes, getHours, getMinutes } from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DateTimePickerPopoverProps {
  value?: string | null
  onChange: (iso: string | null) => void
  placeholder?: string
  defaultDate?: Date
  /** "date" = só calendário (hora 00:00); "datetime" = calendário + hora */
  mode?: "date" | "datetime"
  id?: string
  className?: string
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const MINUTES = [0, 15, 30, 45]

export function DateTimePickerPopover({
  value,
  onChange,
  placeholder = "Selecionar data e hora",
  defaultDate,
  mode = "datetime",
  id,
  className,
}: DateTimePickerPopoverProps) {
  const [open, setOpen] = React.useState(false)
  const initial = value ? new Date(value) : defaultDate ?? new Date()
  const [month, setMonth] = React.useState(initial)
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(
    value ? new Date(value) : defaultDate ? new Date(defaultDate) : new Date()
  )
  const [hour, setHour] = React.useState(value ? getHours(new Date(value)) : initial.getHours())
  const [minute, setMinute] = React.useState(
    value ? getMinutes(new Date(value)) : Math.floor(initial.getMinutes() / 15) * 15
  )

  const isDateOnly = mode === "date"
  const displayText = value
    ? format(new Date(value), isDateOnly ? "dd/MM/yyyy" : "dd/MM/yyyy HH:mm", { locale: ptBR })
    : placeholder

  const days = eachDayOfInterval({
    start: startOfMonth(month),
    end: endOfMonth(month),
  })
  const firstDay = startOfMonth(month).getDay()
  const emptySlots = firstDay === 0 ? 6 : firstDay - 1

  const handleApply = () => {
    const d = selectedDate ?? new Date(month.getFullYear(), month.getMonth(), 1)
    const withTime = isDateOnly
      ? setMinutes(setHours(d, 0), 0)
      : setMinutes(setHours(d, hour), minute)
    onChange(withTime.toISOString())
    setOpen(false)
  }

  const handleClear = () => {
    onChange(null)
    setSelectedDate(null)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className={cn(
            "h-9 w-full justify-start text-left font-normal rounded-md border bg-background px-2 text-sm",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          {displayText}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 space-y-3">
          <div className="flex items-center justify-between gap-2">
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
              const isCurrent = selectedDate ? isSameDay(day, selectedDate) : false
              const isThisMonth = isSameMonth(day, month)
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "h-8 w-8 rounded-md text-sm transition-colors",
                    isCurrent && "bg-primary text-primary-foreground",
                    !isCurrent && isThisMonth && "hover:bg-accent",
                    !isThisMonth && "text-muted-foreground"
                  )}
                >
                  {format(day, "d")}
                </button>
              )
            })}
          </div>
          {!isDateOnly && (
            <div className="flex items-center gap-2 pt-2 border-t">
              <span className="text-xs text-muted-foreground">Hora:</span>
              <select
                value={hour}
                onChange={(e) => setHour(Number(e.target.value))}
                className="h-8 rounded-md border bg-background px-2 text-sm w-14"
              >
                {HOURS.map((h) => (
                  <option key={h} value={h}>
                    {String(h).padStart(2, "0")}
                  </option>
                ))}
              </select>
              <span className="text-muted-foreground">:</span>
              <select
                value={minute}
                onChange={(e) => setMinute(Number(e.target.value))}
                className="h-8 rounded-md border bg-background px-2 text-sm w-14"
              >
                {MINUTES.map((m) => (
                  <option key={m} value={m}>
                    {String(m).padStart(2, "0")}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={handleClear}>
              Limpar
            </Button>
            <Button type="button" size="sm" onClick={handleApply}>
              Ok
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
