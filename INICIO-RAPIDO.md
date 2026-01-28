# 🚀 Início Rápido - AsaSistem Dashboard

## ⚠️ IMPORTANTE: Execute comandos no PowerShell, NÃO dentro do Node.js!

Se você viu o erro "pm should be run outside of the Node.js REPL", significa que você está dentro do Node.js REPL.

### Como sair do Node.js REPL:

1. **Digite:** `.exit` e pressione Enter
   OU
2. **Pressione:** `Ctrl+C` duas vezes
   OU
3. **Feche o terminal** e abra um novo PowerShell

### ✅ Passos Corretos:

1. **Abra o PowerShell** (não execute `node` primeiro!)

2. **Navegue até a pasta do projeto:**
   ```powershell
   cd c:\Users\mateu\AsaSistem
   ```
   
   ⚠️ **IMPORTANTE:** Você DEVE estar na pasta `AsaSistem` para executar os comandos!
   
   - ✅ Correto: `PS C:\Users\mateu\AsaSistem>`
   - ❌ Errado: `PS C:\Users\mateu>`

3. **Verifique se está no PowerShell correto:**
   - Você deve ver algo como: `PS C:\Users\mateu\AsaSistem>`
   - **NÃO** deve ver: `>` (isso é o REPL do Node.js)
   - **NÃO** deve estar em `C:\Users\mateu>` (pasta errada!)

4. **Instale as dependências:**
   ```powershell
   npm install
   ```

5. **Inicie o servidor:**
   ```powershell
   npm run dev
   ```

6. **Acesse no navegador:**
   ```
   http://localhost:3000
   ```

## 🔍 Como identificar se está no lugar certo:

### ✅ PowerShell (CORRETO):
```
PS C:\Users\mateu\AsaSistem> npm install
```

### ❌ Node.js REPL (ERRADO):
```
> npm install
```

Se você ver apenas `>` no início da linha, você está no REPL do Node.js. Saia primeiro!

## 📝 Comandos úteis:

- **Verificar versão do Node.js:** `node --version` (depois saia com `.exit`)
- **Verificar versão do npm:** `npm --version`
- **Instalar dependências:** `npm install`
- **Iniciar servidor:** `npm run dev`
- **Parar servidor:** `Ctrl+C`
