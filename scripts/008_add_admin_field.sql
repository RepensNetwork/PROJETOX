-- Adicionar campo de administrador e melhorar tabela membros
-- Execute este script para adicionar funcionalidades de admin

-- Adicionar coluna is_admin (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'membros' 
    AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE public.membros ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Tornar Mateus Friese admin
UPDATE public.membros
SET is_admin = true
WHERE email = 'mateusfriese@hotmail.com';

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_membros_is_admin ON public.membros(is_admin);

-- Evitar política com recursão em membros
-- A política abaixo referenciava a própria tabela e causava erro 42P17
DROP POLICY IF EXISTS "Admins can manage all members" ON public.membros;
-- Manter política simples para authenticated (defina regras mais rígidas depois)
DROP POLICY IF EXISTS "Allow all for membros" ON public.membros;
CREATE POLICY "Allow all for membros" ON public.membros
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
