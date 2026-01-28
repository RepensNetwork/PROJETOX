# 🔐 Configuração de Autenticação e Login

## 📋 Visão Geral

O sistema agora possui autenticação completa com Supabase Auth. Cada usuário precisa fazer login antes de acessar o sistema, e o header inclui um sino de notificações que mostra quando o usuário é mencionado no chat.

## 🚀 Passos para Configurar

### 1. Habilitar Autenticação no Supabase

1. Acesse o **Supabase Dashboard**
2. Vá em **Authentication** > **Providers**
3. Habilite **Email** provider
4. Configure as opções:
   - ✅ Enable email provider
   - ✅ Confirm email (opcional, para produção)

### 2. Configurar URLs de Redirecionamento

1. No Supabase Dashboard, vá em **Authentication** > **URL Configuration**
2. Configure:
   - **Site URL**: `http://localhost:3000` (desenvolvimento)
   - **Redirect URLs**:
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/dashboard`
     - `http://localhost:3000/login`

### 3. Executar Script SQL

Execute o script `scripts/006_setup_auth.sql` no Supabase SQL Editor:

```sql
-- O script cria:
-- 1. Função para sincronizar usuários Auth com tabela membros
-- 2. Trigger automático
-- 3. Políticas RLS atualizadas
```

### 4. Criar Usuários

#### Opção A: Via Supabase Dashboard (Recomendado)

1. Vá em **Authentication** > **Users**
2. Clique em **Add User**
3. Preencha:
   - **Email**: email do membro
   - **Password**: senha temporária
   - **Auto Confirm User**: ✅ (marca para confirmar automaticamente)
4. Clique em **Create User**

**Importante:** O email deve corresponder ao email na tabela `membros`!

#### Opção B: Criar Membro Primeiro

1. Adicione o membro na tabela `membros` (via CSV ou manualmente)
2. Depois crie o usuário no Supabase Auth com o mesmo email

### 5. Instalar Dependências

Execute no terminal:

```bash
npm install @radix-ui/react-popover @radix-ui/react-scroll-area
```

## 🎯 Como Funciona

### Fluxo de Autenticação

1. **Usuário acessa qualquer rota protegida**
   - Middleware verifica autenticação
   - Se não autenticado, redireciona para `/login`

2. **Usuário faz login**
   - Digite email e senha
   - Sistema verifica no Supabase Auth
   - Verifica se existe membro correspondente
   - Redireciona para `/dashboard`

3. **Sessão mantida**
   - Cookies gerenciados pelo Supabase SSR
   - Middleware valida em cada requisição

### Sistema de Notificações

1. **Sino no Header**
   - Mostra contador de notificações não lidas
   - Badge vermelho com número

2. **Ao clicar no sino**
   - Abre popover com lista de notificações
   - Notificações não lidas aparecem destacadas
   - Opção de marcar todas como lidas

3. **Ao clicar em uma notificação**
   - Marca como lida automaticamente
   - Redireciona para a escala relacionada

## 📱 Interface

### Página de Login

- Design moderno e limpo
- Validação de campos
- Mensagens de erro claras
- Responsivo

### Header com Notificações

- **Sino de notificações** (ícone Bell)
  - Badge com contador de não lidas
  - Popover com lista completa
  - Scroll para muitas notificações

- **Menu do usuário** (avatar)
  - Nome e email
  - Opção de logout

## 🔧 Estrutura de Arquivos

```
app/
  login/
    page.tsx              # Página de login
  auth/
    callback/
      route.ts            # Callback do Supabase Auth
  actions/
    auth.ts               # Actions de autenticação

components/
  layout/
    header.tsx             # Header com notificações
  notifications/
    notification-bell.tsx # Componente do sino

lib/
  supabase/
    client.ts             # Cliente Supabase para browser
    server.ts             # Cliente Supabase para server

middleware.ts             # Proteção de rotas
```

## 🐛 Troubleshooting

### Erro: "Usuário não encontrado"

**Causa:** Email do usuário Auth não corresponde a nenhum membro.

**Solução:**
1. Verifique se o membro existe na tabela `membros`
2. Confirme que o email é exatamente o mesmo
3. Crie o membro primeiro ou atualize o email no Auth

### Erro: "Invalid login credentials"

**Causa:** Email ou senha incorretos.

**Solução:**
1. Verifique email e senha
2. Confirme que o usuário foi criado no Supabase Auth
3. Tente resetar a senha no Supabase Dashboard

### Notificações não aparecem

**Causa:** Tabela `notificacoes` não criada ou membro_id incorreto.

**Solução:**
1. Execute `scripts/005_create_notificacoes_table.sql`
2. Verifique se o `membro_id` está correto
3. Confirme que há notificações no banco

### Middleware bloqueando tudo

**Causa:** Configuração incorreta de rotas públicas.

**Solução:**
1. Verifique `middleware.ts`
2. Confirme que `/login` e `/auth/callback` estão nas rotas públicas
3. Verifique variáveis de ambiente do Supabase

## 📝 Variáveis de Ambiente

Certifique-se de ter no `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
```

## 🔒 Segurança

- ✅ Rotas protegidas por middleware
- ✅ Sessões gerenciadas pelo Supabase
- ✅ Validação de membro correspondente
- ✅ RLS habilitado nas tabelas
- ✅ Cookies seguros (HttpOnly, SameSite)

## 💡 Próximas Melhorias

- [ ] Recuperação de senha
- [ ] Alteração de senha
- [ ] Perfil do usuário
- [ ] Notificações em tempo real (WebSockets)
- [ ] Filtros de notificações
- [ ] Marcar como lida individualmente
