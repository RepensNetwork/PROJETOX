"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Upload, Loader2, FileText, AlertCircle, CheckCircle2, Download } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface CSVImporterProps {
  title: string
  description: string
  onImport: (data: any[]) => Promise<{ success: boolean; imported: number; errors?: string[] }>
  exampleHeaders: string[]
  exampleRow: string[]
  exampleRows?: string[][] // Múltiplas linhas de exemplo
  trigger?: React.ReactNode
}

export function CSVImporter({
  title,
  description,
  onImport,
  exampleHeaders,
  exampleRow,
  exampleRows,
  trigger,
}: CSVImporterProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<any[]>([])
  const [result, setResult] = useState<{
    success: boolean
    imported: number
    errors?: string[]
  } | null>(null)

  const downloadTemplate = () => {
    const rows = exampleRows || [exampleRow]
    const csvContent = [
      exampleHeaders.join(','),
      ...rows.map(row => row.map(cell => {
        // Se a célula contém vírgula ou aspas, envolver em aspas
        if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
          return `"${cell.replace(/"/g, '""')}"`
        }
        return cell
      }).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `template_${title.toLowerCase().replace(/\s+/g, '_')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (!selectedFile.name.endsWith('.csv')) {
      alert("Por favor, selecione um arquivo CSV")
      return
    }

    setFile(selectedFile)
    setResult(null)

    // Preview do arquivo
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const lines = text.split('\n').filter(line => line.trim())
      const headers = lines[0]?.split(',').map(h => h.trim())
      const rows = lines.slice(1, 6).map(line => 
        line.split(',').map(cell => cell.trim())
      )
      setPreview(rows)
    }
    reader.readAsText(selectedFile)
  }

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim())
    if (lines.length < 2) return []

    // Função para parsear linha CSV considerando aspas
    const parseLine = (line: string): string[] => {
      const result: string[] = []
      let current = ''
      let inQuotes = false

      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        const nextChar = line[i + 1]

        if (char === '"') {
          if (inQuotes && nextChar === '"') {
            current += '"'
            i++ // Pular próxima aspas
          } else {
            inQuotes = !inQuotes
          }
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      result.push(current.trim())
      return result
    }

    const headers = parseLine(lines[0]).map(h => h.replace(/^"|"$/g, '').trim().toLowerCase())
    const rows = lines.slice(1).map(line => {
      const values = parseLine(line).map(v => v.replace(/^"|"$/g, '').trim())
      const obj: any = {}
      headers.forEach((header, index) => {
        obj[header] = values[index] || ''
      })
      return obj
    })

    return rows.filter(row => Object.values(row).some(v => v))
  }

  const handleImport = async () => {
    if (!file) return

    setLoading(true)
    setResult(null)

    try {
      const text = await file.text()
      const data = parseCSV(text)

      if (data.length === 0) {
        setResult({
          success: false,
          imported: 0,
          errors: ["Nenhum dado encontrado no arquivo CSV"],
        })
        setLoading(false)
        return
      }

      const importResult = await onImport(data)
      setResult(importResult)

      if (importResult.success) {
        setTimeout(() => {
          setOpen(false)
          setFile(null)
          setPreview([])
          setResult(null)
          window.location.reload()
        }, 2000)
      }
    } catch (error: any) {
      setResult({
        success: false,
        imported: 0,
        errors: [error.message || "Erro ao processar arquivo CSV"],
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Importar CSV
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Selecionar arquivo CSV</label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
            </div>
            <div className="pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={downloadTemplate}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Baixar Template
              </Button>
            </div>
          </div>

          {file && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>{file.name}</span>
              </div>
            </div>
          )}

          {preview.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Preview (primeiras 5 linhas)</label>
              <div className="rounded-md border overflow-auto max-h-48">
                <table className="w-full text-xs">
                  <thead className="bg-muted">
                    <tr>
                      {exampleHeaders.map((header, i) => (
                        <th key={i} className="px-2 py-1 text-left font-medium">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} className="border-t">
                        {exampleHeaders.map((_, j) => (
                          <td key={j} className="px-2 py-1">
                            {row[j] || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <p className="text-sm font-medium">Formato esperado do CSV:</p>
            <div className="text-xs space-y-1">
              <p className="font-mono bg-background p-2 rounded">
                {exampleHeaders.join(', ')}
              </p>
              <p className="font-mono bg-background p-2 rounded">
                {exampleRow.join(', ')}
              </p>
            </div>
          </div>

          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              {result.success ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                {result.success ? (
                  <div>
                    <p className="font-medium">Importação concluída!</p>
                    <p className="text-sm">{result.imported} registro(s) importado(s) com sucesso.</p>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium">Erro na importação</p>
                    {result.errors?.map((error, i) => (
                      <p key={i} className="text-sm">{error}</p>
                    ))}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setOpen(false)
              setFile(null)
              setPreview([])
              setResult(null)
            }}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleImport}
            disabled={!file || loading}
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Importar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
