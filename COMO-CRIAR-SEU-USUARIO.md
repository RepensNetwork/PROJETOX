# 👤 Criar Seu Usuário de Login

## 🚀 Passos Rápidos

### 1. Criar Membro no Banco de Dados

Execute este SQL no **Supabase SQL Editor**:

```sql
-- Criar membro Mateus Friese
INSERT INTO public.membros (nome, email, ativo)
VALUES (
  'Mateus Friese',
  'mateusfriese@hotmail.com',
  true
)
ON CONFLICT (email) DO UPDATE
SET nome = EXCLUDED.nome,
    ativo = EXCLUDED.ativo;
```

**Ou use o arquivo:** `scripts/007_criar_usuario_admin.sql`

### 2. Criar Usuário no Supabase Auth

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em: **Authentication** > **Users**
4. Clique em: **"Add User"** ou **"Invite User"**
5. Preencha:
   - **Email**: `mateusfriese@hotmail.com`
   - **Password**: `Brf@2016`
   - ✅ **Auto Confirm User** (marque esta opção!)
6. Clique em: **"Create User"**

### 3. Fazer Login

1. Acesse: `http://localhost:3000/login`
2. Digite:
   - Email: `mateusfriese@hotmail.com`
   - Senha: `Brf@2016`
3. Clique em **"Entrar"**

## ✅ Pronto!

Agora você pode:
- ✅ Acessar o sistema
- ✅ Ver notificações no sino do header
- ✅ Usar o chat com menções (@mentions)
- ✅ Gerenciar escalas, navios e demandas

## 🔒 Importante

- O email na tabela `membros` DEVE ser exatamente igual ao email no Supabase Auth
- A senha é case-sensitive (maiúsculas/minúsculas importam)
- Após o primeiro login, considere alterar a senha
