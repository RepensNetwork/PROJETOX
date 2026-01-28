# 🚀 Executar Script 009 - Criar Membro

## ⚡ Solução Rápida (2 minutos)

### Passo 1: Acessar Supabase SQL Editor

1. Abra seu navegador
2. Acesse: **https://supabase.com/dashboard**
3. Faça login (se necessário)
4. Selecione seu projeto
5. No menu lateral, clique em **SQL Editor** (ícone de banco de dados)

### Passo 2: Copiar e Colar o SQL

Copie **TODO** o código abaixo:

```sql
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
```

### Passo 3: Executar o Script

1. No SQL Editor do Supabase, **cole** o código acima
2. Clique no botão **RUN** (ou pressione `Ctrl+Enter`)
3. Aguarde alguns segundos

### Passo 4: Verificar o Resultado

Você deve ver **2 resultados**:

**Resultado 1:** (Primeira verificação)
- Pode estar vazio se o membro não existir
- Ou mostrar os dados do membro se já existir

**Resultado 2:** (Após INSERT)
- Deve mostrar **1 linha** com:
  - `nome`: Mateus Friese
  - `email`: mateusfriese@hotmail.com
  - `ativo`: true
  - `is_admin`: true

### Passo 5: Fazer Login Novamente

1. Volte para: `http://localhost:3000/login`
2. Email: `mateusfriese@hotmail.com`
3. Senha: `Brf@2016`
4. Clique em **Entrar**

✅ **Deve funcionar agora!**

---

## 📸 Visual Guide

### Onde encontrar o SQL Editor:

```
Supabase Dashboard
  └── Seu Projeto
      └── SQL Editor (menu lateral esquerdo)
          └── Cole o código aqui
              └── Clique em RUN
```

### Como deve aparecer:

```
┌─────────────────────────────────────┐
│  SQL Editor                         │
├─────────────────────────────────────┤
│  [Cole o código SQL aqui]          │
│                                     │
│  ┌─────────┐                        │
│  │  RUN   │  ← Clique aqui         │
│  └─────────┘                        │
└─────────────────────────────────────┘
```

---

## 🐛 Se Der Erro

### Erro: "relation 'public.membros' does not exist"

**Causa:** A tabela `membros` não foi criada ainda.

**Solução:**
1. Execute primeiro o script `001_create_tables.sql`
2. Depois execute o script `009_verificar_e_criar_membro.sql`

### Erro: "permission denied"

**Causa:** Problema de permissões RLS.

**Solução:**
Execute este SQL antes:

```sql
-- Desabilitar RLS temporariamente (apenas para desenvolvimento)
ALTER TABLE public.membros DISABLE ROW LEVEL SECURITY;

-- Executar o script 009 novamente
-- (cole o código do script 009 aqui)

-- Reabilitar RLS
ALTER TABLE public.membros ENABLE ROW LEVEL SECURITY;
```

### Erro: "duplicate key value"

**Causa:** O membro já existe, mas pode estar inativo.

**Solução:**
Execute este SQL para ativar:

```sql
UPDATE public.membros
SET ativo = true, is_admin = true
WHERE email = 'mateusfriese@hotmail.com';
```

---

## ✅ Checklist Final

Após executar o script, verifique:

- [ ] Script executou sem erros
- [ ] Resultado mostra 1 linha com seus dados
- [ ] Campo `ativo` está como `true`
- [ ] Campo `is_admin` está como `true`
- [ ] Tentou fazer login novamente
- [ ] Login funcionou! 🎉

---

## 🆘 Ainda Não Funciona?

Se após executar o script o login ainda não funcionar:

1. **Verifique o console do navegador (F12):**
   - Procure por erros em vermelho
   - Copie as mensagens de erro

2. **Verifique os logs do servidor:**
   - Olhe o terminal onde `npm run dev` está rodando
   - Procure por mensagens de erro

3. **Verifique se o email está correto:**
   - No Supabase: `mateusfriese@hotmail.com`
   - No login: `mateusfriese@hotmail.com`
   - Devem ser **exatamente iguais** (sem espaços, case-sensitive)

---

**Execute o script e tente fazer login novamente!** 🚀
