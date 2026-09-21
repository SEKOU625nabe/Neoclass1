#!/bin/bash

# ============================================================
# NEOCLASS MOBILE - Setup Script
# ============================================================

set -e

echo "📱 Neoclass Mobile - Setup"
echo "=========================="
echo ""

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js non installé"
    echo "Télécharger depuis: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js trouvé: $(node --version)"
echo ""

# Vérifier Android SDK
if [ -z "$ANDROID_SDK_ROOT" ] && [ -z "$ANDROID_HOME" ]; then
    echo "⚠️  SDK Android non trouvé"
    echo "Définir ANDROID_SDK_ROOT ou ANDROID_HOME"
fi

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm install

# Ajouter plateforme Android
if [ ! -d "android" ]; then
    echo "📱 Ajout de la plateforme Android..."
    npx capacitor add android
else
    echo "✅ Plateforme Android déjà présente"
fi

# Synchroniser
echo "🔄 Synchronisation..."
npx capacitor sync android

echo ""
echo "✅ Setup terminé!"
echo ""
echo "Prochaines étapes:"
echo "1. Ouvrir dans Android Studio: npx capacitor open android"
echo "2. Configurer Firebase (google-services.json)"
echo "3. Build: ./gradlew build"
echo ""
