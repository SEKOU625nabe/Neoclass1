# 🎓 NEOCLASS - Flutter App

> **Plateforme d'apprentissage révolutionnaire avec gamification et DARX IA**  
> Construit avec **Flutter** pour Web, Android, et iOS

---

## ✨ Caractéristiques

- ✅ **Multi-plateforme**: Web, Android, iOS
- ✅ **Firebase intégré**: Auth, Firestore, Storage, Messaging
- ✅ **Menu optimisé**: 5 onglets (Accueil, Apprentissage, DARX IA, Récompenses, Profil)
- ✅ **Responsive design**: Mobile-first
- ✅ **Thème clair/sombre**: Support complet
- ✅ **Offline support**: Données synchronisées
- ✅ **Netlify ready**: Web hosting intégré

---

## 🚀 Démarrage Rapide

### Prérequis
- **Flutter** 3.0+ ([Installer](https://flutter.dev/docs/get-started/install))
- **Dart** (inclus dans Flutter)
- **Firebase Project** (gratuit sur [console.firebase.google.com](https://console.firebase.google.com))

### Installation

```bash
# 1. Cloner/ouvrir le projet
cd flutter_app

# 2. Récupérer les dépendances
flutter pub get

# 3. Générer les fichiers
flutter pub run build_runner build
```

### Tests Locaux

**Web** (Recommandé):
```bash
flutter run -d chrome
```

**Android**:
```bash
flutter run
```

**iOS** (macOS only):
```bash
flutter run -d iPhone
```

---

## 📁 Structure

```
flutter_app/
├── lib/
│   ├── main.dart                      # Entrée principale
│   ├── firebase_options.dart          # Config Firebase
│   ├── screens/
│   │   ├── splash_screen.dart         # Splash
│   │   ├── login_screen.dart          # Connexion
│   │   ├── dashboard_screen.dart      # Tableau de bord
│   │   └── other_screens.dart         # Autres pages
│   ├── services/                      # (À développer)
│   │   ├── firebase_service.dart
│   │   ├── auth_service.dart
│   │   └── user_service.dart
│   └── models/                        # (À développer)
│       ├── user_model.dart
│       └── course_model.dart
│
├── android/                           # Configuration Android
├── ios/                               # Configuration iOS
├── web/                               # Configuration Web
├── pubspec.yaml                       # Dépendances
├── netlify.toml                       # Config Netlify
└── FLUTTER_NETLIFY_GUIDE.md          # Guide complet
```

---

## 🔧 Configuration Firebase

**1. Créer un projet Firebase**:
```
https://console.firebase.google.com
→ "Créer un projet"
→ Nom: "neoclass"
→ Créer
```

**2. Ajouter les apps**:
```
Web: App → +Ajouter → Web
Android: App → +Ajouter → Android  
iOS: App → +Ajouter → iOS
```

**3. Copier les credentials**:

**Web** (`lib/firebase_options.dart`):
```dart
static const FirebaseOptions web = FirebaseOptions(
  apiKey: '...',
  appId: '...',
  // etc
);
```

**Android** (`android/app/google-services.json`):
```json
{
  "project_info": {
    // ...
  }
}
```

**iOS** (`ios/Runner/GoogleService-Info.plist`):
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC ...>
<plist version="1.0">
<!-- ... -->
</plist>
```

---

## 🌐 Déployer sur Netlify

### Depuis UI Netlify

```
1. netlify.com → "New site from Git"
2. Sélectionner le repository
3. Config auto OK (netlify.toml)
4. "Deploy site"
5. ✅ Site live en 5-10 min!
```

### Depuis CLI

```bash
# Install
npm install -g netlify-cli

# Login
netlify login

# Deploy
flutter build web --release
netlify deploy --prod --dir=build/web
```

### URL de la version Web
```
https://neoclass-flutter.netlify.app
(ou votre domaine custom)
```

---

## 📱 Builds de Production

### Android

```bash
# APK
flutter build apk --release

# App Bundle (recommandé)
flutter build appbundle --release
```

### iOS

```bash
flutter build ios --release
# Ouvre Xcode pour l'archivage
```

### Web

```bash
flutter build web --release
# Output: build/web/
```

---

## 📚 Dépendances Principales

- **Firebase**: Auth, Firestore, Storage, Messaging
- **go_router**: Navigation
- **provider**: State management
- **google_fonts**: Polices
- **http/dio**: Networking
- **hive**: Local storage

Pour la liste complète → `pubspec.yaml`

---

## 🧪 Tests

```bash
# Tests unitaires
flutter test

# Tests d'intégration
flutter drive --target=test_driver/app.dart
```

---

## 🐛 Troubleshooting

| Problème | Solution |
|----------|----------|
| `flutter: command not found` | Ajouter Flutter à PATH |
| `Error: Unable to locate Android SDK` | Installer Android Studio + SDK |
| `Firebase auth fails` | Vérifier `firebase_options.dart` |
| `Web ne s'affiche pas` | Vérifier `netlify.toml` |
| `Pod install error` | Exécuter `flutter clean && flutter pub get` |

---

## 📖 Documentation

- **Flutter**: https://flutter.dev/docs
- **Firebase**: https://firebase.google.com/docs
- **Netlify**: https://docs.netlify.com
- **Guide Complet**: `FLUTTER_NETLIFY_GUIDE.md`

---

## 📝 Licence

MIT License - Voir `LICENSE` pour détails

---

## 👥 Contributeurs

- **Neoclass Team**
- **Flutter Community**

---

## 🎉 Status

```
✅ Web (Netlify)     : Live
✅ Android          : Prêt
✅ iOS              : Prêt  
✅ Firebase         : Configuré
✅ Documentation    : Complète
```

---

**Dernière mise à jour**: 3 Juin 2026  
**Version**: 1.0.0  
**Support**: support@neoclass.app
