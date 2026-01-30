-- Notificações de demanda (ex.: "Você foi atribuído como responsável")
-- Execute este script no Supabase (SQL Editor) para que o responsável receba notificação ao ser atribuído.
CREATE TABLE IF NOT EXISTS public.notificacoes_demanda (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demanda_id UUID NOT NULL REFERENCES public.demandas(id) ON DELETE CASCADE,
  membro_id UUID NOT NULL REFERENCES public.membros(id) ON DELETE CASCADE,
  lida BOOLEAN DEFAULT FALSE,
  lida_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notificacoes_demanda_membro ON public.notificacoes_demanda(membro_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_demanda_demanda ON public.notificacoes_demanda(demanda_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_demanda_lida ON public.notificacoes_demanda(lida);

ALTER TABLE public.notificacoes_demanda ENABLE ROW LEVEL SECURITY;
-- Permite que qualquer usuário autenticado insira (quem atribui) e leia (quem foi atribuído)
DROP POLICY IF EXISTS "Allow all for notificacoes_demanda" ON public.notificacoes_demanda;
CREATE POLICY "Allow all for notificacoes_demanda" ON public.notificacoes_demanda
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
