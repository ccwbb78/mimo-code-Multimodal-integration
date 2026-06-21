# MiMo-Code Cross-Platform Build Guide

This guide explains how to build MiMo-Code for macOS and Linux from a Windows machine.

## Prerequisites

1. **Bun** (v1.3.11 or later) - JavaScript runtime and package manager
2. **Node.js** (v18 or later)
3. **Git** (for version control operations)

## Quick Start

### Option 1: Using Batch Script (Windows)

```batch
build-cross-platform.bat
```

### Option 2: Using Bash Script (Git Bash/WSL)

```bash
chmod +x build-cross-platform.sh
./build-cross-platform.sh
```

### Option 3: Manual Build Steps

#### Step 1: Build CLI Binaries

For macOS (both Intel and Apple Silicon):
```bash
cd packages/opencode
TARGET_OS=darwin TARGET_ARCH=all bun run script/build.ts
```

For Linux (x64 and arm64):
```bash
cd packages/opencode
TARGET_OS=linux TARGET_ARCH=all bun run script/build.ts
```

#### Step 2: Build Desktop App

For macOS:
```bash
cd packages/desktop
bun run build
bun run package:mac
```

For Linux:
```bash
cd packages/desktop
bun run build
bun run package:linux
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

**macOS** - Located in `C:\mimocode-build\desktop-mac\`:
- `.dmg` - macOS Disk Image
- `.zip` - macOS ZIP Archive

**Linux** - Located in `C:\mimocode-build\desktop-linux\`:
- `.AppImage` - Universal Linux Package
- `.deb` - Debian/Ubuntu Package

## Platform-Specific Notes

### macOS
- The build creates universal binaries that work on both Intel and Apple Silicon Macs
- Code signing is not included in this build process
- For distribution, you may need to sign and notarize the app

### Linux
- AppImage: Universal format that runs on most Linux distributions
- deb: Debian/Ubuntu package format
- For other distributions, consider converting the AppImage or building from source

## Troubleshooting

### Cross-compilation Issues
- Bun supports cross-compilation for CLI binaries
- electron-builder may have limitations when cross-compiling desktop apps
- If you encounter issues, consider building on the target platform directly

### Missing Dependencies
If you encounter missing native dependencies:
```bash
bun install --os="*" --cpu="*"
```

### Build Failures
1. Ensure all dependencies are installed: `bun install`
2. Clear build caches: `rm -rf node_modules/.cache`
3. Check the error messages for specific issues

## Advanced Configuration

### Custom Build Targets
You can modify the build scripts to target specific architectures:
- `TARGET_ARCH=arm64` - ARM64 only
- `TARGET_ARCH=x64` - x64 only

### Environment Variables
- `TARGET_OS` - Target operating system (darwin/linux)
- `TARGET_ARCH` - Target architecture (arm64/x64/all)
- `MIMOCODE_CHANNEL` - Build channel (prod/beta/dev)

## Distribution

After building, you can distribute the installers:
- macOS: Share the `.dmg` or `.zip` file
- Linux: Share the `.AppImage` (universal) or `.deb` (Debian/Ubuntu) file

## Notes

- The CLI binaries are self-contained and don't require Node.js or Bun on the target machine
- The desktop app bundles the CLI binary for the target platform
- Code signing and notarization are not included in this build process
- For production releases, consider setting up proper CI/CD pipelines
