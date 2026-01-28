# AsaSistem Dashboard

Dashboard integrado com Terminal, GitHub e Aplicações personalizadas.

## 🚀 Funcionalidades

### 1. **Terminal Integrado**
- Terminal interativo usando xterm.js
- Suporte a comandos básicos
- Interface moderna com tema escuro
- Redimensionamento automático

### 2. **Integração GitHub**
- Conecte-se usando Personal Access Token
- Visualize seus repositórios
- Informações detalhadas: estrelas, forks, linguagem
- Acesso rápido aos repositórios

### 3. **Painel de Aplicações**
- Adicione suas aplicações favoritas
- Acesso rápido a ferramentas e serviços
- Gerenciamento personalizado
- Armazenamento local

### 4. **Sistema de Gestão de Operações**
- Gestão de navios e escalas
- Interface moderna com Radix UI
- Design profissional e responsivo
- Componentes reutilizáveis

## 📦 Instalação

### Pré-requisitos

**IMPORTANTE:** Você precisa ter o Node.js instalado (versão 18 ou superior).

- Baixe em: https://nodejs.org/
- Verifique a instalação: `node --version` e `npm --version`
- Se não estiver instalado, instale e **reinicie o terminal/PowerShell**

**⚠️ Se você ver o erro "npm não é reconhecido":**
- Veja o guia completo: [INSTALAR-NODEJS.md](./INSTALAR-NODEJS.md)
- O Node.js não está instalado ou não está no PATH
- Instale o Node.js e **reinicie o terminal** após a instalação

### Passos

1. **Navegue até a pasta do projeto:**
   ```powershell
   cd c:\Users\mateu\AsaSistem
   ```
   ⚠️ **IMPORTANTE:** Você DEVE estar na pasta `AsaSistem`!
   - ✅ Correto: `PS C:\Users\mateu\AsaSistem>`
   - ❌ Errado: `PS C:\Users\mateu>`

2. Instale as dependências:
   ```powershell
   npm install
   ```

3. Execute o servidor de desenvolvimento:
   ```powershell
   npm run dev
   ```

4. Abra [http://localhost:3000](http://localhost:3000) no navegador

**Ou use o script automático (após navegar para a pasta):**
```powershell
cd c:\Users\mateu\AsaSistem
.\iniciar.ps1
```

### ⚠️ Erro "ERR_CONNECTION_REFUSED"?

Se você ver o erro `ERR_CONNECTION_REFUSED`, significa que o servidor não está rodando:

1. **Verifique se o Node.js está instalado:**
   ```bash
   node --version
   ```
   Se não funcionar, instale o Node.js primeiro.

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor:**
   ```bash
   npm run dev
   ```

4. **Aguarde a mensagem:** `Ready - started server on 0.0.0.0:3000`

5. **Acesse:** http://localhost:3000

Veja mais detalhes em [SETUP.md](./SETUP.md)

### ⚠️ Erro "pm should be run outside of the Node.js REPL"?

**Este erro significa que você está dentro do REPL do Node.js!**

**Solução:**
1. Se você vê apenas `>` no terminal, você está no Node.js REPL
2. **Saia do REPL:** Digite `.exit` e pressione Enter, ou pressione `Ctrl+C` duas vezes
3. **Execute os comandos npm no PowerShell normal** (não dentro do Node.js)

**Exemplo correto:**
```powershell
PS C:\Users\mateu\AsaSistem> npm install
```

**Exemplo errado:**
```
> npm install
```

Veja o guia completo em [INICIO-RAPIDO.md](./INICIO-RAPIDO.md)

**Ou use o script automático (certifique-se de estar na pasta correta):**
```powershell
cd c:\Users\mateu\AsaSistem
.\iniciar.ps1
```

### ⚠️ Erro "O termo '.\iniciar.ps1' não é reconhecido"?

**Este erro significa que você não está na pasta correta!**

**Solução:**
1. Verifique onde você está: `pwd` ou olhe o prompt
2. Se você estiver em `C:\Users\mateu>`, navegue para a pasta do projeto:
   ```powershell
   cd c:\Users\mateu\AsaSistem
   ```
3. Agora execute o script:
   ```powershell
   .\iniciar.ps1
   ```

Veja [COMANDOS-RAPIDOS.md](./COMANDOS-RAPIDOS.md) para referência rápida.

### ⚠️ Erro "Uncaught SyntaxError: Unexpected identifier 'version'"?

**Este erro geralmente é causado por cache corrompido ou dependências mal instaladas.**

**Solução rápida:**
```powershell
cd c:\Users\mateu\AsaSistem
.\limpar-e-reconstruir.ps1
npm run dev
```

Veja o guia completo em [ERRO-SYNTAX-VERSION.md](./ERRO-SYNTAX-VERSION.md)

## 🔧 Configuração

### GitHub Integration

Para usar a integração com GitHub:

1. Crie um Personal Access Token em [GitHub Settings](https://github.com/settings/tokens)
2. Selecione as permissões necessárias (pelo menos `public_repo` para repositórios públicos)
3. Cole o token na interface do dashboard

## 🛠️ Tecnologias

- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Radix UI** - Componentes acessíveis
- **xterm.js** - Terminal emulador
- **GitHub API** - Integração com GitHub
- **Lucide React** - Ícones
- **date-fns** - Formatação de datas
- **class-variance-authority** - Sistema de variantes

## 📝 Comandos do Terminal

- `help` - Mostra comandos disponíveis
- `clear` - Limpa o terminal
- `echo <text>` - Repete o texto
- `date` - Mostra data/hora
- `pwd` - Mostra diretório atual
- `ls` - Lista arquivos

## 🎨 Personalização

O dashboard é totalmente personalizável. Você pode:
- Adicionar novas aplicações
- Modificar temas e cores
- Estender comandos do terminal
- Adicionar novas integrações

## 📄 Licença

Este projeto é de uso pessoal.
