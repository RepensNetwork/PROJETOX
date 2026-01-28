# 🗄️ Como Executar os Scripts SQL no Supabase

## ⚠️ ORDEM OBRIGATÓRIA

**IMPORTANTE:** Você DEVE executar os scripts nesta ordem:

1. **PRIMEIRO:** `001_create_tables.sql` (cria as tabelas)
2. **DEPOIS:** `002_seed_data.sql` (insere dados de exemplo)

---

## 📋 Passo a Passo

### 1️⃣ Executar Script de Criação de Tabelas

1. **Acesse o Supabase Dashboard:**
   - Vá em: https://app.supabase.com
   - Selecione seu projeto

2. **Abra o SQL Editor:**
   - Clique em **SQL Editor** no menu lateral (ícone de código `</>`)

3. **Crie uma nova query:**
   - Clique em **"New query"** ou **"+"**

4. **Copie o conteúdo do arquivo:**
   - Abra o arquivo `scripts/001_create_tables.sql` no seu editor
   - Selecione TODO o conteúdo (Ctrl+A)
   - Copie (Ctrl+C)

5. **Cole no SQL Editor:**
   - Cole o conteúdo no editor do Supabase (Ctrl+V)

6. **Execute o script:**
   - Clique no botão **"Run"** (ou pressione `Ctrl+Enter`)
   - Aguarde a mensagem de sucesso: `Success. No rows returned`

7. **Verifique se funcionou:**
   - Vá em **Table Editor** no menu lateral
   - Você deve ver as seguintes tabelas:
     - `navios`
     - `membros`
     - `escalas`
     - `demandas`
     - `comentarios`
     - `anexos`
     - `historico`

### 2️⃣ Executar Script de Dados de Exemplo

**SÓ EXECUTE ESTE DEPOIS DE TER EXECUTADO O PRIMEIRO COM SUCESSO!**

1. **No SQL Editor do Supabase:**
   - Clique em **"New query"** novamente (ou limpe o editor anterior)

2. **Copie o conteúdo:**
   - Abra o arquivo `scripts/002_seed_data.sql`
   - Selecione TODO o conteúdo (Ctrl+A)
   - Copie (Ctrl+C)

3. **Cole e execute:**
   - Cole no SQL Editor
   - Clique em **"Run"** (ou `Ctrl+Enter`)
   - Aguarde a mensagem de sucesso

4. **Verifique os dados:**
   - Vá em **Table Editor**
   - Clique em cada tabela para ver os dados:
     - `membros` → 3 membros
     - `navios` → 2 navios
     - `escalas` → 5 escalas
     - `demandas` → 12 demandas

---

## ✅ Verificação Final

Após executar ambos os scripts:

1. **No Table Editor, verifique:**
   - [ ] Tabela `membros` existe e tem 3 registros
   - [ ] Tabela `navios` existe e tem 2 registros
   - [ ] Tabela `escalas` existe e tem 5 registros
   - [ ] Tabela `demandas` existe e tem 12 registros

2. **Reinicie o servidor Next.js:**
   ```powershell
   # Pare o servidor (Ctrl+C)
   # Inicie novamente
   npm run dev
   ```

3. **Teste o sistema:**
   - Acesse: http://localhost:3000
   - Vá em **Navios** → Deve mostrar 2 navios
   - Vá em **Escalas** → Deve mostrar 5 escalas
   - Vá em **Demandas** → Deve mostrar 12 demandas

---

## 🐛 Erros Comuns

### Erro: "relation does not exist"

**Causa:** Você tentou executar o script de seed ANTES do script de criação.

**Solução:**
1. Execute primeiro `001_create_tables.sql`
2. Verifique se as tabelas foram criadas (Table Editor)
3. Só então execute `002_seed_data.sql`

### Erro: "duplicate key value"

**Causa:** Você executou o script de seed mais de uma vez.

**Solução:**
1. Limpe os dados existentes (opcional):
   ```sql
   TRUNCATE TABLE public.historico, public.comentarios, public.anexos, 
                 public.demandas, public.escalas, public.navios, public.membros CASCADE;
   ```
2. Execute `002_seed_data.sql` novamente

### Erro: "type does not exist"

**Causa:** Os tipos ENUM não foram criados.

**Solução:**
1. Execute `001_create_tables.sql` novamente
2. Os tipos ENUM são criados automaticamente no script

---

## 📝 Notas Importantes

- Os scripts usam `CREATE TABLE IF NOT EXISTS`, então podem ser executados múltiplas vezes sem erro
- O script de seed usa IDs fixos (UUIDs), então executar múltiplas vezes pode causar erros de duplicação
- Se precisar resetar tudo, delete as tabelas manualmente no Table Editor ou use `DROP TABLE`

---

## 🎉 Pronto!

Após executar ambos os scripts com sucesso, seu banco de dados estará configurado e pronto para uso!
