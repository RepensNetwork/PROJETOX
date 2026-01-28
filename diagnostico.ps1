# Script de Diagnóstico - AsaSistem Dashboard
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Diagnóstico do Sistema" -ForegroundColor Cyan
Write-Host "  AsaSistem Dashboard" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar diretório atual
Write-Host "1. Diretório Atual:" -ForegroundColor Yellow
$currentDir = Get-Location
Write-Host "   $currentDir" -ForegroundColor White
if ($currentDir.Path -notlike "*AsaSistem*") {
    Write-Host "   ⚠ Você NÃO está na pasta AsaSistem!" -ForegroundColor Red
    Write-Host "   → Execute: cd c:\Users\mateu\AsaSistem" -ForegroundColor Yellow
} else {
    Write-Host "   ✓ Você está na pasta correta" -ForegroundColor Green
}
Write-Host ""

# Verificar Node.js
Write-Host "2. Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    if ($LASTEXITCODE -eq 0 -and $nodeVersion -notlike "*não é reconhecido*") {
        Write-Host "   ✓ Node.js: $nodeVersion" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Node.js NÃO encontrado!" -ForegroundColor Red
        Write-Host "   → Instale em: https://nodejs.org/" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ✗ Node.js NÃO encontrado!" -ForegroundColor Red
    Write-Host "   → Instale em: https://nodejs.org/" -ForegroundColor Yellow
}
Write-Host ""

# Verificar npm
Write-Host "3. Verificando npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version 2>&1
    if ($LASTEXITCODE -eq 0 -and $npmVersion -notlike "*não é reconhecido*") {
        Write-Host "   ✓ npm: v$npmVersion" -ForegroundColor Green
    } else {
        Write-Host "   ✗ npm NÃO encontrado!" -ForegroundColor Red
    }
} catch {
    Write-Host "   ✗ npm NÃO encontrado!" -ForegroundColor Red
}
Write-Host ""

# Verificar arquivos do projeto
Write-Host "4. Verificando arquivos do projeto..." -ForegroundColor Yellow
$requiredFiles = @("package.json", "next.config.js", "tsconfig.json", "app", "components")
$allFilesExist = $true

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "   ✓ $file encontrado" -ForegroundColor Green
    } else {
        Write-Host "   ✗ $file NÃO encontrado!" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host ""
    Write-Host "   ⚠ Alguns arquivos estão faltando!" -ForegroundColor Yellow
    Write-Host "   → Certifique-se de estar na pasta correta do projeto" -ForegroundColor Yellow
}
Write-Host ""

# Verificar node_modules
Write-Host "5. Verificando dependências..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "   ✓ node_modules existe" -ForegroundColor Green
    
    # Verificar se package.json existe para contar dependências
    if (Test-Path "package.json") {
        try {
            $packageJson = Get-Content "package.json" | ConvertFrom-Json
            $depCount = 0
            if ($packageJson.dependencies) { $depCount += $packageJson.dependencies.Count }
            if ($packageJson.devDependencies) { $depCount += $packageJson.devDependencies.Count }
            Write-Host "   → Total de dependências: $depCount" -ForegroundColor Gray
        } catch {
            Write-Host "   ⚠ Não foi possível ler package.json" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "   ⚠ node_modules NÃO existe" -ForegroundColor Yellow
    Write-Host "   → Execute: npm install" -ForegroundColor Yellow
}
Write-Host ""

# Verificar porta 3000
Write-Host "6. Verificando porta 3000..." -ForegroundColor Yellow
try {
    $portInUse = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
    if ($portInUse) {
        Write-Host "   ⚠ Porta 3000 está em uso" -ForegroundColor Yellow
        Write-Host "   → O Next.js tentará usar outra porta automaticamente" -ForegroundColor Gray
    } else {
        Write-Host "   ✓ Porta 3000 disponível" -ForegroundColor Green
    }
} catch {
    Write-Host "   → Não foi possível verificar a porta" -ForegroundColor Gray
}
Write-Host ""

# Verificar permissões do PowerShell
Write-Host "7. Verificando permissões..." -ForegroundColor Yellow
$executionPolicy = Get-ExecutionPolicy
Write-Host "   → Execution Policy: $executionPolicy" -ForegroundColor Gray
if ($executionPolicy -eq "Restricted") {
    Write-Host "   ⚠ Execution Policy está restrito" -ForegroundColor Yellow
    Write-Host "   → Execute: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser" -ForegroundColor Yellow
}
Write-Host ""

# Resumo e próximos passos
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Resumo e Próximos Passos" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($currentDir.Path -notlike "*AsaSistem*") {
    Write-Host "1. Navegue para a pasta do projeto:" -ForegroundColor White
    Write-Host "   cd c:\Users\mateu\AsaSistem" -ForegroundColor Gray
    Write-Host ""
}

if (-not (Test-Path "node_modules")) {
    Write-Host "2. Instale as dependências:" -ForegroundColor White
    Write-Host "   npm install" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "3. Inicie o servidor:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""

Write-Host "4. Acesse no navegador:" -ForegroundColor White
Write-Host "   http://localhost:3000" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Se ainda houver erros, copie a mensagem" -ForegroundColor Yellow
Write-Host "  de erro completa e me envie!" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
