-- Módulo Financeiro - Agenciamento Marítimo de Cruzeiros
-- Centros de custo, categorias, contas, lançamentos (receber/pagar), comissões

-- 1. CATEGORIAS (receita/despesa)
CREATE TABLE IF NOT EXISTS public.financeiro_categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  cor TEXT DEFAULT '#6366f1',
  icone TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CONTAS (caixa, bancos)
CREATE TABLE IF NOT EXISTS public.financeiro_contas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('caixa', 'banco', 'outro')),
  instituicao TEXT,
  agencia TEXT,
  numero TEXT,
  saldo_inicial NUMERIC(15,2) DEFAULT 0,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. LANÇAMENTOS (contas a receber + contas a pagar + movimentações)
CREATE TABLE IF NOT EXISTS public.financeiro_lancamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conta_id UUID REFERENCES public.financeiro_contas(id) ON DELETE SET NULL,
  categoria_id UUID REFERENCES public.financeiro_categorias(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  valor NUMERIC(15,2) NOT NULL CHECK (valor > 0),
  data_vencimento DATE NOT NULL,
  data_liquidacao DATE,
  descricao TEXT,
  documento_ref TEXT,
  escala_id UUID REFERENCES public.escalas(id) ON DELETE SET NULL,
  demanda_id UUID REFERENCES public.demandas(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'previsto' CHECK (status IN ('rascunho', 'previsto', 'confirmado', 'liquidado', 'cancelado')),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.membros(id) ON DELETE SET NULL
);

-- 4. COMISSÕES (por escala/serviço - típico de agenciamento)
CREATE TABLE IF NOT EXISTS public.financeiro_comissoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escala_id UUID NOT NULL REFERENCES public.escalas(id) ON DELETE CASCADE,
  descricao TEXT,
  valor_bruto NUMERIC(15,2) NOT NULL DEFAULT 0,
  percentual_comissao NUMERIC(5,2) NOT NULL DEFAULT 0,
  valor_comissao NUMERIC(15,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'calculada', 'faturada', 'paga', 'cancelada')),
  data_previsao DATE,
  data_recebimento DATE,
  lancamento_id UUID REFERENCES public.financeiro_lancamentos(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_fin_cat_tipo ON public.financeiro_categorias(tipo);
CREATE INDEX IF NOT EXISTS idx_fin_lanc_tipo ON public.financeiro_lancamentos(tipo);
CREATE INDEX IF NOT EXISTS idx_fin_lanc_status ON public.financeiro_lancamentos(status);
CREATE INDEX IF NOT EXISTS idx_fin_lanc_data_venc ON public.financeiro_lancamentos(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_fin_lanc_escala ON public.financeiro_lancamentos(escala_id);
CREATE INDEX IF NOT EXISTS idx_fin_lanc_demanda ON public.financeiro_lancamentos(demanda_id);
CREATE INDEX IF NOT EXISTS idx_fin_lanc_conta ON public.financeiro_lancamentos(conta_id);
CREATE INDEX IF NOT EXISTS idx_fin_com_escala ON public.financeiro_comissoes(escala_id);
CREATE INDEX IF NOT EXISTS idx_fin_com_status ON public.financeiro_comissoes(status);

-- RLS
ALTER TABLE public.financeiro_categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financeiro_contas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financeiro_lancamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financeiro_comissoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all financeiro_categorias" ON public.financeiro_categorias FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all financeiro_contas" ON public.financeiro_contas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all financeiro_lancamentos" ON public.financeiro_lancamentos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all financeiro_comissoes" ON public.financeiro_comissoes FOR ALL USING (true) WITH CHECK (true);

-- Seed categorias iniciais (agenciamento marítimo) - só se vazio
INSERT INTO public.financeiro_categorias (nome, tipo, cor, icone)
SELECT v.nome, v.tipo, v.cor, v.icone FROM (VALUES
  ('Comissão agenciamento', 'receita', '#22c55e', 'percent'),
  ('Serviços portuários', 'receita', '#3b82f6', 'anchor'),
  ('Passagens / Pax', 'receita', '#8b5cf6', 'users'),
  ('Outras receitas', 'receita', '#6366f1', 'trending-up'),
  ('Taxas portuárias', 'despesa', '#f59e0b', 'ship'),
  ('Transporte terrestre', 'despesa', '#ef4444', 'car'),
  ('Hospedagem', 'despesa', '#ec4899', 'hotel'),
  ('Suprimentos / Bordo', 'despesa', '#14b8a6', 'package'),
  ('Honorários / Terceiros', 'despesa', '#64748b', 'file-text'),
  ('Outras despesas', 'despesa', '#78716c', 'minus-circle')
) AS v(nome, tipo, cor, icone)
WHERE NOT EXISTS (SELECT 1 FROM public.financeiro_categorias LIMIT 1);

INSERT INTO public.financeiro_contas (nome, tipo)
SELECT 'Caixa Geral', 'caixa'
WHERE NOT EXISTS (SELECT 1 FROM public.financeiro_contas LIMIT 1);
