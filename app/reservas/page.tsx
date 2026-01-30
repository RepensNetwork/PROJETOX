import { Header } from "@/components/layout/header"
import { getReservasHotel } from "@/app/actions/reservas"
import { ReservasClient } from "./reservas-client"

interface ReservasPageProps {
  searchParams: Promise<{ dataInicio?: string; dataFim?: string }>
}

export default async function ReservasPage({ searchParams }: ReservasPageProps) {
  const params = await searchParams
  const reservas = await getReservasHotel({
    dataInicio: params.dataInicio,
    dataFim: params.dataFim,
  })

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reservas (Hotel)</h1>
          <p className="text-muted-foreground">
            Tripulantes que precisam de hotel — check-in, check-out, valor, café/almoço e confirmação
          </p>
        </div>

        <ReservasClient
          reservas={reservas}
          filtroInicial={{ dataInicio: params.dataInicio, dataFim: params.dataFim }}
        />
      </main>
    </div>
  )
}
