-- Tabela de Notificações
-- Notificações geradas quando um membro é mencionado (@mention) em uma mensagem

CREATE TABLE IF NOT EXISTS public.notificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mensagem_id UUID NOT NULL REFERENCES public.mensagens(id) ON DELETE CASCADE,
  membro_id UUID NOT NULL REFERENCES public.membros(id) ON DELETE CASCADE,
  escala_id UUID NOT NULL REFERENCES public.escalas(id) ON DELETE CASCADE,
  lida BOOLEAN DEFAULT FALSE,
  lida_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Menções em Mensagens
-- Armazena quais membros foram mencionados em cada mensagem

CREATE TABLE IF NOT EXISTS public.mensagem_mencoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mensagem_id UUID NOT NULL REFERENCES public.mensagens(id) ON DELETE CASCADE,
  membro_id UUID NOT NULL REFERENCES public.membros(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(mensagem_id, membro_id)
);

-- Tabela de Leituras de Mensagens
-- Rastreia quando cada membro leu cada mensagem

CREATE TABLE IF NOT EXISTS public.mensagem_leituras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mensagem_id UUID NOT NULL REFERENCES public.mensagens(id) ON DELETE CASCADE,
  membro_id UUID NOT NULL REFERENCES public.membros(id) ON DELETE CASCADE,
  lida_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(mensagem_id, membro_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_notificacoes_membro ON public.notificacoes(membro_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_escala ON public.notificacoes(escala_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON public.notificacoes(lida);
CREATE INDEX IF NOT EXISTS idx_notificacoes_mensagem ON public.notificacoes(mensagem_id);
CREATE INDEX IF NOT EXISTS idx_mensagem_mencoes_mensagem ON public.mensagem_mencoes(mensagem_id);
CREATE INDEX IF NOT EXISTS idx_mensagem_mencoes_membro ON public.mensagem_mencoes(membro_id);
CREATE INDEX IF NOT EXISTS idx_mensagem_leituras_mensagem ON public.mensagem_leituras(mensagem_id);
CREATE INDEX IF NOT EXISTS idx_mensagem_leituras_membro ON public.mensagem_leituras(membro_id);

-- Enable Row Level Security
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensagem_mencoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensagem_leituras ENABLE ROW LEVEL SECURITY;

-- RLS Policies (permissive for small team)
CREATE POLICY "Allow all for notificacoes" ON public.notificacoes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for mensagem_mencoes" ON public.mensagem_mencoes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for mensagem_leituras" ON public.mensagem_leituras FOR ALL USING (true) WITH CHECK (true);
