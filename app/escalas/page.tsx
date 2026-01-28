import { Header } from "@/components/layout/header"
import { EscalasTable } from "@/components/escalas/escalas-table"
import { EscalaForm } from "@/components/escalas/escala-form"
import { getEscalas } from "@/app/actions/escalas"
import { getNavios } from "@/app/actions/navios"
import { CSVImporter } from "@/components/import/csv-importer"
import { importEscalas } from "@/app/actions/import"

export default async function EscalasPage() {
  const [escalas, navios] = await Promise.all([
    getEscalas(),
    getNavios(),
  ])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Escalas</h1>
            <p className="text-muted-foreground">
              Gerencie todas as escalas dos navios
            </p>
          </div>
          <div className="flex gap-2">
            <CSVImporter
              title="Importar Escalas"
              description="Importe escalas a partir de um arquivo CSV. Os navios devem estar cadastrados primeiro."
              onImport={importEscalas}
              exampleHeaders={[
                "navio",
                "porto",
                "data_chegada",
                "data_saida",
                "voy",
                "procedencia",
                "destino",
                "status",
                "observacoes",
              ]}
              exampleRow={[
                "Navio Exemplo",
                "Santos - SP",
                "2025-01-25T08:00:00",
                "2025-01-27T18:00:00",
                "A123",
                "Fortaleza - CE",
                "Santos - SP",
                "planejada",
                "",
              ]}
              exampleRows={[
                [
                  "Navio Exemplo",
                  "Santos - SP",
                  "2025-01-25T08:00:00",
                  "2025-01-27T18:00:00",
                  "A123",
                  "Fortaleza - CE",
                  "Santos - SP",
                  "planejada",
                  "",
                ],
                [
                  "Outro Navio",
                  "Paranaguá - PR",
                  "2025-02-01T10:00:00",
                  "2025-02-03T18:00:00",
                  "B456",
                  "Rio de Janeiro - RJ",
                  "Paranaguá - PR",
                  "em_operacao",
                  "",
                ],
                [
                  "Terceiro Navio",
                  "Rio Grande - RS",
                  "2025-02-10T14:00:00",
                  "",
                  "",
                  "",
                  "",
                  "planejada",
                  "Escala rápida",
                ],
              ]}
            />
            <EscalaForm navios={navios} />
          </div>
        </div>

        <EscalasTable escalas={escalas} navios={navios} />
      </main>
    </div>
  )
}
