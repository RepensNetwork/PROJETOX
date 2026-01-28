# 🔧 Corrigir Erro: "Usuário não encontrado"

## ⚠️ Problema

Você está vendo o erro: **"Usuário não encontrado. Entre em contato com o administrador."**

Isso significa que:
- ✅ O login no Supabase Auth funcionou (senha correta)
- ❌ Mas não existe um registro na tabela `membros` com o email `mateusfriese@hotmail.com`

## ✅ Solução Rápida

### Opção 1: Executar Script SQL (Recomendado)

1. **Acesse o Supabase Dashboard:**
   - Vá para: https://supabase.com/dashboard
   - Selecione seu projeto
   - Clique em **SQL Editor**

2. **Execute o script:**
   - Abra o arquivo `scripts/009_verificar_e_criar_membro.sql`
   - Copie e cole o conteúdo no SQL Editor
   - Clique em **Run** ou pressione `Ctrl+Enter`

3. **Verifique o resultado:**
   - O script vai mostrar se o membro existe
   - Se não existir, vai criar automaticamente
   - Vai mostrar o membro criado/atualizado

### Opção 2: Executar SQL Manualmente

Execute este SQL no Supabase SQL Editor:

```sql
-- Criar ou atualizar membro
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
  is_admin = COALESCE(EXCLUDED.is_admin, membros.is_admin, true);

-- Verificar se foi criado
SELECT * FROM public.membros WHERE email = 'mateusfriese@hotmail.com';
```

## 🔍 Verificar se o Problema Foi Resolvido

Após executar o script:

1. **Verifique no Supabase:**
   ```sql
   SELECT id, nome, email, ativo, is_admin 
   FROM public.membros 
   WHERE email = 'mateusfriese@hotmail.com';
   ```
   
   Deve retornar uma linha com:
   - `nome`: Mateus Friese
   - `email`: mateusfriese@hotmail.com
   - `ativo`: true
   - `is_admin`: true

2. **Tente fazer login novamente:**
   - Acesse: `http://localhost:3000/login`
   - Email: `mateusfriese@hotmail.com`
   - Senha: `Brf@2016`
   - Deve funcionar agora!

## 🐛 Se Ainda Não Funcionar

### Verificar se o usuário existe no Supabase Auth

1. Acesse: https://supabase.com/dashboard
2. Vá em: **Authentication** > **Users**
3. Procure por: `mateusfriese@hotmail.com`
4. Se não existir, crie:
   - Clique em **Add User**
   - Email: `mateusfriese@hotmail.com`
   - Password: `Brf@2016`
   - ✅ Marque **Auto Confirm User**
   - Clique em **Create User**

### Verificar se o email está exatamente igual

O email deve ser **exatamente igual** em ambos os lugares:
- Supabase Auth: `mateusfriese@hotmail.com`
- Tabela membros: `mateusfriese@hotmail.com`

**Importante:** O email é case-sensitive na comparação!

### Verificar RLS (Row Level Security)

Se ainda não funcionar, pode ser um problema de permissões:

```sql
-- Verificar políticas RLS na tabela membros
SELECT * FROM pg_policies WHERE tablename = 'membros';

-- Se necessário, permitir leitura pública (apenas para teste)
ALTER TABLE public.membros ENABLE ROW LEVEL SECURITY;

-- Criar política permissiva (apenas para desenvolvimento)
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.membros;
CREATE POLICY "Allow all for authenticated users" ON public.membros
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

## 📝 Checklist Completo

Antes de reportar problemas, verifique:

- [ ] Usuário existe no Supabase Auth Dashboard
- [ ] Membro existe na tabela `membros` (mesmo email)
- [ ] Email está exatamente igual (sem espaços, case-sensitive)
- [ ] Campo `ativo` está como `true`
- [ ] Script SQL foi executado com sucesso
- [ ] Tentou fazer login novamente após executar o script

## 🚀 Próximos Passos

Após resolver:

1. ✅ Faça login com sucesso
2. ✅ Verifique se aparece seu nome no header
3. ✅ Verifique se aparece a opção "Administração" no menu (se `is_admin = true`)
4. ✅ Acesse o dashboard

---

**Execute o script `009_verificar_e_criar_membro.sql` e tente fazer login novamente!** 🎯
