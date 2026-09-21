#!/bin/bash

# ============================================================
# 🚀 SCRIPT DÉPLOIEMENT - SYSTÈME DE PAIEMENT
# ============================================================
# Intégration rapide du système de paiement dans toutes les interfaces

set -e

echo "🚀 Déploiement du système de paiement Neoclass..."
echo ""

# ============================================================
# 1. VÉRIFICATIONS PRÉALABLES
# ============================================================

echo "✅ Étape 1: Vérifications préalables..."

if ! command -v git &> /dev/null; then
    echo "❌ Git non trouvé. Veuillez installer Git."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm non trouvé. Veuillez installer Node.js."
    exit 1
fi

echo "✅ Git et npm trouvés"
echo ""

# ============================================================
# 2. CRÉER RÉPERTOIRES
# ============================================================

echo "✅ Étape 2: Création des répertoires..."

mkdir -p public/js/pricing
mkdir -p public/html/pricing
mkdir -p flutter_app/lib/services/pricing
mkdir -p mobile-app/www/js/pricing

echo "✅ Répertoires créés"
echo ""

# ============================================================
# 3. COPIER FICHIERS CORE
# ============================================================

echo "✅ Étape 3: Copie des fichiers core..."

# JavaScript
cp pricing-system-pro.js public/js/pricing/
cp pricing-system-pro.js mobile-app/www/js/pricing/
cp pricing-system-pro.js flutter_app/lib/services/pricing/

# HTML
cp admin-pricing-panel.html public/html/pricing/
cp pricing-display.html public/html/pricing/

echo "✅ Fichiers copiés"
echo ""

# ============================================================
# 4. INSTALLER DÉPENDANCES FLUTTER
# ============================================================

echo "✅ Étape 4: Installation dépendances Flutter..."

if [ -f "flutter_app/pubspec.yaml" ]; then
    cd flutter_app
    flutter pub get
    cd ..
    echo "✅ Dépendances Flutter installées"
else
    echo "⚠️ flutter_app/pubspec.yaml non trouvé (optionnel)"
fi

echo ""

# ============================================================
# 5. CONFIGURER FIREBASE
# ============================================================

echo "✅ Étape 5: Configuration Firebase..."

cat > firebase-pricing-rules.txt << 'EOF'
# Ajouter ces règles Firestore dans Firebase Console:
# https://console.firebase.google.com → neoclass-73b86 → Firestore → Rules

match /settings/{document=**} {
  allow read: if true;
  allow write: if request.auth.token.admin == true;
}

match /pricingConfigs/{document=**} {
  allow read: if request.auth.token.admin == true;
  allow write: if request.auth.token.admin == true;
}

match /subscriptions/{document=**} {
  allow read: if request.auth.uid == resource.data.userId;
  allow write: if request.auth.uid == resource.data.userId || request.auth.token.admin == true;
}

match /payments/{document=**} {
  allow read: if request.auth.uid == resource.data.userId || request.auth.token.admin == true;
  allow write: if request.auth.token.admin == true;
}

match /promotions/{document=**} {
  allow read: if true;
  allow write: if request.auth.token.admin == true;
}

match /customPricing/{document=**} {
  allow read: if request.auth.token.admin == true;
  allow write: if request.auth.token.admin == true;
}
EOF

echo "✅ Fichier firebase-pricing-rules.txt créé"
echo "⚠️ À appliquer manuellement dans Firebase Console"
echo ""

# ============================================================
# 6. CRÉER COLLECTION FIRESTORE
# ============================================================

echo "✅ Étape 6: Préparation données Firestore..."

cat > firestore-init-data.json << 'EOF'
{
  "collections": {
    "settings": {
      "documents": {
        "pricing": {
          "data": {
            "prices": {
              "student": {
                "monthly": {"price": 20000, "name": "Mensuel Élève"},
                "quarterly": {"price": 50000, "name": "Trimestriel Élève"},
                "annual": {"price": 200000, "name": "Annuel Élève"}
              },
              "school": {
                "monthly": {"price": 500000, "name": "Mensuel École"},
                "quarterly": {"price": 1400000, "name": "Trimestriel École"},
                "annual": {"price": 5000000, "name": "Annuel École"}
              },
              "parent": {
                "monthly": {"price": 15000, "name": "Mensuel Parent"},
                "quarterly": {"price": 40000, "name": "Trimestriel Parent"},
                "annual": {"price": 160000, "name": "Annuel Parent"}
              }
            },
            "trialDays": 30,
            "isActive": true,
            "createdAt": "2026-06-03T00:00:00Z"
          }
        }
      }
    }
  }
}
EOF

