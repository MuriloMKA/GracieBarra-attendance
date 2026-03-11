@echo off
chcp 65001 > nul
echo.
echo ╔═══════════════════════════════════════════════════╗
echo ║                                                   ║
echo ║     📱 ATUALIZAR APP NO CELULAR                  ║
echo ║                                                   ║
echo ╚═══════════════════════════════════════════════════╝
echo.
echo ⏳ Conecte o celular via USB e certifique-se que a
echo    depuração USB está ativada...
echo.
pause
echo.
echo 🔄 Iniciando atualização...
echo.

REM Definir variável de ambiente e rodar build
powershell -Command "$env:VITE_API_URL='http://192.168.15.200:3001/api'; npm run build"

if errorlevel 1 (
    echo.
    echo ❌ Erro no build!
    pause
    exit /b 1
)

echo.
echo ✅ Build concluído!
echo.
echo 📱 Sincronizando com Android...
echo.

npx cap sync android

if errorlevel 1 (
    echo.
    echo ❌ Erro no sync!
    pause
    exit /b 1
)

echo.
echo ✅ Sync concluído!
echo.
echo 📲 Instalando no celular...
echo.

cd android
call gradlew installDebug
cd ..

if errorlevel 1 (
    echo.
    echo ❌ Erro na instalação!
    pause
    exit /b 1
)

echo.
echo ╔═══════════════════════════════════════════════════╗
echo ║                                                   ║
echo ║     ✅ APP ATUALIZADO COM SUCESSO! 🎉            ║
echo ║                                                   ║
echo ╚═══════════════════════════════════════════════════╝
echo.
echo Agora você pode abrir o app no celular!
echo.
pause
