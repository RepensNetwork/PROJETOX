# 🗄️ Guia Completo: Configurar Banco de Dados Supabase

## ⚠️ IMPORTANTE

**O sistema precisa do Supabase conectado para funcionar completamente!** Sem ele, você verá erros como "Cannot read properties of null" e os botões não funcionarão corretamente.

---

## 📋 Passo a Passo Completo

### 1️⃣ Criar Conta no Supabase

1. Acesse: **https://supabase.com**
2. Clique em **"Start your project"** ou **"Sign Up"**
3. Faça login com GitHub, Google ou email
4. Confirme seu email se necessário

### 2️⃣ Criar Novo Projeto

1. No dashboard do Supabase, clique em **"New Project"**
2. Preencha os dados:
   - **Name:** `shipops` (ou qualquer nome)
   - **Database Password:** Crie uma senha forte (anote ela!)
   - **Region:** Escolha a região mais próxima (ex: `South America (São Paulo)`)
   - **Pricing Plan:** Escolha **Free** para começar
3. Clique em **"Create new project"**
4. Aguarde 2-3 minutos enquanto o projeto é criado

### 3️⃣ Obter Credenciais

1. No dashboard do seu projeto, vá em **Settings** (ícone de engrenagem no menu lateral)
2. Clique em **API** no menu lateral
3. Você verá duas informações importantes:

   **a) Project URL:**
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```
   Copie essa URL completa!

   **b) anon/public key:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHh4eHh4eHh4eCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQ...
   ```
   Copie essa chave completa (é bem longa)!

### 4️⃣ Configurar Arquivo .env.local

1. Na raiz do projeto `AsaSistem`, crie um arquivo chamado **`.env.local`**
   - Se já existir, abra ele
   - Se não existir, crie um novo arquivo

2. Adicione as seguintes linhas (substitua pelos valores que você copiou):

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

   ⚠️ **IMPORTANTE:**
   - Não deixe espaços antes ou depois do `=`
   - Não use aspas nas variáveis
   - A URL deve começar com `https://`
   - A chave é muito longa, copie ela completa

3. Salve o arquivo (Ctrl+S)

### 5️⃣ Executar Scripts SQL

Agora você precisa criar as tabelas no banco de dados:

#### Opção A: Via Dashboard do Supabase (Mais Fácil)

1. No dashboard do Supabase, vá em **SQL Editor** (ícone de código no menu lateral)
2. Clique em **"New query"**
3. Abra o arquivo `scripts/001_create_tables.sql` do projeto
4. Copie TODO o conteúdo do arquivo
5. Cole no SQL Editor do Supabase
6. Clique em **"Run"** (ou pressione Ctrl+Enter)
7. Aguarde a mensagem de sucesso
8. Repita o processo com `scripts/002_seed_data.sql` (dados de exemplo)

#### Opção B: Via Supabase CLI

```powershell
# Instalar Supabase CLI (se ainda não tiver)
npm install -g supabase

# Fazer login
supabase login

# Conectar ao projeto
supabase link --project-ref seu-project-ref

# Executar scripts
supabase db execute --file scripts/001_create_tables.sql
supabase db execute --file scripts/002_seed_data.sql
```

### 6️⃣ Verificar se Está Funcionando

1. **Reinicie o servidor Next.js:**
   - Pare o servidor (Ctrl+C no terminal)
   - Inicie novamente: `npm run dev`

2. **Acesse o sistema:**
   - Abra: http://localhost:3000
   - Vá em **Navios** ou **Escalas**
   - Tente criar um novo navio ou escala

3. **Verifique o console:**
   - Abra o terminal onde o servidor está rodando
   - Você NÃO deve ver mais a mensagem: `⚠️ Supabase não configurado!`
   - Se aparecer, verifique se o arquivo `.env.local` está correto

---

## ✅ Checklist de Verificação

Marque cada item quando completar:

- [ ] Conta criada no Supabase
- [ ] Projeto criado no Supabase
- [ ] Credenciais copiadas (URL e Anon Key)
- [ ] Arquivo `.env.local` criado na raiz do projeto
- [ ] Variáveis adicionadas no `.env.local`
- [ ] Script `001_create_tables.sql` executado com sucesso
- [ ] Script `002_seed_data.sql` executado com sucesso
- [ ] Servidor Next.js reiniciado
- [ ] Sistema funcionando sem erros

---

## 🐛 Troubleshooting

### Erro: "Supabase não configurado"

**Causa:** Arquivo `.env.local` não existe ou está incorreto

**Solução:**
1. Verifique se o arquivo `.env.local` está na raiz do projeto (`c:\Users\mateu\AsaSistem\.env.local`)
2. Verifique se as variáveis estão escritas corretamente (sem espaços, sem aspas)
3. Reinicie o servidor Next.js após criar/editar o arquivo

### Erro: "Invalid API key"

**Causa:** A chave anon está incorreta ou incompleta

**Solução:**
1. Volte ao Supabase Dashboard → Settings → API
2. Copie a chave novamente (ela é muito longa, certifique-se de copiar tudo)
3. Cole no `.env.local` sem espaços ou quebras de linha
4. Reinicie o servidor

### Erro: "relation does not exist"

**Causa:** As tabelas não foram criadas no banco

**Solução:**
1. Execute o script `001_create_tables.sql` no SQL Editor do Supabase
2. Verifique se não houve erros na execução
3. Vá em **Table Editor** no Supabase e verifique se as tabelas aparecem

### Erro: "Cannot read properties of null"

**Causa:** Banco não conectado ou tabelas vazias

**Solução:**
1. Verifique se o `.env.local` está configurado corretamente
2. Execute os scripts SQL novamente
3. Verifique se há dados nas tabelas (Table Editor do Supabase)

### O servidor não reconhece as variáveis

**Causa:** Servidor não foi reiniciado após criar `.env.local`

**Solução:**
1. Pare o servidor (Ctrl+C)
2. Inicie novamente: `npm run dev`
3. As variáveis só são carregadas quando o servidor inicia

---

## 📊 Verificar Dados no Supabase

Para verificar se os dados foram criados corretamente:

1. No Supabase Dashboard, vá em **Table Editor**
2. Você deve ver as seguintes tabelas:
   - `navios` (2 navios)
   - `membros` (3 membros)
   - `escalas` (5 escalas)
   - `demandas` (12 demandas)
   - `comentarios`
   - `anexos`
   - `historico`

3. Clique em cada tabela para ver os dados

---

## 🔒 Segurança

⚠️ **IMPORTANTE sobre segurança:**

- O arquivo `.env.local` está no `.gitignore` e NÃO será commitado no Git
- A chave `anon` é pública e pode ser usada no frontend (isso é seguro)
- NUNCA compartilhe sua senha do banco de dados
- Para produção, configure políticas RLS mais restritivas

---

## 📚 Recursos Úteis

- **Documentação do Supabase:** https://supabase.com/docs
- **Dashboard do Supabase:** https://app.supabase.com
- **SQL Editor:** https://app.supabase.com/project/_/sql
- **Table Editor:** https://app.supabase.com/project/_/editor

---

## 🎉 Pronto!

Após seguir todos os passos, seu sistema deve estar funcionando completamente!

**Se ainda tiver problemas, verifique:**
1. Console do terminal (mensagens de erro)
2. Console do navegador (F12 → Console)
3. Logs do Supabase Dashboard → Logs

---

**Precisa de ajuda?** Verifique os logs do servidor e do navegador para mensagens de erro específicas.
