# Script para limpar e reconstruir o projeto
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Limpando e Reconstruindo Projeto" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se está na pasta correta
$currentDir = Get-Location
if ($currentDir.Path -notlike "*AsaSistem*") {
    Write-Host "⚠ Você não está na pasta AsaSistem!" -ForegroundColor Red
    Write-Host "Execute: cd c:\Users\mateu\AsaSistem" -ForegroundColor Yellow
    exit 1
}

Write-Host "1. Removendo .next (cache do Next.js)..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next
    Write-Host "   ✓ .next removido" -ForegroundColor Green
} else {
    Write-Host "   → .next não existe" -ForegroundColor Gray
}
Write-Host ""

Write-Host "2. Removendo node_modules..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force node_modules
    Write-Host "   ✓ node_modules removido" -ForegroundColor Green
} else {
    Write-Host "   → node_modules não existe" -ForegroundColor Gray
}
Write-Host ""

Write-Host "3. Removendo package-lock.json..." -ForegroundColor Yellow
if (Test-Path "package-lock.json") {
    Remove-Item -Force package-lock.json
    Write-Host "   ✓ package-lock.json removido" -ForegroundColor Green
} else {
    Write-Host "   → package-lock.json não existe" -ForegroundColor Gray
}
Write-Host ""

Write-Host "4. Limpando cache do npm..." -ForegroundColor Yellow
npm cache clean --force 2>&1 | Out-Null
Write-Host "   ✓ Cache limpo" -ForegroundColor Green
Write-Host ""

Write-Host "5. Reinstalando dependências..." -ForegroundColor Yellow
Write-Host ""
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "✗ Erro ao instalar dependências!" -ForegroundColor Red
    exit 1
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Limpeza Concluída!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Agora você pode executar:" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor Gray
Write-Host ""
