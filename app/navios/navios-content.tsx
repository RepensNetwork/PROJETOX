import { getNavios } from "@/app/actions/navios"
import { NaviosTable } from "@/components/navios/navios-table"
import { NavioForm } from "@/components/navios/navio-form"
import { CSVImporter } from "@/components/import/csv-importer"
import { importNavios } from "@/app/actions/import"

export async function NaviosContent() {
  const navios = await getNavios()

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Navios</h1>
          <p className="text-muted-foreground">
            Gerencie a frota de navios cadastrados
          </p>
        </div>
        <div className="flex gap-2">
        <CSVImporter
          title="Importar Navios"
          description="Importe navios a partir de um arquivo CSV"
          onImport={importNavios}
          exampleHeaders={["nome", "companhia", "observacoes"]}
          exampleRow={["Navio Exemplo", "Companhia ABC", "Navio de carga geral"]}
          exampleRows={[
            ["Navio Exemplo", "Companhia ABC", "Navio de carga geral"],
            ["Outro Navio", "Companhia XYZ", "Navio de passageiros"],
            ["Terceiro Navio", "Companhia DEF", ""]
          ]}
        />
        <NavioForm />
        </div>
      </div>
      <NaviosTable navios={navios} />
    </>
  )
}
