#!/bin/bash

# ============================================================
# NEOCLASS MOBILE - Build Script pour Play Store
# ============================================================

set -e

echo "🚀 Neoclass Mobile - Build Script"
echo "=================================="
echo ""

# Vérifications
if [ ! -f "android/app/google-services.json" ]; then
    echo "❌ Erreur: google-services.json non trouvé"
    echo "Placez google-services.json dans android/app/"
    exit 1
fi

if [ ! -f "android/app/neoclass-key.jks" ]; then
    echo "⚠️  Attention: neoclass-key.jks non trouvé"
    echo "La clé de signature est nécessaire pour Play Store"
    exit 1
fi

echo "✅ Vérifications réussies"
echo ""

# Build
echo "🔨 Construction du bundle release..."
cd android
./gradlew clean
./gradlew bundleRelease

cd ..

AAB_PATH="android/app/build/outputs/bundle/release/app-release.aab"

if [ -f "$AAB_PATH" ]; then
    echo ""
    echo "✅ Build réussi!"
    echo "📦 Fichier: $AAB_PATH"
    echo ""
    echo "Prochaines étapes:"
    echo "1. Aller sur Google Play Console"
    echo "2. Créer une nouvelle version"
    echo "3. Charger le fichier AAB"
    echo "4. Remplir les notes de version"
    echo "5. Soumettre pour review"
else
    echo ""
    echo "❌ Build échoué"
    exit 1
fi
