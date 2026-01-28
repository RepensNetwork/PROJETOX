# ⚡ Comandos Rápidos - AsaSistem Dashboard

## 🎯 Execute estes comandos na ordem:

### 1. Navegar para a pasta do projeto
```powershell
cd c:\Users\mateu\AsaSistem
```

**Verifique que você está na pasta correta:**
- ✅ Deve mostrar: `PS C:\Users\mateu\AsaSistem>`
- ❌ NÃO deve mostrar: `PS C:\Users\mateu>`

### 2. Instalar dependências (primeira vez)
```powershell
npm install
```

### 3. Iniciar o servidor
```powershell
npm run dev
```

### 4. Acessar no navegador
Abra: **http://localhost:3000**

---

## 🚀 Ou use o script automático:

**Primeiro, certifique-se de estar na pasta correta:**
```powershell
cd c:\Users\mateu\AsaSistem
```

**Depois execute:**
```powershell
.\iniciar.ps1
```

---

## ⚠️ Erros Comuns:

### Erro: "O termo '.\iniciar.ps1' não é reconhecido"
**Causa:** Você não está na pasta `AsaSistem`

**Solução:**
```powershell
cd c:\Users\mateu\AsaSistem
.\iniciar.ps1
```

### Erro: "npm não é reconhecido"
**Causa:** Node.js não está instalado ou não está no PATH

**Solução:** Instale o Node.js em https://nodejs.org/ e reinicie o terminal

### Erro: "pm should be run outside of the Node.js REPL"
**Causa:** Você está dentro do Node.js REPL (digitou `node` antes)

**Solução:** Saia com `.exit` ou `Ctrl+C` e execute os comandos no PowerShell normal

---

## 📍 Verificar onde você está:

```powershell
pwd
```

Ou simplesmente olhe o prompt:
- `PS C:\Users\mateu\AsaSistem>` ✅ Correto!
- `PS C:\Users\mateu>` ❌ Pasta errada, execute `cd c:\Users\mateu\AsaSistem`
