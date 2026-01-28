# 🔧 Solução: HTTP ERROR 500

## ⚠️ Problema

Erro HTTP 500 geralmente indica que:
1. Dependências não foram instaladas
2. Erro de compilação TypeScript/JavaScript
3. Módulo não encontrado

## ✅ Solução Passo a Passo

### 1. Verificar se as dependências estão instaladas

```powershell
cd c:\Users\mateu\AsaSistem
npm install --legacy-peer-deps
```

### 2. Limpar cache e reconstruir

```powershell
# Remover cache do Next.js
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

# Remover node_modules (se necessário)
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue

# Reinstalar
npm install --legacy-peer-deps
```

### 3. Verificar erros no terminal

Olhe o terminal onde `npm run dev` está rodando e procure por:
- Erros em vermelho
- Mensagens de "Module not found"
- Erros de TypeScript

### 4. Verificar dependências críticas

Certifique-se de que estas dependências estão instaladas:

```powershell
npm list clsx tailwind-merge class-variance-authority @radix-ui/react-slot tailwindcss-animate
```

Se alguma estiver faltando:

```powershell
npm install clsx tailwind-merge class-variance-authority @radix-ui/react-slot tailwindcss-animate --legacy-peer-deps
```

## 🔍 Verificações Adicionais

### Verificar se o servidor está rodando corretamente

No terminal onde você executou `npm run dev`, você deve ver:

```
✓ Ready in Xs
○ Local: http://localhost:3000
```

Se houver erros, copie a mensagem completa.

### Verificar console do navegador

1. Abra o navegador
2. Pressione `F12`
3. Vá para a aba "Console"
4. Procure por erros em vermelho
5. Copie as mensagens de erro

## 🐛 Erros Comuns

### "Cannot find module 'clsx'"

**Solução:**
```powershell
npm install clsx tailwind-merge class-variance-authority --legacy-peer-deps
```

### "Cannot find module '@radix-ui/react-slot'"

**Solução:**
```powershell
npm install @radix-ui/react-slot --legacy-peer-deps
```

### "Cannot find module 'tailwindcss-animate'"

**Solução:**
```powershell
npm install tailwindcss-animate --legacy-peer-deps
```

### Erro de compilação TypeScript

**Solução:**
```powershell
# Limpar cache
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

# Reinstalar
npm install --legacy-peer-deps

# Tentar novamente
npm run dev
```

## 🚀 Solução Rápida Completa

Execute estes comandos na ordem:

```powershell
cd c:\Users\mateu\AsaSistem

# Limpar tudo
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue

# Reinstalar
npm install --legacy-peer-deps

# Iniciar servidor
npm run dev
```

## 📋 Checklist

Antes de reportar o problema, verifique:

- [ ] Executou `npm install --legacy-peer-deps`
- [ ] Limpou o cache (`.next` foi removido)
- [ ] Todas as dependências foram instaladas
- [ ] Não há erros no terminal onde `npm run dev` está rodando
- [ ] Verificou o console do navegador (F12)

## 🆘 Se Nada Funcionar

1. **Copie a mensagem de erro completa** do terminal
2. **Copie os erros do console do navegador** (F12)
3. **Execute o diagnóstico:**
   ```powershell
   .\diagnostico.ps1
   ```

Envie essas informações para análise.
