#!/bin/bash

# ============================================================
# DEPLOYMENT CHECKLIST - ANDROID & iOS
# ============================================================
# Vérifier avant de soumettre aux stores
# ============================================================

echo "╔════════════════════════════════════════════════════════╗"
echo "║         PRE-SUBMISSION CHECKLIST v1.0.0               ║"
echo "╚════════════════════════════════════════════════════════╝"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

check_mark="${GREEN}✓${NC}"
cross="${RED}✗${NC}"

# ============================================================
# ANDROID CHECKLIST
# ============================================================

echo ""
echo "╔═ ANDROID PlayStore ═════════════════════════════════╗"

# Check APK
if [ -f "build/android/app-release.apk" ]; then
    echo -e "$check_mark APK file found"
else
    echo -e "$cross APK file NOT found"
fi

# Check AAB
if [ -f "build/android/app-release.aab" ]; then
    echo -e "$check_mark AAB file found (required for PlayStore)"
else
    echo -e "$cross AAB file NOT found"
fi

# Check icon
if [ -f "build/assets/neoclass-icon-512.png" ]; then
    echo -e "$check_mark App icon (512x512) found"
else
    echo -e "$cross App icon NOT found"
fi

# Check signing
if [ -f "android/neoclass-release-key.jks" ]; then
    echo -e "$check_mark Signing key (.jks) found"
else
    echo -e "$cross Signing key NOT found"
fi

# Check manifest
if grep -q "android:versionCode" "android/app/src/main/AndroidManifest.xml"; then
    echo -e "$check_mark AndroidManifest.xml configured"
else
    echo -e "$cross AndroidManifest.xml NOT configured"
fi

# Check permissions
if grep -q "android.permission.INTERNET" "android/app/src/main/AndroidManifest.xml"; then
    echo -e "$check_mark Permissions configured"
else
    echo -e "$cross Permissions NOT configured"
fi

# Check Firebase config
if [ -f "android/app/google-services.json" ]; then
    echo -e "$check_mark Firebase configuration found"
else
    echo -e "$cross Firebase configuration NOT found"
fi

# ============================================================
# iOS CHECKLIST
# ============================================================

echo ""
echo "╔═ iOS AppStore ════════════════════════════════════════╗"

# Check bundle ID
if grep -q "com.neoclass.mobile" "ios/App/App/Info.plist"; then
    echo -e "$check_mark Bundle ID configured"
else
    echo -e "$cross Bundle ID NOT configured"
fi

# Check Info.plist
if [ -f "ios/App/App/Info.plist" ]; then
    echo -e "$check_mark Info.plist found"
else
    echo -e "$cross Info.plist NOT found"
fi

# Check Firebase iOS config
if [ -f "ios/App/App/GoogleService-Info.plist" ]; then
    echo -e "$check_mark Firebase iOS config found"
else
    echo -e "$cross Firebase iOS config NOT found"
fi

# Check AppDelegate
if [ -f "ios/App/App/AppDelegate.swift" ]; then
    echo -e "$check_mark AppDelegate.swift found"
else
    echo -e "$cross AppDelegate.swift NOT found"
fi

# Check certificates
echo -e "$YELLOW? Verify Apple Developer Certificates (manual check)${NC}"
echo "  - Development Certificate"
echo "  - Distribution Certificate"
echo "  - Provisioning Profiles"

# ============================================================
# SHARED CHECKLIST
# ============================================================

echo ""
echo "╔═ SHARED REQUIREMENTS ══════════════════════════════════╗"

# Version info
if grep -q '"version": "1.0.0"' "package.json"; then
    echo -e "$check_mark Version 1.0.0 set"
else
    echo -e "$cross Version NOT set correctly"
fi

# App name
if grep -q '"appName": "Neoclass"' "capacitor.config.json"; then
    echo -e "$check_mark App name configured"
else
    echo -e "$cross App name NOT configured"
fi

# Firebase config
if [ -f "firebase-config-global.js" ]; then
    echo -e "$check_mark Firebase global config found"
else
    echo -e "$cross Firebase global config NOT found"
fi

# Screenshots
if ls build/assets/screenshot-*.png 1> /dev/null 2>&1; then
    count=$(ls build/assets/screenshot-*.png 2>/dev/null | wc -l)
    echo -e "$check_mark Screenshots found ($count)"
else
    echo -e "$cross Screenshots NOT found (required)"
fi

# Privacy Policy
if [ -f "docs/PRIVACY_POLICY.md" ]; then
    echo -e "$check_mark Privacy Policy found"
else
    echo -e "$cross Privacy Policy NOT found"
fi

# Terms of Service
if [ -f "docs/TERMS_OF_SERVICE.md" ]; then
    echo -e "$check_mark Terms of Service found"
else
    echo -e "$cross Terms of Service NOT found"
fi

# ============================================================
# SUBMISSION INSTRUCTIONS
# ============================================================

echo ""
echo "╔═ SUBMISSION INSTRUCTIONS ══════════════════════════════╗"
echo ""
echo "ANDROID (Google Play Store):"
echo "  1. Go to https://play.google.com/console"
echo "  2. Create new app → Neoclass"
echo "  3. Fill app details:"
echo "     - Title: Neoclass"
echo "     - Short description (80 chars max)"
echo "     - Full description (4000 chars max)"
echo "  4. Add app icon (512x512 PNG)"
echo "  5. Add 2-5 screenshots (1080x1920 PNG)"
echo "  6. Add feature graphic (1024x500 PNG)"
echo "  7. Select category: Education"
echo "  8. Fill content rating questionnaire"
echo "  9. Upload AAB file"
echo "  10. Set pricing → Free"
echo "  11. Submit for review (2-7 days)"
echo ""
echo "iOS (Apple App Store):"
echo "  1. Go to https://appstoreconnect.apple.com"
echo "  2. Create new app → Neoclass"
echo "  3. Fill app information:"
echo "     - Privacy Policy URL"
echo "     - Support URL"
echo "     - Marketing URL"
echo "  4. Add app icon (1024x1024 PNG)"
echo "  5. Add 3-5 screenshots per device (iPhone, iPad)"
echo "  6. Add preview video (optional)"
echo "  7. Select category: Education"
echo "  8. Set age rating"
echo "  9. Upload from Xcode → Archive"
echo "  10. Configure pricing → Free"
echo "  11. Submit for review (3-24 hours)"
echo ""
echo "╚════════════════════════════════════════════════════════╝"
