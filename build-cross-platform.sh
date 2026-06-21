#!/bin/bash
set -e

# Cross-platform build script for MiMo-Code
# Builds CLI binaries and Desktop installers for macOS and Linux
# Output directory: C:\mimocode-build (Windows) or /c/mimocode-build (Git Bash)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Output directory - use C:\mimocode-build
OUTPUT_DIR="/c/mimocode-build"
mkdir -p "$OUTPUT_DIR/cli" "$OUTPUT_DIR/desktop-mac" "$OUTPUT_DIR/desktop-linux"

echo "=========================================="
echo "MiMo-Code Cross-Platform Build Script"
echo "=========================================="
echo "Output directory: $OUTPUT_DIR"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    if ! command -v bun &> /dev/null; then
        log_error "bun is not installed. Please install bun first."
        exit 1
    fi

    if ! command -v node &> /dev/null; then
        log_error "node is not installed. Please install node first."
        exit 1
    fi

    log_info "Prerequisites check passed."
}

# Build CLI binaries for specific platforms
build_cli_binaries() {
    local platform=$1
    local arch=$2

    log_info "Building CLI binary for ${platform}-${arch}..."

    cd "$SCRIPT_DIR/packages/opencode"

    # Run the build script with target platform
    TARGET_OS="$platform" TARGET_ARCH="$arch" bun run script/build.ts

    # Copy build output to output directory
    if [ "$platform" = "darwin" ]; then
        cp -r dist/mimocode-darwin-* "$OUTPUT_DIR/cli/"
    elif [ "$platform" = "linux" ]; then
        cp -r dist/mimocode-linux-* "$OUTPUT_DIR/cli/"
    fi

    cd "$SCRIPT_DIR"
    log_info "CLI binary build completed for ${platform}-${arch}"
}

# Build desktop app
build_desktop() {
    local platform=$1

    log_info "Building desktop app for ${platform}..."

    cd "$SCRIPT_DIR/packages/desktop"

    # Build the renderer and main process
    bun run build

    # Package for the target platform
    case "$platform" in
        "mac"|"darwin")
            bun run package:mac
            # Copy to output directory
            cp -r C:/mimocode-build/desktop/*.dmg "$OUTPUT_DIR/desktop-mac/" 2>/dev/null || true
            cp -r C:/mimocode-build/desktop/*.zip "$OUTPUT_DIR/desktop-mac/" 2>/dev/null || true
            ;;
        "linux")
            bun run package:linux
            # Copy to output directory
            cp -r C:/mimocode-build/desktop/*.AppImage "$OUTPUT_DIR/desktop-linux/" 2>/dev/null || true
            cp -r C:/mimocode-build/desktop/*.deb "$OUTPUT_DIR/desktop-linux/" 2>/dev/null || true
            ;;
        *)
            log_error "Unsupported platform: $platform"
            exit 1
            ;;
    esac

    cd "$SCRIPT_DIR"
    log_info "Desktop build completed for ${platform}"
}

# Main build process
main() {
    check_prerequisites

    echo ""
    log_info "Starting cross-platform build process..."
    echo ""

    # Step 1: Build CLI binaries for macOS
    log_info "=== Step 1: Building CLI binaries for macOS ==="
    build_cli_binaries "darwin" "all"

    # Step 2: Build CLI binaries for Linux
    log_info "=== Step 2: Building CLI binaries for Linux ==="
    build_cli_binaries "linux" "all"

    # Step 3: Build Desktop app for macOS
    log_info "=== Step 3: Building Desktop app for macOS ==="
    build_desktop "mac"

    # Step 4: Build Desktop app for Linux
    log_info "=== Step 4: Building Desktop app for Linux ==="
    build_desktop "linux"

    echo ""
    log_info "=========================================="
    log_info "Build process completed!"
    log_info "=========================================="
    echo ""
    log_info "Output locations:"
    log_info "  CLI binaries: $OUTPUT_DIR/cli/"
    log_info "  macOS Desktop: $OUTPUT_DIR/desktop-mac/"
    log_info "  Linux Desktop: $OUTPUT_DIR/desktop-linux/"
    echo ""
}

# Run main function
main "$@"
