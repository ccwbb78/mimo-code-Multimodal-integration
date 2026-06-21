#!/bin/bash
set -e

# Build verification script for MiMo-Code
# Checks if all expected build artifacts exist

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=========================================="
echo "MiMo-Code Build Verification"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

# Check CLI binaries
check_cli_binaries() {
    echo "Checking CLI binaries..."
    echo ""

    local platforms=("darwin-arm64" "darwin-x64" "linux-arm64" "linux-x64")
    local found=0
    local missing=0

    for platform in "${platforms[@]}"; do
        local bin_path="packages/opencode/dist/mimocode-${platform}/bin/mimo"
        if [ -f "$bin_path" ]; then
            log_info "Found CLI binary: $platform"
            ((found++))
        else
            log_warn "Missing CLI binary: $platform"
            ((missing++))
        fi
    done

    echo ""
    echo "CLI Binaries Summary:"
    echo "  Found: $found"
    echo "  Missing: $missing"
    echo ""
}

# Check desktop installers
check_desktop_installers() {
    echo "Checking desktop installers..."
    echo ""

    # Check macOS installers
    local mac_dmg=$(find packages/desktop/release -name "*.dmg" 2>/dev/null | head -1)
    local mac_zip=$(find packages/desktop/release -name "*.zip" 2>/dev/null | head -1)

    if [ -n "$mac_dmg" ]; then
        log_info "Found macOS DMG: $(basename "$mac_dmg")"
    else
        log_warn "No macOS DMG found"
    fi

    if [ -n "$mac_zip" ]; then
        log_info "Found macOS ZIP: $(basename "$mac_zip")"
    else
        log_warn "No macOS ZIP found"
    fi

    # Check Linux installers
    local linux_appimage=$(find packages/desktop/release -name "*.AppImage" 2>/dev/null | head -1)
    local linux_deb=$(find packages/desktop/release -name "*.deb" 2>/dev/null | head -1)

    if [ -n "$linux_appimage" ]; then
        log_info "Found Linux AppImage: $(basename "$linux_appimage")"
    else
        log_warn "No Linux AppImage found"
    fi

    if [ -n "$linux_deb" ]; then
        log_info "Found Linux DEB: $(basename "$linux_deb")"
    else
        log_warn "No Linux DEB found"
    fi

    echo ""
}

# Check file sizes
check_file_sizes() {
    echo "Checking file sizes..."
    echo ""

    # Check CLI binaries
    for platform in darwin-arm64 darwin-x64 linux-arm64 linux-x64; do
        local bin_path="packages/opencode/dist/mimocode-${platform}/bin/mimo"
        if [ -f "$bin_path" ]; then
            local size=$(du -h "$bin_path" | cut -f1)
            log_info "CLI binary $platform: $size"
        fi
    done

    # Check desktop installers
    for file in packages/desktop/release/*.dmg packages/desktop/release/*.zip packages/desktop/release/*.AppImage packages/desktop/release/*.deb; do
        if [ -f "$file" ]; then
            local size=$(du -h "$file" | cut -f1)
            log_info "$(basename "$file"): $size"
        fi
    done

    echo ""
}

# Main verification
main() {
    check_cli_binaries
    check_desktop_installers
    check_file_sizes

    echo "=========================================="
    echo "Verification completed!"
    echo "=========================================="
    echo ""
}

# Run main function
main "$@"
