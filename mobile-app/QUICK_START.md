# ⚡ NEOCLASS MOBILE - Quick Start

## 🚀 Démarrage en 5 minutes

### 1️⃣ Installer
```bash
cd mobile-app
npm install
npx capacitor add android
npx capacitor sync android
```

### 2️⃣ Configurer Firebase
- Télécharger `google-services.json` de [Firebase Console](https://console.firebase.google.com)
- Placer dans `android/app/google-services.json`
- Mettre à jour les clés dans `www/app.js`

### 3️⃣ Ouvrir Android Studio
```bash
npx capacitor open android
```

### 4️⃣ Compiler et tester
- Cliquer sur **Run > Run 'app'** dans Android Studio
- Ou: `npx capacitor run android`

---

## 🎯 Points clés

| Point | Details |
|-------|---------|
| **Dossier web** | `www/` - HTML/CSS/JS |
| **Config Android** | `android/` - Configuration |
| **Firebase** | `android/app/google-services.json` |
| **Build** | `./gradlew build` |
| **Release** | `./gradlew bundleRelease` |

---

## 📱 Structure UI

```
Splash (2s)
  ↓
Login/Register
  ↓
Dashboard (avec 5 onglets)
  ├─ Accueil
  ├─ Cours
  ├─ Messages
  ├─ Boutique
  └─ Profil
```

---

## 🔑 Fichiers importants

| Fichier | Rôle |
|---------|------|
| `www/index.html` | UI React |
| `www/app.js` | Logique métier |
| `capacitor.config.json` | Config app |
| `android/app/build.gradle` | Config build |
| `android/app/src/main/AndroidManifest.xml` | Permissions |
| `DEPLOYMENT_GUIDE.md` | Guide Play Store |

---

## 🎨 Personnalisation

### Couleurs
Modifier `android/app/src/main/res/values/colors.xml`

### Textes
Modifier `android/app/src/main/res/values/strings.xml`

### Thème
Modifier `android/app/src/main/res/values/styles.xml`

---

## 🏪 Play Store (version simple)

```bash
# 1. Générer clé
keytool -genkey -v -keystore neoclass-key.jks ...

# 2. Build release
./build-release.sh

# 3. Charger sur Google Play Console

# 4. Attendre approbation (24-72h)
```

Voir [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) pour détails complets.

---

## 🐛 Problèmes courants

**Erreur SDK**
```bash
export ANDROID_SDK_ROOT=/path/to/sdk
```

**Erreur gradle**
```bash
cd android && ./gradlew clean && ./gradlew build
```

**Firebase ne fonctionne pas**
- Vérifier `google-services.json`
- Vérifier clés dans `www/app.js`

---

## ✅ Checklist rapide avant Play Store

- [ ] Firebase configuré
- [ ] Build release réussi
- [ ] Icônes 512x512
- [ ] Screenshots prêtes
- [ ] Listings complétées
- [ ] AAB < 50 MB
- [ ] Testé sur vrai téléphone

---

**Documentation complète**: Voir [README.md](README.md)  
**Déploiement détaillé**: Voir [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)  
**Checklist complet**: Voir [CHECKLIST.md](CHECKLIST.md)
