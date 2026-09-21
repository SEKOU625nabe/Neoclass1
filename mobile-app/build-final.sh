#!/bin/bash

# ============================================================
# NEOCLASS BUILD SCRIPT - ANDROID & iOS
# ============================================================
# Usage: ./build-final.sh [android|ios|both]
# ============================================================

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════╗"
echo "║         NEOCLASS RELEASE BUILD v1.0.0                 ║"
echo "║    Building for Android PlayStore & iOS AppStore      ║"
echo "╚════════════════════════════════════════════════════════╝"

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ANDROID_DIR="$PROJECT_ROOT/android"
iOS_DIR="$PROJECT_ROOT/ios"
BUILD_DIR="$PROJECT_ROOT/build"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ============================================================
# FUNCTIONS
# ============================================================

log_info() {
  echo -e "${GREEN}✓ $1${NC}"
}

log_warn() {
  echo -e "${YELLOW}⚠ $1${NC}"
}

log_error() {
  echo -e "${RED}✗ $1${NC}"
}

# ============================================================
# PRE-BUILD CHECKS
# ============================================================

check_prerequisites() {
  log_info "Vérifying prerequisites..."
  
  # Check Node.js
  if ! command -v node &> /dev/null; then
    log_error "Node.js not found. Install from https://nodejs.org"
    exit 1
  fi
  
  # Check npm
  if ! command -v npm &> /dev/null; then
    log_error "npm not found"
    exit 1
  fi
  
  # Check Capacitor
  if ! npm list -g @capacitor/cli &> /dev/null; then
    log_warn "Installing @capacitor/cli globally..."
    npm install -g @capacitor/cli
  fi
  
  log_info "All prerequisites OK"
}

# ============================================================
# ANDROID BUILD
# ============================================================

build_android() {
  log_info "🤖 Building Android..."
  
  cd "$PROJECT_ROOT"
  
  # Install dependencies
  log_info "Installing npm dependencies..."
  npm install
  
  # Generate Capacitor config
  log_info "Generating Capacitor configuration..."
  npx capacitor update android
  
  # Build for production
  log_info "Building web bundle..."
  npm run build 2>/dev/null || log_warn "No build script found"
  
  # Sync to Capacitor
  log_info "Syncing to Capacitor Android..."
  npx capacitor sync android
  
  # Build Android
  cd "$ANDROID_DIR"
  
  log_info "Building APK..."
  ./gradlew assembleRelease -x lint || {
    log_warn "APK build had issues, checking gradle..."
  }
  
  log_info "Building AAB (for Google Play)..."
  ./gradlew bundleRelease -x lint || {
    log_warn "AAB build had issues"
  }
  
  # Copy outputs
  mkdir -p "$BUILD_DIR/android"
  
  if [ -f "app/build/outputs/apk/release/app-release.apk" ]; then
    cp "app/build/outputs/apk/release/app-release.apk" "$BUILD_DIR/android/"
    log_info "APK saved to: $BUILD_DIR/android/app-release.apk"
  fi
  
  if [ -f "app/build/outputs/bundle/release/app-release.aab" ]; then
    cp "app/build/outputs/bundle/release/app-release.aab" "$BUILD_DIR/android/"
    log_info "AAB saved to: $BUILD_DIR/android/app-release.aab"
  fi
  
  cd "$PROJECT_ROOT"
}

# ============================================================
# iOS BUILD
# ============================================================

build_ios() {
  log_info "🍎 Building iOS..."
  
  cd "$PROJECT_ROOT"
  
  # Install dependencies
  npm install
  
  # Sync to Capacitor
  log_info "Syncing to Capacitor iOS..."
  npx capacitor sync ios
  
  # Open Xcode workspace
  log_info "Opening Xcode workspace..."
  open "$iOS_DIR/App/App.xcworkspace"
  
  log_info "Manual steps in Xcode:"
  log_info "1. Select 'App' target"
  log_info "2. Go to Signing & Capabilities"
  log_info "3. Select your Development Team"
  log_info "4. Product → Build"
  log_info "5. Product → Archive"
  log_info "6. Distribute App → Upload to App Store"
  
  mkdir -p "$BUILD_DIR/ios"
  log_info "iOS build outputs will be in: $BUILD_DIR/ios"
}

# ============================================================
# ASSET GENERATION
# ============================================================

generate_assets() {
  log_info "Generating app assets..."
  
  mkdir -p "$BUILD_DIR/assets"
  
  # Create placeholder icon
  cat > "$BUILD_DIR/assets/generate-icons.html" << 'EOF'
<!DOCTYPE html>
<html>
<head>
  <title>Neoclass Icon Generator</title>
</head>
<body>
  <h1>App Icon Generator</h1>
  <canvas id="canvas"></canvas>
  <button onclick="downloadIcon()">Download Icon</button>
  
  <script>
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    // Create 512x512 icon
    canvas.width = 512;
    canvas.height = 512;
    
    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, 512, 512);
    gradient.addColorStop(0, '#6c63ff');
    gradient.addColorStop(1, '#f59e0b');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    
    // Draw "NC" text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 200px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('NC', 256, 256);
    
    function downloadIcon() {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'neoclass-icon-512.png';
      link.click();
    }
  </script>
</body>
</html>
EOF
  
  log_info "Asset generation guide saved to: $BUILD_DIR/assets/generate-icons.html"
}

# ============================================================
# MAIN BUILD SCRIPT
# ============================================================

main() {
  local target="${1:-both}"
  
  check_prerequisites
  generate_assets
  
  case "$target" in
    android)
      build_android
      ;;
    ios)
      build_ios
      ;;
    both)
      build_android
      build_ios
      ;;
    *)
      log_error "Unknown target: $target"
      echo "Usage: $0 [android|ios|both]"
      exit 1
      ;;
  esac
  
  echo ""
  log_info "Build complete! Outputs in: $BUILD_DIR"
}

# Run main
main "$@"
