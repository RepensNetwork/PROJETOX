# 🔧 Solução de Problemas - AsaSistem Dashboard

## 🚨 Erros Comuns e Soluções

### 1. Erro ao executar script PowerShell

**Erro:** "Não é possível carregar o arquivo porque a execução de scripts está desabilitada"

**Solução:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Depois execute novamente:
```powershell
cd c:\Users\mateu\AsaSistem
.\iniciar.ps1
```

---

### 2. Erro "npm não é reconhecido"

**Causa:** Node.js não está instalado ou não está no PATH

**Solução:**
1. Instale o Node.js: https://nodejs.org/
2. Reinicie o terminal/PowerShell
3. Verifique: `node --version` e `npm --version`

---

### 3. Erro ao instalar dependências

**Erro:** `npm ERR! code ENOENT` ou `npm ERR! Cannot find module`

**Solução:**
```powershell
# Limpar cache
npm cache clean --force

# Deletar node_modules e package-lock.json (se existir)
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue

# Reinstalar
npm install
```

---

### 4. Erro ao iniciar o servidor

**Erro:** `Error: Cannot find module` ou erros de importação

**Solução:**
```powershell
# Certifique-se de estar na pasta correta
cd c:\Users\mateu\AsaSistem

# Reinstalar dependências
npm install

# Tentar novamente
npm run dev
```

---

### 5. Erro de porta em uso

**Erro:** `Port 3000 is already in use`

**Solução:**
```powershell
# Encontrar processo usando a porta 3000
Get-NetTCPConnection -LocalPort 3000 | Select-Object OwningProcess

# Ou simplesmente deixe o Next.js usar outra porta automaticamente
# Ele mostrará qual porta está usando
```

---

### 6. Erro de TypeScript

**Erro:** Erros de tipo ou compilação TypeScript

**Solução:**
```powershell
# Verificar se TypeScript está instalado
npm list typescript

# Se não estiver, instalar
npm install --save-dev typescript @types/node @types/react @types/react-dom
```

---

### 7. Erro de módulos não encontrados

**Erro:** `Module not found: Can't resolve 'xterm'` ou similar

**Solução:**
```powershell
# Reinstalar todas as dependências
Remove-Item -Recurse -Force node_modules
npm install
```

---

### 8. Erro de permissão

**Erro:** Acesso negado ou permissão insuficiente

**Solução:**
1. Execute o PowerShell como Administrador
2. Ou verifique as permissões da pasta:
   ```powershell
   icacls "c:\Users\mateu\AsaSistem"
   ```

---

## 🔍 Script de Diagnóstico

Execute o script de diagnóstico para identificar problemas:

```powershell
cd c:\Users\mateu\AsaSistem
.\diagnostico.ps1
```

Este script verifica:
- ✅ Diretório atual
- ✅ Instalação do Node.js
- ✅ Instalação do npm
- ✅ Arquivos do projeto
- ✅ Dependências instaladas
- ✅ Porta 3000
- ✅ Permissões do PowerShell

---

## 📋 Checklist de Verificação

Antes de reportar um erro, verifique:

- [ ] Está na pasta correta: `C:\Users\mateu\AsaSistem`
- [ ] Node.js está instalado: `node --version`
- [ ] npm está instalado: `npm --version`
- [ ] Dependências instaladas: `node_modules` existe
- [ ] Não está dentro do Node.js REPL (não deve ver apenas `>`)
- [ ] PowerShell tem permissão para executar scripts

---

## 🆘 Ainda com problemas?

Se nenhuma das soluções acima funcionou:

1. **Execute o diagnóstico:**
   ```powershell
   cd c:\Users\mateu\AsaSistem
   .\diagnostico.ps1
   ```

2. **Copie a mensagem de erro completa** (incluindo stack trace)

3. **Verifique os logs:**
   - Logs do npm: `C:\Users\mateu\AppData\Local\npm-cache\_logs\`
   - Console do navegador (F12)

4. **Informações úteis para reportar:**
   - Versão do Node.js: `node --version`
   - Versão do npm: `npm --version`
   - Sistema operacional: Windows 10/11
   - Mensagem de erro completa
   - Passos que você executou antes do erro

---

## 💡 Dicas Gerais

- Sempre execute comandos na pasta `AsaSistem`
- Reinicie o terminal após instalar Node.js
- Use `Ctrl+C` para parar o servidor
- Limpe o cache do npm se houver problemas: `npm cache clean --force`
