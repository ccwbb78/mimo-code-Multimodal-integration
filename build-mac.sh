#!/bin/bash
# Build script for macOS - run this on a Mac
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=========================================="
echo "Building MiMo-Code for macOS"
echo "=========================================="

# Build CLI for macOS
echo "[1/3] Building CLI binaries for macOS..."
cd packages/opencode
bun run script/build.ts --single
cd ../..

# Copy CLI to output
mkdir -p /c/mimocode-build/cli
cp -r packages/opencode/dist/mimocode-darwin-* /c/mimocode-build/cli/

# Build desktop app
echo "[2/3] Building desktop app..."
cd packages/desktop
bun run build

# Package for macOS
echo "[3/3] Packaging desktop app for macOS..."
bun run package:mac

# Copy to output
mkdir -p /c/mimocode-build/desktop-mac
cp -r C:/mimocode-build/desktop/*.dmg /c/mimocode-build/desktop-mac/ 2>/dev/null || true
cp -r C:/mimocode-build/desktop/*.zip /c/mimocode-build/desktop-mac/ 2>/dev/null || true

cd ..

echo ""
echo "=========================================="
echo "Build completed!"
echo "=========================================="
echo ""
echo "Output locations:"
echo "  CLI: /c/mimocode-build/cli/"
echo "  Desktop: /c/mimocode-build/desktop-mac/"
echo ""
