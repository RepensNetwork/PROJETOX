# 🚀 Como Iniciar o Servidor - Guia Rápido

## ⚠️ Erro "ERR_CONNECTION_REFUSED"

Este erro significa que o servidor Next.js **não está rodando**. Você precisa iniciá-lo primeiro!

---

## ✅ Passos para Iniciar o Servidor

### 1. Certifique-se de estar na pasta correta

```powershell
cd c:\Users\mateu\AsaSistem
```

Verifique que você vê: `PS C:\Users\mateu\AsaSistem>`

### 2. Verifique se as dependências estão instaladas

```powershell
# Verificar se node_modules existe
Test-Path node_modules
```

Se retornar `False`, instale as dependências:
```powershell
npm install
```

### 3. Inicie o servidor de desenvolvimento

```powershell
npm run dev
```

### 4. Aguarde a mensagem de sucesso

Você deve ver algo como:
```
✓ Ready in 2.5s
○ Local:        http://localhost:3000
```

### 5. Acesse no navegador

Abra: **http://localhost:3000**

---

## 🔍 Verificações Importantes

### O servidor está rodando?

Você deve ver no terminal:
- ✅ `✓ Ready in Xs`
- ✅ `○ Local: http://localhost:3000`
- ✅ Nenhuma mensagem de erro

### O servidor não inicia?

**Possíveis problemas:**

1. **Porta 3000 está em uso:**
   ```powershell
   # Verificar processos na porta 3000
   Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
   ```
   
   Se houver processos, o Next.js tentará usar outra porta (3001, 3002, etc.)

2. **Erros de compilação:**
   - Olhe o terminal onde executou `npm run dev`
   - Procure por mensagens de erro em vermelho
   - Copie a mensagem de erro completa

3. **Dependências não instaladas:**
   ```powershell
   npm install
   ```

---

## 🎯 Script Automático

Use o script que criamos:

```powershell
cd c:\Users\mateu\AsaSistem
.\iniciar.ps1
```

Este script:
- Verifica Node.js e npm
- Instala dependências se necessário
- Inicia o servidor automaticamente

---

## 📝 Checklist

Antes de acessar http://localhost:3000, verifique:

- [ ] Está na pasta `C:\Users\mateu\AsaSistem`
- [ ] Executou `npm install` (dependências instaladas)
- [ ] Executou `npm run dev` (servidor iniciado)
- [ ] Vê a mensagem "Ready" no terminal
- [ ] O terminal não mostra erros

---

## 🐛 Problemas Comuns

### "Port 3000 is already in use"

**Solução:** O Next.js tentará usar outra porta automaticamente. Olhe a mensagem no terminal para ver qual porta está sendo usada (ex: http://localhost:3001)

### "Cannot find module"

**Solução:**
```powershell
Remove-Item -Recurse -Force node_modules
npm install
```

### Servidor inicia mas a página não carrega

**Solução:**
1. Limpe o cache do navegador (Ctrl+Shift+Delete)
2. Tente em modo anônimo/privado
3. Verifique o console do navegador (F12) para erros

---

## 💡 Dica Importante

**Mantenha o terminal aberto!** O servidor precisa estar rodando continuamente. Se você fechar o terminal, o servidor para e você verá o erro `ERR_CONNECTION_REFUSED` novamente.

Para parar o servidor, pressione `Ctrl+C` no terminal.
