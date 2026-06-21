# MiMo-Code Build Instructions

## Overview

This document explains how to build MiMo-Code for different platforms. Due to Bun's cross-compilation limitations, you need to build on the target platform.

## Build Output Directory

All builds output to `C:\mimocode-build\`:
```
C:\mimocode-build\
├── cli\                    # CLI binaries
│   ├── mimocode-windows-x64\    # Windows (built on Windows)
│   ├── mimocode-darwin-arm64\   # macOS Apple Silicon (built on Mac)
│   ├── mimocode-darwin-x64\     # macOS Intel (built on Mac)
│   ├── mimocode-linux-arm64\    # Linux ARM64 (built on Linux)
│   └── mimocode-linux-x64\      # Linux x64 (built on Linux)
├── desktop-mac\            # macOS installers
├── desktop-linux\          # Linux installers
└── desktop\                # Windows installers
```

## Building on Windows (Current Platform)

The Windows build is already configured and working:

```batch
# Build CLI for Windows
cd packages\opencode
bun run script/build.ts --single

# Build Desktop app for Windows
cd packages\desktop
bun run build
bun run package:win
```

Output: `C:\mimocode-build\desktop\MiMoCode-0.2.0-x64.exe`

## Building on macOS

To build for macOS, you need to run the build on a Mac:

1. **Clone the repository on a Mac**
2. **Install dependencies**:
   ```bash
   bun install
   ```

3. **Run the macOS build script**:
   ```bash
   chmod +x build-mac.sh
   ./build-mac.sh
   ```

   Or manually:
   ```bash
   # Build CLI
   cd packages/opencode
   bun run script/build.ts --single

   # Build Desktop
   cd ../desktop
   bun run build
   bun run package:mac
   ```

4. **Output**:
   - CLI: `C:\mimocode-build\cli\mimocode-darwin-*\`
   - Desktop: `C:\mimocode-build\desktop-mac\*.dmg` and `*.zip`

## Building on Linux

To build for Linux, you need to run the build on a Linux machine:

1. **Clone the repository on Linux**
2. **Install dependencies**:
   ```bash
   bun install
   ```

3. **Run the Linux build script**:
   ```bash
   chmod +x build-linux.sh
   ./build-linux.sh
   ```

   Or manually:
   ```bash
   # Build CLI
   cd packages/opencode
   bun run script/build.ts --single

   # Build Desktop
   cd ../desktop
   bun run build
   bun run package:linux
   ```

4. **Output**:
   - CLI: `C:\mimocode-build\cli\mimocode-linux-*\`
   - Desktop: `C:\mimocode-build\desktop-linux\*.AppImage` and `*.deb`

## Cross-Compilation Limitations

**Important**: Bun cannot cross-compile for other platforms directly. This means:
- You cannot build macOS binaries on Windows
- You cannot build Linux binaries on Windows
- You must build on the target platform

## Alternative: Using CI/CD

For automated cross-platform builds, consider using GitHub Actions:

```yaml
# .github/workflows/build.yml
name: Build

on: [push, pull_request]

jobs:
  build-mac:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run build:cli:mac
      - run: bun run build:desktop:mac

  build-linux:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run build:cli:linux
      - run: bun run build:desktop:linux

  build-windows:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run build:cli:win
      - run: bun run build:desktop:win
```

## Verification

After building, verify the output:

```bash
# Check CLI binaries
ls -lh C:/mimocode-build/cli/

# Check Desktop installers
ls -lh C:/mimocode-build/desktop-mac/
ls -lh C:/mimocode-build/desktop-linux/
ls -lh C:/mimocode-build/desktop/
```

## Troubleshooting

### Build fails with "Cannot find module"
- Run `bun install` to ensure all dependencies are installed
- Clear node_modules and reinstall: `rm -rf node_modules && bun install`

### electron-builder fails
- Ensure you're running from the correct directory
- Check that the CLI binary exists in the expected location

### Cross-compilation errors
- This is expected - you must build on the target platform
- Use CI/CD or virtual machines for cross-platform builds

## Summary

| Platform | Build On | Output |
|----------|----------|--------|
| Windows  | Windows  | `.exe` installer |
| macOS    | macOS    | `.dmg` and `.zip` |
| Linux    | Linux    | `.AppImage` and `.deb` |

For each platform, you must build on that platform. The build scripts are provided for each platform.
