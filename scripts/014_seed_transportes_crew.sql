-- Demandas de transporte crew Jan/2026 (Azhari, Eliana, Juliano, Rohan)
-- IMPORTANTE: substitua 'SEU_ESCALA_ID_AQUI' pelo id real da escala (ex.: Marejada).
-- Para obter: SELECT id, porto, data_chegada FROM public.escalas ORDER BY data_chegada DESC LIMIT 5;

-- AZHARI MUH ZAINI – Desembarque: Terminal 11:00 → Aeroporto Navegantes (voo 14h)
INSERT INTO public.demandas (
  escala_id, tipo, categoria, titulo, descricao, prioridade, status,
  pickup_at, pickup_local, dropoff_local, transporte_legs
) VALUES (
  'SEU_ESCALA_ID_AQUI', 'desembarque_passageiros', 'passageiros',
  'AZHARI MUH ZAINI', 'Desembarque. Saída 11h. Aeroporto Navegantes, voo 14h.',
  'alta', 'pendente',
  '2026-01-30T11:00:00-03:00', 'Terminal', 'Aeroporto Navegantes',
  '[{"id":"leg-1","label":"Terminal → Aeroporto Navegantes","pickup_at":"2026-01-30T11:00:00-03:00","pickup_local":"Terminal","dropoff_local":"Aeroporto Navegantes","status":"pendente","grupo":"Voo 14h"}]'::jsonb
);

-- ELIANA – Desembarque: 11h → Hotel; 01/02 08:00 Hotel → Aeroporto Florianópolis (voo 13h)
INSERT INTO public.demandas (
  escala_id, tipo, categoria, titulo, descricao, prioridade, status,
  transporte_legs
) VALUES (
  'SEU_ESCALA_ID_AQUI', 'desembarque_passageiros', 'passageiros',
  'ELIANA', 'Desembarque 11h → Hotel. Dia 01/02 busca hotel 5h antes (08h) → Aeroporto Florianópolis voo 13h.',
  'alta', 'pendente',
  '[
    {"id":"leg-1","label":"Terminal → Hotel","pickup_at":"2026-01-30T11:00:00-03:00","pickup_local":"Terminal","dropoff_local":"Hotel (a confirmar)","status":"pendente"},
    {"id":"leg-2","label":"Hotel → Aeroporto Florianópolis","pickup_at":"2026-02-01T08:00:00-03:00","pickup_local":"Hotel (a confirmar)","dropoff_local":"Aeroporto Florianópolis","status":"pendente","grupo":"Voo 13h"}
  ]'::jsonb
);

-- JULIANO – Embarque: 30/01 18:45 Aeroporto → Hotel; 31/01 08:30 Hotel → Terminal Marejada
INSERT INTO public.demandas (
  escala_id, tipo, categoria, titulo, descricao, prioridade, status,
  transporte_legs
) VALUES (
  'SEU_ESCALA_ID_AQUI', 'embarque_passageiros', 'passageiros',
  'JULIANO', 'LA 4518 Florianópolis 30 Jan 2026 18:45. Hotel a confirmar. Dia 31/01 hotel → Terminal Marejada 08:30.',
  'alta', 'pendente',
  '[
    {"id":"leg-1","label":"Aeroporto Florianópolis → Hotel","pickup_at":"2026-01-30T18:45:00-03:00","pickup_local":"Aeroporto Florianópolis","dropoff_local":"Hotel (a confirmar)","status":"pendente","grupo":"LA 4518 18:45"},
    {"id":"leg-2","label":"Hotel → Terminal Marejada","pickup_at":"2026-01-31T08:30:00-03:00","pickup_local":"Hotel (a confirmar)","dropoff_local":"Terminal Marejada","status":"pendente"}
  ]'::jsonb
);

-- ROHAN – Embarque: 30/01 14:35 Aeroporto → Hotel; 31/01 08:30 Hotel → Terminal Marejada
INSERT INTO public.demandas (
  escala_id, tipo, categoria, titulo, descricao, prioridade, status,
  transporte_legs
) VALUES (
  'SEU_ESCALA_ID_AQUI', 'embarque_passageiros', 'passageiros',
  'ROHAN', 'QR 7255 Florianópolis 30 Jan 2026 14:35. Hotel a confirmar. Dia 31/01 hotel → Terminal Marejada 08:30.',
  'alta', 'pendente',
  '[
    {"id":"leg-1","label":"Aeroporto Florianópolis → Hotel","pickup_at":"2026-01-30T14:35:00-03:00","pickup_local":"Aeroporto Florianópolis","dropoff_local":"Hotel (a confirmar)","status":"pendente","grupo":"QR 7255 14:35"},
    {"id":"leg-2","label":"Hotel → Terminal Marejada","pickup_at":"2026-01-31T08:30:00-03:00","pickup_local":"Hotel (a confirmar)","dropoff_local":"Terminal Marejada","status":"pendente"}
  ]'::jsonb
);

-- DUNHILL – criar manualmente quando tiver dados do voo (tipo: embarque_passageiros, transporte_legs conforme padrão acima)
