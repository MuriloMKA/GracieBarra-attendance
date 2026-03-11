@echo off
chcp 65001 > nul
echo.
echo ╔═══════════════════════════════════════════════════╗
echo ║                                                   ║
echo ║     🔄 REINICIANDO BACKEND                       ║
echo ║                                                   ║
echo ╚═══════════════════════════════════════════════════╝
echo.
echo 🛑 Parando processos node existentes...
echo.

powershell -Command "Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force"

timeout /t 2 /nobreak > nul

echo.
echo ✅ Processos parados!
echo.
echo 🚀 Iniciando backend em http://192.168.15.200:3001
echo.
echo ⚠️  Não feche esta janela! O backend está rodando aqui.
echo.
echo ═══════════════════════════════════════════════════
echo.

node server/index.js
