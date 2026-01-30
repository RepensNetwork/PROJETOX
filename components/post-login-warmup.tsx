"use client"

import { Ship } from "lucide-react"

export function PostLoginWarmup() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-8 px-6">
        <div className="relative">
          <Ship className="h-16 w-16 text-primary animate-warmup-float" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          Preparando sua área de trabalho...
        </p>
        <div className="w-64 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full w-[30%] rounded-full bg-primary animate-warmup-line origin-left"
            aria-hidden
          />
        </div>
      </div>
    </div>
  )
}
