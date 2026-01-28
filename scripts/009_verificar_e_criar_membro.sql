-- Script para verificar e criar membro se não existir
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se o membro existe
SELECT 
  id, 
  nome, 
  email, 
  ativo, 
  is_admin,
  created_at
FROM public.membros 
WHERE email = 'mateusfriese@hotmail.com';

-- 2. Se não existir, criar o membro
INSERT INTO public.membros (nome, email, ativo, is_admin)
VALUES (
  'Mateus Friese',
  'mateusfriese@hotmail.com',
  true,
  true
)
ON CONFLICT (email) DO UPDATE
SET 
  nome = EXCLUDED.nome,
  ativo = EXCLUDED.ativo,
  is_admin = COALESCE(EXCLUDED.is_admin, membros.is_admin, false);

-- 3. Verificar novamente após criação/atualização
SELECT 
  id, 
  nome, 
  email, 
  ativo, 
  is_admin,
  created_at
FROM public.membros 
WHERE email = 'mateusfriese@hotmail.com';
