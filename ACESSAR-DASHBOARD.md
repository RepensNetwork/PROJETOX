# 🎯 ACESSAR O DASHBOARD - Passo a Passo

## 🚀 INÍCIO RÁPIDO

### Execute estes comandos no PowerShell:

```powershell
# 1. Ir para a pasta do projeto
cd c:\Users\mateu\AsaSistem

# 2. Iniciar o servidor
npm run dev
```

### Aguarde ver esta mensagem:

```
✓ Ready in Xs
○ Local:        http://localhost:3000
```

### Depois, abra no navegador:

**http://localhost:3000**

---

## ✅ OU USE O SCRIPT AUTOMÁTICO

```powershell
cd c:\Users\mateu\AsaSistem
.\iniciar.ps1
```

Este script faz tudo automaticamente!

---

## ⚠️ IMPORTANTE

- **Mantenha o terminal aberto** enquanto usar o dashboard
- **NÃO feche o terminal** - se fechar, o servidor para
- Para parar o servidor, pressione `Ctrl+C` no terminal

---

## 🐛 Se Não Funcionar

### 1. Verificar se está na pasta correta:
```powershell
pwd
```
Deve mostrar: `C:\Users\mateu\AsaSistem`

### 2. Se não estiver, navegue:
```powershell
cd c:\Users\mateu\AsaSistem
```

### 3. Se as dependências não estiverem instaladas:
```powershell
npm install
```

### 4. Depois inicie o servidor:
```powershell
npm run dev
```

---

## 📱 O QUE VOCÊ VERÁ NO DASHBOARD

Quando acessar http://localhost:3000, você verá:

- ✅ **Terminal Integrado** - Terminal interativo
- ✅ **GitHub Integration** - Conecte seus repositórios
- ✅ **Aplicações** - Gerencie suas apps favoritas

---

## 💡 DICA

Se você ver o erro "ERR_CONNECTION_REFUSED", significa que o servidor não está rodando. Execute `npm run dev` primeiro!
