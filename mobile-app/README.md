# 🚀 Neoclass Mobile App - README

## 📱 À propos

**Neoclass Mobile** est l'application Android de la plateforme Neoclass, conçue pour offrir une expérience d'apprentissage complète sur mobile.

### ✨ Fonctionnalités

- 🔐 **Authentification sécurisée** - Login/Register avec Firebase
- 📚 **Tableau de bord personnalisé** - Vue d'ensemble des informations
- 👨‍🎓 **Gestion pour Élèves** - Accès aux cours, quiz, gamification
- 👨‍🏫 **Gestion pour Professeurs** - Création de contenu, notation
- 🏫 **Gestion pour Directeurs** - Finances, scolarités, équipe
- 💰 **Système Finance intégré** - Suivi des paiements et dépenses
- 📊 **Analytics** - Statistiques en temps réel
- 🤖 **DARX IA** - Assistant pédagogique
- 🎮 **Gamification** - Points, streaks, récompenses

---

## 📋 Structure du projet

```
mobile-app/
├── www/                           # Application web
│   ├── index.html                 # UI principale
│   ├── app.js                     # Logique métier
│   ├── manifest.json              # PWA manifest
│   └── assets/                    # Images, icônes
├── android/                       # Configuration Android
│   ├── app/
│   │   ├── build.gradle           # Config build
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml
│   │   │   └── res/               # Ressources (strings, colors, styles)
│   │   └── google-services.json   # Config Firebase
│   └── build.gradle               # Build root
├── capacitor.config.json          # Config Capacitor
├── package.json                   # Dépendances Node
└── DEPLOYMENT_GUIDE.md            # Guide de déploiement complet
```

---

## 🛠️ Technologies utilisées

- **Framework**: Capacitor 5.6.0
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Frontend**: HTML5, CSS3, JavaScript vanilla
- **Mobile**: Android 5.0+
- **Build**: Gradle, Android Studio

---

## 💻 Installation pour développement

```bash
# 1. Installer Node.js et npm
# https://nodejs.org/

# 2. Cloner le projet
cd mobile-app

# 3. Installer les dépendances
npm install

# 4. Ajouter plateforme Android
npx capacitor add android

# 5. Synchroniser
npx capacitor sync android

# 6. Ouvrir dans Android Studio
npx capacitor open android
```

---

## 🔑 Configuration Firebase

Avant de compiler:

1. Créer un projet sur [Firebase Console](https://console.firebase.google.com)
2. Télécharger `google-services.json`
3. Placer dans `android/app/google-services.json`
4. Ajouter les clés dans `www/app.js` ligne ~18

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

---

## 🏃 Exécution

### Développement
```bash
# Build et lancer sur appareil
npx capacitor run android

# Ou depuis Android Studio
# Run > Run 'app'
```

### Production
```bash
# Build release
cd android
./gradlew bundleRelease

# Sortie: android/app/build/outputs/bundle/release/app-release.aab
```

---

## 🎯 Déploiement Play Store

Voir [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) pour instructions détaillées.

### Résumé rapide:
1. ✅ Préparer les assets (icônes, screenshots)
2. ✅ Configurer Firebase
3. ✅ Générer clé de signature
4. ✅ Build AAB
5. ✅ Créer listing Google Play
6. ✅ Soumettre pour review

---

## 📱 Rôles et Accès

### 👨‍🎓 Élève
- Accès aux cours
- Quiz et exercices
- Messagerie
- Boutique
- Gamification (points, streaks)

### 👨‍🏫 Professeur
- Créer et gérer cours
- Créer quiz
- Notation
- Gérer élèves
- Statistiques

### 👨‍👩‍👧 Parent
- Suivi enfant
- Rapports
- Contrôle parental

### 🏫 Directeur
- Gestion élèves et profs
- Finances et scolarités
- Dépenses
- Notifications
- Analytics

---

## 🔒 Sécurité

- ✅ Firebase Authentication (OAuth2)
- ✅ Firestore Security Rules
- ✅ HTTPS forcé
- ✅ Données chiffrées
- ✅ Pas de données sensibles en localStorage

---

## 🚀 Performance

- **Taille APK**: ~15-20 MB
- **Taille min RAM**: 512 MB
- **Android min**: 5.0 (API 24)
- **Temps démarrage**: ~2-3 secondes

---

## 🐛 Issues et Support

Signaler les bugs ou poser des questions sur:
- GitHub Issues (si repo public)
- Email: dev@neoclass.com
- Discord: [Lien serveur]

---

## 📄 Licence

Copyright © 2026 Neoclass. Tous droits réservés.

---

**Version**: 1.0.0  
**Mise à jour**: Mai 2026  
**Dernière release**: https://play.google.com/store/apps/details?id=com.neoclass.mobile
