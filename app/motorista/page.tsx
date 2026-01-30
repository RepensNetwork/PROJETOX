import dynamic from "next/dynamic"
import { Header } from "@/components/layout/header"
import { getTransportesDoDia } from "@/app/actions/transportes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const MotoristaClient = dynamic(
  () => import("@/app/motorista/motorista-client").then((m) => m.MotoristaClient),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse rounded-lg border bg-card p-6 space-y-3">
        <div className="h-4 w-1/3 rounded bg-muted" />
        <div className="h-20 rounded bg-muted" />
        <div className="h-20 rounded bg-muted" />
      </div>
    ),
  }
)

interface MotoristaPageProps {
  searchParams?: { date?: string; tipo?: string }
}

export default async function MotoristaPage({ searchParams }: MotoristaPageProps) {
  const date = searchParams?.date
  const tipo = searchParams?.tipo
  /** Sem data na URL = puxar todos os transportes. */
  const dateForFetch = date && date !== "all" && date.toLowerCase() !== "todos" ? date : "all"
  const transportes = await getTransportesDoDia(dateForFetch, tipo)

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
  const defaultDate = date || "all"
  const inputDateValue = date && date !== "all" && date.toLowerCase() !== "todos" ? date : ""

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Transportes do dia</h1>
            <p className="text-muted-foreground">Visão simples para o motorista confirmar as viagens</p>
          </div>
        </div>

        <form method="get" className="rounded-lg border bg-card p-4 space-y-3">
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                name="date"
                type="text"
                inputMode="numeric"
                placeholder="dd/mm/aaaa (deixe vazio = todos)"
                defaultValue={inputDateValue}
              />
            </div>
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

        <MotoristaClient transportes={transportes} dataFiltro={defaultDate} />
      </main>
    </div>
  )
}
