-- Atualiza as demandas de tripulante (Eliana, Juliano, Dunhill, Rohan) com os dados
-- da reserva de hotel do PDF 24566 (Hotel Itajaí Tur), para que a reserva conste na demanda.
-- Assim, ao abrir a demanda do tripulante, o bloco "Reserva (Hotel)" já virá preenchido.
--
-- Hotel: Hotel Itajaí Tur
-- Endereço: Rua Alberto Werner, 133 - Centro, CEP 88.304-053 - ITAJAÍ - SC - BRASIL
--
-- IMPORTANTE: Se der erro "column reserva_checkin does not exist", execute PRIMEIRO
-- o script 020a_criar_colunas_reserva.sql no Supabase e depois rode este de novo.

-- Juliano de Francisco: 30/01–31/01, R$ 255, café
UPDATE public.demandas
SET
  reserva_hotel_nome = 'Hotel Itajaí Tur',
  reserva_hotel_endereco = 'Rua Alberto Werner, 133 - Centro, CEP 88.304-053 - ITAJAÍ - SC - BRASIL',
  reserva_checkin = '2026-01-30',
  reserva_checkout = '2026-01-31',
  reserva_valor = 255.00,
  reserva_cafe_incluso = TRUE,
  reserva_almoco_incluso = FALSE,
  reserva_confirmado = TRUE,
  updated_at = NOW()
WHERE tipo IN ('embarque_passageiros', 'desembarque_passageiros', 'transporte_terrestre')
  AND titulo ILIKE '%Juliano%'
  AND (reserva_hotel_nome IS NULL OR reserva_hotel_nome = '');

-- Rohan Ratnakar Shetty: 30/01–31/01, R$ 255, café
UPDATE public.demandas
SET
  reserva_hotel_nome = 'Hotel Itajaí Tur',
  reserva_hotel_endereco = 'Rua Alberto Werner, 133 - Centro, CEP 88.304-053 - ITAJAÍ - SC - BRASIL',
  reserva_checkin = '2026-01-30',
  reserva_checkout = '2026-01-31',
  reserva_valor = 255.00,
  reserva_cafe_incluso = TRUE,
  reserva_almoco_incluso = FALSE,
  reserva_confirmado = TRUE,
  updated_at = NOW()
WHERE tipo IN ('embarque_passageiros', 'desembarque_passageiros', 'transporte_terrestre')
  AND titulo ILIKE '%Rohan%'
  AND (reserva_hotel_nome IS NULL OR reserva_hotel_nome = '');

-- Dunhill Casabar Ramil: 30/01–31/01, R$ 255, café
UPDATE public.demandas
SET
  reserva_hotel_nome = 'Hotel Itajaí Tur',
  reserva_hotel_endereco = 'Rua Alberto Werner, 133 - Centro, CEP 88.304-053 - ITAJAÍ - SC - BRASIL',
  reserva_checkin = '2026-01-30',
  reserva_checkout = '2026-01-31',
  reserva_valor = 255.00,
  reserva_cafe_incluso = TRUE,
  reserva_almoco_incluso = FALSE,
  reserva_confirmado = TRUE,
  updated_at = NOW()
WHERE tipo IN ('embarque_passageiros', 'desembarque_passageiros', 'transporte_terrestre')
  AND titulo ILIKE '%Dunhill%'
  AND (reserva_hotel_nome IS NULL OR reserva_hotel_nome = '');

-- Eliana Franciele Buhs: 31/01–01/02, R$ 255, café
UPDATE public.demandas
SET
  reserva_hotel_nome = 'Hotel Itajaí Tur',
  reserva_hotel_endereco = 'Rua Alberto Werner, 133 - Centro, CEP 88.304-053 - ITAJAÍ - SC - BRASIL',
  reserva_checkin = '2026-01-31',
  reserva_checkout = '2026-02-01',
  reserva_valor = 255.00,
  reserva_cafe_incluso = TRUE,
  reserva_almoco_incluso = FALSE,
  reserva_confirmado = TRUE,
  updated_at = NOW()
WHERE tipo IN ('embarque_passageiros', 'desembarque_passageiros', 'transporte_terrestre')
  AND titulo ILIKE '%Eliana%'
  AND (reserva_hotel_nome IS NULL OR reserva_hotel_nome = '');
