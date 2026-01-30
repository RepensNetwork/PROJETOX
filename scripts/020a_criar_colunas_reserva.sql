-- Execute ESTE script PRIMEIRO no Supabase (SQL Editor).
-- Cria as colunas de reserva na tabela demandas. Depois rode o script 020.

ALTER TABLE public.demandas ADD COLUMN IF NOT EXISTS reserva_checkin DATE;
ALTER TABLE public.demandas ADD COLUMN IF NOT EXISTS reserva_checkout DATE;
ALTER TABLE public.demandas ADD COLUMN IF NOT EXISTS reserva_valor NUMERIC(12, 2);
ALTER TABLE public.demandas ADD COLUMN IF NOT EXISTS reserva_cafe_incluso BOOLEAN DEFAULT FALSE;
ALTER TABLE public.demandas ADD COLUMN IF NOT EXISTS reserva_almoco_incluso BOOLEAN DEFAULT FALSE;
ALTER TABLE public.demandas ADD COLUMN IF NOT EXISTS reserva_confirmado BOOLEAN DEFAULT FALSE;
ALTER TABLE public.demandas ADD COLUMN IF NOT EXISTS reserva_hotel_nome TEXT;
ALTER TABLE public.demandas ADD COLUMN IF NOT EXISTS reserva_hotel_endereco TEXT;
 