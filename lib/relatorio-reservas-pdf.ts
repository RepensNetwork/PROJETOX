import type { ReservaItem } from "@/lib/reservas"
import { getTripulanteNome } from "@/lib/reservas"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"

function formatDate(value: string | null | undefined): string {
  if (!value) return "—"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return "—"
  return format(d, "dd/MM/yyyy", { locale: ptBR })
}

function formatCurrency(value: number | null | undefined): string {
  if (value == null || value === undefined) return "—"
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value))
}

interface JsPDFWithAutoTable {
  lastAutoTable?: { finalY: number }
  addPage: (size?: string | number[], orientation?: string) => void
  save: (name: string) => void
}

export interface RelatorioReservasPDFParams {
  reservas: ReservaItem[]
  dataInicio?: string
  dataFim?: string
}

export async function gerarRelatorioReservasPDF(
  params: RelatorioReservasPDFParams
): Promise<void> {
  const { reservas, dataInicio, dataFim } = params
  const { jsPDF } = await import("jspdf")
  const autoTable = (await import("jspdf-autotable")).default
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" }) as unknown as JsPDFWithAutoTable
  const margin = 12
  let y = margin
  const lineHeight = 6

  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.text("Relatório de Reservas (Hotel)", margin, y)
  y += lineHeight + 2

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text("Reservas da página atual (lista exibida no momento da geração).", margin, y)
  y += lineHeight
  const periodo =
    dataInicio || dataFim
      ? `Período (check-in): ${dataInicio ?? "..."} a ${dataFim ?? "..."}`
      : "Todos os períodos"
  doc.text(periodo, margin, y)
  y += lineHeight
  doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, margin, y)
  y += lineHeight
  doc.text(`Total: ${reservas.length} reserva(s)`, margin, y)
  y += lineHeight + 4

  const headers = [
    "Tripulante",
    "Hotel",
    "Endereço",
    "Navio / Escala",
    "Check-in",
    "Check-out",
    "Valor",
    "Café",
    "Almoço",
    "Confirmado",
  ]
  const body = reservas.map((r) => [
    getTripulanteNome(r),
    r.reserva_hotel_nome ?? "—",
    r.reserva_hotel_endereco ?? "—",
    `${r.escala?.navio?.nome ?? "—"} / ${r.escala?.porto ?? "—"}`,
    formatDate(r.reserva_checkin),
    formatDate(r.reserva_checkout),
    formatCurrency(r.reserva_valor),
    r.reserva_cafe_incluso ? "Sim" : "Não",
    r.reserva_almoco_incluso ? "Sim" : "Não",
    r.reserva_confirmado ? "Sim" : "Não",
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
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 28 },
      2: { cellWidth: 45 },
      3: { cellWidth: 30 },
      4: { cellWidth: 22 },
      5: { cellWidth: 22 },
      6: { cellWidth: 22 },
      7: { cellWidth: 14 },
      8: { cellWidth: 14 },
      9: { cellWidth: 20 },
    },
    margin: { left: margin },
    tableWidth: "wrap",
  })

  const fileName = `reservas-hotel-${format(new Date(), "yyyy-MM-dd")}.pdf`
  doc.save(fileName)
}
