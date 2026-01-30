-- Nome e endereço do hotel na reserva (para rastrear qual hotel e onde fica)

ALTER TABLE public.demandas
  ADD COLUMN IF NOT EXISTS reserva_hotel_nome TEXT,
  ADD COLUMN IF NOT EXISTS reserva_hotel_endereco TEXT;

COMMENT ON COLUMN public.demandas.reserva_hotel_nome IS 'Nome do hotel da reserva';
COMMENT ON COLUMN public.demandas.reserva_hotel_endereco IS 'Endereço completo do hotel (onde fica)';
