-- Tabela de Mensagens do Chat Interno
-- Todas as mensagens estão vinculadas a uma escala específica

CREATE TABLE IF NOT EXISTS public.mensagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escala_id UUID NOT NULL REFERENCES public.escalas(id) ON DELETE CASCADE,
  membro_id UUID NOT NULL REFERENCES public.membros(id) ON DELETE CASCADE,
  conteudo TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_mensagens_escala ON public.mensagens(escala_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_membro ON public.mensagens(membro_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_created_at ON public.mensagens(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.mensagens ENABLE ROW LEVEL SECURITY;

-- RLS Policy (permissive for small team - all authenticated can CRUD)
CREATE POLICY "Allow all for mensagens" ON public.mensagens FOR ALL USING (true) WITH CHECK (true);
