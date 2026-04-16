@echo off
setlocal enabledelayedexpansion
chcp 65001 > nul

echo.
echo =====================================================
echo    ATUALIZAR APP NO CELULAR (ANDROID / USB)
echo =====================================================
echo.
echo Conecte o celular via USB e confirme depuracao USB.
echo.
pause

echo.
echo [1/5] Validando ferramentas...
set "ADB_EXE=adb"
where adb >nul 2>&1
if errorlevel 1 (
    if exist "%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" (
        set "ADB_EXE=%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe"
    ) else if exist "%USERPROFILE%\AppData\Local\Android\Sdk\platform-tools\adb.exe" (
        set "ADB_EXE=%USERPROFILE%\AppData\Local\Android\Sdk\platform-tools\adb.exe"
    ) else if defined ANDROID_HOME if exist "%ANDROID_HOME%\platform-tools\adb.exe" (
        set "ADB_EXE=%ANDROID_HOME%\platform-tools\adb.exe"
    ) else if defined ANDROID_SDK_ROOT if exist "%ANDROID_SDK_ROOT%\platform-tools\adb.exe" (
        set "ADB_EXE=%ANDROID_SDK_ROOT%\platform-tools\adb.exe"
    ) else (
        echo.
        echo ERRO: adb nao encontrado no PATH nem em caminhos padrao do SDK.
        echo Instale Android SDK Platform-Tools no Android Studio ^> SDK Manager.
        goto :fail
    )
)

REM Detectar Java do Android Studio (JBR - Java Build Runtime)
if exist "C:\Program Files\Android\Android Studio\jbr" (
    set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
) else if exist "C:\Program Files (x86)\Android\Android Studio\jbr" (
    set "JAVA_HOME=C:\Program Files (x86)\Android\Android Studio\jbr"
)

REM Detectar Android SDK e criar local.properties
set "SDK_FOUND="
if exist "%LOCALAPPDATA%\Android\Sdk" (
    set "ANDROID_SDK_PATH=%LOCALAPPDATA%\Android\Sdk"
    set "SDK_FOUND=1"
) else if defined ANDROID_HOME if exist "%ANDROID_HOME%" (
    set "ANDROID_SDK_PATH=%ANDROID_HOME%"
    set "SDK_FOUND=1"
) else if defined ANDROID_SDK_ROOT if exist "%ANDROID_SDK_ROOT%" (
    set "ANDROID_SDK_PATH=%ANDROID_SDK_ROOT%"
    set "SDK_FOUND=1"
)

if not defined SDK_FOUND (
    echo.
    echo ERRO: Android SDK nao encontrado.
    echo Instale o Android SDK via Android Studio.
    goto :fail
)

REM Criar ou atualizar android/local.properties
REM Usar forward slashes no path para Windows/Gradle compatibility
setlocal enabledelayedexpansion
set "SDK_PATH_FORWARD=!ANDROID_SDK_PATH:\=/!"
(
    echo sdk.dir=!SDK_PATH_FORWARD!
) > android\local.properties
endlocal

where npm.cmd >nul 2>&1
if errorlevel 1 (
    echo.
    echo ERRO: npm.cmd nao encontrado no PATH.
    goto :fail
)

where npx.cmd >nul 2>&1
if errorlevel 1 (
    echo.
    echo ERRO: npx.cmd nao encontrado no PATH.
    goto :fail
)

echo.
echo [2/5] Verificando dispositivo conectado...
"%ADB_EXE%" start-server >nul 2>&1
setlocal enabledelayedexpansion
set "DEVICE_FOUND="
"%ADB_EXE%" devices > "%TEMP%\adb_devices.txt" 2>&1
for /f "skip=1 tokens=1,2" %%A in (%TEMP%\adb_devices.txt) do (
    if not "%%A"=="" (
        if "%%B"=="device" set "DEVICE_FOUND=1"
    )
)
endlocal && set "DEVICE_FOUND=%DEVICE_FOUND%"

if not defined DEVICE_FOUND (
    echo.
    echo ERRO: nenhum dispositivo Android autorizado encontrado.
    echo Dica: aceite o prompt de depuracao USB no celular e rode novamente.
    "%ADB_EXE%" devices
    goto :fail
)

echo.
echo [3/5] Gerando build web com API do Railway...
set "VITE_API_URL=https://graciebarra-attendance-production.up.railway.app/api"
call npm.cmd run build
if errorlevel 1 (
    echo.
    echo ERRO: falha no build web.
    goto :fail
)

echo.
echo [4/5] Sincronizando Capacitor Android...
call npx.cmd cap sync android
if errorlevel 1 (
    echo.
    echo ERRO: falha no cap sync android.
    goto :fail
)

echo.
echo [5/5] Desinstalando app anterior e instalando nova versao...
setlocal enabledelayedexpansion
set "DEVICE_READY="
"%ADB_EXE%" devices > "%TEMP%\adb_devices_preinstall.txt" 2>&1
for /f "skip=1 tokens=1,2" %%A in (%TEMP%\adb_devices_preinstall.txt) do (
    if not "%%A"=="" (
        if "%%B"=="device" set "DEVICE_READY=1"
    )
)
endlocal && set "DEVICE_READY=%DEVICE_READY%"

if not defined DEVICE_READY (
    echo.
    echo ERRO: dispositivo desconectado antes da instalacao.
    echo Reconecte o celular, desbloqueie a tela e confirme depuracao USB.
    "%ADB_EXE%" devices
    goto :fail
)

"%ADB_EXE%" uninstall com.graciebarrabarra.attendance >nul 2>&1
pushd android
call gradlew.bat installDebug
set "GRADLE_EXIT=!errorlevel!"
popd

if not "!GRADLE_EXIT!"=="0" (
    echo.
    echo ERRO: falha ao instalar no celular.
    goto :fail
)

echo.
echo =====================================================
echo    APP ATUALIZADO COM SUCESSO NO CELULAR
echo =====================================================
echo.
echo Se o app nao abrir automaticamente, abra manualmente no celular.
echo.
pause
exit /b 0

:fail
echo.
echo Processo interrompido.
pause
exit /b 1
