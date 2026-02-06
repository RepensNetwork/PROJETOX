"use client"

import { useState, useEffect } from "react"
import { format, parse, isValid } from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"
import { Label } from "@/components/ui/label"
import { DateTimePickerPopover } from "@/components/ui/datetime-picker-popover"

interface MotoristaDatePickerProps {
  defaultValue: string
}

function toISOOrNull(ddMmYyyy: string): string | null {
  if (!ddMmYyyy.trim()) return null
  const d = parse(ddMmYyyy.trim(), "dd/MM/yyyy", new Date(), { locale: ptBR })
  return isValid(d) ? d.toISOString() : null
}

export function MotoristaDatePicker({ defaultValue }: MotoristaDatePickerProps) {
  const [dateStr, setDateStr] = useState(defaultValue)

  useEffect(() => {
    setDateStr(defaultValue)
  }, [defaultValue])

  const isoValue = toISOOrNull(dateStr)

  return (
    <div className="space-y-2">
      <Label htmlFor="date">Data</Label>
      <input type="hidden" name="date" value={dateStr} id="date-hidden" />
      <DateTimePickerPopover
        id="date"
        mode="date"
        value={isoValue}
        onChange={(iso) => {
          setDateStr(iso ? format(new Date(iso), "dd/MM/yyyy", { locale: ptBR }) : "")
        }}
        placeholder="dd/mm/aaaa (deixe vazio = todos)"
        className="min-w-[200px]"
      />
    </div>
  )
}
