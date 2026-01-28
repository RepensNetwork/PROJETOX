# @Mentions e Notificações no Chat

## 📋 Visão Geral

O sistema de chat agora suporta **menções (@mentions)** com notificações automáticas e rastreamento de leitura. Quando você menciona um colaborador usando `@nome`, ele recebe uma notificação e o sistema registra quando a mensagem foi lida.

## 🚀 Como Usar

### 1. Executar os Scripts SQL

Execute os scripts SQL no Supabase na seguinte ordem:

```sql
-- 1. Tabela de mensagens (se ainda não executou)
-- scripts/004_create_mensagens_table.sql

-- 2. Tabelas de notificações, menções e leituras
-- scripts/005_create_notificacoes_table.sql
```

**No Supabase Dashboard:**
1. Acesse o SQL Editor
2. Execute `004_create_mensagens_table.sql` (se ainda não executou)
3. Execute `005_create_notificacoes_table.sql`
4. Confirme que as tabelas foram criadas

### 2. Mencionar Colaboradores

1. No campo de mensagem, digite `@`
2. Uma lista de colaboradores aparecerá automaticamente
3. Continue digitando para filtrar (ex: `@jo` mostra "João Silva")
4. Use as setas ↑↓ para navegar
5. Pressione `Enter` ou `Tab` para selecionar
6. Ou clique diretamente no nome

**Exemplo:**
```
@joão favor verificar a escala
```

### 3. Visualizar Menções

- Menções aparecem **destacadas** nas mensagens (fundo azul)
- Formato: `@Nome do Colaborador`

## 🔔 Sistema de Notificações

### Como Funciona

1. **Ao mencionar alguém:**
   - Uma notificação é criada automaticamente
   - O colaborador mencionado recebe a notificação
   - A notificação fica vinculada à mensagem e à escala

2. **Rastreamento de Leitura:**
   - Quando o colaborador visualiza a mensagem, ela é marcada como lida
   - O sistema registra o horário exato da leitura
   - Isso acontece automaticamente quando a página é carregada

### Estrutura de Dados

**Tabela `notificacoes`:**
- `mensagem_id` - ID da mensagem que gerou a notificação
- `membro_id` - ID do membro mencionado
- `escala_id` - ID da escala relacionada
- `lida` - Se a notificação foi lida (boolean)
- `lida_em` - Timestamp de quando foi lida
- `created_at` - Timestamp de criação

**Tabela `mensagem_mencoes`:**
- `mensagem_id` - ID da mensagem
- `membro_id` - ID do membro mencionado
- Relacionamento único (não duplica menções)

**Tabela `mensagem_leituras`:**
- `mensagem_id` - ID da mensagem
- `membro_id` - ID do membro que leu
- `lida_em` - Timestamp da leitura
- Relacionamento único por membro/mensagem

## 🎨 Interface

### Autocomplete de Menções

- **Dropdown aparece** quando você digita `@`
- **Filtragem em tempo real** conforme você digita
- **Navegação por teclado:**
  - `↑` / `↓` - Navegar na lista
  - `Enter` / `Tab` - Selecionar
  - `Escape` - Fechar dropdown
- **Visualização:**
  - Avatar do colaborador
  - Nome completo
  - Email
  - Ícone @

### Mensagens com Menções

- Menções aparecem com **fundo azul destacado**
- Formato: `@Nome do Colaborador`
- Fácil identificação visual

## 🔧 Funcionalidades Técnicas

### Extração de Menções

O sistema extrai menções do texto usando regex:
- Padrão: `@nome` ou `@id`
- Busca por nome, email ou ID
- Remove duplicatas automaticamente

### Processamento Automático

1. **Ao enviar mensagem:**
   - Extrai todas as menções do texto
   - Cria registros em `mensagem_mencoes`
   - Gera notificações em `notificacoes`

2. **Ao visualizar mensagens:**
   - Marca automaticamente como lida
   - Registra timestamp em `mensagem_leituras`

## 📊 Queries Úteis

### Ver todas as notificações de um membro

```sql
SELECT 
  n.*,
  m.conteudo as mensagem_conteudo,
  a.nome as autor_nome
FROM notificacoes n
JOIN mensagens m ON m.id = n.mensagem_id
JOIN membros a ON a.id = m.membro_id
WHERE n.membro_id = 'ID_DO_MEMBRO'
ORDER BY n.created_at DESC;
```

### Ver notificações não lidas

```sql
SELECT * FROM notificacoes
WHERE membro_id = 'ID_DO_MEMBRO'
AND lida = false
ORDER BY created_at DESC;
```

### Ver quem leu uma mensagem

```sql
SELECT 
  ml.*,
  m.nome as membro_nome
FROM mensagem_leituras ml
JOIN membros m ON m.id = ml.membro_id
WHERE ml.mensagem_id = 'ID_DA_MENSAGEM'
ORDER BY ml.lida_em DESC;
```

## 🐛 Troubleshooting

### Autocomplete não aparece
- Verifique se há membros cadastrados
- Confirme que `todosMembros` está sendo passado para o componente
- Verifique o console do navegador para erros

### Menções não geram notificações
- Verifique se a tabela `notificacoes` foi criada
- Confirme que `mensagem_mencoes` está sendo populada
- Verifique os logs do servidor

### Leituras não são registradas
- Verifique se a tabela `mensagem_leituras` foi criada
- Confirme que o `membroAtual` está correto
- Verifique os logs do servidor

## 📝 Próximas Melhorações

- [ ] Badge de notificações não lidas no header
- [ ] Página dedicada de notificações
- [ ] Notificações em tempo real (WebSockets)
- [ ] Marcar todas como lidas
- [ ] Filtro de mensagens por menção
- [ ] Histórico de notificações

## 💡 Dicas

1. **Use menções para:**
   - Chamar atenção de alguém específico
   - Atribuir tarefas
   - Solicitar informações urgentes

2. **Boas práticas:**
   - Mencione apenas quando necessário
   - Use o nome completo ou começo do nome
   - Combine com contexto claro na mensagem

3. **Exemplo de uso:**
   ```
   @joão favor verificar a documentação do navio
   @maria pode confirmar o horário de chegada?
   ```
