# 🗑️ Como Limpar o Banco de Dados

Este guia explica como limpar todos os dados do banco de dados para começar do zero.

## ⚠️ ATENÇÃO

**Este script remove TODOS os dados das tabelas!** Use apenas se tiver certeza de que deseja limpar o banco.

## 📋 Passo a Passo

### 1. Acessar o Supabase SQL Editor

1. Acesse [https://app.supabase.com](https://app.supabase.com)
2. Selecione seu projeto
3. No menu lateral, clique em **"SQL Editor"**
4. Clique em **"New query"**

### 2. Executar o Script de Limpeza

1. Abra o arquivo `scripts/003_limpar_banco.sql` no seu editor
2. Copie todo o conteúdo do arquivo
3. Cole no SQL Editor do Supabase
4. Clique em **"Run"** ou pressione `Ctrl+Enter`

### 3. Verificar a Limpeza

O script mostrará uma mensagem de sucesso e listará o número de registros em cada tabela (deve ser 0).

## 📝 O que o Script Faz

O script remove todos os dados das seguintes tabelas (nesta ordem):

1. `historico` - Histórico de alterações
2. `comentarios` - Comentários das demandas
3. `anexos` - Anexos das demandas
4. `demandas` - Demandas
5. `escalas` - Escalas
6. `navios` - Navios
7. `membros` - Membros/Colaboradores

## 🔄 Após Limpar

Após limpar o banco, você pode:

1. **Cadastrar manualmente** através das interfaces do sistema
2. **Importar via CSV** usando os botões "Importar CSV" nas páginas:
   - Colaboradores (`/membros`)
   - Navios (`/navios`)
   - Escalas (`/escalas`)

## 📄 Formato dos Arquivos CSV

### Colaboradores (membros.csv)
```csv
nome,email,avatar_url
João Silva,joao@example.com,https://example.com/avatar.jpg
Maria Santos,maria@example.com,
```

### Navios (navios.csv)
```csv
nome,companhia,observacoes
Navio Exemplo,Companhia ABC,Navio de carga geral
Outro Navio,Companhia XYZ,
```

### Escalas (escalas.csv)
```csv
navio,porto,data_chegada,data_saida,status,observacoes
Navio Exemplo,Santos - SP,2025-01-25T08:00:00,2025-01-27T18:00:00,planejada,
Outro Navio,Paranaguá - PR,2025-02-01T10:00:00,2025-02-03T18:00:00,em_operacao,
```

**Importante para Escalas:**
- O campo `navio` deve conter o **nome exato** do navio cadastrado
- As datas devem estar no formato ISO (YYYY-MM-DDTHH:mm:ss)
- O status pode ser: `planejada`, `em_operacao`, `concluida`, `cancelada`

## 🚨 Se Algo Der Errado

Se você executar o script por engano, você precisará:

1. Recriar os dados manualmente
2. Ou restaurar um backup do banco (se tiver configurado backups no Supabase)
