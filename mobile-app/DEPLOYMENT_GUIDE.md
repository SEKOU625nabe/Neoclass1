# 📱 NEOCLASS MOBILE - Guide d'Installation et Déploiement

## 🚀 Démarrage rapide

### Prérequis
- Node.js 16+ et npm
- Android Studio
- JDK 11+
- Git

### 1. Installation locale

```bash
# Cloner et accéder au dossier
cd mobile-app

# Installer les dépendances
npm install

# Ajouter la plateforme Android
npx capacitor add android

# Synchroniser les fichiers
npx capacitor sync android
```

### 2. Ouvrir dans Android Studio

```bash
npx capacitor open android
```

### 3. Configuration Firebase

Avant de compiler:

1. Aller dans [Firebase Console](https://console.firebase.google.com)
2. Créer un projet ou utiliser l'existant
3. Télécharger `google-services.json`
4. Placer dans: `android/app/google-services.json`
5. Mettre à jour les clés dans [www/app.js](www/app.js)

### 4. Compiler et tester

#### Sur un appareil physique:
```bash
# Build release
./gradlew build

# Ou depuis Android Studio
# Build > Build Bundle(s) / APK(s)
```

#### Sur un émulateur:
```bash
./gradlew installDebug
```

---

## 🏪 Déploiement sur Google Play Store

### Étape 1: Préparer le keystore

```bash
# Générer une clé de signature
keytool -genkey -v -keystore neoclass-key.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias neoclass-key
```

Répondre aux questions pour créer la clé.

### Étape 2: Configurer le signing dans build.gradle

Ajouter dans `android/app/build.gradle`:

```gradle
android {
    signingConfigs {
        release {
            storeFile file('neoclass-key.jks')
            storePassword 'YOUR_STORE_PASSWORD'
            keyAlias 'neoclass-key'
            keyPassword 'YOUR_KEY_PASSWORD'
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Étape 3: Créer l'AAB (Android App Bundle)

```bash
cd android
./gradlew bundleRelease
```

Le fichier se trouvera dans:
`android/app/build/outputs/bundle/release/app-release.aab`

### Étape 4: Créer un compte Google Play Developer

1. Aller à [Google Play Console](https://play.google.com/console)
2. Payer les frais (25$)
3. Remplir le profil de développeur

### Étape 5: Préparer le listing

Dans Google Play Console:

#### A. Informations de base
- **Nom**: Neoclass
- **Description courte**: Plateforme éducative complète
- **Description complète**: 
  ```
  Neoclass est la plateforme éducative la plus complète en Afrique de l'Ouest.
  
  ✨ Fonctionnalités:
  - 📚 Cours interactifs pour élèves
  - 👨‍🏫 Outils pour professeurs
  - 🏫 Gestion d'école complète
  - 💰 Système financier intégré
  - 🤖 Assistant IA (DARX)
  - 🏆 Gamification et récompenses
  - 📊 Analytics en temps réel
  - 💬 Communication intégrée
  
  Gratuit et accessible à tous!
  ```

#### B. Icône
- Créer une icône 512x512 PNG (format PNG, pas plus de 1 MB)
- Placer dans `assets/icon-512.png`

#### C. Images (minimum 2, maximum 8)
- Format: PNG ou JPEG
- Taille: 1080x1920 ou 9:16
- Créer des captures d'écran de:
  - Écran de login
  - Dashboard
  - Cours
  - Quiz
  - Finances (pour directeurs)

#### D. Catégorie
- Sélectionner: **Enseignement**

#### E. Rating (PEGI)
- Cocher les cases appropriées

#### F. Politique de confidentialité
- Ajouter: `https://neoclass.com/privacy`

#### G. Permissions
- Vérifier que les permissions demandées correspondent au manifest

### Étape 6: Soumettre

1. Aller dans **Applications > Neoclass > Canaux de publication**
2. Cliquer sur **Créer une version** dans le canal **Production**
3. Charger le fichier AAB généré
4. Remplir les notes de version
5. Vérifier toutes les exigences
6. **Soumettre l'examen**

### Délai d'approbation
- Généralement 24-72 heures
- Peut être plus long si modifications demandées

---

## 📋 Checklist avant soumission

- [ ] Firebase config correct (google-services.json)
- [ ] Version code incrémentée (versionCode)
- [ ] Icônes et images préparées
- [ ] Politique de confidentialité en ligne
- [ ] Description complète avec fonctionnalités
- [ ] Test sur appareil physique
- [ ] Vérifier permissions dans manifest
- [ ] URL de support configurée
- [ ] Email de contact valide

---

## 🔧 Build personnalisé sans Android Studio

```bash
# Build APK (pour test)
cd android
./gradlew assembleDebug
# Fichier: android/app/build/outputs/apk/debug/app-debug.apk

# Build AAB (pour Play Store)
cd android
./gradlew bundleRelease
# Fichier: android/app/build/outputs/bundle/release/app-release.aab
```

---

## 🐛 Troubleshooting

### "SDK not found"
```bash
export ANDROID_SDK_ROOT=/path/to/android-sdk
```

### "Gradle build failed"
```bash
cd android
./gradlew clean
./gradlew build
```

### Firebase auth ne fonctionne pas
- Vérifier les clés de configuration dans `www/app.js`
- Vérifier google-services.json est présent
- Vérifier les SHA-1 fingerprint dans Firebase Console

### App crash au démarrage
- Vérifier les logs: `adb logcat`
- Vérifier les permissions dans manifest
- Vérifier internet permission est présente

---

## 📞 Support

Pour questions ou problèmes:
- Documentation: https://capacitorjs.com
- Firebase: https://firebase.google.com/docs
- Android: https://developer.android.com

---

**Version**: 1.0.0  
**Dernière mise à jour**: Mai 2026  
**Auteur**: Neoclass Team
