# ⚡ Início Rápido - Usar Launch Configuration

## 🎯 MÉTODO MAIS RÁPIDO

### Pressione `F5` e pronto!

1. **Pressione `F5`** no VS Code/Cursor
2. Escolha: **"🚀 Iniciar AsaSistem Dashboard"**
3. Aguarde o servidor iniciar
4. Acesse: **http://localhost:3000**

## 📋 Passo a Passo Visual

### 1. Abrir Debug Panel

**Método 1:** Pressione `F5`

**Método 2:** 
- Clique no ícone de "Debug" na barra lateral (inseto/bug)
- Ou: `Ctrl+Shift+D`

### 2. Selecionar Configuração

No dropdown no topo, você verá:
- 🚀 **Iniciar AsaSistem Dashboard** ← Use esta!
- 🔍 Debug Next.js
- 🏗️ Build do Projeto

### 3. Executar

- Clique no botão verde ▶️ (Play)
- Ou pressione `F5` novamente

### 4. Ver o Sistema

- O terminal integrado abrirá automaticamente
- Você verá: `✓ Ready in Xs`
- Abra: **http://localhost:3000**

## 🎨 Atalhos Úteis

| Ação | Atalho |
|------|--------|
| Iniciar Debug | `F5` |
| Parar Debug | `Shift+F5` |
| Executar Task | `Ctrl+Shift+B` |
| Command Palette | `Ctrl+Shift+P` |

## 🚀 Tasks Disponíveis

Para executar tasks:

1. `Ctrl+Shift+P`
2. Digite: `Tasks: Run Task`
3. Escolha:
   - 🚀 Iniciar Servidor de Desenvolvimento
   - 📦 Instalar Dependências
   - 🧹 Limpar e Reconstruir
   - 🔍 Verificar Linter

## ✅ Verificar se Funcionou

Após pressionar `F5`, você deve ver no terminal:

```
✓ Ready in 2.5s
○ Local:        http://localhost:3000
```

Se aparecer isso, está funcionando! 🎉

## 🐛 Problemas?

### Se o F5 não funcionar:

1. Verifique se está na pasta do projeto
2. Execute: `npm install --legacy-peer-deps`
3. Tente novamente

### Se der erro:

1. Veja a mensagem no terminal integrado
2. Execute a task: **📦 Instalar Dependências**
3. Tente `F5` novamente

---

**Agora é só pressionar `F5` e usar o sistema!** 🚀
