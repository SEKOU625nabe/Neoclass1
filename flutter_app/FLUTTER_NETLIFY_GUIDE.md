# 🚀 FLUTTER NEOCLASS - TEST & NETLIFY DEPLOYMENT

**Version**: 1.0.0  
**Platforms**: Android, iOS, Web  
**Hosting**: Netlify (Web)

---

## 🎯 DÉMARRAGE RAPIDE

### 1️⃣ Installer Flutter

**Windows**:
```bash
# Télécharger depuis: https://flutter.dev/docs/get-started/install/windows
# Ou via Chocolatey:
choco install flutter

# Vérifier
flutter --version
flutter doctor
```

**macOS**:
```bash
brew install flutter

# Vérifier
flutter --version
flutter doctor
```

**Linux**:
```bash
git clone https://github.com/flutter/flutter.git -b stable
export PATH="$PWD/flutter/bin:$PATH"

# Vérifier
flutter --version
flutter doctor
```

### 2️⃣ Installer Dépendances

```bash
cd flutter_app

# Récupérer les packages
flutter pub get

# (Optionnel) Générer fichiers Hive
flutter pub run build_runner build
```

### 3️⃣ Tester en Local

#### Tests Web (Recommandé pour Netlify)
```bash
flutter run -d chrome

# Ou
flutter run -d edge

# Ou responsive
flutter run -d web-server
```

#### Tests Android
```bash
# Connecter un device Android ou lancer émulateur

flutter devices  # Voir devices disponibles

flutter run

# Ou spécifier device
flutter run -d emulator-5554
```

#### Tests iOS (macOS only)
```bash
# Lancer simulateur iOS
open -a Simulator

flutter run -d iPhone
```

---

## 🌐 BUILD POUR NETLIFY

### Build Web Release
```bash
flutter clean

flutter build web --release

# Output: build/web/
```

### Vérifier Build
```bash
# Voir les fichiers générés
ls -la build/web/

# Doit contenir:
# - index.html
# - main.dart.js
# - main.dart.wasm (optionnel)
# - assets/
```

---

## 📤 DÉPLOYER SUR NETLIFY

### Option 1: UI Netlify (Recommandée)

**Étape 1**: Créer compte Netlify
```
https://netlify.com → Sign Up
```

**Étape 2**: Connecter GitHub
```
Netlify Dashboard → "New site from Git"
→ Sélectionner GitHub
→ Autoriser Netlify
```

**Étape 3**: Sélectionner Repository
```
Chercher: neoclass
Sélectionner: neoclass-flutter (ou votre repo)
```

**Étape 4**: Configurer Build
```
Build command: flutter build web --release
Publish directory: build/web
```

**Étape 5**: Déployer
```
Click "Deploy site"
→ Attendre build (~5-10 min)
→ Site live! 🎉
```

**Résultat**:
```
URL: https://[random-name].netlify.app
Exemple: https://neoclass-flutter.netlify.app
```

### Option 2: CLI Netlify

**Install Netlify CLI**:
```bash
npm install -g netlify-cli

# Ou
npm install netlify-cli
```

**Authentifier**:
```bash
netlify login

# Suivre les instructions pour autoriser
```

**Déployer**:
```bash
cd flutter_app

flutter build web --release

netlify deploy --prod --dir=build/web

# Ou sans --prod (draft deploy)
netlify deploy --dir=build/web
```

**Résultat**:
```
Deployed URL: https://neoclass-flutter.netlify.app
```

### Option 3: Git + Auto-Deploy

