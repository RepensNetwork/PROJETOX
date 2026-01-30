-- Tripulante = demanda principal; sub-demandas (transporte, hotel) linkadas por demanda_pai_id
-- Campos de reserva hotel: check-in, check-out, valor, café, almoço, confirmado

-- 1. Demanda pai (tripulante): demanda_pai_id NULL = demanda principal; preenchido = sub-demanda
ALTER TABLE public.demandas
  ADD COLUMN IF NOT EXISTS demanda_pai_id UUID REFERENCES public.demandas(id) ON DELETE CASCADE;

-- 2. Campos de reserva hotel (para demandas tipo reserva_hotel)
ALTER TABLE public.demandas
  ADD COLUMN IF NOT EXISTS reserva_checkin DATE,
  ADD COLUMN IF NOT EXISTS reserva_checkout DATE,
  ADD COLUMN IF NOT EXISTS reserva_valor NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS reserva_cafe_incluso BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS reserva_almoco_incluso BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS reserva_confirmado BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_demandas_demanda_pai ON public.demandas(demanda_pai_id);
CREATE INDEX IF NOT EXISTS idx_demandas_tipo_reserva ON public.demandas(tipo) WHERE tipo = 'reserva_hotel';
CREATE INDEX IF NOT EXISTS idx_demandas_reserva_checkin ON public.demandas(reserva_checkin) WHERE reserva_checkin IS NOT NULL;

COMMENT ON COLUMN public.demandas.demanda_pai_id IS 'Se preenchido, esta demanda é sub-demanda (ex: transporte ou hotel) do tripulante/demanda principal';
COMMENT ON COLUMN public.demandas.reserva_confirmado IS 'Hotel confirmado pela operação';
