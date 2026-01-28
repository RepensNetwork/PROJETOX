"use client"

import { useState } from "react"
import { DemandasList } from "@/components/dashboard/demandas-list"
import { DemandasFilter } from "@/components/dashboard/demandas-filter"
import type { Demanda, Membro, Escala, Navio } from "@/lib/types/database"

interface DemandasClientProps {
  urgentDemandas: (Demanda & { escala: Escala & { navio: Navio }; responsavel: Membro | null })[]
  recentDemandas: (Demanda & { escala: Escala & { navio: Navio }; responsavel: Membro | null })[]
  todayDemandas: (Demanda & { escala: Escala & { navio: Navio }; responsavel: Membro | null })[]
  membros: Membro[]
}

export function DemandasClient({ urgentDemandas, recentDemandas, todayDemandas, membros }: DemandasClientProps) {
  const [responsavelFilter, setResponsavelFilter] = useState<string | null>(null)

  const filterDemandas = (demandas: typeof urgentDemandas) => {
    if (!responsavelFilter) return demandas
    return demandas.filter(d => d.responsavel_id === responsavelFilter)
  }

  const filteredUrgentDemandas = filterDemandas(urgentDemandas)
  const filteredRecentDemandas = filterDemandas(recentDemandas)
  const filteredTodayDemandas = filterDemandas(todayDemandas)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-lg font-semibold">Demandas</h2>
          <p className="text-sm text-muted-foreground">
            {responsavelFilter 
              ? `Filtrado por: ${membros.find(m => m.id === responsavelFilter)?.nome || "Responsável"}`
              : "Todas as demandas"
            }
          </p>
        </div>
        <DemandasFilter
          membros={membros}
          responsavelId={responsavelFilter}
          onFilterChange={setResponsavelFilter}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {filteredUrgentDemandas.length > 0 && (
            <DemandasList 
              demandas={filteredUrgentDemandas}
              title="Demandas Urgentes"
              description="Demandas críticas, de alta prioridade ou atrasadas"
              showUrgent
            />
          )}

          <DemandasList
            demandas={filteredTodayDemandas}
            title="Demandas do Dia"
            description="Demandas com prazo ou escala para hoje"
            emptyMessage="Nenhuma demanda para hoje"
          />
        </div>

        <div className="space-y-6">
          <DemandasList 
            demandas={filteredRecentDemandas.slice(0, 5)}
            title="Atividade Recente"
            description="Últimas demandas atualizadas"
            emptyMessage="Nenhuma atividade recente"
          />
        </div>
      </div>
    </div>
  )
}