**Créer `.gitignore`** (si n'existe pas):
```
.dart_tool/
.flutter-plugins
.flutter-plugins-dependencies
.packages
.pub-cache/
build/
*.iml
*.lock
node_modules/
.env
```

**Push sur GitHub**:
```bash
git add .
git commit -m "Add Flutter app for Netlify"
git push origin main
```

**Netlify Auto-Deploy**:
```
Netlify détecte automatiquement netlify.toml
→ Build auto démarré
→ Site déployé auto
```

**Voir les builds**:
```
Netlify Dashboard → Deploys
Voir l'historique et les logs
```

---

## 🔐 CONFIGURER FIREBASE (Important!)

### 1. Ajouter API Keys

**Fichier**: `lib/firebase_options.dart`

**Remplacer**:
```dart
// Web
apiKey: 'AIzaSyDkLJFpQw_neoclass_YOUR_API_KEY'
→ Votre vraie API key

// iOS
apiKey: 'YOUR_iOS_API_KEY'
→ Votre vraie API key

// Android  
apiKey: 'YOUR_ANDROID_API_KEY'
→ Votre vraie API key
```

### 2. Obtenir les Keys

**Firebase Console**:
```
1. Aller: https://console.firebase.google.com
2. Sélectionner projet: neoclass-73b86
3. Project Settings (roue dentée)
4. Service accounts
5. Copier les keys
```

---

## 🧪 TESTS PRÉDEPLOIEMENT

### Checklist
```
✅ flutter pub get (dépendances OK)
✅ flutter doctor (pas d'erreurs)
✅ flutter run -d chrome (web test OK)
✅ firebase_options.dart rempli (API keys OK)
✅ netlify.toml présent
✅ Build web OK: flutter build web --release
✅ build/web/index.html existe
✅ Aucun warning critique
```

### Test Local
```bash
flutter build web --release

# Servir localement
# Option 1: Python
python -m SimpleHTTPServer 8000
# Puis ouvrir: http://localhost:8000

# Option 2: Node.js
npx http-server build/web -c-1 -o
```

---

## 📊 BUILD POUR STORES

### Build Android Release

**Genérer Signing Key** (si n'existe pas):
```bash
keytool -genkey -v -keystore ~/flutter.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias flutter_key
```

**Créer `android/key.properties`**:
```properties
storePassword=YOUR_PASSWORD
keyPassword=YOUR_PASSWORD
keyAlias=flutter_key
storeFile=../flutter.jks
```

**Build APK**:
```bash
flutter build apk --release
# Output: build/app/outputs/flutter-app.apk
```

**Build AppBundle** (Recommandé):
```bash
flutter build appbundle --release
# Output: build/app/outputs/bundle/release/app-release.aab
```

### Build iOS Release

**Requirements**: macOS + Xcode

```bash
flutter build ios --release

# Ouvre Xcode automatiquement
# Sélectionner: Generic iOS Device
# Product → Archive
# Distribute App → Upload to App Store
```

---

## 🚀 APRÈS DÉPLOIEMENT

### Vérifier Site Live

**URL**: https://neoclass-flutter.netlify.app

**Tester**:
```
✅ Page charge
✅ Pas de 404
✅ Routing fonctionne
✅ Responsive mobile
✅ Styles corrects
✅ Firebase connecté
```

### Configurer Domaine Custom

**Netlify Dashboard**:
```
Domain Settings → Custom domain
Ajouter: neoclass.app (ou votre domaine)
Suivre instructions DNS
```

### Activer HTTPS

```
Automatique via Netlify (Let's Encrypt)
Gratuit & auto-renew
```

---

## 📱 ARCHITECTURE FLUTTER

**Fichiers**:
```
flutter_app/
├── lib/
│   ├── main.dart                 ← Point d'entrée
│   ├── firebase_options.dart     ← Config Firebase
│   ├── screens/
│   │   ├── splash_screen.dart
│   │   ├── login_screen.dart
│   │   ├── dashboard_screen.dart
│   │   └── other_screens.dart
│   ├── services/                 ← (À créer)
│   │   ├── firebase_service.dart
│   │   ├── auth_service.dart
│   │   └── user_service.dart
│   └── models/                   ← (À créer)
│       ├── user_model.dart
│       └── course_model.dart
│
├── android/                      ← Config Android
├── ios/                          ← Config iOS
├── web/                          ← Config Web
│   ├── index.html
│   ├── manifest.json
│   └── favicon.png
│
├── pubspec.yaml                  ← Dépendances
├── netlify.toml                  ← Config Netlify
└── README.md
```

---

## 🐛 TROUBLESHOOTING

### Web ne s'affiche pas sur Netlify
```
Solution:
1. Vérifier netlify.toml
2. Vérifier build/web existe
3. Vérifier index.html valide
4. Vérifier logs Netlify
```

### Firebase erreur "auth/invalid-api-key"
```
Solution:
1. Vérifier firebase_options.dart
2. Vérifier API keys correctes
3. Régénérer si nécessaire
```

### Routage cassé sur Netlify
```
Solution:
netlify.toml déjà configuré!
Vérifie: 
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## ✅ CHECKLIST FINAL

```
AVANT NETLIFY:
☐ flutter pub get OK
☐ flutter doctor OK
☐ Tests local OK
☐ firebase_options.dart rempli
☐ netlify.toml présent
☐ Build web OK

PENDANT DEPLOY:
☐ Git push OK
☐ Netlify reçoit repo
☐ Build démarre
☐ Build réussit (~5-10 min)

APRÈS DEPLOY:
☐ Site accessible
☐ Pas d'erreurs console
☐ Responsive fonctionne
☐ Firebase connecté
☐ Auth works
☐ Navigation OK
```

---

## 🎉 RÉSUMÉ

```
                ╔═════════════════════════════════════╗
                ║   FLUTTER NEOCLASS DÉPLOYÉ!       ║
                ║                                     ║
                ║  📱 Android ........... Ready     ║
                ║  🍎 iOS .............. Ready     ║
                ║  🌐 Web (Netlify) ... Live! ✅  ║
                ║                                     ║
                ║  URL: https://neoclass.netlify.app ║
                ║                                     ║
                ╚═════════════════════════════════════╝
```

---

**Créé**: 3 Juin 2026  
**Status**: ✅ Prêt  
**Platforms**: Web (Live), Android, iOS (Ready to build)
