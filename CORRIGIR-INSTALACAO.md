# 🔧 Corrigir Erro de Instalação

## ⚠️ Problema

Erro de conflito de dependências entre ESLint 9 e eslint-config-next.

## ✅ Solução

O `package.json` foi corrigido. Agora execute:

```powershell
cd c:\Users\mateu\AsaSistem
npm install
```

## 🔄 Se Ainda Der Erro

### Opção 1: Usar --legacy-peer-deps

```powershell
npm install --legacy-peer-deps
```

### Opção 2: Limpar e Reinstalar

```powershell
# Remover node_modules e package-lock.json
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue

# Reinstalar
npm install
```

## ✅ O Que Foi Corrigido

- ESLint atualizado de `^9.0.0` para `^8.57.0` (compatível com eslint-config-next)
- Agora as dependências são compatíveis

## 🚀 Depois de Instalar

Execute o servidor:

```powershell
npm run dev
```
