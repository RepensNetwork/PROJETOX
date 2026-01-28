-- Configuração de Autenticação
-- Este script configura o Supabase Auth para trabalhar com a tabela membros

-- 1. Habilitar autenticação por email/senha no Supabase Dashboard
-- Vá em Authentication > Providers > Email e habilite "Enable email provider"

-- 2. Criar função para sincronizar usuários do Auth com a tabela membros
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar se já existe um membro com este email
  IF NOT EXISTS (
    SELECT 1 FROM public.membros WHERE email = NEW.email
  ) THEN
    -- Criar membro automaticamente quando usuário se registra
    INSERT INTO public.membros (id, nome, email, ativo)
    VALUES (
      gen_random_uuid(),
      COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
      NEW.email,
      true
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger para criar membro quando usuário se registra
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. Política RLS para membros baseada em autenticação
-- (Já existe, mas garantindo que está correta)
DROP POLICY IF EXISTS "Users can view own profile" ON public.membros;
CREATE POLICY "Users can view own profile" ON public.membros
  FOR SELECT
  USING (auth.uid()::text = id::text OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- 5. Atualizar membros existentes para ter senha no Supabase Auth
-- NOTA: Isso deve ser feito manualmente no Supabase Dashboard
-- Authentication > Users > Add User
-- Ou via API/SDK

-- 6. Configurar redirect URLs no Supabase Dashboard
-- Authentication > URL Configuration
-- Site URL: http://localhost:3000 (desenvolvimento)
-- Redirect URLs: 
--   http://localhost:3000/auth/callback
--   http://localhost:3000/dashboard
