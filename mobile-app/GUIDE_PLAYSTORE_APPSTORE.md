# 📱 Guide de Publication sur PlayStore & AppStore

## ✅ PRÉ-REQUIS

### 1. **COMPTES DÉVELOPPEUR**

**Google Play Store:**
- Compte Google
- Frais: $25 USD (une fois)
- Accès: https://play.google.com/console/u/0/signup

**Apple AppStore:**
- Compte Apple Developer
- Frais: $99 USD/an
- Accès: https://developer.apple.com/app-store/register/

### 2. **SETUP LOCAL**

```bash
# Installation des outils
npm install -g cordova @capacitor/cli

# Dans le projet
npm install

# Générer les certificats/clés
cordova cert info
```

---

## 🔧 CONFIGURATION

### 1. **capacitor.config.json**

```json
{
  "appId": "com.neoclass.mobile",
  "appName": "Neoclass",
  "webDir": "www",
  "bundledWebRuntime": false,
  "server": {
    "androidScheme": "https"
  },
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 0,
      "showSpinner": false
    }
  }
}
```

### 2. **AndroidManifest.xml**

Location: `android/app/src/main/AndroidManifest.xml`

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

### 3. **Info.plist (iOS)**

Location: `ios/App/App/Info.plist`

```xml
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsArbitraryLoads</key>
  <true/>
  <key>NSExceptionDomains</key>
  <dict>
    <key>neoclass-73b86.firebaseapp.com</key>
    <dict>
      <key>NSIncludesSubdomains</key>
      <true/>
      <key>NSTemporaryExceptionAllowsInsecureHTTPLoads</key>
      <true/>
    </dict>
  </dict>
</dict>
```

---

## 📦 BUILD & PUBLICATION

### **ANDROID (PlayStore)**

#### 1. Générer la clé de signature

```bash
keytool -genkey -v -keystore neoclass-release-key.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias neoclass-key
```

#### 2. Configurer le build

```bash
# Dans android/app/build.gradle

android {
  ...
  signingConfigs {
    release {
      storeFile file('neoclass-release-key.jks')
      storePassword System.getenv("KEYSTORE_PASSWORD")
      keyAlias System.getenv("KEY_ALIAS")
      keyPassword System.getenv("KEY_PASSWORD")
    }
  }
}
```

#### 3. Build release APK/AAB

```bash
# Build APK
npm run build -- --prod
npx capacitor build android --prod

# Build AAB (requis pour PlayStore)
cd android && ./gradlew bundleRelease
```

#### 4. Upload sur Google Play Console

1. Créer une nouvelle app
2. Compléter les infos requis:
   - Nom de l'app: "Neoclass"
   - Description courte/longue
   - Screenshots (min 2)
   - Icône 512x512 PNG
   - Bannière de couverture
   - Catégorie: "Éducation"
   - Évaluation de contenu

3. Upload l'AAB depuis `android/app/build/outputs/bundle/release/`

4. Configurer les prix/distribution

5. Soumettre pour vérification (2-7 jours)

---

### **iOS (AppStore)**

#### 1. Créer certificats & identifiants

```bash
# Sur Apple Developer Portal
# 1. Certificates -> Create: Apple Development & Apple Distribution
# 2. Identifiers -> App ID: com.neoclass.mobile
# 3. Provisioning Profiles pour Development & Distribution
```

#### 2. Setup Xcode

```bash
# Installer Xcode
xcode-select --install

# Configurer Capacitor pour iOS
npx capacitor add ios
npx capacitor sync ios
```

#### 3. Ouvrir et configurer dans Xcode

```bash
open ios/App/App.xcworkspace
```

**Dans Xcode:**
- Signing & Capabilities -> Team ID
- Bundle Identifier: `com.neoclass.mobile`
- Version: `1.0.0`
- Build: `1`

#### 4. Archive & upload

```bash
# Build for distribution
npx capacitor build ios --prod

# Dans Xcode:
# Product -> Archive -> Distribute App -> Upload to App Store
```

#### 5. AppStore Connect

1. Créer une nouvelle app
2. Compléter les infos:
   - Nom: "Neoclass"
   - Description
   - Mots-clés
   - Support URL
   - Privacy URL

3. Ajouter des screenshots pour chaque device (min 2)

4. Sélectionner une catégorie: Education

5. Ajouter les notes de version

6. Soumettre pour vérification (24-48h)

---

## 🔒 SÉCURITÉ & PERMISSIONS

### PlayStore

**Politiques importantes:**
- ✅ Politique de confidentialité OBLIGATOIRE
- ✅ Contacter: email@neoclass.com
- ✅ Pas de contenu pour enfants (ou déclarer)
- ✅ Catégories autorisées

