# 🎯 NEOCLASS MOBILE - Checklist Complet

## ✅ Avant de démarrer le développement

- [ ] Node.js 16+ installé
- [ ] Android Studio installé
- [ ] JDK 11+ installé
- [ ] Android SDK configuré
- [ ] Cloner le repository

## ✅ Configuration Firebase

- [ ] Créer projet Firebase Console
- [ ] Télécharger google-services.json
- [ ] Placer dans android/app/
- [ ] Mettre à jour clés dans www/app.js
- [ ] Activer Authentication (Email/Password)
- [ ] Activer Firestore Database
- [ ] Configurer security rules

## ✅ Setup initial

```bash
npm install
npx capacitor add android
npx capacitor sync android
```

- [ ] Dépendances installées
- [ ] Platform Android ajoutée
- [ ] Fichiers synchronisés

## ✅ Avant la première build

- [ ] Vérifier AndroidManifest.xml
- [ ] Permissions correctes dans manifest
- [ ] Strings.xml avec textes français
- [ ] Colors et styles configurés
- [ ] gradle.properties existe

## ✅ Build et test

- [ ] Build debug réussit
- [ ] App lance sans erreurs
- [ ] Login/Register fonctionne
- [ ] Dashboard charge correctement
- [ ] Navigation fonctionne
- [ ] Thème light/dark fonctionne

## ✅ Avant soumettre à Play Store

### Code
- [ ] Pas d'erreurs Lint
- [ ] Pas de warnings majeurs
- [ ] Code obfusqué (Proguard)
- [ ] Pas de clés API en dur
- [ ] Permissions minimales

### Versioning
- [ ] Version code incrémentée
- [ ] Version name mise à jour
- [ ] Changelog complet

### Assets
- [ ] Icône 512x512 PNG prête
- [ ] 2-8 screenshots préparées (1080x1920)
- [ ] Bannière feature image (1024x500)
- [ ] Logo texte prêt

### Store Listing
- [ ] Titre: "Neoclass"
- [ ] Description courte: < 80 caractères
- [ ] Description complète: 4000 caractères max
- [ ] Catégorie: Éducation
- [ ] Note PEGI complétée
- [ ] Politique privée URL
- [ ] Email contact configuré
- [ ] Site web (optionnel)

### Security
- [ ] google-services.json en .gitignore
- [ ] Clé de signature sécurisée
- [ ] Pas de credentials en code

### Testing
- [ ] Testé sur Android 5.0 (API 21 min)
- [ ] Testé sur Android 13 (API 34 max)
- [ ] Testé sur petit écran (4.5")
- [ ] Testé sur grand écran (6"+)
- [ ] Orientation portrait correcte
- [ ] Notch/safe areas gérées

## ✅ Build Release

```bash
chmod +x build-release.sh
./build-release.sh
```

- [ ] AAB généré sans erreurs
- [ ] Fichier < 50 MB
- [ ] Fichier signé correctement

## ✅ Google Play Console

- [ ] Compte développeur créé (25$)
- [ ] Profil complété
- [ ] Accepté conditions générales
- [ ] Accord programme famille (si applicable)
- [ ] Carte de crédit valide

## ✅ Soumission

- [ ] Listing complet rempli
- [ ] Toutes exigences vérifiées
- [ ] Screenshots vérifiées
- [ ] AAB chargé
- [ ] Version notes remplies
- [ ] Test interne lancé d'abord

## ✅ Post-soumission

- [ ] Monitoring Play Console
- [ ] Répondre aux reviews
- [ ] Monitorer crash reports
- [ ] Analytics configurées
- [ ] Feedback system en place

## 📊 Avant première release

### Checklist Fonctionnalités minimales
- [ ] ✅ Login/Register
- [ ] ✅ Dashboard personnalisé
- [ ] ✅ Navigation working
- [ ] ✅ Profil user
- [ ] ✅ Logout

### Checklist Optionnel (v1.1+)
- [ ] Notifications push
- [ ] Mode hors ligne
- [ ] Share sur réseaux
- [ ] In-app purchases
- [ ] Analytics
- [ ] Crashes reporting

---

## 🚀 Distribution

### Beta Testing (recommandé)
```bash
# 1. Google Play Console > Canaux > Test
# 2. Charger AAB
# 3. Configurer testeurs
# 4. Récupérer feedback
# 5. Corriger issues
# 6. Release en production
```

### Release Production
```bash
# 1. Incrementer versionCode (build.gradle)
# 2. Build release
# 3. Play Console > Production
# 4. Charger AAB
# 5. Remplir notes de version
# 6. Soumettre review
```

---

## 📝 Notes importantes

- **Délai approbation**: 24-72h généralement
- **Rejet possible si**: permissions excessives, contenu inappropriate, crash
- **Update cycle**: Minimum 2h entre updates
- **Retention**: App doit rester active ou délistée après 6 mois inactivité
- **Données utilisateur**: Respecter RGPD/confidentialité

---

## 🔗 Ressources utiles

- Android Dev: https://developer.android.com
- Firebase: https://firebase.google.com/docs
- Capacitor: https://capacitorjs.com/docs
- Play Store Policy: https://play.google.com/about/developer-content-policy/
- Material Design: https://material.io/design

---

**Version**: 1.0.0  
**Dernière update**: Mai 2026
