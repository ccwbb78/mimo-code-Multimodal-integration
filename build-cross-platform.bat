@echo off
setlocal enabledelayedexpansion

REM Cross-platform build script for MiMo-Code (Windows)
REM Builds CLI binaries and Desktop installers for macOS and Linux
REM Output directory: C:\mimocode-build

cd /d "%~dp0"

set OUTPUT_DIR=C:\mimocode-build
if not exist "%OUTPUT_DIR%" mkdir "%OUTPUT_DIR%"
if not exist "%OUTPUT_DIR%\cli" mkdir "%OUTPUT_DIR%\cli"
if not exist "%OUTPUT_DIR%\desktop-mac" mkdir "%OUTPUT_DIR%\desktop-mac"
if not exist "%OUTPUT_DIR%\desktop-linux" mkdir "%OUTPUT_DIR%\desktop-linux"

echo ==========================================
echo MiMo-Code Cross-Platform Build Script
echo ==========================================
echo Output directory: %OUTPUT_DIR%
echo.

REM Check prerequisites
echo [INFO] Checking prerequisites...

where bun >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] bun is not installed. Please install bun first.
    exit /b 1
)

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] node is not installed. Please install node first.
    exit /b 1
)

echo [INFO] Prerequisites check passed.
echo.

REM Step 1: Build CLI binaries for macOS
echo [INFO] === Step 1: Building CLI binaries for macOS ===
cd packages\opencode
set TARGET_OS=darwin
set TARGET_ARCH=all
bun run script\build.ts
xcopy /E /I /Y dist\mimocode-darwin-* "%OUTPUT_DIR%\cli\" >nul
cd ..\..
echo [INFO] CLI binary build completed for macOS
echo.

REM Step 2: Build CLI binaries for Linux
echo [INFO] === Step 2: Building CLI binaries for Linux ===
cd packages\opencode
set TARGET_OS=linux
set TARGET_ARCH=all
bun run script\build.ts
xcopy /E /I /Y dist\mimocode-linux-* "%OUTPUT_DIR%\cli\" >nul
cd ..\..
echo [INFO] CLI binary build completed for Linux
echo.

REM Step 3: Build Desktop app for macOS
echo [INFO] === Step 3: Building Desktop app for macOS ===
cd packages\desktop
call bun run build
call bun run package:mac
if exist C:\mimocode-build\desktop\*.dmg copy /Y C:\mimocode-build\desktop\*.dmg "%OUTPUT_DIR%\desktop-mac\" >nul
if exist C:\mimocode-build\desktop\*.zip copy /Y C:\mimocode-build\desktop\*.zip "%OUTPUT_DIR%\desktop-mac\" >nul
cd ..\..
echo [INFO] Desktop build completed for macOS
echo.

REM Step 4: Build Desktop app for Linux
echo [INFO] === Step 4: Building Desktop app for Linux ===
cd packages\desktop
call bun run build
call bun run package:linux
if exist C:\mimocode-build\desktop\*.AppImage copy /Y C:\mimocode-build\desktop\*.AppImage "%OUTPUT_DIR%\desktop-linux\" >nul
if exist C:\mimocode-build\desktop\*.deb copy /Y C:\mimocode-build\desktop\*.deb "%OUTPUT_DIR%\desktop-linux\" >nul
cd ..\..
echo [INFO] Desktop build completed for Linux
echo.

echo ==========================================
echo Build process completed!
echo ==========================================
echo.
echo Output locations:
echo   CLI binaries: %OUTPUT_DIR%\cli\
echo   macOS Desktop: %OUTPUT_DIR%\desktop-mac\
echo   Linux Desktop: %OUTPUT_DIR%\desktop-linux\
echo.

endlocal
