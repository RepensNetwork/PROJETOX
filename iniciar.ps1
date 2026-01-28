# Script de Inicialização - AsaSistem Dashboard
# Execute este script no PowerShell (não dentro do Node.js REPL!)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AsaSistem Dashboard" -ForegroundColor Cyan
Write-Host "  Script de Inicialização" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se está no PowerShell correto
if ($PSVersionTable.PSVersion) {
    Write-Host "✓ Executando no PowerShell" -ForegroundColor Green
} else {
    Write-Host "✗ Este script deve ser executado no PowerShell!" -ForegroundColor Red
    exit 1
}

# Verificar Node.js
Write-Host "Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "✓ Node.js: $nodeVersion" -ForegroundColor Green
    } else {
        Write-Host "✗ Node.js não encontrado!" -ForegroundColor Red
        Write-Host "  → Instale em: https://nodejs.org/" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "✗ Node.js não encontrado!" -ForegroundColor Red
    Write-Host "  → Instale em: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Verificar npm
Write-Host "Verificando npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version 2>$null
    if ($npmVersion) {
        Write-Host "✓ npm: v$npmVersion" -ForegroundColor Green
    } else {
        Write-Host "✗ npm não encontrado!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ npm não encontrado!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Verificar dependências
if (-not (Test-Path "node_modules")) {
    Write-Host "Dependências não encontradas. Instalando..." -ForegroundColor Yellow
    Write-Host ""
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "✗ Erro ao instalar dependências!" -ForegroundColor Red
        exit 1
    }
    Write-Host ""
    Write-Host "✓ Dependências instaladas!" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "✓ Dependências já instaladas" -ForegroundColor Green
    Write-Host ""
}

# Iniciar servidor
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Iniciando servidor de desenvolvimento" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Acesse: http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Pressione Ctrl+C para parar o servidor" -ForegroundColor Yellow
Write-Host ""

npm run dev
