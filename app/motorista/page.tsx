import { Header } from "@/components/layout/header"
import { MotoristaClient } from "@/app/motorista/motorista-client"
import { getTransportesDoDia } from "@/app/actions/transportes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface MotoristaPageProps {
  searchParams?: { date?: string; tipo?: string }
}

export default async function MotoristaPage({ searchParams }: MotoristaPageProps) {
  const date = searchParams?.date
  const tipo = searchParams?.tipo
  const transportes = await getTransportesDoDia(date, tipo)

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
  const defaultDate = date || todayValue

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
                placeholder="dd/mm/aaaa"
                defaultValue={defaultDate}
              />
            </div>
            <Button type="submit">Filtrar</Button>
            <Button type="button" variant="outline" asChild>
              <a href={`/motorista?date=${todayValue}`}>Hoje</a>
            </Button>
            <Button type="button" variant="outline" asChild>
              <a href={`/motorista?date=${tomorrowValue}`}>Amanhã</a>
            </Button>
            <Button type="button" variant="ghost" asChild>
              <a href="/motorista?date=all">Todos</a>
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" asChild>
              <a href={`/motorista?date=${defaultDate}&tipo=desembarque_passageiros`}>Desembark</a>
            </Button>
            <Button type="button" variant="outline" size="sm" asChild>
              <a href={`/motorista?date=${defaultDate}&tipo=embarque_passageiros`}>Embark</a>
            </Button>
            <Button type="button" variant="outline" size="sm" asChild>
              <a href={`/motorista?date=${defaultDate}&tipo=visita_medica`}>Visita médica</a>
            </Button>
            <Button type="button" variant="ghost" size="sm" asChild>
              <a href={`/motorista?date=${defaultDate}`}>Limpar tipo</a>
            </Button>
          </div>
        </form>

        <MotoristaClient transportes={transportes} />
      </main>
    </div>
  )
}
