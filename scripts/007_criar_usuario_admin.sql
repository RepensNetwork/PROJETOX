-- Script para criar o membro inicial
-- Execute este script ANTES de criar o usuário no Supabase Auth

-- Inserir membro na tabela membros
INSERT INTO public.membros (nome, email, ativo)
VALUES (
  'Mateus Friese',
  'mateusfriese@hotmail.com',
  true
)
ON CONFLICT (email) DO UPDATE
SET nome = EXCLUDED.nome,
    ativo = EXCLUDED.ativo;

-- Verificar se foi criado
SELECT id, nome, email, ativo, created_at
FROM public.membros
WHERE email = 'mateusfriese@hotmail.com';
