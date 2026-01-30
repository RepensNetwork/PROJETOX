-- Alertas globais: nova demanda / novo transporte (sino + dashboard)
-- Execute no Supabase (SQL Editor) para notificações de novas demandas e transportes.
CREATE TABLE IF NOT EXISTS public.alertas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL CHECK (tipo IN ('nova_demanda', 'novo_transporte')),
  demanda_id UUID NOT NULL REFERENCES public.demandas(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alertas_created_at ON public.alertas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alertas_demanda ON public.alertas(demanda_id);
CREATE INDEX IF NOT EXISTS idx_alertas_tipo ON public.alertas(tipo);

ALTER TABLE public.alertas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow read alertas" ON public.alertas;
CREATE POLICY "Allow read alertas" ON public.alertas FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow insert alertas" ON public.alertas;
CREATE POLICY "Allow insert alertas" ON public.alertas FOR INSERT TO authenticated WITH CHECK (true);
