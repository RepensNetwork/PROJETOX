"use client"

import * as React from "react"
import { format, parse, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, isSameMonth, isSameDay, setHours, setMinutes, getHours, getMinutes, isValid } from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  placeholder = "DD/MM/AAAA HH:MM ou use o calendário",
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
  const displayFormat = isDateOnly ? "dd/MM/yyyy" : "dd/MM/yyyy HH:mm"
  const displayText = value
    ? format(new Date(value), displayFormat, { locale: ptBR })
    : ""

  const [inputText, setInputText] = React.useState(displayText)
  React.useEffect(() => {
    const next = value
      ? format(new Date(value), displayFormat, { locale: ptBR })
      : ""
    setInputText(next)
  }, [value, displayFormat])

  const handleInputBlur = () => {
    const trimmed = inputText.trim()
    if (!trimmed) {
      onChange(null)
      return
    }
    try {
      // Tenta primeiro com data + hora, depois só data (hora 00:00 no modo datetime)
      let parsed: Date | null = null
      parsed = parse(trimmed, displayFormat, new Date(), { locale: ptBR })
      if (!isValid(parsed) && !isDateOnly) {
        const onlyDate = parse(trimmed, "dd/MM/yyyy", new Date(), { locale: ptBR })
        if (isValid(onlyDate)) {
          parsed = setMinutes(setHours(onlyDate, 0), 0)
        }
      }
      if (parsed && isValid(parsed)) {
        onChange(parsed.toISOString())
        setInputText(format(parsed, displayFormat, { locale: ptBR }))
      } else {
        setInputText(displayText)
      }
    } catch {
      setInputText(displayText)
    }
  }

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
      <div
        className={cn(
          "flex h-9 w-full items-center gap-1 rounded-md border bg-background px-2 text-sm",
          className
        )}
      >
        <Input
          id={id}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          autoComplete="off"
          className="h-8 flex-1 min-w-0 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          aria-label={placeholder}
          title="Digite no formato DD/MM/AAAA HH:MM ou clique no ícone para escolher"
        />
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 rounded-md"
            aria-label="Abrir calendário"
          >
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
      </div>
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
