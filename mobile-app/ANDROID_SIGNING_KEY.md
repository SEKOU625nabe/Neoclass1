# 🔐 CONFIGURATION SIGNATURE ANDROID

## 🔑 Clé de Signature Générée

```bash
# Commande pour générer la clé (À FAIRE UNE SEULE FOIS):
keytool -genkey -v -keystore neoclass-release-key.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias neoclass-key \
  -storepass neoclass2024 \
  -keypass neoclass2024 \
  -dname "CN=Neoclass, OU=Mobile, O=Neoclass, L=Kinshasa, ST=DRC, C=CD"
```

## 📋 Informations de la Clé

| Propriété | Valeur |
|-----------|--------|
| **Fichier** | `neoclass-release-key.jks` |
| **Alias** | `neoclass-key` |
| **Store Password** | `neoclass2024` |
| **Key Password** | `neoclass2024` |
| **Algorithme** | RSA 2048-bit |
| **Validité** | 10000 jours (27+ ans) |
| **Organisation** | Neoclass |
| **Pays** | CD (RDC) |

---

## ⚙️ Configuration build.gradle

```gradle
android {
    compileSdkVersion 34
    
    defaultConfig {
        applicationId "com.neoclass.mobile"
        minSdkVersion 24
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
    }
    
    signingConfigs {
        release {
            storeFile file("../neoclass-release-key.jks")
            storePassword "neoclass2024"
            keyAlias "neoclass-key"
            keyPassword "neoclass2024"
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

---

## 🛡️ Fichier .env (SÉCURISÉ)

```env
# android/keystore.properties
KEYSTORE_FILE=neoclass-release-key.jks
KEYSTORE_PASSWORD=neoclass2024
KEY_ALIAS=neoclass-key
KEY_PASSWORD=neoclass2024
```

---

## 📁 Où mettre le fichier?

```
neoclass/mobile-app/
├── android/
│   ├── neoclass-release-key.jks ← ICI! (JAMAIS dans Git!)
│   ├── app/
│   │   └── build.gradle
│   └── build.gradle
```

---

## 🚨 IMPORTANT: .gitignore

```gitignore
# SIGNATURE KEYS - NEVER COMMIT!
*.jks
*.keystore
*.p12
*.pfx
keystore.properties
.env
.env.local
```

---

## 🔍 Vérifier la clé

```bash
# Lister les infos de la clé
keytool -list -v -keystore neoclass-release-key.jks -alias neoclass-key -storepass neoclass2024
```

---

## 📦 Utilisation lors du Build

```bash
# Build release APK
cd android
./gradlew assembleRelease

# Build AAB (pour Google Play)
./gradlew bundleRelease

# L'output sera:
# - APK: app/build/outputs/apk/release/app-release.apk
# - AAB: app/build/outputs/bundle/release/app-release.aab
```

---

## ✅ Checklist

- [ ] Clé générée ✓
- [ ] Fichier neoclass-release-key.jks créé
- [ ] build.gradle configuré
- [ ] .gitignore mis à jour
- [ ] Passwords notées en sécurisé
- [ ] Prêt pour le build
