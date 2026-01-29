-- Ship Operations Management System Schema
-- Core tables: navios (ships), escalas (port calls), demandas (demands)

-- 1. NAVIOS (Ships)
CREATE TABLE IF NOT EXISTS public.navios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  companhia TEXT NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. MEMBROS DA EQUIPE (Team Members)
CREATE TABLE IF NOT EXISTS public.membros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ESCALAS (Port Calls)
CREATE TYPE escala_status AS ENUM ('planejada', 'em_operacao', 'concluida', 'cancelada');

CREATE TABLE IF NOT EXISTS public.escalas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  navio_id UUID NOT NULL REFERENCES public.navios(id) ON DELETE CASCADE,
  porto TEXT NOT NULL,
  data_chegada TIMESTAMPTZ NOT NULL,
  data_saida TIMESTAMPTZ NOT NULL,
  observacoes TEXT,
  status escala_status DEFAULT 'planejada',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. DEMANDAS (Demands)
CREATE TYPE demanda_tipo AS ENUM (
  'embarque_passageiros',
  'desembarque_passageiros',
  'controle_listas',
  'suporte_especial',
  'visita_medica',
  'atendimento_emergencial',
  'documentacao_medica',
  'orcamento_produtos',
  'compra',
  'entrega_bordo',
  'confirmacao_recebimento',
  'abastecimento_agua',
  'combustivel',
  'controle_horarios',
  'policia_federal',
  'receita_federal',
  'mapa',
  'port_authority',
  'reserva_hotel',
  'transporte_terrestre',
  'motorista',
  'veiculo',
  'pickup_dropoff',
  'checklist_padrao',
  'relatorio',
  'documento_obrigatorio',
  'procedimento_repetitivo',
  'outro'
);

CREATE TYPE demanda_status AS ENUM ('pendente', 'em_andamento', 'aguardando_terceiro', 'concluida', 'cancelada');
CREATE TYPE demanda_prioridade AS ENUM ('baixa', 'media', 'alta', 'urgente');
CREATE TYPE demanda_categoria AS ENUM ('passageiros', 'saude', 'suprimentos', 'abastecimento', 'autoridades', 'logistica', 'processos_internos');

CREATE TABLE IF NOT EXISTS public.demandas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escala_id UUID NOT NULL REFERENCES public.escalas(id) ON DELETE CASCADE,
  tipo demanda_tipo NOT NULL,
  categoria demanda_categoria NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  pickup_at TIMESTAMPTZ,
  pickup_local TEXT,
  dropoff_local TEXT,
  transporte_status TEXT DEFAULT 'pendente',
  transporte_modalidade TEXT,
  transporte_grupo TEXT,
  transporte_concluido_em TIMESTAMPTZ,
  transporte_legs JSONB,
  responsavel_id UUID REFERENCES public.membros(id) ON DELETE SET NULL,
  prioridade demanda_prioridade DEFAULT 'media',
  status demanda_status DEFAULT 'pendente',
  prazo TIMESTAMPTZ,
  checklist JSONB DEFAULT '[]'::jsonb,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. COMENTARIOS (Comments on demands)
CREATE TABLE IF NOT EXISTS public.comentarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demanda_id UUID NOT NULL REFERENCES public.demandas(id) ON DELETE CASCADE,
  membro_id UUID REFERENCES public.membros(id) ON DELETE SET NULL,
  conteudo TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ANEXOS (Attachments)
CREATE TABLE IF NOT EXISTS public.anexos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demanda_id UUID NOT NULL REFERENCES public.demandas(id) ON DELETE CASCADE,
  nome_arquivo TEXT NOT NULL,
  url TEXT NOT NULL,
  tipo_mime TEXT,
  tamanho_bytes INTEGER,
  uploaded_by UUID REFERENCES public.membros(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. HISTORICO (Activity history)
CREATE TABLE IF NOT EXISTS public.historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demanda_id UUID NOT NULL REFERENCES public.demandas(id) ON DELETE CASCADE,
  membro_id UUID REFERENCES public.membros(id) ON DELETE SET NULL,
  acao TEXT NOT NULL,
  detalhes JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_escalas_navio ON public.escalas(navio_id);
CREATE INDEX IF NOT EXISTS idx_escalas_status ON public.escalas(status);
CREATE INDEX IF NOT EXISTS idx_escalas_data_chegada ON public.escalas(data_chegada);
CREATE INDEX IF NOT EXISTS idx_demandas_escala ON public.demandas(escala_id);
CREATE INDEX IF NOT EXISTS idx_demandas_status ON public.demandas(status);
CREATE INDEX IF NOT EXISTS idx_demandas_responsavel ON public.demandas(responsavel_id);
CREATE INDEX IF NOT EXISTS idx_demandas_prazo ON public.demandas(prazo);
CREATE INDEX IF NOT EXISTS idx_demandas_pickup_at ON public.demandas(pickup_at);
CREATE INDEX IF NOT EXISTS idx_comentarios_demanda ON public.comentarios(demanda_id);

-- Enable Row Level Security (permissive for MVP - all authenticated users can access)
ALTER TABLE public.navios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escalas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demandas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comentarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anexos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico ENABLE ROW LEVEL SECURITY;

-- RLS Policies (permissive for small team - all authenticated can CRUD)
CREATE POLICY "Allow all for navios" ON public.navios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for membros" ON public.membros FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for escalas" ON public.escalas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for demandas" ON public.demandas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for comentarios" ON public.comentarios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anexos" ON public.anexos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for historico" ON public.historico FOR ALL USING (true) WITH CHECK (true);
