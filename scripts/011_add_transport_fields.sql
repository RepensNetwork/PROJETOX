-- Campos de transporte para demandas (motorista)
ALTER TABLE public.demandas
  ADD COLUMN IF NOT EXISTS pickup_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS pickup_local TEXT,
  ADD COLUMN IF NOT EXISTS dropoff_local TEXT,
  ADD COLUMN IF NOT EXISTS transporte_status TEXT DEFAULT 'pendente',
  ADD COLUMN IF NOT EXISTS transporte_modalidade TEXT,
  ADD COLUMN IF NOT EXISTS transporte_grupo TEXT,
  ADD COLUMN IF NOT EXISTS transporte_concluido_em TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS transporte_legs JSONB;

CREATE INDEX IF NOT EXISTS idx_demandas_pickup_at ON public.demandas(pickup_at);
