"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { DateTimePickerPopover } from "@/components/ui/datetime-picker-popover"

interface EmailsDateFiltersProps {
  defaultFrom?: string
  defaultTo?: string
}

export function EmailsDateFilters({ defaultFrom, defaultTo }: EmailsDateFiltersProps) {
  const [fromValue, setFromValue] = useState(defaultFrom || "")
  const [toValue, setToValue] = useState(defaultTo || "")

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="from">Recebido de</Label>
        <DateTimePickerPopover
          id="from"
          mode="date"
          value={fromValue ? new Date(fromValue + "T12:00:00").toISOString() : undefined}
          placeholder="Selecionar data"
          onChange={(iso) => {
            const val = iso ? iso.slice(0, 10) : ""
            setFromValue(val)
          }}
        />
        <input type="hidden" name="from" value={fromValue} readOnly />
      </div>
      <div className="space-y-2">
        <Label htmlFor="to">Recebido até</Label>
        <DateTimePickerPopover
          id="to"
          mode="date"
          value={toValue ? new Date(toValue + "T12:00:00").toISOString() : undefined}
          placeholder="Selecionar data"
          onChange={(iso) => {
            const val = iso ? iso.slice(0, 10) : ""
            setToValue(val)
          }}
        />
        <input type="hidden" name="to" value={toValue} readOnly />
      </div>
    </>
  )
}
