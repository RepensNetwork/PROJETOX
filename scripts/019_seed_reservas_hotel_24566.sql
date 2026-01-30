-- Reservas de hotel extraídas do PDF 24566 (Hotel Itajaí Tur - Confirmação de Reserva)
-- Hotel: Hotel Itajaí Tur
-- Endereço: Rua Alberto Werner, 133 - Centro, CEP 88.304-053 - ITAJAÍ - SC - BRASIL
-- Total: 4 hóspedes, R$ 1.020,00
--
-- Usa automaticamente uma escala em Itajaí (a mais próxima por data_chegada).
-- Se não houver escala em Itajaí, substitua (SELECT id_escala FROM ...) por um UUID fixo.

WITH escala_itajai AS (
  SELECT id FROM public.escalas
  WHERE porto ILIKE '%itajai%' OR porto ILIKE '%itajaí%'
  ORDER BY data_chegada DESC
  LIMIT 1
)
INSERT INTO public.demandas (
  escala_id,
  tipo,
  categoria,
  titulo,
  descricao,
  prioridade,
  status,
  reserva_hotel_nome,
  reserva_hotel_endereco,
  reserva_checkin,
  reserva_checkout,
  reserva_valor,
  reserva_cafe_incluso,
  reserva_almoco_incluso,
  reserva_confirmado
)
SELECT
  (SELECT id FROM escala_itajai),
  'reserva_hotel'::demanda_tipo,
  'logistica'::demanda_categoria,
  titulo,
  descricao,
  'media'::demanda_prioridade,
  'pendente'::demanda_status,
  'Hotel Itajaí Tur',
  'Rua Alberto Werner, 133 - Centro, CEP 88.304-053 - ITAJAÍ - SC - BRASIL',
  reserva_checkin,
  reserva_checkout,
  reserva_valor,
  TRUE,
  FALSE,
  TRUE
FROM (VALUES
  (
    'Juliano de Francisco',
    'Reserva 24566 - Quarto 310 - Hotel Itajaí Tur',
    '2026-01-30'::date,
    '2026-01-31'::date,
    255.00
  ),
  (
    'Rohan Ratnakar Shetty',
    'Reserva 24566 - Quarto 311 - Hotel Itajaí Tur',
    '2026-01-30'::date,
    '2026-01-31'::date,
    255.00
  ),
  (
    'Dunhill Casabar Ramil',
    'Reserva 24566 - Quarto 510 - Hotel Itajaí Tur',
    '2026-01-30'::date,
    '2026-01-31'::date,
    255.00
  ),
  (
    'Eliana Franciele Buhs',
    'Reserva 24566 - Quarto 512 - Hotel Itajaí Tur',
    '2026-01-31'::date,
    '2026-02-01'::date,
    255.00
  )
) AS v(titulo, descricao, reserva_checkin, reserva_checkout, reserva_valor);

-- Versão alternativa com UUID fixo (se a CTE acima falhar por não haver escala em Itajaí):
-- Substitua os 4 blocos abaixo descomentando e trocando ESCALA_ID_AQUI por um UUID real.
/*
INSERT INTO public.demandas (
  escala_id,
  tipo,
  categoria,
  titulo,
  descricao,
  prioridade,
  status,
  reserva_hotel_nome,
  reserva_hotel_endereco,
  reserva_checkin,
  reserva_checkout,
  reserva_valor,
  reserva_cafe_incluso,
  reserva_almoco_incluso,
  reserva_confirmado
) VALUES
  (
    'ESCALA_ID_AQUI'::uuid,
    'reserva_hotel',
    'logistica',
    'Juliano de Francisco',
    'Reserva 24566 - Quarto 310 - Hotel Itajaí Tur',
    'media',
    'pendente',
    'Hotel Itajaí Tur',
    'Rua Alberto Werner, 133 - Centro, CEP 88.304-053 - ITAJAÍ - SC - BRASIL',
    '2026-01-30',
    '2026-01-31',
    255.00,
    TRUE,
    FALSE,
    TRUE
  ),
  (
    'ESCALA_ID_AQUI'::uuid,
    'reserva_hotel',
    'logistica',
    'Rohan Ratnakar Shetty',
    'Reserva 24566 - Quarto 311 - Hotel Itajaí Tur',
    'media',
    'pendente',
    'Hotel Itajaí Tur',
    'Rua Alberto Werner, 133 - Centro, CEP 88.304-053 - ITAJAÍ - SC - BRASIL',
    '2026-01-30',
    '2026-01-31',
    255.00,
    TRUE,
    FALSE,
    TRUE
  ),
  (
    'ESCALA_ID_AQUI'::uuid,
    'reserva_hotel',
    'logistica',
    'Dunhill Casabar Ramil',
    'Reserva 24566 - Quarto 510 - Hotel Itajaí Tur',
    'media',
    'pendente',
    'Hotel Itajaí Tur',
    'Rua Alberto Werner, 133 - Centro, CEP 88.304-053 - ITAJAÍ - SC - BRASIL',
    '2026-01-30',
    '2026-01-31',
    255.00,
    TRUE,
    FALSE,
    TRUE
  ),
  (
    'ESCALA_ID_AQUI'::uuid,
    'reserva_hotel',
    'logistica',
    'Eliana Franciele Buhs',
    'Reserva 24566 - Quarto 512 - Hotel Itajaí Tur',
    'media',
    'pendente',
    'Hotel Itajaí Tur',
    'Rua Alberto Werner, 133 - Centro, CEP 88.304-053 - ITAJAÍ - SC - BRASIL',
    '2026-01-31',
    '2026-02-01',
    255.00,
    TRUE,
    FALSE,
    TRUE
  );
