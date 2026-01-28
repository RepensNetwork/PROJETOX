# 👤 Perfil e Administração de Usuários

## 📋 Funcionalidades Implementadas

### 1. Tela de Perfil (`/perfil`)

Permite que cada usuário:
- ✅ Visualize suas informações pessoais
- ✅ Adicione ou atualize sua foto de perfil
- ✅ Veja status e permissões

**Como acessar:**
- Clique no avatar no header (canto superior direito)
- Selecione "Meu Perfil"

**Como adicionar foto:**
1. Acesse `/perfil`
2. Clique em "Selecionar Imagem"
3. Escolha uma imagem (JPG, PNG, GIF - máximo 5MB)
4. Clique em "Salvar Foto"

### 2. Tela de Administração (`/admin/usuarios`)

Permite que administradores:
- ✅ Vejam todos os usuários do sistema
- ✅ Visualizem estatísticas (total, ativos, admins)
- ✅ Acessem página de edição de cada usuário
- ✅ Editem informações, status e permissões

**Como acessar:**
- Apenas usuários com `is_admin = true`
- Clique no avatar no header
- Selecione "Administração"

**Funcionalidades:**
- Lista completa de usuários
- Filtros visuais (ativos, inativos, admins)
- Edição individual de cada usuário

### 3. Filtro de Demandas no Dashboard

Permite filtrar demandas por responsável:
- ✅ Dropdown com todos os responsáveis
- ✅ Filtro aplicado em tempo real
- ✅ Badge mostrando o filtro ativo
- ✅ Botão para limpar filtro

**Como usar:**
1. Acesse o Dashboard
2. Na seção "Demandas", use o dropdown "Filtrar por responsável"
3. Selecione um responsável
4. As demandas serão filtradas automaticamente
5. Clique no X no badge para remover o filtro

## 🚀 Configuração Inicial

### 1. Executar Script SQL

Execute o script para adicionar campo de admin:

```sql
-- Arquivo: scripts/008_add_admin_field.sql
-- Execute no Supabase SQL Editor
```

Este script:
- Adiciona coluna `is_admin` na tabela `membros`
- Torna Mateus Friese administrador
- Cria índices para performance

### 2. Instalar Dependências

```bash
npm install @radix-ui/react-switch
```

### 3. Tornar Usuário Admin

Execute no Supabase SQL Editor:

```sql
-- Tornar um usuário admin
UPDATE public.membros
SET is_admin = true
WHERE email = 'mateusfriese@hotmail.com';
```

## 📱 Interface

### Página de Perfil

- **Card de Foto:**
  - Avatar grande (preview)
  - Input de arquivo
  - Botão de salvar
  - Validação de tipo e tamanho

- **Card de Informações:**
  - Nome (somente leitura)
  - Email (somente leitura)
  - Status (Ativo/Inativo)
  - Permissões (se admin)

### Página de Administração

- **Cards de Estatísticas:**
  - Total de usuários
  - Usuários ativos
  - Administradores

- **Lista de Usuários:**
  - Avatar
  - Nome e email
  - Badges (Admin, Inativo)
  - Data de cadastro
  - Botão "Editar"

### Página de Edição de Usuário

- **Card de Foto:**
  - Avatar grande do usuário

- **Formulário:**
  - Nome (editável)
  - Email (editável)
  - Switch: Usuário Ativo
  - Switch: Administrador
  - Informações do sistema (ID, data de cadastro)

### Filtro no Dashboard

- **Dropdown:**
  - Opção "Todos os responsáveis"
  - Lista de todos os membros
  - Filtro aplicado em tempo real

- **Badge:**
  - Mostra responsável selecionado
  - Botão X para limpar

## 🔧 Estrutura de Arquivos

```
app/
  perfil/
    page.tsx                    # Página de perfil do usuário
  admin/
    usuarios/
      page.tsx                  # Lista de todos os usuários
      [id]/
        page.tsx                 # Edição de usuário individual

components/
  admin/
    editar-usuario-form.tsx     # Formulário de edição
  dashboard/
    demandas-filter.tsx         # Componente de filtro
  ui/
    switch.tsx                  # Componente Switch (toggle)

scripts/
  008_add_admin_field.sql       # Script para adicionar campo admin
```

## 🔒 Permissões

### Usuário Normal
- ✅ Acessar seu próprio perfil
- ✅ Editar sua foto
- ❌ Ver outros usuários
- ❌ Acessar administração

### Administrador
- ✅ Tudo que usuário normal pode fazer
- ✅ Acessar `/admin/usuarios`
- ✅ Ver todos os usuários
- ✅ Editar qualquer usuário
- ✅ Tornar outros usuários admin
- ✅ Ativar/desativar usuários

## 🐛 Troubleshooting

### Foto não salva

**Causa:** Problema com upload ou storage.

**Solução:**
1. Verifique o tamanho da imagem (máximo 5MB)
2. Confirme que é um formato válido (JPG, PNG, GIF)
3. Verifique os logs do console
4. Em produção, configure Supabase Storage para melhor performance

### Não consigo acessar administração

**Causa:** Usuário não é admin.

**Solução:**
1. Execute o script `008_add_admin_field.sql`
2. Verifique se `is_admin = true` no banco:
   ```sql
   SELECT * FROM membros WHERE email = 'seu@email.com';
   ```
3. Faça logout e login novamente

### Filtro não funciona

**Causa:** Problema com estado do componente.

**Solução:**
1. Recarregue a página
2. Verifique se há membros cadastrados
3. Confirme que as demandas têm `responsavel_id` preenchido

## 📝 Notas Importantes

### Upload de Fotos

- **Atual:** Usa base64 (armazenado diretamente na coluna)
- **Limitação:** Pode ser lento para imagens grandes
- **Recomendação:** Configure Supabase Storage para produção

### Permissões de Admin

- O campo `is_admin` controla acesso à administração
- Apenas admins podem ver a opção "Administração" no menu
- Admins podem editar qualquer usuário, incluindo tornar outros admins

### Filtro de Demandas

- O filtro é aplicado apenas nas listas de demandas do dashboard
- Não afeta os cards de estatísticas
- O estado do filtro é mantido durante a sessão

## 💡 Próximas Melhorias

- [ ] Upload de fotos para Supabase Storage
- [ ] Redimensionamento automático de imagens
- [ ] Histórico de alterações de usuários
- [ ] Busca na lista de usuários
- [ ] Filtros avançados (por status, data, etc.)
- [ ] Exportação de lista de usuários
