# Script PowerShell para ajudar no login do GitHub
# Execute: .\scripts\github-login.ps1

Write-Host "🔐 Configuração de Login no GitHub" -ForegroundColor Cyan
Write-Host ""

# Verificar se GitHub CLI está instalado
Write-Host "Verificando GitHub CLI..." -ForegroundColor Yellow
$ghInstalled = Get-Command gh -ErrorAction SilentlyContinue

if ($ghInstalled) {
    Write-Host "✅ GitHub CLI encontrado!" -ForegroundColor Green
    
    # Verificar status de autenticação
    Write-Host ""
    Write-Host "Verificando status de autenticação..." -ForegroundColor Yellow
    gh auth status
    
    Write-Host ""
    Write-Host "Para fazer login, execute:" -ForegroundColor Cyan
    Write-Host "  gh auth login" -ForegroundColor White
} else {
    Write-Host "❌ GitHub CLI não encontrado" -ForegroundColor Red
    Write-Host ""
    Write-Host "Opções de instalação:" -ForegroundColor Yellow
    Write-Host "1. Via winget: winget install --id GitHub.cli" -ForegroundColor White
    Write-Host "2. Via Chocolatey: choco install gh" -ForegroundColor White
    Write-Host "3. Baixar de: https://github.com/cli/cli/releases" -ForegroundColor White
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

# Verificar Git
Write-Host ""
Write-Host "Verificando Git..." -ForegroundColor Yellow
$gitInstalled = Get-Command git -ErrorAction SilentlyContinue

if ($gitInstalled) {
    Write-Host "✅ Git encontrado!" -ForegroundColor Green
    
    # Mostrar configuração atual
    Write-Host ""
    Write-Host "Configuração atual do Git:" -ForegroundColor Cyan
    $userName = git config --global user.name
    $userEmail = git config --global user.email
    
    if ($userName) {
        Write-Host "  Nome: $userName" -ForegroundColor White
    } else {
        Write-Host "  ⚠️  Nome não configurado" -ForegroundColor Yellow
        Write-Host "     Configure com: git config --global user.name 'Seu Nome'" -ForegroundColor Gray
    }
    
    if ($userEmail) {
        Write-Host "  Email: $userEmail" -ForegroundColor White
    } else {
        Write-Host "  ⚠️  Email não configurado" -ForegroundColor Yellow
        Write-Host "     Configure com: git config --global user.email 'seu-email@exemplo.com'" -ForegroundColor Gray
    }
    
    # Verificar credential helper
    $credentialHelper = git config --global credential.helper
    if ($credentialHelper) {
        Write-Host "  Credential Helper: $credentialHelper" -ForegroundColor White
    } else {
        Write-Host "  ⚠️  Credential Helper não configurado" -ForegroundColor Yellow
        Write-Host "     Configure com: git config --global credential.helper manager-core" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ Git não encontrado" -ForegroundColor Red
    Write-Host "   Instale o Git de: https://git-scm.com/download/win" -ForegroundColor White
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

# Verificar SSH
Write-Host ""
Write-Host "Verificando chaves SSH..." -ForegroundColor Yellow
$sshDir = "$env:USERPROFILE\.ssh"

if (Test-Path $sshDir) {
    $sshKeys = Get-ChildItem $sshDir -Filter "*.pub" -ErrorAction SilentlyContinue
    
    if ($sshKeys) {
        Write-Host "✅ Chaves SSH encontradas:" -ForegroundColor Green
        foreach ($key in $sshKeys) {
            Write-Host "  - $($key.Name)" -ForegroundColor White
        }
        Write-Host ""
        Write-Host "Para testar conexão SSH:" -ForegroundColor Cyan
        Write-Host "  ssh -T git@github.com" -ForegroundColor White
    } else {
        Write-Host "⚠️  Nenhuma chave SSH pública encontrada" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Para gerar uma chave SSH:" -ForegroundColor Cyan
        Write-Host "  ssh-keygen -t ed25519 -C 'seu-email@exemplo.com'" -ForegroundColor White
    }
} else {
    Write-Host "⚠️  Diretório .ssh não encontrado" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Para gerar uma chave SSH:" -ForegroundColor Cyan
    Write-Host "  ssh-keygen -t ed25519 -C 'seu-email@exemplo.com'" -ForegroundColor White
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 Para mais informações, consulte:" -ForegroundColor Cyan
Write-Host "   GITHUB-LOGIN-TERMINAL.md" -ForegroundColor White
Write-Host ""
