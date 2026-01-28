-- Seed data for Ship Operations Management System

-- Insert team members
INSERT INTO public.membros (id, nome, email, avatar_url) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Ana Silva', 'ana@operacoes.com', NULL),
  ('22222222-2222-2222-2222-222222222222', 'Carlos Santos', 'carlos@operacoes.com', NULL),
  ('33333333-3333-3333-3333-333333333333', 'Marina Costa', 'marina@operacoes.com', NULL);

-- Insert ships (Costa fleet)
INSERT INTO public.navios (id, nome, companhia, observacoes) VALUES
  ('aaaa0001-0001-0001-0001-000000000001', 'Costa Diadema', 'Costa Cruzeiros', 'Capacidade: 4.947 passageiros. Tripulação: 1.253.'),
  ('aaaa0002-0002-0002-0002-000000000002', 'Costa Fascinosa', 'Costa Cruzeiros', 'Capacidade: 3.780 passageiros. Tripulação: 1.110.');

-- Insert port calls (escalas) - upcoming and current
INSERT INTO public.escalas (id, navio_id, porto, data_chegada, data_saida, status, observacoes) VALUES
  -- Costa Diadema escalas
  ('bbbb0001-0001-0001-0001-000000000001', 'aaaa0001-0001-0001-0001-000000000001', 'Santos - SP', 
   NOW() - INTERVAL '2 hours', NOW() + INTERVAL '10 hours', 'em_operacao', 'Escala principal. Embarque de 800 passageiros.'),
  ('bbbb0002-0002-0002-0002-000000000002', 'aaaa0001-0001-0001-0001-000000000001', 'Rio de Janeiro - RJ', 
   NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 12 hours', 'planejada', 'Escala técnica. Abastecimento programado.'),
  ('bbbb0003-0003-0003-0003-000000000003', 'aaaa0001-0001-0001-0001-000000000001', 'Salvador - BA', 
   NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days 8 hours', 'planejada', NULL),
  -- Costa Fascinosa escalas
  ('bbbb0004-0004-0004-0004-000000000004', 'aaaa0002-0002-0002-0002-000000000002', 'Itajaí - SC', 
   NOW() + INTERVAL '6 hours', NOW() + INTERVAL '18 hours', 'planejada', 'Chegada prevista às 14h.'),
  ('bbbb0005-0005-0005-0005-000000000005', 'aaaa0002-0002-0002-0002-000000000002', 'Buenos Aires - ARG', 
   NOW() + INTERVAL '4 days', NOW() + INTERVAL '4 days 14 hours', 'planejada', 'Escala internacional. Documentação especial.');

-- Insert demands for the active port call (Santos)
INSERT INTO public.demandas (id, escala_id, tipo, categoria, titulo, descricao, responsavel_id, prioridade, status, prazo, checklist) VALUES
  -- Passageiros
  ('cccc0001-0001-0001-0001-000000000001', 'bbbb0001-0001-0001-0001-000000000001', 'embarque_passageiros', 'passageiros',
   'Embarque de passageiros - Turno manhã', 'Embarque de 450 passageiros no turno da manhã (8h-12h)', 
   '11111111-1111-1111-1111-111111111111', 'alta', 'em_andamento', NOW() + INTERVAL '4 hours',
   '[{"item": "Verificar lista de embarque", "done": true}, {"item": "Preparar área de check-in", "done": true}, {"item": "Conferir documentos", "done": false}, {"item": "Finalizar embarque", "done": false}]'),
  
  ('cccc0002-0002-0002-0002-000000000002', 'bbbb0001-0001-0001-0001-000000000001', 'embarque_passageiros', 'passageiros',
   'Embarque de passageiros - Turno tarde', 'Embarque de 350 passageiros no turno da tarde (14h-18h)', 
   '11111111-1111-1111-1111-111111111111', 'alta', 'pendente', NOW() + INTERVAL '8 hours',
   '[{"item": "Verificar lista de embarque", "done": false}, {"item": "Preparar área de check-in", "done": false}]'),
  
  -- Autoridades
  ('cccc0003-0003-0003-0003-000000000003', 'bbbb0001-0001-0001-0001-000000000001', 'policia_federal', 'autoridades',
   'Liberação Polícia Federal', 'Acompanhar inspeção da PF para liberação do navio', 
   '22222222-2222-2222-2222-222222222222', 'urgente', 'em_andamento', NOW() + INTERVAL '2 hours',
   '[{"item": "Agendar visita", "done": true}, {"item": "Preparar documentação", "done": true}, {"item": "Acompanhar inspeção", "done": false}]'),
  
  ('cccc0004-0004-0004-0004-000000000004', 'bbbb0001-0001-0001-0001-000000000001', 'receita_federal', 'autoridades',
   'Despacho Receita Federal', 'Documentação de importação de suprimentos', 
   '22222222-2222-2222-2222-222222222222', 'alta', 'aguardando_terceiro', NOW() + INTERVAL '3 hours',
   '[{"item": "Enviar documentos", "done": true}, {"item": "Aguardar análise", "done": false}]'),
  
  -- Logística
  ('cccc0005-0005-0005-0005-000000000005', 'bbbb0001-0001-0001-0001-000000000001', 'transporte_terrestre', 'logistica',
   'Transfer aeroporto - Tripulação', 'Transporte de 15 tripulantes do aeroporto de Guarulhos', 
   '33333333-3333-3333-3333-333333333333', 'alta', 'pendente', NOW() + INTERVAL '5 hours',
   '[{"item": "Confirmar voo", "done": true}, {"item": "Reservar van", "done": false}, {"item": "Confirmar motorista", "done": false}]'),
  
  ('cccc0006-0006-0006-0006-000000000006', 'bbbb0001-0001-0001-0001-000000000001', 'reserva_hotel', 'logistica',
   'Hotel para tripulação - Pernoite', 'Reserva de 5 quartos para tripulação em trânsito', 
   '33333333-3333-3333-3333-333333333333', 'media', 'concluida', NOW() - INTERVAL '1 hour',
   '[{"item": "Pesquisar hotéis", "done": true}, {"item": "Fazer reserva", "done": true}, {"item": "Confirmar", "done": true}]'),
  
  -- Suprimentos
  ('cccc0007-0007-0007-0007-000000000007', 'bbbb0001-0001-0001-0001-000000000001', 'entrega_bordo', 'suprimentos',
   'Entrega de alimentos frescos', 'Recebimento de 2 toneladas de alimentos frescos', 
   '33333333-3333-3333-3333-333333333333', 'alta', 'pendente', NOW() + INTERVAL '6 hours',
   '[{"item": "Confirmar pedido", "done": true}, {"item": "Verificar nota fiscal", "done": false}, {"item": "Supervisionar descarga", "done": false}]'),
  
  -- Saúde
  ('cccc0008-0008-0008-0008-000000000008', 'bbbb0001-0001-0001-0001-000000000001', 'visita_medica', 'saude',
   'Visita médico ANVISA', 'Inspeção sanitária obrigatória', 
   '11111111-1111-1111-1111-111111111111', 'urgente', 'pendente', NOW() + INTERVAL '1 hour',
   '[{"item": "Preparar documentação sanitária", "done": false}, {"item": "Acompanhar inspeção", "done": false}]');

-- Insert demands for upcoming port calls
INSERT INTO public.demandas (escala_id, tipo, categoria, titulo, descricao, responsavel_id, prioridade, status, prazo) VALUES
  -- Rio de Janeiro
  ('bbbb0002-0002-0002-0002-000000000002', 'abastecimento_agua', 'abastecimento',
   'Abastecimento de água potável', 'Abastecimento de 500.000 litros de água potável', 
   '22222222-2222-2222-2222-222222222222', 'alta', 'pendente', NOW() + INTERVAL '2 days 2 hours'),
  
  ('bbbb0002-0002-0002-0002-000000000002', 'policia_federal', 'autoridades',
   'Agendamento PF Rio', 'Agendar inspeção da Polícia Federal no Rio', 
   '22222222-2222-2222-2222-222222222222', 'media', 'pendente', NOW() + INTERVAL '1 day'),
  
  -- Itajaí (Costa Fascinosa)
  ('bbbb0004-0004-0004-0004-000000000004', 'embarque_passageiros', 'passageiros',
   'Embarque de passageiros Itajaí', 'Embarque de 600 passageiros', 
   '11111111-1111-1111-1111-111111111111', 'alta', 'pendente', NOW() + INTERVAL '8 hours'),
  
  ('bbbb0004-0004-0004-0004-000000000004', 'transporte_terrestre', 'logistica',
   'Transfer VIPs aeroporto Navegantes', 'Transporte de 8 passageiros VIP do aeroporto', 
   '33333333-3333-3333-3333-333333333333', 'alta', 'pendente', NOW() + INTERVAL '7 hours');

-- Insert some comments
INSERT INTO public.comentarios (demanda_id, membro_id, conteudo) VALUES
  ('cccc0003-0003-0003-0003-000000000003', '22222222-2222-2222-2222-222222222222', 'Agente da PF confirmou visita para às 10h.'),
  ('cccc0003-0003-0003-0003-000000000003', '11111111-1111-1111-1111-111111111111', 'Documentação pronta na recepção do pier.'),
  ('cccc0005-0005-0005-0005-000000000005', '33333333-3333-3333-3333-333333333333', 'Voo confirmado - chegada 14:30 em GRU.');

-- Insert activity history
INSERT INTO public.historico (demanda_id, membro_id, acao, detalhes) VALUES
  ('cccc0001-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111', 'status_alterado', '{"de": "pendente", "para": "em_andamento"}'),
  ('cccc0006-0006-0006-0006-000000000006', '33333333-3333-3333-3333-333333333333', 'status_alterado', '{"de": "em_andamento", "para": "concluida"}'),
  ('cccc0004-0004-0004-0004-000000000004', '22222222-2222-2222-2222-222222222222', 'status_alterado', '{"de": "em_andamento", "para": "aguardando_terceiro"}');
