# 🔄 Atualizar Dependências - AsaSistem Dashboard

## ⚠️ Avisos de Depreciação

Após `npm install`, você pode ver avisos sobre pacotes deprecados. Isso é normal, mas é recomendado atualizar para as versões mais recentes.

## ✅ Dependências Atualizadas

As dependências foram atualizadas para versões mais recentes:

### Antes (Deprecado):
- `xterm@5.3.0` → `@xterm/xterm@^5.3.0`
- `xterm-addon-fit@0.8.0` → `@xterm/addon-fit@^0.11.0`
- `xterm-addon-web-links@0.9.0` → `@xterm/addon-web-links@^0.12.0`
- `eslint@8.57.0` → `eslint@^9.0.0`

## 🚀 Como Atualizar

### Opção 1: Reinstalar com as novas dependências

```powershell
cd c:\Users\mateu\AsaSistem

# Remover node_modules
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue

# Reinstalar com as novas versões
npm install
```

### Opção 2: Atualizar automaticamente

```powershell
cd c:\Users\mateu\AsaSistem

# Atualizar todas as dependências
npm update

# Ou atualizar pacotes específicos
npm install @xterm/xterm@latest @xterm/addon-fit@latest @xterm/addon-web-links@latest
```

## 🔒 Resolver Vulnerabilidades

Para resolver as 3 vulnerabilidades de alta severidade:

```powershell
# Verificar vulnerabilidades
npm audit

# Tentar corrigir automaticamente
npm audit fix

# Se não funcionar, forçar (pode quebrar compatibilidade)
npm audit fix --force
```

**⚠️ Atenção:** `npm audit fix --force` pode atualizar dependências de forma que quebre compatibilidade. Use com cuidado.

## 📋 Checklist Pós-Atualização

Após atualizar as dependências:

- [ ] Execute `npm install` novamente
- [ ] Verifique se não há erros: `npm run lint`
- [ ] Teste o servidor: `npm run dev`
- [ ] Verifique se o terminal funciona corretamente
- [ ] Verifique vulnerabilidades: `npm audit`

## 🐛 Se Algo Quebrar

Se após atualizar algo não funcionar:

1. **Reverter para versões antigas:**
   ```powershell
   git checkout package.json
   npm install
   ```

2. **Ou usar o script de limpeza:**
   ```powershell
   .\limpar-e-reconstruir.ps1
   ```

## 💡 Dicas

- **Mantenha dependências atualizadas** regularmente
- **Verifique vulnerabilidades** periodicamente: `npm audit`
- **Teste após atualizar** para garantir que tudo funciona
- **Leia os changelogs** das dependências principais antes de atualizar

## 📝 Notas sobre os Avisos

Os avisos de depreciação são informativos e não impedem o funcionamento. No entanto:

- **xterm**: A nova versão `@xterm/xterm` é mantida ativamente
- **eslint**: A versão 9 tem melhorias de performance e novas regras
- **Outros**: Avisos sobre `inflight`, `rimraf`, `glob` são de dependências transitivas (indiretas)

Você pode ignorar os avisos de dependências transitivas, mas é recomendado atualizar as dependências principais.
