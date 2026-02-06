import { Suspense } from "react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { getEscalasForSelect } from "@/app/actions/demandas"
import { getMembros } from "@/app/actions/dashboard"
import { MotoristaContent } from "./motorista-content"
import { MotoristaDatePicker } from "./motorista-date-picker"
import { MotoristaNovaDemanda } from "./motorista-nova-demanda"

interface MotoristaPageProps {
  searchParams?: { date?: string; tipo?: string }
}

function MotoristaSkeleton() {
  return <div className="animate-pulse rounded-xl border bg-card p-6 h-64 space-y-3"><div className="h-4 w-1/3 rounded bg-muted" /><div className="h-20 rounded bg-muted" /><div className="h-20 rounded bg-muted" /></div>
}

export default async function MotoristaPage({ searchParams }: MotoristaPageProps) {
  const params = searchParams || {}
  const date = params?.date
  const tipo = params?.tipo
  const dateForFetch = date && date !== "all" && date.toLowerCase() !== "todos" ? date : "all"
  const defaultDate = date || "all"
  const today = new Date()
  const formatDate = (value: Date) => {
    const day = String(value.getDate()).padStart(2, "0")
    const month = String(value.getMonth() + 1).padStart(2, "0")
    const year = value.getFullYear()
    return `${day}/${month}/${year}`
  }
  const todayValue = formatDate(today)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowValue = formatDate(tomorrow)
  const inputDateValue = date && date !== "all" && date.toLowerCase() !== "todos" ? date : ""

  const [escalas, membros] = await Promise.all([
    getEscalasForSelect(),
    getMembros(),
  ])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Transportes do dia</h1>
            <p className="text-muted-foreground">Visão simples para o motorista confirmar as viagens</p>
          </div>
          <MotoristaNovaDemanda escalas={escalas} membros={membros} />
        </div>

        <form method="get" className="rounded-xl border bg-card p-4 space-y-3">
          <div className="flex flex-wrap items-end gap-3">
            <MotoristaDatePicker defaultValue={inputDateValue} />
            <Button type="submit">Filtrar</Button>
            <Button type="button" variant="outline" asChild>
              <a href={`/motorista?date=${todayValue}`}>Hoje</a>
            </Button>
            <Button type="button" variant="outline" asChild>
              <a href={`/motorista?date=${tomorrowValue}`}>Amanhã</a>
            </Button>
            <Button type="button" variant="outline" asChild>
              <a href="/motorista">Todos</a>
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" asChild>
              <a href={defaultDate !== "all" ? `/motorista?date=${defaultDate}&tipo=desembarque_passageiros` : "/motorista?tipo=desembarque_passageiros"}>Desembark</a>
            </Button>
            <Button type="button" variant="outline" size="sm" asChild>
              <a href={defaultDate !== "all" ? `/motorista?date=${defaultDate}&tipo=embarque_passageiros` : "/motorista?tipo=embarque_passageiros"}>Embark</a>
            </Button>
            <Button type="button" variant="outline" size="sm" asChild>
              <a href={defaultDate !== "all" ? `/motorista?date=${defaultDate}&tipo=visita_medica` : "/motorista?tipo=visita_medica"}>Visita médica</a>
            </Button>
            <Button type="button" variant="ghost" size="sm" asChild>
              <a href={defaultDate !== "all" ? `/motorista?date=${defaultDate}` : "/motorista"}>Limpar tipo</a>
            </Button>
          </div>
        </form>

        <Suspense fallback={<MotoristaSkeleton />}>
          <MotoristaContent dateForFetch={dateForFetch} defaultDate={defaultDate} tipo={tipo} />
        </Suspense>
      </main>
    </div>
  )
}
