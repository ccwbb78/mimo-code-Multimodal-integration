#!/bin/bash
# Build script for Linux - run this on Linux
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=========================================="
echo "Building MiMo-Code for Linux"
echo "=========================================="

# Build CLI for Linux
echo "[1/3] Building CLI binaries for Linux..."
cd packages/opencode
bun run script/build.ts --single
cd ../..

# Copy CLI to output
mkdir -p /c/mimocode-build/cli
cp -r packages/opencode/dist/mimocode-linux-* /c/mimocode-build/cli/

# Build desktop app
echo "[2/3] Building desktop app..."
cd packages/desktop
bun run build

# Package for Linux
echo "[3/3] Packaging desktop app for Linux..."
bun run package:linux

# Copy to output
mkdir -p /c/mimocode-build/desktop-linux
cp -r C:/mimocode-build/desktop/*.AppImage /c/mimocode-build/desktop-linux/ 2>/dev/null || true
cp -r C:/mimocode-build/desktop/*.deb /c/mimocode-build/desktop-linux/ 2>/dev/null || true

cd ..

echo ""
echo "=========================================="
echo "Build completed!"
echo "=========================================="
echo ""
echo "Output locations:"
echo "  CLI: /c/mimocode-build/cli/"
echo "  Desktop: /c/mimocode-build/desktop-linux/"
echo ""