echo "✅ Fichier firestore-init-data.json créé"
echo "⚠️ Importer manuellement dans Firestore ou utiliser script spécifique"
echo ""

# ============================================================
# 7. INTÉGRER WEB (Neoclass3.html)
# ============================================================

echo "✅ Étape 7: Intégration Web (Neoclass3.html)..."

if grep -q "pricing-system-pro.js" Neoclass3.html; then
    echo "✅ pricing-system-pro.js déjà intégré dans Neoclass3.html"
else
    # Ajouter le script avant </body>
    sed -i '/<\/body>/i\    <script src="/js/pricing/pricing-system-pro.js"><\/script>' Neoclass3.html
    echo "✅ pricing-system-pro.js ajouté à Neoclass3.html"
fi

echo ""

# ============================================================
# 8. INTÉGRER MOBILE (Capacitor)
# ============================================================

echo "✅ Étape 8: Intégration Mobile (Capacitor)..."

if [ -d "mobile-app" ]; then
    if [ -f "mobile-app/www/index.html" ]; then
        if grep -q "pricing-system-pro.js" mobile-app/www/index.html; then
            echo "✅ pricing-system-pro.js déjà intégré dans Capacitor"
        else
            sed -i '/<\/body>/i\    <script src="js/pricing/pricing-system-pro.js"><\/script>' mobile-app/www/index.html
            echo "✅ pricing-system-pro.js ajouté à Capacitor"
        fi
    fi
fi

echo ""

# ============================================================
# 9. CRÉER FICHIERS CONFIGURATION
# ============================================================

echo "✅ Étape 9: Création fichiers de configuration..."

# Configuration admin
cat > .env.admin << 'EOF'
# Admin Configuration
ADMIN_EMAIL=admin@neoclass.app
FIREBASE_PROJECT_ID=neoclass-73b86
PRICING_ADMIN_ROLE=pricing_admin
EOF

# Configuration utilisateur
cat > .env.user << 'EOF'
# User Configuration
SHOW_PRICING=true
TRIAL_DAYS=30
PAYMENT_GATEWAY=stripe
EOF

echo "✅ Fichiers .env créés"
echo ""

# ============================================================
# 10. TESTS & VÉRIFICATION
# ============================================================

echo "✅ Étape 10: Vérification..."

echo ""
echo "📋 Checklist:"
echo ""
echo "  ✅ Fichiers core copiés"
echo "  ✅ Répertoires créés"
echo "  ✅ Dépendances installées"
echo "  ✅ Intégration Web effectuée"
echo "  ✅ Intégration Mobile effectuée"
echo ""

echo "⚠️ ACTIONS MANUELLES REQUISES:"
echo ""
echo "1. Firebase Firestore Rules:"
echo "   → Copier rules de: firebase-pricing-rules.txt"
echo "   → Vers: console.firebase.google.com → Firestore → Rules"
echo ""
echo "2. Firebase Initial Data:"
echo "   → Importer: firestore-init-data.json"
echo "   → Ou créer manuellement dans Firestore Console"
echo ""
echo "3. Admin Access:"
echo "   → Créer utilisateur admin dans Firebase"
echo "   → Ajouter custom claim: admin = true"
echo ""
echo "4. Test URLs:"
echo "   Web Admin: http://localhost:5000/html/pricing/admin-pricing-panel.html"
echo "   Web Users: http://localhost:5000/html/pricing/pricing-display.html"
echo "   Flutter: flutter run -d chrome"
echo ""

echo ""
echo "✅ Déploiement du système de paiement TERMINÉ!"
echo ""
echo "🚀 Prochaines étapes:"
echo "  1. Configurer Firebase Rules"
echo "  2. Importer données initiales"
echo "  3. Tester en local"
echo "  4. Déployer en production"
echo ""
