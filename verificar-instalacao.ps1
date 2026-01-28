# Script de Verificação - AsaSistem Dashboard
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Verificação de Instalação" -ForegroundColor Cyan
Write-Host "  AsaSistem Dashboard" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
Write-Host "1. Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "   ✓ Node.js instalado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Node.js NÃO está instalado!" -ForegroundColor Red
    Write-Host "   → Baixe em: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "   → Após instalar, reinicie o terminal e execute este script novamente" -ForegroundColor Yellow
    exit 1
}

# Verificar npm
Write-Host "2. Verificando npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "   ✓ npm instalado: v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host "   ✗ npm NÃO está disponível!" -ForegroundColor Red
    exit 1
}

# Verificar se node_modules existe
Write-Host "3. Verificando dependências..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "   ✓ Dependências instaladas" -ForegroundColor Green
} else {
    Write-Host "   ⚠ Dependências não instaladas" -ForegroundColor Yellow
    Write-Host "   → Execute: npm install" -ForegroundColor Yellow
}

# Verificar se porta 3000 está em uso
Write-Host "4. Verificando porta 3000..." -ForegroundColor Yellow
$portInUse = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($portInUse) {
    Write-Host "   ⚠ Porta 3000 está em uso" -ForegroundColor Yellow
    Write-Host "   → O Next.js tentará usar outra porta automaticamente" -ForegroundColor Yellow
} else {
    Write-Host "   ✓ Porta 3000 disponível" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Próximos Passos:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Instalar dependências (se necessário):" -ForegroundColor White
Write-Host "   npm install" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Iniciar servidor de desenvolvimento:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Acessar no navegador:" -ForegroundColor White
Write-Host "   http://localhost:3000" -ForegroundColor Gray
Write-Host ""
