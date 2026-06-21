# Cross-Platform Build Implementation Summary

## Overview

This document summarizes the changes made to enable building MiMo-Code for macOS and Linux from a Windows machine.

## Files Created/Modified

### New Files

1. **`build-cross-platform.sh`** - Bash script for cross-platform builds
2. **`build-cross-platform.bat`** - Windows batch script for cross-platform builds
3. **`build-cross-platform.ps1`** - PowerShell script for cross-platform builds
4. **`verify-build.sh`** - Script to verify build output
5. **`BUILD_CROSS_PLATFORM.md`** - Detailed build guide
6. **`CROSS_PLATFORM_BUILD_SUMMARY.md`** - This summary document

### Modified Files

1. **`packages/desktop/electron-builder.json`**
   - Updated `extraResources` path to use platform-specific variables (`${os}-${arch}`)
   - Changed output directory from hardcoded path to relative `release`
   - Updated artifact naming to include architecture

2. **`packages/desktop/electron-builder.config.ts`**
   - Updated to match JSON configuration
   - Fixed `extraResources` path to use platform variables

3. **`package.json`**
   - Added new npm scripts for cross-platform builds:
     - `build:cli:mac` - Build CLI for macOS
     - `build:cli:linux` - Build CLI for Linux
     - `build:desktop:mac` - Build desktop app for macOS
     - `build:desktop:linux` - Build desktop app for Linux
     - `build:cross-platform` - Run full cross-platform build (bash)
     - `build:cross-platform:win` - Run full cross-platform build (Windows)
     - `verify:build` - Verify build output

## How to Use

### Quick Start (Windows)

```batch
# Run the batch script
build-cross-platform.bat
```

### Quick Start (Git Bash/WSL)

```bash
# Make script executable and run
chmod +x build-cross-platform.sh
./build-cross-platform.sh
```

### Using npm Scripts

```bash
# Build CLI for macOS
bun run build:cli:mac

# Build CLI for Linux
bun run build:cli:linux

# Build desktop app for macOS
bun run build:desktop:mac

# Build desktop app for Linux
bun run build:desktop:linux

# Run full cross-platform build
bun run build:cross-platform

# Verify build output
bun run verify:build
```

### PowerShell (Advanced)

```powershell
# Build everything
.\build-cross-platform.ps1 -Target all -Platform all

# Build only CLI for macOS
.\build-cross-platform.ps1 -Target cli -Platform darwin

# Build only desktop for Linux
.\build-cross-platform.ps1 -Target desktop -Platform linux
```

## Build Output

All build artifacts are output to `C:\mimocode-build\`:

### CLI Binaries

Located in `C:\mimocode-build\cli\`:
- `mimocode-darwin-arm64/` - macOS Apple Silicon
- `mimocode-darwin-x64/` - macOS Intel
- `mimocode-linux-arm64/` - Linux ARM64
- `mimocode-linux-x64/` - Linux x64

### Desktop Installers

Located in `C:\mimocode-build\desktop-mac\`:
- `MiMoCode-<version>-<arch>.dmg` - macOS Disk Image
- `MiMoCode-<version>-<arch>.zip` - macOS ZIP

Located in `C:\mimocode-build\desktop-linux\`:
- `MiMoCode-<version>-<arch>.AppImage` - Linux AppImage
- `MiMoCode-<version>-<arch>.deb` - Debian Package

## Technical Details

### Cross-Compilation Support

The build system uses Bun's cross-compilation capabilities:
- CLI binaries can be compiled for any platform from any platform
- The `TARGET_OS` and `TARGET_ARCH` environment variables control the target platform
- electron-builder handles desktop app packaging for the target platform

### Platform-Specific Resources

The electron-builder configuration now uses platform variables in paths:
```json
{
  "from": "../opencode/dist/mimocode-${os}-${arch}/bin/",
  "to": "bin/",
  "filter": ["mimo*"]
}
```

This ensures the correct CLI binary is bundled for each platform.

### Build Process

1. **CLI Build**: Uses Bun's compiler to create standalone binaries
2. **Desktop Build**: Uses electron-vite to build the Electron app
3. **Packaging**: Uses electron-builder to create platform-specific installers

## Troubleshooting

### Common Issues

1. **Missing native dependencies**
   ```bash
   bun install --os="*" --cpu="*"
   ```

2. **Build fails on Windows**
   - Ensure Git Bash or WSL is available for bash scripts
   - Use the batch script or PowerShell script instead

3. **electron-builder errors**
   - Some features may require building on the target platform
   - Code signing is not included in this build process

### Verification

Run the verification script to check build output:
```bash
bun run verify:build
```

## Notes

- Code signing and notarization are not included
- For production releases, consider CI/CD pipelines
- The CLI binaries are self-contained (no runtime dependencies)
- The desktop app bundles the CLI binary for the target platform
