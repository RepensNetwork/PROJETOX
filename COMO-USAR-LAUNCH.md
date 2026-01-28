# 🚀 Como Usar o Launch Configuration

## ✅ Configuração Criada!

Criei configurações para você executar e debugar o sistema diretamente do VS Code/Cursor.

## 🎯 Como Usar

### Opção 1: Usar o Launch (Recomendado)

1. **Abra o painel de Debug:**
   - Pressione `F5` OU
   - Clique no ícone de "Debug" na barra lateral (ou `Ctrl+Shift+D`)
   - Ou vá em: `Run > Start Debugging`

2. **Selecione a configuração:**
   - No dropdown no topo, escolha: **"🚀 Iniciar AsaSistem Dashboard"**

3. **Execute:**
   - Clique no botão verde de "Play" OU
   - Pressione `F5`

4. **Acesse:**
   - O servidor iniciará automaticamente
   - Abra: **http://localhost:3000**

### Opção 2: Usar Tasks (Atalhos)

1. **Abra o Command Palette:**
   - Pressione `Ctrl+Shift+P`

2. **Digite:** `Tasks: Run Task`

3. **Escolha uma das opções:**
   - **🚀 Iniciar Servidor de Desenvolvimento** - Inicia o servidor
   - **📦 Instalar Dependências** - Instala dependências
   - **🧹 Limpar e Reconstruir** - Limpa e reinstala tudo
   - **🔍 Verificar Linter** - Verifica erros

### Opção 3: Atalho Rápido

**Pressione `Ctrl+Shift+B`** para executar a task padrão (iniciar servidor)

## 📋 Configurações Disponíveis

### Launch Configurations:

1. **🚀 Iniciar AsaSistem Dashboard**
   - Inicia o servidor de desenvolvimento
   - Abre no terminal integrado
   - Pronto para usar!

2. **🔍 Debug Next.js**
   - Inicia com debug habilitado
   - Permite colocar breakpoints
   - Útil para debugar problemas

3. **🏗️ Build do Projeto**
   - Cria build de produção
   - Útil para testar antes de deploy

## 🎨 Recursos Adicionais

### Tasks Criadas:

- **🚀 Iniciar Servidor** - `npm run dev`
- **📦 Instalar Dependências** - `npm install --legacy-peer-deps`
- **🧹 Limpar e Reconstruir** - Limpa tudo e reinstala
- **🔍 Verificar Linter** - `npm run lint`

## 💡 Dicas

### Atalhos Úteis:

- `F5` - Iniciar/Continuar debug
- `Shift+F5` - Parar debug
- `Ctrl+Shift+B` - Executar task padrão
- `Ctrl+Shift+P` - Command Palette

### Verificar se está funcionando:

1. Execute o launch (`F5`)
2. Veja o terminal integrado
3. Deve aparecer: `✓ Ready in Xs`
4. Acesse: http://localhost:3000

## 🐛 Se Não Funcionar

### Verificar se Node.js está instalado:

1. Abra o terminal integrado (`Ctrl+`` `)
2. Execute: `node --version`
3. Se não funcionar, instale o Node.js

### Verificar se as dependências estão instaladas:

1. Execute a task: **📦 Instalar Dependências**
2. Ou no terminal: `npm install --legacy-peer-deps`

### Limpar e reconstruir:

1. Execute a task: **🧹 Limpar e Reconstruir**
2. Depois execute: **🚀 Iniciar Servidor**

## 🎉 Pronto!

Agora você pode:
- ✅ Executar o sistema com `F5`
- ✅ Usar tasks para comandos comuns
- ✅ Debugar o código
- ✅ Tudo integrado no editor!

---

**Execute `F5` agora para iniciar o sistema!** 🚀
