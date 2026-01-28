# 🔧 Solução: Erro -102 (npm não encontrado)

## ⚠️ Problema

Você está vendo:
- **Erro -102** ao acessar http://localhost:3000
- **"npm não é reconhecido"** no terminal

**Causa:** O npm não está no PATH do terminal, mesmo que o Node.js esteja instalado.

---

## ✅ Solução Rápida

### Opção 1: Usar Tasks (Recomendado - Já Configurado!)

As tasks foram atualizadas para incluir o npm no PATH automaticamente:

1. **Pressione `Ctrl+Shift+B`**
2. Escolha: **"🚀 Iniciar Servidor de Desenvolvimento"**
3. O servidor iniciará automaticamente
4. Acesse: **http://localhost:3000**

**Pronto!** ✅

---

### Opção 2: Adicionar npm ao PATH Temporariamente

No terminal integrado do Cursor:

```powershell
# Adicionar npm ao PATH
$env:PATH += ";C:\Program Files\nodejs"

# Verificar se funcionou
npm --version

# Navegar para o projeto
cd c:\Users\mateu\AsaSistem

# Iniciar servidor
npm run dev
```

---

### Opção 3: Adicionar npm ao PATH Permanentemente

1. **Pressione `Win + R`**
2. Digite: `sysdm.cpl`
3. Vá em: **Avançado > Variáveis de Ambiente**
4. Em **"Variáveis do sistema"**, encontre **"Path"**
5. Clique em **"Editar"**
6. Clique em **"Novo"**
7. Adicione: `C:\Program Files\nodejs`
8. Clique em **"OK"** em todas as janelas
9. **Reinicie o Cursor**

---

## 🔍 Verificar Instalação

Execute no terminal:

```powershell
# Verificar Node.js
node --version
# Deve mostrar: v24.13.0 (ou similar)

# Verificar npm (após adicionar ao PATH)
npm --version
# Deve mostrar: 10.x.x (ou similar)
```

---

## 🚀 Iniciar o Sistema

Após corrigir o PATH:

```powershell
cd c:\Users\mateu\AsaSistem
npm install --legacy-peer-deps
npm run dev
```

Você deve ver:
```
✓ Ready in 2.5s
○ Local:        http://localhost:3000
```

---

## 💡 Método Mais Fácil

**Use as Tasks do Cursor:**

1. `Ctrl+Shift+B` → **"🚀 Iniciar Servidor de Desenvolvimento"**
2. Pronto! As tasks já estão configuradas para encontrar o npm automaticamente.

---

## 🆘 Se Ainda Não Funcionar

1. **Execute o script de diagnóstico:**
   ```powershell
   cd c:\Users\mateu\AsaSistem
   .\encontrar-npm.ps1
   ```

2. **Ou execute diretamente:**
   ```powershell
   "C:\Program Files\nodejs\npm.cmd" run dev
   ```

---

**Recomendação: Use `Ctrl+Shift+B` - já está configurado!** 🚀
