# 📥 Como Importar Dados via CSV

Este guia explica como importar Colaboradores, Navios e Escalas usando arquivos CSV.

## 📋 Onde Importar

Você pode importar dados nas seguintes páginas:

1. **Colaboradores** - `/membros` - Botão "Importar CSV"
2. **Navios** - `/navios` - Botão "Importar CSV"
3. **Escalas** - `/escalas` - Botão "Importar CSV"

## 📄 Formatos dos Arquivos CSV

### 1. Colaboradores (membros.csv)

**Cabeçalhos obrigatórios:**
- `nome` (ou `name`)
- `email` (ou `e_mail`)

**Cabeçalhos opcionais:**
- `avatar_url` (ou `avatar`)

**Exemplo:**
```csv
nome,email,avatar_url
João Silva,joao@example.com,https://example.com/avatar.jpg
Maria Santos,maria@example.com,
Pedro Costa,pedro@example.com,https://example.com/pedro.jpg
```

### 2. Navios (navios.csv)

**Cabeçalhos obrigatórios:**
- `nome` (ou `name`)
- `companhia` (ou `company`)

**Cabeçalhos opcionais:**
- `observacoes` (ou `observations`, `obs`)

**Exemplo:**
```csv
nome,companhia,observacoes
Navio Exemplo,Companhia ABC,Navio de carga geral
Outro Navio,Companhia XYZ,
Terceiro Navio,Companhia DEF,Navio de passageiros
```

### 3. Escalas (escalas.csv)

**Cabeçalhos obrigatórios:**
- `navio` (ou `navio_nome`, `ship`) - **Nome exato do navio cadastrado**
- `porto` (ou `port`)
- `data_chegada` (ou `chegada`, `arrival`)

**Cabeçalhos opcionais:**
- `data_saida` (ou `saida`, `departure`)
- `status` (padrão: `planejada`)
- `observacoes` (ou `observations`, `obs`)

**Formatos de data aceitos:**
- ISO: `2025-01-25T08:00:00`
- ISO sem hora: `2025-01-25` (será interpretado como meia-noite)
- Formato brasileiro: `25/01/2025 08:00`

**Status válidos:**
- `planejada`
- `em_operacao`
- `concluida`
- `cancelada`

**Exemplo:**
```csv
navio,porto,data_chegada,data_saida,status,observacoes
Navio Exemplo,Santos - SP,2025-01-25T08:00:00,2025-01-27T18:00:00,planejada,
Outro Navio,Paranaguá - PR,2025-02-01T10:00:00,2025-02-03T18:00:00,em_operacao,
Terceiro Navio,Rio Grande - RS,2025-02-10T14:00:00,,planejada,Escala rápida
```

## ⚠️ Importante

### Para Escalas:
1. **Os navios devem estar cadastrados ANTES** de importar escalas
2. O nome do navio no CSV deve ser **exatamente igual** ao nome cadastrado
3. Se o navio não for encontrado, a linha será ignorada com erro

### Dicas:
- Use vírgulas para separar colunas
- Se um campo contiver vírgulas, coloque entre aspas: `"Campo, com vírgula"`
- Campos vazios são permitidos (exceto obrigatórios)
- O sistema mostra um preview das primeiras 5 linhas antes de importar

## 🔄 Processo de Importação

1. Clique no botão **"Importar CSV"** na página desejada
2. Selecione o arquivo CSV
3. Revise o preview (primeiras 5 linhas)
4. Clique em **"Importar"**
5. Aguarde o processamento
6. Veja o resultado (quantos registros foram importados)
7. A página será recarregada automaticamente após sucesso

## ❌ Tratamento de Erros

Se houver erros na importação:
- O sistema mostrará quais linhas tiveram problemas
- As linhas válidas serão importadas normalmente
- As linhas com erro serão ignoradas
- Você pode corrigir o CSV e tentar novamente

## 📝 Exemplo Completo

### Passo 1: Limpar o banco (opcional)
Execute o script `scripts/003_limpar_banco.sql` no Supabase SQL Editor.

### Passo 2: Importar Colaboradores
1. Crie `membros.csv`:
```csv
nome,email
João Silva,joao@example.com
Maria Santos,maria@example.com
```
2. Vá para `/membros`
3. Clique em "Importar CSV"
4. Selecione o arquivo
5. Clique em "Importar"

### Passo 3: Importar Navios
1. Crie `navios.csv`:
```csv
nome,companhia
Navio Exemplo,Companhia ABC
Outro Navio,Companhia XYZ
```
2. Vá para `/navios`
3. Clique em "Importar CSV"
4. Selecione o arquivo
5. Clique em "Importar"

### Passo 4: Importar Escalas
1. Crie `escalas.csv`:
```csv
navio,porto,data_chegada,data_saida,status
Navio Exemplo,Santos - SP,2025-01-25T08:00:00,2025-01-27T18:00:00,planejada
Outro Navio,Paranaguá - PR,2025-02-01T10:00:00,2025-02-03T18:00:00,em_operacao
```
2. Vá para `/escalas`
3. Clique em "Importar CSV"
4. Selecione o arquivo
5. Clique em "Importar"

## ✅ Pronto!

Agora você tem todos os dados importados e pode começar a usar o sistema!