### AppStore

**Review Guidelines:**
- ✅ Pas de crash/bugs critiques
- ✅ Icône doit correspondre aux couleurs de l'app
- ✅ Pas de fake ratings
- ✅ Respecter le design d'iOS

---

## 📊 MÉTADONNÉES

### Screenshots (Important!)

**Recommandations:**
1. **Android (PlayStore):**
   - Taille: 1080x1920 (9:16 aspect ratio)
   - Format: PNG/JPEG
   - Min 2, max 8 screenshots
   - Ajouter du texte illustratif

2. **iOS (AppStore):**
   - Taille: 1170x2532 (pour iPhone 12/13)
   - Format: PNG/JPEG
   - Min 2, max 10 screenshots
   - Texte limité à 30 caractères

**Contenu des screenshots:**
```
1. Dashboard avec NabeCoins
2. Sélection des cours
3. Quiz interactif
4. Social/Leaderboard
5. Retrait de NabeCoins
6. Gamification (Badges)
```

### Descriptions

**PlayStore:**
```
Titre: Neoclass - Apprends, Gagne, Évolue (35 caractères)

Description courte (80 caractères):
La plateforme éducative qui te récompense en argent réel!

Description longue:
Neoclass est la première plateforme éducative qui combine:
- 📚 Cours interactifs (Guinée & France)
- 💰 Récompenses en NabeCoins convertibles
- 📿 Module Coran complet (114 sourates)
- 🎮 Mini-jeux éducatifs
- 🏆 Gamification avec badges & streaks
- 👨‍👩‍👧 Suivi parental
- 🏫 Gestion scolaire complète

Apprends à ton rythme, gagne de l'argent, évolue! 🚀
```

**AppStore:**
```
Neoclass - Learn, Earn, Evolve

La plateforme éducative révolutionnaire qui te récompense
en argent réel pour chaque cours suivi.

Fonctionnalités principales:
📚 Cours complets
💰 Gagnez des NabeCoins
🎓 Certifications
🌐 Réseau social d'apprentissage
```

---

## 📈 POST-PUBLICATION

### 1. **Monitoring**

```bash
# Google Play Console
- Crash analytics
- Reviews & ratings
- User acquisition

# AppStore Connect
- App Store analytics
- Crash logs
- Performance
```

### 2. **Updates**

**PlayStore:**
- Nouvelle version chaque 2-4 semaines
- Déploiement par région optionnel
- Staged rollout recommandé

**AppStore:**
- Moins flexible
- Mieux de tester en TestFlight d'abord
- Versions numérotées strictes (1.0.0)

### 3. **Support & Feedback**

```
Email de support: support@neoclass.com
Lien support: https://neoclass.com/support
Chat: support intégré dans l'app
```

---

## ⚠️ CHECKLIST AVANT SUBMISSION

- [ ] App ne crash pas
- [ ] Tous les liens fonctionnent
- [ ] Pas d'erreurs Firebase
- [ ] UI responsive sur différents écrans
- [ ] Permissions minimales demandées
- [ ] Politique de confidentialité en place
- [ ] Conditions d'utilisation en place
- [ ] Pas d'auto-redirect externes
- [ ] Tous les assets sont lisses (1x, 2x, 3x)
- [ ] Version 1.0.0 correcte
- [ ] Pas de contenu de test/debug
- [ ] HTTPS partout
- [ ] Fonctionnement offline correct

---

## 🆘 TROUBLESHOOTING

### PlayStore

**"App not published"**
```
→ Vérifier signing key
→ Vérifier contentRating
→ Remplir pricing
```

**"Rejected: Policy violation"**
```
→ Ajouter Privacy Policy
→ Retirer contenu suspect
→ Respecter guidelines
```

### AppStore

**"Rejected during review"**
```
→ Vérifier crash logs
→ Tester sur TestFlight
→ Vérifier Xcode warnings
```

**"Build rejected: expires"**
```
→ Certificats iOS expirent
→ Renouveler dans Developer Portal
→ Synchroniser dans Xcode
```

---

## 📞 CONTACTS & RESOURCES

- **Google Play Support**: https://support.google.com/googleplay
- **Apple Dev Support**: https://developer.apple.com/support/
- **Cordova Docs**: https://cordova.apache.org
- **Capacitor Docs**: https://capacitorjs.com/docs

---

**✅ Bon à savoir:**
- PlayStore = Plus flexible, approval plus rapide
- AppStore = Plus strict, meilleure qualité
- Commencer par Android (plus simple)
- Tester appels API avant publication
- Penser aux temps de chargement réseau

---

Generated: 2026-05-25
Version: 1.0.0
