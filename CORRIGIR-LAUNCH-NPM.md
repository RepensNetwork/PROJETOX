# 🔧 Corrigir Erro: "Can't find Node.js binary 'npm'"

## ⚠️ Problema

O erro indica que o Cursor não consegue encontrar o `npm` no PATH do sistema.

## ✅ Soluções

### Solução 1: Usar Tasks (Recomendado - Mais Simples)

**Em vez de usar F5, use Tasks:**

1. **Pressione `Ctrl+Shift+B`** (ou `Ctrl+Shift+P` → "Tasks: Run Task")
2. Escolha: **"🚀 Iniciar Servidor de Desenvolvimento"**
3. O servidor iniciará no terminal integrado
4. Acesse: **http://localhost:3000**

**Vantagens:**
- ✅ Funciona mesmo se npm não estiver no PATH do sistema
- ✅ Usa o terminal integrado que tem acesso ao npm
- ✅ Mais simples e direto

### Solução 2: Verificar se Node.js está Instalado

1. **Abra o terminal integrado:**
   - Pressione `` Ctrl+` `` (Ctrl + crase)
   - Ou: `Terminal > New Terminal`

2. **Verifique se npm funciona:**
   ```powershell
   npm --version
   ```

3. **Se não funcionar:**
   - Instale o Node.js: https://nodejs.org/
   - Reinicie o Cursor após instalar

### Solução 3: Adicionar Node.js ao PATH

Se o Node.js estiver instalado mas não no PATH:

1. **Encontre onde o Node.js está instalado:**
   - Geralmente: `C:\Program Files\nodejs\`
   - Ou: `C:\Users\mateu\AppData\Roaming\npm\`

2. **Adicione ao PATH do Windows:**
   - Pressione `Win + R`
   - Digite: `sysdm.cpl`
   - Vá em: `Avançado > Variáveis de Ambiente`
   - Em "Variáveis do sistema", edite `Path`
   - Adicione o caminho do Node.js (ex: `C:\Program Files\nodejs\`)
   - Clique em `OK` em todas as janelas
   - **Reinicie o Cursor**

### Solução 4: Usar Terminal Integrado Diretamente

**Método mais simples - não precisa de launch:**

1. **Abra o terminal integrado:**
   - `` Ctrl+` ``

2. **Execute:**
   ```powershell
   cd c:\Users\mateu\AsaSistem
   npm run dev
   ```

3. **Acesse:**
   - http://localhost:3000

## 🎯 Método Recomendado (Mais Fácil)

**Use Tasks em vez de Launch:**

1. **`Ctrl+Shift+B`** → Escolha "🚀 Iniciar Servidor de Desenvolvimento"
2. Pronto! O servidor iniciará automaticamente

## 📋 Verificar Instalação do Node.js

Execute no terminal integrado:

```powershell
node --version
npm --version
```

Se ambos funcionarem, o Node.js está instalado corretamente.

## 🆘 Se Nada Funcionar

1. **Instale o Node.js:**
   - Baixe: https://nodejs.org/
   - Instale a versão LTS
   - Reinicie o Cursor

2. **Use o terminal integrado diretamente:**
   ```powershell
   cd c:\Users\mateu\AsaSistem
   npm install --legacy-peer-deps
   npm run dev
   ```

---

**Recomendação: Use `Ctrl+Shift+B` para iniciar o servidor!** 🚀
