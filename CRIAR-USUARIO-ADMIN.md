# 👤 Criar Usuário Administrador

## 📋 Instruções para Criar o Usuário Mateus Friese

### Passo 1: Criar Membro na Tabela

Execute o script SQL no Supabase:

```sql
-- Arquivo: scripts/007_criar_usuario_admin.sql
-- Execute no Supabase SQL Editor
```

Ou execute diretamente:

```sql
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

### Passo 2: Criar Usuário no Supabase Auth

1. **Acesse o Supabase Dashboard**
   - Vá para: https://supabase.com/dashboard
   - Selecione seu projeto

2. **Navegue até Authentication**
   - Menu lateral: **Authentication** > **Users**

3. **Adicionar Novo Usuário**
   - Clique no botão **"Add User"** ou **"Invite User"**
   - Preencha os dados:
     - **Email**: `mateusfriese@hotmail.com`
     - **Password**: `Brf@2016`
     - **Auto Confirm User**: ✅ (marque esta opção)
   - Clique em **"Create User"** ou **"Send Invitation"**

4. **Verificar Criação**
   - O usuário deve aparecer na lista de usuários
   - Status deve ser "Confirmed" ou "Active"

### Passo 3: Testar Login

1. Acesse: `http://localhost:3000/login`
2. Digite:
   - **Email**: `mateusfriese@hotmail.com`
   - **Senha**: `Brf@2016`
3. Clique em **"Entrar"**
4. Você deve ser redirecionado para o dashboard

## 🔧 Alternativa: Via API (Avançado)

Se você tem acesso ao Supabase Admin API, pode criar o usuário programaticamente:

```typescript
// Exemplo usando Supabase Admin API
const { data, error } = await supabase.auth.admin.createUser({
  email: 'mateusfriese@hotmail.com',
  password: 'Brf@2016',
  email_confirm: true,
})
```

## ✅ Verificação

Após criar o usuário, verifique:

1. **Membro existe na tabela:**
   ```sql
   SELECT * FROM membros WHERE email = 'mateusfriese@hotmail.com';
   ```

2. **Usuário existe no Auth:**
   - Supabase Dashboard > Authentication > Users
   - Deve aparecer `mateusfriese@hotmail.com`

3. **Login funciona:**
   - Acesse `/login` e teste as credenciais

## 🐛 Troubleshooting

### Erro: "Usuário não encontrado" no login

**Causa:** Membro não existe na tabela `membros`.

**Solução:**
1. Execute o script SQL `007_criar_usuario_admin.sql`
2. Verifique se o email está exatamente igual: `mateusfriese@hotmail.com`

### Erro: "Invalid login credentials"

**Causa:** Usuário não existe no Supabase Auth ou senha incorreta.

**Solução:**
1. Verifique se o usuário foi criado no Supabase Dashboard
2. Confirme que a senha está correta: `Brf@2016`
3. Tente resetar a senha no Dashboard se necessário

### Erro: "Email já existe"

**Causa:** Usuário ou membro já foi criado anteriormente.

**Solução:**
- Se o membro existe mas não o usuário Auth: crie apenas o usuário Auth
- Se ambos existem: use as credenciais para fazer login

## 📝 Notas Importantes

- ⚠️ **Segurança**: Esta senha está documentada aqui apenas para configuração inicial
- 🔒 **Recomendação**: Após o primeiro login, altere a senha
- 👥 **Múltiplos Usuários**: Para criar mais usuários, repita o processo ou use CSV import

## 🚀 Próximos Passos

Após criar o usuário:

1. ✅ Fazer login no sistema
2. ✅ Verificar se o sino de notificações aparece no header
3. ✅ Testar o chat e menções (@mentions)
4. ✅ Criar mais membros/usuários conforme necessário
