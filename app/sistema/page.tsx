'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Ship,
  Hash,
  Building2,
  Calendar,
  MapPin,
  ArrowLeft,
  Pencil,
  Plus,
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

// Dados de exemplo (em produção, viriam de uma API ou banco de dados)
const mockNavio = {
  id: '1',
  nome: 'Navio Exemplo',
  companhia: 'Companhia Marítima ABC',
  observacoes: 'Navio de carga geral',
  escalas: [
    {
      id: '1',
      porto: 'Porto de Santos',
      data_chegada: new Date('2026-01-25T08:00:00'),
      data_saida: new Date('2026-01-27T18:00:00'),
      status: 'em_operacao',
    },
    {
      id: '2',
      porto: 'Porto de Paranaguá',
      data_chegada: new Date('2026-02-01T10:00:00'),
      data_saida: null,
      status: 'planejada',
    },
    {
      id: '3',
      porto: 'Porto de Itajaí',
      data_chegada: new Date('2025-12-15T14:00:00'),
      data_saida: new Date('2025-12-17T16:00:00'),
      status: 'concluida',
    },
  ],
}

const statusColors: Record<string, string> = {
  planejada: 'warning',
  em_operacao: 'primary',
  concluida: 'success',
  cancelada: 'destructive',
}

const statusLabels: Record<string, string> = {
  planejada: 'Planejada',
  em_operacao: 'Em Operação',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
}

export default function SistemaPage() {
  const [navio] = useState(mockNavio)

  const escalasAtivas = navio.escalas.filter(
    (e) => e.status === 'planejada' || e.status === 'em_operacao'
  )
  const escalasPassadas = navio.escalas.filter(
    (e) => e.status === 'concluida' || e.status === 'cancelada'
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Header Section */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 text-gray-100">
              <div className="p-2 rounded-lg bg-blue-600/20 border border-blue-600/30">
                <Ship className="h-6 w-6 text-blue-400" />
              </div>
              {navio.nome}
            </h1>
            <p className="text-gray-400 mt-1">Detalhes e histórico de escalas</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Pencil className="h-4 w-4" />
            Editar
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Navio</CardTitle>
              <CardDescription>Dados cadastrais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-800/30 border border-gray-700/50">
                <div className="p-2 rounded-lg bg-blue-600/20 border border-blue-600/30">
                  <Building2 className="h-5 w-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                    Companhia
                  </p>
                  <p className="text-base text-gray-100 font-medium">
                    {navio.companhia}
                  </p>
                </div>
              </div>
              {navio.observacoes && (
                <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-800/30 border border-gray-700/50">
                  <div className="p-2 rounded-lg bg-purple-600/20 border border-purple-600/30">
                    <Hash className="h-5 w-5 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                      Observações
                    </p>
                    <p className="text-base text-gray-200">{navio.observacoes}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
              <CardDescription>Estatísticas de escalas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-6 rounded-lg bg-gradient-to-br from-blue-600/20 to-blue-700/10 border border-blue-600/30 hover:border-blue-600/50 transition-all">
                  <p className="text-4xl font-bold text-blue-400 mb-2">
                    {escalasAtivas.length}
                  </p>
                  <p className="text-sm font-medium text-gray-300">
                    Escalas Ativas
                  </p>
                </div>
                <div className="text-center p-6 rounded-lg bg-gradient-to-br from-gray-800/50 to-gray-800/30 border border-gray-700/50 hover:border-gray-600/50 transition-all">
                  <p className="text-4xl font-bold text-gray-200 mb-2">
                    {escalasPassadas.length}
                  </p>
                  <p className="text-sm font-medium text-gray-300">
                    Escalas Anteriores
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {escalasAtivas.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Escalas Ativas</CardTitle>
              <CardDescription>Escalas agendadas ou em andamento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {escalasAtivas.map((escala) => (
                  <Link
                    key={escala.id}
                    href={`/sistema/escalas/${escala.id}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-5 rounded-lg border border-gray-700/50 bg-gray-800/30 hover:bg-gray-800/50 hover:border-gray-600/50 transition-all cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-blue-600/20 border border-blue-600/30 group-hover:bg-blue-600/30 transition-colors">
                          <MapPin className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                          <span className="font-semibold text-gray-100 text-base">
                            {escala.porto}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="flex items-center gap-2 text-sm text-gray-300">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">
                              Chegada:{' '}
                              {format(
                                new Date(escala.data_chegada),
                                'dd/MM/yyyy HH:mm'
                              )}
                            </span>
                          </div>
                          {escala.data_saida && (
                            <p className="text-xs text-gray-400 mt-1">
                              Saída:{' '}
                              {format(
                                new Date(escala.data_saida),
                                'dd/MM/yyyy HH:mm'
                              )}
                            </p>
                          )}
                        </div>
                        <Badge variant={statusColors[escala.status] as any}>
                          {statusLabels[escala.status]}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {escalasPassadas.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Escalas</CardTitle>
              <CardDescription>Escalas concluídas ou canceladas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {escalasPassadas.map((escala) => (
                  <Link
                    key={escala.id}
                    href={`/sistema/escalas/${escala.id}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-5 rounded-lg border border-gray-700/50 bg-gray-800/20 hover:bg-gray-800/40 hover:border-gray-600/50 transition-all cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-gray-700/30 border border-gray-600/30 group-hover:bg-gray-700/50 transition-colors">
                          <MapPin className="h-5 w-5 text-gray-400" />
                        </div>
                        <div>
                          <span className="font-medium text-gray-300 text-base">
                            {escala.porto}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span>
                              {format(
                                new Date(escala.data_chegada),
                                'dd/MM/yyyy'
                              )}
                            </span>
                          </div>
                        </div>
                        <Badge variant={statusColors[escala.status] as any}>
                          {statusLabels[escala.status]}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
