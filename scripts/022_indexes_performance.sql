-- Índices para acelerar as consultas mais usadas (financeiro, dashboard, listas)
-- Execute no SQL Editor do Supabase: Dashboard > SQL Editor > New query > colar e Run

-- Financeiro: lançamentos filtrados por tipo, status e ordenados por data
CREATE INDEX IF NOT EXISTS idx_financeiro_lancamentos_tipo_data
  ON public.financeiro_lancamentos (tipo, data_vencimento DESC);

CREATE INDEX IF NOT EXISTS idx_financeiro_lancamentos_status
  ON public.financeiro_lancamentos (status) WHERE status IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_financeiro_lancamentos_escala
  ON public.financeiro_lancamentos (escala_id) WHERE escala_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_financeiro_lancamentos_demanda
  ON public.financeiro_lancamentos (demanda_id) WHERE demanda_id IS NOT NULL;

-- Escalas: listagens por data (financeiro, dashboard, intake)
CREATE INDEX IF NOT EXISTS idx_escalas_data_chegada
  ON public.escalas (data_chegada ASC);

CREATE INDEX IF NOT EXISTS idx_escalas_navio
  ON public.escalas (navio_id);

-- Demandas: filtros comuns e sync reserva → financeiro
CREATE INDEX IF NOT EXISTS idx_demandas_reserva_valor
  ON public.demandas (id) WHERE reserva_valor IS NOT NULL AND (reserva_valor > 0);

CREATE INDEX IF NOT EXISTS idx_demandas_escala_status
  ON public.demandas (escala_id, status);

CREATE INDEX IF NOT EXISTS idx_demandas_prazo
  ON public.demandas (prazo) WHERE prazo IS NOT NULL;

-- Comissões
CREATE INDEX IF NOT EXISTS idx_financeiro_comissoes_escala
  ON public.financeiro_comissoes (escala_id);

CREATE INDEX IF NOT EXISTS idx_financeiro_comissoes_data
  ON public.financeiro_comissoes (data_previsao DESC NULLS LAST);
