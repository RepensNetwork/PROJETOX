# 🔐 Como Fazer Login no GitHub pelo Terminal

Este guia mostra diferentes formas de fazer login no GitHub usando o terminal (PowerShell).

## 🚀 Método 1: GitHub CLI (Recomendado)

O GitHub CLI (`gh`) é a forma mais fácil e segura de fazer login.

### 1. Instalar GitHub CLI

**Via winget (Windows):**
```powershell
winget install --id GitHub.cli
```

**Via Chocolatey:**
```powershell
choco install gh
```

**Via Scoop:**
```powershell
scoop install gh
```

**Ou baixar manualmente:**
- Acesse: https://github.com/cli/cli/releases
- Baixe o instalador `.msi` para Windows
- Execute o instalador

### 2. Fazer Login

```powershell
gh auth login
```

O comando irá:
1. Perguntar se você quer fazer login via navegador ou token
2. Escolha **"Login with a web browser"** (mais fácil)
3. Escolha o protocolo HTTPS
4. Escolha autenticar Git com suas credenciais GitHub
5. Abrirá o navegador para autorizar
6. Copie o código e cole no terminal

### 3. Verificar Login

```powershell
gh auth status
```

### 4. Comandos Úteis do GitHub CLI

```powershell
# Ver seus repositórios
gh repo list

# Criar um novo repositório
gh repo create nome-do-repo --public

# Clonar um repositório
gh repo clone usuario/repo

# Ver informações do seu perfil
gh api user

# Ver issues
gh issue list

# Criar uma issue
gh issue create --title "Título" --body "Descrição"
```

---

## 🔑 Método 2: Personal Access Token (PAT)

Se preferir usar um token de acesso pessoal:

### 1. Criar um Personal Access Token

1. Acesse: https://github.com/settings/tokens
2. Clique em **"Generate new token"** → **"Generate new token (classic)"**
3. Dê um nome (ex: "Terminal Access")
4. Selecione as permissões necessárias:
   - `repo` - Para acessar repositórios
   - `workflow` - Para GitHub Actions
   - `read:org` - Para ler organizações
5. Clique em **"Generate token"**
6. **COPIE O TOKEN** (você só verá uma vez!)

### 2. Configurar Git com o Token

```powershell
# Configurar nome e email (se ainda não fez)
git config --global user.name "Seu Nome"
git config --global user.email "seu-email@exemplo.com"

# Configurar credenciais (Windows)
git config --global credential.helper wincred

# Ou usar o GCM (Git Credential Manager) - recomendado
git config --global credential.helper manager-core
```

### 3. Usar o Token

Quando fizer `git push` ou `git pull`, o Git pedirá:
- **Username**: seu username do GitHub
- **Password**: cole o Personal Access Token (não sua senha!)

### 4. Salvar Credenciais Permanentemente

**Opção A: Git Credential Manager (Recomendado)**
```powershell
# Instalar Git Credential Manager
winget install --id Microsoft.GitCredentialManager

# Configurar
git config --global credential.helper manager-core
```

**Opção B: Salvar no Windows Credential Manager**
```powershell
# O Windows salvará automaticamente após o primeiro uso
# Ou configure manualmente:
git config --global credential.helper wincred
```

---

## 🔧 Método 3: SSH Keys (Mais Seguro)

Para usar SSH em vez de HTTPS:

### 1. Gerar Chave SSH

```powershell
# Gerar nova chave SSH
ssh-keygen -t ed25519 -C "seu-email@exemplo.com"

# Quando perguntar onde salvar, pressione Enter (salvará em ~/.ssh/id_ed25519)
# Quando perguntar senha, pode deixar vazio ou criar uma senha forte
```

### 2. Adicionar Chave ao SSH Agent

```powershell
# Iniciar o ssh-agent
Start-Service ssh-agent

# Adicionar a chave
ssh-add ~/.ssh/id_ed25519
```

### 3. Copiar a Chave Pública

```powershell
# Mostrar a chave pública
Get-Content ~/.ssh/id_ed25519.pub

# Ou copiar para clipboard
Get-Content ~/.ssh/id_ed25519.pub | Set-Clipboard
```

### 4. Adicionar no GitHub

1. Acesse: https://github.com/settings/keys
2. Clique em **"New SSH key"**
3. Dê um título (ex: "Meu PC")
4. Cole a chave pública
5. Clique em **"Add SSH key"**

### 5. Testar Conexão

```powershell
ssh -T git@github.com
```

Você deve ver: `Hi username! You've successfully authenticated...`

### 6. Usar SSH nos Repositórios

```powershell
# Ao clonar, use SSH:
git clone git@github.com:usuario/repo.git

# Ou alterar URL de um repo existente:
git remote set-url origin git@github.com:usuario/repo.git
```

---

## 📋 Verificar Configuração Atual

```powershell
# Ver configuração do Git
git config --list

# Ver credenciais salvas (Windows)
cmdkey /list

# Ver status do GitHub CLI
gh auth status

# Testar conexão SSH
ssh -T git@github.com
```

---

## 🛠️ Solução de Problemas

### Erro: "Authentication failed"

1. Verifique se o token está correto
2. Verifique se o token não expirou
3. Tente gerar um novo token

### Erro: "Permission denied (publickey)"

1. Verifique se a chave SSH está adicionada ao GitHub
2. Teste a conexão: `ssh -T git@github.com`
3. Verifique se está usando a URL SSH correta

### Erro: "fatal: could not read Username"

1. Configure o credential helper:
   ```powershell
   git config --global credential.helper manager-core
   ```
2. Ou use SSH em vez de HTTPS

### Limpar Credenciais Salvas

```powershell
# Remover credenciais do Windows
cmdkey /delete:git:https://github.com

# Ou remover todas
cmdkey /list | ForEach-Object { cmdkey /delete:$_ }
```

---

## ✅ Recomendações

1. **Para iniciantes**: Use GitHub CLI (`gh auth login`)
2. **Para desenvolvedores**: Use SSH Keys (mais seguro)
3. **Para automação**: Use Personal Access Tokens

---

## 🎯 Próximos Passos

Após fazer login, você pode:

```powershell
# Clonar seus repositórios
gh repo clone usuario/repo

# Ou com Git
git clone https://github.com/usuario/repo.git

# Criar novo repositório
gh repo create meu-novo-repo --public

# Ver seus repositórios
gh repo list
```

---

**Login no GitHub configurado com sucesso!** 🎉
