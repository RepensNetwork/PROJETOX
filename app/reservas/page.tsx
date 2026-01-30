import { Header } from "@/components/layout/header"
import { getReservasHotel } from "@/app/actions/reservas"
import { ReservasClient } from "./reservas-client"

export default async function ReservasPage() {
  const reservas = await getReservasHotel()

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

        <ReservasClient reservas={reservas} />
      </main>
    </div>
  )
}
