import type { TransporteLeg } from "./transportes"
import type { Demanda, Escala, Navio } from "@/lib/types/database"

type TransporteItem = Demanda & { escala: Escala & { navio: Navio } }
type Entry = { demanda: TransporteItem; leg: TransporteLeg }

function formatDateTime(value?: string | null): string {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function safeStr(value: string | null | undefined): string {
  return value != null ? String(value).trim() : "—"
}

interface JsPDFWithAutoTable {
  lastAutoTable?: { finalY: number }
  addPage: (size?: string | number[], orientation?: string) => void
  save: (name: string) => void
}

export interface RelatorioTransportesPDFParams {
  porHorario: { slot: string; entries: Entry[] }[]
  resumo: { total: number; pendentes: number; concluidas: number; viagens: number }
  dataFiltro?: string
}

export async function gerarRelatorioTransportesPDF(params: RelatorioTransportesPDFParams): Promise<void> {
  const { porHorario, resumo, dataFiltro } = params
  const { jsPDF } = await import("jspdf")
  await import("jspdf-autotable")
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" }) as unknown as JsPDFWithAutoTable
  const margin = 12
  let y = margin
  const lineHeight = 6
  const smallLine = 4

  // Título
  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.text("Relatório de Transportes", margin, y)
  y += lineHeight + 2

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  const dataRelatorio =
    dataFiltro && dataFiltro !== "all" && dataFiltro.toLowerCase() !== "todos"
      ? `Data: ${dataFiltro}`
      : "Período: Todos os transportes"
  doc.text(dataRelatorio, margin, y)
  y += smallLine
  doc.text(`Gerado em: ${formatDateTime(new Date().toISOString())}`, margin, y)
  y += smallLine + 2

  // Resumo
  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.text("Resumo", margin, y)
  y += lineHeight
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.text(
    `${resumo.total} viagem(ns) em ${resumo.viagens} horário(s) • ${resumo.pendentes} pendente(s) • ${resumo.concluidas} concluída(s)`,
    margin,
    y
  )
  y += lineHeight + 4

  const colWidths = [26, 20, 16, 20, 20, 20, 26, 16, 16, 20, 50]
  const headers = [
    "Tripulante",
    "Navio",
    "Porto",
    "Trecho",
    "Origem",
    "Destino",
    "Horário busca",
    "Status",
    "Nº viagem",
    "Voo/obs",
    "Descrição",
  ]

  const autoTable = (await import("jspdf-autotable")).default

  for (const { slot, entries } of porHorario) {
    if (y > 170) {
      doc.addPage("a4", "landscape")
      y = margin
    }

    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    const slotLabel =
      slot === "A definir"
        ? "Viagem a definir"
        : slot.includes(" ")
          ? `Viagem em ${slot.split(" ")[0]} às ${slot.split(" ")[1]}`
          : `Viagem às ${slot}`
    doc.text(`${slotLabel} (${entries.length} ${entries.length === 1 ? "tripulante" : "tripulantes"})`, margin, y)
    y += lineHeight + 2

    const body = entries.map(({ demanda, leg }) => [
      safeStr(demanda.titulo),
      safeStr(demanda.escala?.navio?.nome),
      safeStr(demanda.escala?.porto),
      safeStr(leg.label),
      safeStr(leg.pickup_local),
      safeStr(leg.dropoff_local),
      leg.pickup_at ? formatDateTime(leg.pickup_at) : "—",
      leg.status === "concluido" ? "Concluído" : "Pendente",
      safeStr(leg.grupo),
      safeStr(leg.observacao),
      safeStr(demanda.descricao),
    ])

    autoTable(doc, {
      startY: y,
      head: [headers],
      body,
      theme: "grid",
      styles: {
        fontSize: 8,
        overflow: "linebreak",
        cellPadding: 2,
      },
      headStyles: { fillColor: [66, 66, 66], fontSize: 8 },
      columnStyles: Object.fromEntries(
        headers.map((_, i) => [i, { cellWidth: colWidths[i] ?? "auto" }])
      ) as Record<number, { cellWidth: number | "auto" }>,
      margin: { left: margin },
      tableWidth: "wrap",
    })

    y = (doc.lastAutoTable?.finalY ?? y) + 6
  }

  const fileName =
    `relatorio-transportes-${dataFiltro && dataFiltro !== "all" ? dataFiltro.replace(/\//g, "-") : "todos"}-${new Date().toISOString().slice(0, 10)}.pdf`
  doc.save(fileName)
}
