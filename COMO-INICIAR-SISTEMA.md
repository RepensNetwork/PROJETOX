# 🚀 Como Iniciar o Sistema - Guia Completo

## ⚡ MÉTODO MAIS RÁPIDO (Recomendado)

### Use Tasks - Funciona Sempre!

1. **Pressione `Ctrl+Shift+B`**
2. Escolha: **"🚀 Iniciar Servidor de Desenvolvimento"**
3. Aguarde o servidor iniciar
4. Acesse: **http://localhost:3000**

**Pronto! O sistema está rodando!** ✅

---

## 📋 Outros Métodos

### Método 1: Terminal Integrado (Mais Simples)

1. **Abra o terminal:**
   - Pressione `` Ctrl+` `` (Ctrl + crase)
   - Ou: `Terminal > New Terminal`

2. **Execute:**
   ```powershell
   cd c:\Users\mateu\AsaSistem
   npm run dev
   ```

3. **Acesse:**
   - http://localhost:3000

### Método 2: Command Palette

1. **Pressione `Ctrl+Shift+P`**
2. Digite: `Tasks: Run Task`
3. Escolha: **"🚀 Iniciar Servidor de Desenvolvimento"**

### Método 3: Launch (Se npm estiver no PATH)

1. **Pressione `F5`**
2. Escolha: **"🌐 Abrir Dashboard no Navegador"**
3. O servidor iniciará automaticamente e abrirá o navegador

---

## 🎯 Tasks Disponíveis

Execute com `Ctrl+Shift+P` → `Tasks: Run Task`:

| Task | Descrição |
|------|-----------|
| 🚀 **Iniciar Servidor de Desenvolvimento** | Inicia o servidor (`npm run dev`) |
| 📦 **Instalar Dependências** | Instala todas as dependências |
| 🧹 **Limpar e Reconstruir** | Limpa tudo e reinstala |
| 🔍 **Verificar Linter** | Verifica erros de código |

---

## ✅ Verificar se Funcionou

Após iniciar, você deve ver no terminal:

```
✓ Ready in 2.5s
○ Local:        http://localhost:3000
```

Se aparecer isso, está funcionando! 🎉

---

## 🐛 Problemas Comuns

### Erro: "npm não é reconhecido"

**Solução:**
1. Instale o Node.js: https://nodejs.org/
2. Reinicie o Cursor
3. Tente novamente

### Erro: "Cannot find module"

**Solução:**
1. Execute: `Ctrl+Shift+P` → `Tasks: Run Task` → **"📦 Instalar Dependências"**
2. Ou no terminal: `npm install --legacy-peer-deps`

### Porta 3000 já em uso

**Solução:**
1. Feche outros servidores Next.js
2. Ou altere a porta no `package.json`

---

## 💡 Dicas

### Atalhos Úteis:

- `` Ctrl+` `` - Abrir/fechar terminal
- `Ctrl+Shift+B` - Executar task padrão (iniciar servidor)
- `Ctrl+Shift+P` - Command Palette
- `F5` - Launch (se configurado)

### Verificar Versões:

```powershell
node --version
npm --version
```

---

## 🎉 Pronto!

**Use `Ctrl+Shift+B` para iniciar o sistema rapidamente!** 🚀
