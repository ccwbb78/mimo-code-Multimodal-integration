# Cross-platform build script for MiMo-Code (PowerShell)
# Builds CLI binaries and Desktop installers for macOS and Linux
# Output directory: C:\mimocode-build

param(
    [ValidateSet("all", "cli", "desktop")]
    [string]$Target = "all",

    [ValidateSet("all", "darwin", "linux")]
    [string]$Platform = "all"
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

# Output directory
$OutputDir = "C:\mimocode-build"
if (-not (Test-Path $OutputDir)) { New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null }
if (-not (Test-Path "$OutputDir\cli")) { New-Item -ItemType Directory -Path "$OutputDir\cli" -Force | Out-Null }
if (-not (Test-Path "$OutputDir\desktop-mac")) { New-Item -ItemType Directory -Path "$OutputDir\desktop-mac" -Force | Out-Null }
if (-not (Test-Path "$OutputDir\desktop-linux")) { New-Item -ItemType Directory -Path "$OutputDir\desktop-linux" -Force | Out-Null }

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "MiMo-Code Cross-Platform Build Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Output directory: $OutputDir"
Write-Host ""

# Helper functions
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warn {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check prerequisites
function Test-Prerequisites {
    Write-Info "Checking prerequisites..."

    if (-not (Get-Command "bun" -ErrorAction SilentlyContinue)) {
        Write-Error "bun is not installed. Please install bun first."
        exit 1
    }

    if (-not (Get-Command "node" -ErrorAction SilentlyContinue)) {
        Write-Error "node is not installed. Please install node first."
        exit 1
    }

    Write-Info "Prerequisites check passed."
}

# Build CLI binaries
function Build-CLI {
    param([string]$TargetPlatform)

    Write-Info "Building CLI binaries for $TargetPlatform..."

    Set-Location "$ScriptDir\packages\opencode"

    # Set environment variables
    $env:TARGET_OS = $TargetPlatform
    $env:TARGET_ARCH = "all"

    # Run build script
    bun run script\build.ts

    # Copy to output directory
    if ($TargetPlatform -eq "darwin") {
        Copy-Item -Path "dist\mimocode-darwin-*" -Destination "$OutputDir\cli\" -Recurse -Force
    } elseif ($TargetPlatform -eq "linux") {
        Copy-Item -Path "dist\mimocode-linux-*" -Destination "$OutputDir\cli\" -Recurse -Force
    }

    Set-Location $ScriptDir
    Write-Info "CLI build completed for $TargetPlatform"
}

# Build desktop app
function Build-Desktop {
    param([string]$TargetPlatform)

    Write-Info "Building desktop app for $TargetPlatform..."

    Set-Location "$ScriptDir\packages\desktop"

    # Build the app
    bun run build

    # Package for target platform
    switch ($TargetPlatform) {
        "darwin" {
            bun run package:mac
            # Copy to output directory
            Copy-Item -Path "C:\mimocode-build\desktop\*.dmg" -Destination "$OutputDir\desktop-mac\" -Force -ErrorAction SilentlyContinue
            Copy-Item -Path "C:\mimocode-build\desktop\*.zip" -Destination "$OutputDir\desktop-mac\" -Force -ErrorAction SilentlyContinue
        }
        "linux" {
            bun run package:linux
            # Copy to output directory
            Copy-Item -Path "C:\mimocode-build\desktop\*.AppImage" -Destination "$OutputDir\desktop-linux\" -Force -ErrorAction SilentlyContinue
            Copy-Item -Path "C:\mimocode-build\desktop\*.deb" -Destination "$OutputDir\desktop-linux\" -Force -ErrorAction SilentlyContinue
        }
        default {
            Write-Error "Unsupported platform: $TargetPlatform"
            exit 1
        }
    }

    Set-Location $ScriptDir
    Write-Info "Desktop build completed for $TargetPlatform"
}

# Main build process
function Start-Build {
    Test-Prerequisites

    Write-Host ""
    Write-Info "Starting build process..."
    Write-Host ""

    # Build CLI binaries
    if ($Target -eq "all" -or $Target -eq "cli") {
        if ($Platform -eq "all" -or $Platform -eq "darwin") {
            Write-Info "=== Building CLI for macOS ==="
            Build-CLI "darwin"
        }

        if ($Platform -eq "all" -or $Platform -eq "linux") {
            Write-Info "=== Building CLI for Linux ==="
            Build-CLI "linux"
        }
    }

    # Build desktop apps
    if ($Target -eq "all" -or $Target -eq "desktop") {
        if ($Platform -eq "all" -or $Platform -eq "darwin") {
            Write-Info "=== Building Desktop for macOS ==="
            Build-Desktop "darwin"
        }

        if ($Platform -eq "all" -or $Platform -eq "linux") {
            Write-Info "=== Building Desktop for Linux ==="
            Build-Desktop "linux"
        }
    }

    Write-Host ""
    Write-Info "=========================================="
    Write-Info "Build process completed!"
    Write-Info "=========================================="
    Write-Host ""
    Write-Info "Output locations:"
    Write-Info "  CLI binaries: $OutputDir\cli\"
    Write-Info "  macOS Desktop: $OutputDir\desktop-mac\"
    Write-Info "  Linux Desktop: $OutputDir\desktop-linux\"
    Write-Host ""
}

# Run the build
Start-Build
