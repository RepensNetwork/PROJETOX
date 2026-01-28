# Guia de Configuração - AsaSistem Dashboard

## 🔧 Pré-requisitos

Antes de executar o projeto, você precisa ter instalado:

1. **Node.js** (versão 18 ou superior)
   - Baixe em: https://nodejs.org/
   - Verifique a instalação: `node --version` e `npm --version`

## 🚀 Passos para Executar

### 1. Instalar Dependências

Abra o terminal/PowerShell na pasta do projeto e execute:

```bash
npm install
```

### 2. Iniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

### 3. Acessar a Aplicação

Abra seu navegador e acesse:
```
http://localhost:3000
```

## ⚠️ Solução de Problemas

### Erro: "npm não é reconhecido"

**Solução:**
1. Instale o Node.js em: https://nodejs.org/
2. Reinicie o terminal/PowerShell após a instalação
3. Verifique se está instalado: `node --version`

### Erro: "ERR_CONNECTION_REFUSED"

**Possíveis causas:**
1. O servidor não está rodando - Execute `npm run dev`
2. Porta 3000 está ocupada - O Next.js tentará usar outra porta automaticamente
3. Firewall bloqueando - Verifique as configurações do firewall

### Erro ao instalar dependências

**Solução:**
```bash
# Limpar cache do npm
npm cache clean --force

# Tentar novamente
npm install
```

## 📦 Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run start` - Inicia servidor de produção
- `npm run lint` - Executa linter

## 🔐 Configuração do GitHub

Para usar a integração GitHub:

1. Acesse: https://github.com/settings/tokens
2. Clique em "Generate new token (classic)"
3. Selecione as permissões necessárias (pelo menos `public_repo`)
4. Copie o token gerado
5. Use o token na interface do dashboard

## 💡 Dicas

- O servidor de desenvolvimento recarrega automaticamente ao salvar arquivos
- Use `Ctrl+C` no terminal para parar o servidor
- Os dados são salvos no localStorage do navegador
