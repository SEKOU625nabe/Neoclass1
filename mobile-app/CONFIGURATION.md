# 🔐 NEOCLASS MOBILE - Configuration

## Variables d'environnement

Créer un fichier `.env` (ne pas commiter):

```env
# Firebase Config
REACT_APP_FIREBASE_API_KEY=YOUR_API_KEY
REACT_APP_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
REACT_APP_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
REACT_APP_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
REACT_APP_FIREBASE_APP_ID=YOUR_APP_ID
REACT_APP_FIREBASE_MEASUREMENT_ID=YOUR_MEASUREMENT_ID

# App Config
REACT_APP_API_URL=https://api.neoclass.com
REACT_APP_VERSION=1.0.0
REACT_APP_BUILD_DATE=2026-05-22

# Debug
REACT_APP_DEBUG=false
```

## Dans www/app.js

Remplacer les valeurs de configuration:

```javascript
// ============================================================
// CONFIGURATION FIREBASE (À METTRE À JOUR)
// ============================================================
const firebaseConfig = {
  apiKey: "AIzaSyD_YOUR_API_KEY_HERE",
  authDomain: "neoclass-firebase.firebaseapp.com",
  projectId: "neoclass-firebase",
  storageBucket: "neoclass-firebase.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456",
  measurementId: "G-MEASUREMENT_ID"
};
```

## Fichiers sensibles à ignorer

Ajouter au `.gitignore`:
```
.env
.env.local
.env.*.local
google-services.json
neoclass-key.jks
capacitor.config.json
```

## Secrets Play Store

Garder sécurisés:
1. `neoclass-key.jks` - Clé de signature
2. `google-services.json` - Config Firebase
3. Mot de passe keystore
4. Credentials développeur

## Configuration par environnement

### Development
- Debug mode ON
- API local ou stage
- Logs activés

### Staging
- Debug mode OFF
- API staging
- Crashlytics activé

### Production
- Debug mode OFF
- API production
- Analytics activé
- Obfuscation ON

## Setup secrets

```bash
# 1. Créer fichier .env.local (non commité)
echo "REACT_APP_FIREBASE_API_KEY=xxx" > .env.local

# 2. Ou mettre dans build.gradle
android {
  buildTypes {
    release {
      buildConfigField "String", "API_URL", '"https://api.neoclass.com"'
    }
  }
}
```

Accéder en code:
```javascript
const apiUrl = process.env.REACT_APP_API_URL || 'https://api.neoclass.com';
```
