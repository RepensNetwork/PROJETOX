# 💬 Sistema de Chat Interno

## 📋 Visão Geral

O sistema de chat interno permite que os membros da equipe se comuniquem diretamente dentro de cada escala. Todas as mensagens estão vinculadas a uma escala específica, facilitando a organização e o contexto das conversas.

## 🚀 Como Usar

### 1. Executar o Script SQL

Primeiro, você precisa criar a tabela de mensagens no banco de dados:

```sql
-- Execute o script em seu banco Supabase
-- Arquivo: scripts/004_create_mensagens_table.sql
```

**No Supabase Dashboard:**
1. Acesse o SQL Editor
2. Cole o conteúdo do arquivo `scripts/004_create_mensagens_table.sql`
3. Execute o script

### 2. Acessar o Chat

1. Navegue até uma escala específicimage.pnga: `/escalas/[id]`
2. Role até a seção "Chat da Escala" no final da página
3. O chat estará disponível para todos os membros cadastrados

## ✨ Funcionalidades

### Enviar Mensagens
- Digite sua mensagem no campo de texto
- Pressione `Enter` para enviar (ou `Shift + Enter` para nova linha)
- Clique no botão de envio (ícone de avião de papel)

### Editar Mensagens
- Apenas suas próprias mensagens podem ser editadas
- Clique no menu de três pontos (⋮) na sua mensagem
- Selecione "Editar"
- Modifique o texto e clique em "Salvar"
- Pressione `Escape` para cancelar

### Deletar Mensagens
- Apenas suas próprias mensagens podem ser deletadas
- Clique no menu de três pontos (⋮) na sua mensagem
- Selecione "Deletar"
- Confirme a ação no diálogo

### Visualização
- Mensagens próprias aparecem à direita (azul)
- Mensagens de outros membros aparecem à esquerda (cinza)
- Cada mensagem mostra:
  - Avatar do autor
  - Nome do autor
  - Tempo relativo (ex: "há 5 minutos")
  - Conteúdo da mensagem
  - Indicador "(editado)" se a mensagem foi modificada

## 🔧 Configuração Atual

**Nota:** Atualmente, o sistema usa o primeiro membro cadastrado como "membro atual". Em produção, isso deve ser substituído por um sistema de autenticação real.

### Para Implementar Autenticação:

1. Integre um sistema de autenticação (NextAuth.js, Supabase Auth, etc.)
2. Modifique `app/escalas/[id]/page.tsx` para obter o membro atual da sessão:

```typescript
// Exemplo com NextAuth
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export default async function EscalaDetailPage({ params }: EscalaDetailPageProps) {
  const session = await getServerSession(authOptions)
  const membroAtual = await getMembroByEmail(session?.user?.email)
  
  // ... resto do código
}
```

## 📊 Estrutura do Banco de Dados

### Tabela: `mensagens`

```sql
CREATE TABLE mensagens (
  id UUID PRIMARY KEY,
  escala_id UUID NOT NULL REFERENCES escalas(id),
  membro_id UUID NOT NULL REFERENCES membros(id),
  conteudo TEXT NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### Relacionamentos
- Cada mensagem pertence a uma **escala** (`escala_id`)
- Cada mensagem tem um **autor** (`membro_id`)
- Mensagens são ordenadas por `created_at` (mais antigas primeiro)

## 🎨 Interface

O chat possui:
- **Design moderno** com tema escuro consistente
- **Scroll automático** para a última mensagem
- **Responsivo** para diferentes tamanhos de tela
- **Feedback visual** para ações (enviando, editando, etc.)

## 🔒 Segurança

- Row Level Security (RLS) habilitado na tabela `mensagens`
- Política permissiva para equipe pequena (todos autenticados podem CRUD)
- Em produção, ajuste as políticas RLS conforme necessário

## 🐛 Troubleshooting

### Chat não aparece
- Verifique se há membros cadastrados no sistema
- Confirme que a tabela `mensagens` foi criada
- Verifique os logs do console para erros

### Mensagens não aparecem
- Verifique a conexão com o Supabase
- Confirme que `escala_id` está correto
- Verifique as políticas RLS no Supabase

### Erro ao enviar mensagem
- Verifique se o `membro_id` está válido
- Confirme que o `escala_id` existe
- Verifique os logs do servidor

## 📝 Próximas Melhorias

- [ ] Notificações em tempo real (WebSockets/Supabase Realtime)
- [ ] Upload de arquivos/imagens
- [ ] Menções de usuários (@nome)
- [ ] Emojis e formatação rica
- [ ] Busca de mensagens
- [ ] Histórico de edições
- [ ] Indicadores de leitura
