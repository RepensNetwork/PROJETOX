# 📥 Como Instalar o Node.js - Guia Completo

## ⚠️ Problema Identificado

Você está vendo o erro:
```
npm : O termo 'npm' não é reconhecido
```

Isso significa que o **Node.js não está instalado** ou não está configurado corretamente no seu sistema.

---

## 🚀 Solução: Instalar Node.js

### Passo 1: Baixar o Node.js

1. Acesse: **https://nodejs.org/**
2. Baixe a versão **LTS** (Long Term Support) - recomendada
3. Escolha a versão para Windows (`.msi`)

### Passo 2: Instalar o Node.js

1. Execute o arquivo `.msi` baixado
2. Siga o assistente de instalação:
   - ✅ **IMPORTANTE:** Marque a opção "Add to PATH" (adicionar ao PATH)
   - Clique em "Next" até concluir
3. Aguarde a instalação terminar

### Passo 3: Verificar a Instalação

**IMPORTANTE:** Feche e abra um NOVO terminal/PowerShell após a instalação!

Depois, execute:

```powershell
node --version
```

Deve mostrar algo como: `v20.x.x` ou `v18.x.x`

```powershell
npm --version
```

Deve mostrar algo como: `10.x.x` ou `9.x.x`

---

## ✅ Se a Instalação Funcionou

Agora você pode executar:

```powershell
# 1. Navegar para a pasta do projeto
cd c:\Users\mateu\AsaSistem

# 2. Instalar dependências
npm install

# 3. Iniciar o servidor
npm run dev
```

---

## ❌ Se Ainda Não Funcionar

### Opção 1: Verificar se Node.js está no PATH

1. Abra "Variáveis de Ambiente" no Windows
2. Procure por "Path" nas variáveis do sistema
3. Verifique se há entradas como:
   - `C:\Program Files\nodejs\`
   - `C:\Users\mateu\AppData\Roaming\npm`

### Opção 2: Reinstalar Node.js

1. Desinstale o Node.js pelo Painel de Controle
2. Baixe e instale novamente de https://nodejs.org/
3. **Certifique-se de marcar "Add to PATH"**
4. Reinicie o computador (recomendado)

### Opção 3: Usar Chocolatey (Alternativa)

Se você tem o Chocolatey instalado:

```powershell
choco install nodejs-lts
```

---

## 🔍 Verificar Instalação Manualmente

Execute estes comandos para verificar:

```powershell
# Verificar se node.exe existe
Test-Path "C:\Program Files\nodejs\node.exe"

# Verificar PATH
$env:PATH -split ';' | Select-String "nodejs"
```

---

## 📝 Checklist Pós-Instalação

Após instalar o Node.js, verifique:

- [ ] Node.js instalado: `node --version` funciona
- [ ] npm instalado: `npm --version` funciona
- [ ] Terminal foi reiniciado após instalação
- [ ] Está na pasta correta: `cd c:\Users\mateu\AsaSistem`

---

## 🆘 Ainda com Problemas?

Se após instalar o Node.js você ainda tiver problemas:

1. **Reinicie o computador** (às vezes necessário para atualizar o PATH)
2. **Abra um novo terminal** (não use o terminal antigo)
3. **Execute o diagnóstico:**
   ```powershell
   cd c:\Users\mateu\AsaSistem
   .\diagnostico.ps1
   ```

---

## 💡 Dica

O Node.js inclui automaticamente o npm, então você só precisa instalar o Node.js uma vez!
