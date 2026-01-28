# Script para encontrar o npm e configurar o PATH
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Encontrando npm..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
Write-Host "1. Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✓ Node.js encontrado: $nodeVersion" -ForegroundColor Green
        
        # Encontrar onde o node está
        $nodePath = (Get-Command node).Source
        Write-Host "   ✓ Caminho do Node.js: $nodePath" -ForegroundColor Green
        
        # O npm geralmente está na mesma pasta do node
        $nodeDir = Split-Path $nodePath
        $npmPath = Join-Path $nodeDir "npm.cmd"
        
        if (Test-Path $npmPath) {
            Write-Host "   ✓ npm encontrado: $npmPath" -ForegroundColor Green
            Write-Host ""
            Write-Host "========================================" -ForegroundColor Cyan
            Write-Host "  SOLUÇÃO:" -ForegroundColor Yellow
            Write-Host "========================================" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "Execute estes comandos:" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "cd c:\Users\mateu\AsaSistem" -ForegroundColor White
            Write-Host "`"$npmPath`" run dev" -ForegroundColor White
            Write-Host ""
            Write-Host "OU adicione ao PATH:" -ForegroundColor Yellow
            Write-Host '$env:PATH += ";' + $nodeDir + '"' -ForegroundColor White
            Write-Host ""
        } else {
            Write-Host "   ✗ npm.cmd não encontrado em: $nodeDir" -ForegroundColor Red
            Write-Host ""
            Write-Host "   Tentando outros locais..." -ForegroundColor Yellow
            
            # Tentar locais comuns
            $commonPaths = @(
                "C:\Program Files\nodejs\npm.cmd",
                "C:\Program Files (x86)\nodejs\npm.cmd",
                "$env:APPDATA\npm\npm.cmd",
                "$env:LOCALAPPDATA\npm\npm.cmd"
            )
            
            foreach ($path in $commonPaths) {
                if (Test-Path $path) {
                    Write-Host "   ✓ npm encontrado: $path" -ForegroundColor Green
                    Write-Host ""
                    Write-Host "Execute:" -ForegroundColor Yellow
                    Write-Host "`"$path`" run dev" -ForegroundColor White
                    break
                }
            }
        }
    } else {
        Write-Host "   ✗ Node.js não encontrado!" -ForegroundColor Red
    }
} catch {
    Write-Host "   ✗ Erro ao verificar Node.js" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Verificando PATH atual..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$pathEntries = $env:PATH -split ';'
$nodePaths = $pathEntries | Where-Object { $_ -like "*nodejs*" -or $_ -like "*npm*" }

if ($nodePaths) {
    Write-Host "✓ Encontradas entradas relacionadas ao Node.js no PATH:" -ForegroundColor Green
    foreach ($path in $nodePaths) {
        Write-Host "   - $path" -ForegroundColor White
    }
} else {
    Write-Host "✗ Nenhuma entrada do Node.js encontrada no PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "SOLUÇÃO: Adicione ao PATH temporariamente:" -ForegroundColor Yellow
    Write-Host '$env:PATH += ";C:\Program Files\nodejs"' -ForegroundColor White
}

Write-Host ""
