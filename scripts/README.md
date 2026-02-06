# 📋 Scripts SQL do Banco de Dados

Este diretório contém os scripts SQL para criar e popular o banco de dados do Ship Operations Management System.

## 📁 Arquivos

### 1. `001_create_tables.sql`
Script para criar todas as tabelas, tipos ENUM, índices e políticas RLS do sistema.

**Conteúdo:**
- Tabelas: `navios`, `membros`, `escalas`, `demandas`, `comentarios`, `anexos`, `historico`
- Tipos ENUM: `escala_status`, `demanda_tipo`, `demanda_status`, `demanda_prioridade`, `demanda_categoria`
- Índices para performance
- Row Level Security (RLS) habilitado
- Políticas RLS permissivas (para MVP)

### 2. `015_create_notificacoes_demanda.sql`
**Necessário para notificações ao atribuir responsável.** Cria a tabela `notificacoes_demanda` e políticas RLS. Execute no Supabase (SQL Editor) para que o responsável receba notificação no sino quando alguém atribuir uma demanda a ele.

### 3. `016_create_alertas.sql`
**Necessário para alertas de novas demandas e transportes.** Cria a tabela `alertas` (nova demanda / novo transporte). Execute no Supabase (SQL Editor) para que novas demandas e transportes apareçam no sino e no dashboard como alerta.

### 4. `021_financeiro_tables.sql`
**Módulo Financeiro.** Cria tabelas: `financeiro_categorias`, `financeiro_contas`, `financeiro_lancamentos`, `financeiro_comissoes`, índices, RLS e seed de categorias/contas iniciais. Execute no SQL Editor do Supabase para usar a área Financeiro do sistema.

### 5. `002_seed_data.sql`
Script para popular o banco de dados com dados de exemplo.

**Conteúdo:**
- 3 membros da equipe
- 2 navios (Costa Diadema e Costa Fascinosa)
- 5 escalas (port calls)
- 12 demandas com diferentes status e prioridades
- Comentários e histórico de atividades

## 🚀 Como Usar

### No Supabase Dashboard

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Execute os scripts na ordem:
   - Primeiro: `001_create_tables.sql`
   - Depois: `002_seed_data.sql`
   - Para notificações de demanda: `015_create_notificacoes_demanda.sql`
   - Para alertas (sino/dashboard): `016_create_alertas.sql`
   - Para módulo Financeiro: `021_financeiro_tables.sql`

### Via CLI do Supabase

```bash
# Instalar Supabase CLI (se ainda não tiver)
npm install -g supabase

# Fazer login
supabase login

# Executar scripts
supabase db execute --file scripts/001_create_tables.sql
supabase db execute --file scripts/002_seed_data.sql
```

### Via psql (PostgreSQL)

```bash
# Conectar ao banco
psql -h <seu-host> -U <seu-usuario> -d <seu-banco>

# Executar scripts
\i scripts/001_create_tables.sql
\i scripts/002_seed_data.sql
```

## ⚠️ Importante

- Execute `001_create_tables.sql` **ANTES** de `002_seed_data.sql`
- Os scripts usam `CREATE TABLE IF NOT EXISTS` e `CREATE INDEX IF NOT EXISTS`, então podem ser executados múltiplas vezes sem erro
- O script de seed usa IDs fixos (UUIDs), então executar múltiplas vezes pode causar erros de duplicação
- Para resetar o banco, você pode deletar as tabelas manualmente ou usar `DROP TABLE` antes de executar novamente

## 📊 Estrutura de Dados

### Tabelas Principais
- **navios**: Navios do sistema
- **membros**: Membros da equipe
- **escalas**: Escalas (port calls) dos navios
- **demandas**: Demandas relacionadas às escalas
- **comentarios**: Comentários nas demandas
- **anexos**: Anexos de arquivos nas demandas
- **historico**: Histórico de ações nas demandas

### Relacionamentos
- `escalas.navio_id` → `navios.id`
- `demandas.escala_id` → `escalas.id`
- `demandas.responsavel_id` → `membros.id`
- `comentarios.membro_id` → `membros.id`
- `anexos.uploaded_by` → `membros.id`
- `historico.membro_id` → `membros.id`

## 🔒 Segurança

As políticas RLS estão configuradas como permissivas (todos os usuários autenticados podem CRUD). Para produção, você deve:

1. Revisar e restringir as políticas RLS
2. Implementar autenticação adequada
3. Adicionar validações de permissões por papel/função

## 📝 Notas

- Os dados de seed são apenas para desenvolvimento e demonstração
- IDs fixos são usados para facilitar testes e desenvolvimento
- Datas são relativas (`NOW() + INTERVAL`) para criar dados dinâmicos
- Checklists são armazenados como JSONB

---

**Scripts SQL criados e prontos para uso!** 🎉
