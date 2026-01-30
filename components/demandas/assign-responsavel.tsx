"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { User } from "lucide-react"
import type { Membro } from "@/lib/types/database"
import { updateDemanda } from "@/app/actions/demandas"
import { criarNotificacaoDemanda } from "@/app/actions/notificacoes-demanda"

interface AssignResponsavelProps {
  demandaId: string
  responsavelAtual: Membro | null
  membros: Membro[]
}

export function AssignResponsavel({
  demandaId,
  responsavelAtual,
  membros,
}: AssignResponsavelProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [value, setValue] = useState(responsavelAtual?.id ?? "none")

  const [notifError, setNotifError] = useState<string | null>(null)

  const handleChange = async (membroId: string) => {
    const newId = membroId === "none" ? "" : membroId
    setValue(membroId)
    setLoading(true)
    setNotifError(null)
    try {
      const { error } = await updateDemanda(demandaId, {
        responsavel_id: newId || null,
      })
      if (error) {
        setValue(responsavelAtual?.id ?? "none")
        return
      }
      if (newId) {
        const result = await criarNotificacaoDemanda(demandaId, newId)
        if (!result.success) {
          setNotifError(
            result.error || "Não foi possível enviar a notificação ao responsável. A atribuição foi salva."
          )
        }
      }
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h4 className="text-sm font-medium mb-2">Responsável</h4>
      {responsavelAtual && value !== "none" && value === responsavelAtual.id ? (
        <div className="flex items-center gap-3 p-3 rounded-lg border">
          <Avatar className="h-9 w-9">
            <AvatarImage src={responsavelAtual.avatar_url || undefined} />
            <AvatarFallback>
              {responsavelAtual.nome.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">{responsavelAtual.nome}</p>
            <p className="text-xs text-muted-foreground">{responsavelAtual.email}</p>
          </div>
        </div>
      ) : value === "none" ? (
        <div className="flex items-center gap-2 p-3 rounded-lg border text-muted-foreground">
          <User className="h-5 w-5" />
          <span className="text-sm">Sem responsável atribuído</span>
        </div>
      ) : null}
      <div className="mt-2">
        <Label htmlFor="responsavel-select" className="text-xs text-muted-foreground">
          Atribuir ou alterar responsável
        </Label>
        <Select
          value={value}
          onValueChange={handleChange}
          disabled={loading}
        >
          <SelectTrigger id="responsavel-select" className="mt-1">
            <SelectValue placeholder="Selecione o responsável" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Nenhum</SelectItem>
            {membros.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {loading && <p className="text-xs text-muted-foreground mt-1">Salvando...</p>}
        {notifError && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">{notifError}</p>
        )}
      </div>
    </div>
  )
}
