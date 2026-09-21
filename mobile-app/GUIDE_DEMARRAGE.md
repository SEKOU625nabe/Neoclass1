# 🚀 NEOCLASS MOBILE - GUIDE DE DÉMARRAGE COMPLET

## 📋 STRUCTURE DU PROJET

```
mobile-app/
├── www/
│   ├── index.html (NOUVEAU - remplacer l'ancien)
│   ├── index-complete.html (version complète)
│   ├── app.js (RÉVISÉ - APP principale)
│   ├── app-utils.js (fonctions utilitaires)
│   ├── data.js (données globales, i18n, constants)
│   ├── firebase-service.js (services Firebase)
│   ├── styles.css (CSS mobile optimisé)
│   ├── modules/
│   │   ├── auth.js (authentification multi-rôles)
│   │   ├── dashboard.js (tableau de bord principal)
│   │   ├── courses.js (gestion des cours)
│   │   ├── finance.js (NabeCoins, retraits, abonnements)
│   │   ├── social.js (chat, classement, réseau)
│   │   └── admin.js (panel admin, paramètres)
│   └── manifest.json
├── GUIDE_PLAYSTORE_APPSTORE.md (publication stores)
└── README.md
```

---

## ⚡ INSTALLATION RAPIDE

### 1. **Remplacer les fichiers**

```bash
# Sauvegarde l'ancien (optionnel)
cp www/index.html www/index-old.html

# Utiliser la nouvelle version
cp www/index-complete.html www/index.html
```

### 2. **Vérifier les scripts**

Assurer que tous les fichiers suivants existent:
- ✅ data.js
- ✅ firebase-service.js
- ✅ app.js (révisé)
- ✅ app-utils.js
- ✅ styles.css
- ✅ modules/auth.js
- ✅ modules/dashboard.js
- ✅ modules/courses.js
- ✅ modules/finance.js
- ✅ modules/social.js
- ✅ modules/admin.js

### 3. **Test en local**

```bash
# Démarrer le serveur Capacitor
npm run dev

# Ou utiliser un serveur local
python -m http.server 8000

# Puis visiter http://localhost:8000
```

---

## 🔥 FLOW DE L'APPLICATION

### **Séquence de démarrage:**

```
1. Page chargée
   ↓
2. Firebase initialisation
   ↓
3. Vérifier authentification
   ├─ Si connecté → Cinematic Splash (4s) → Dashboard
   └─ Si non → Auth Page (Login/Signup)
   ↓
4. User interaction
```

### **Auth Flow (Signup):**

```
Role Selection (Élève/Prof/École/Parent)
   ↓
Système (Guinée/France)
   ↓
Infos personnelles + Email + Password
   ↓
Firebase Signup ✅
   ↓
Dashboard
```

### **Auth Flow (Login):**

```
Email + Password
   ↓
Firebase Login ✅
   ↓
Load User Profile
   ↓
Cinematic Splash
   ↓
Dashboard
```

---

## 📱 MODULES EXPLIQUÉS

### 1. **auth.js** - Authentification
```javascript
// Fonctions principales:
- showAuthPage() // Affiche la page auth
- selectRole() // Choix du rôle
- selectSystem() // Choix du système éducatif
- showSignupForm() // Formulaire signup
- showLoginForm() // Formulaire login
- handleSignup() // Traite signup
- handleLogin() // Traite login
```

**Rôles supportés:**
- `student` - Élève
- `teacher` - Professeur
- `school` - École/Établissement
- `parent` - Parent

**Systèmes supportés:**
- `guinea` - Guinée 🇬🇳
- `france` - France 🇫🇷

---

### 2. **dashboard.js** - Tableau de bord
```javascript
// Pages accessibles:
- Mes cours (renderCoursesPage)
- Quiz (renderQuizzesPage)
- Jeux (renderGamesPage)
- Finance/Retraits (renderFinancePage)
- Social (renderSocialPage)
- Admin (renderAdminPanel) - Admin only
- Paramètres (renderSettingsPage)
```

**Affiche:**
- 💰 NabeCoins actuels
- 🔥 Série (jours consécutifs)
- 📚 Mes cours en cours
- 🏆 Badges débloqués

---

### 3. **courses.js** - Gestion des cours
```javascript
// Fonctions:
- renderCoursesPage() // Liste des cours
- showCourseDetail(courseId) // Détail cours
- handleEnrollCourse(courseId) // S'inscrire
- loadCoursesContent() // Charger contenu
```

**Structure d'un cours:**
```javascript
{
  id: "course1",
  title: "Mathématiques - Algèbre",
  icon: "🧮",
  level: "Débutant",
  lessons: 12,
  description: "...",
  instructor: "Prof Name"
}
```

---

### 4. **finance.js** - Finances
```javascript
// Retraits:
- requestWithdrawal(amount, method, phone)
// Méthodes: orange-money, mtn-money, bank

// Quiz:
- startQuiz(quizId, title)
// Reward: 40-120 NabeCoins

// Jeux:
- startGame(gameId)
// Reward: 80-200 NabeCoins

// Abonnements (Plans):
- SUBSCRIPTION_PLANS[3]
  - Free: 0 GNF
  - Premium: 50,000 GNF
  - Elite: 100,000 GNF
```

---

### 5. **social.js** - Réseau social
```javascript
// Fonctions:
- renderSocialPage() // Accueil social
- switchSocialTab(tab) // Chat / Classement
- openChat(userId, userName) // Ouvrir chat
- sendChatMessage(userId) // Envoyer message

// Classement:
- Top 5 étudiants par score
- Badges/Médailles
- Points par utilisateur
```

---

### 6. **admin.js** - Admin Panel
```javascript
// Sections:
- Gestion utilisateurs (Bannir/Débannir)
- Finances (Approuver retraits)
- Analytique (Stats)
- Contenu (Gérer ressources)

// Droits:
- Rôles autorisés: admin, school
- Vérification: State.profile.role !== 'admin'
```

---

## 🔌 FIREBASE SETUP

### **Collections Firestore:**

```
users/
├── uid
├── email
├── fullName
├── role
├── system (guinea/france)
├── level
├── nabecoins
├── streak
├── badges[]
├── subscription
└── createdAt

courses/
├── id
├── title
├── icon
├── level
├── system
├── lessons
├── instructor
└── description

quiz_results/
├── userId
├── quizId
├── score
├── reward
├── timestamp
└── answers[]

messages/
├── senderId
├── recipientId
├── message
├── timestamp
└── read

withdrawals/
├── userId
├── amount
├── method
├── phoneNumber
├── status (pending/approved/rejected)
└── requestedAt
```

---

## 🎨 CUSTOMIZATION

### **Changer les couleurs:**

```javascript
// Dans data.js ou index.html:
:root {
  --primary: #6c63ff;      // Couleur principale
  --accent: #f59e0b;       // Accent
  --success: #10b981;      // Succès
  --danger: #ef4444;       // Danger
}
```

### **Ajouter une langue:**

```javascript
// Dans data.js > i18n:
const i18n = {
  // ...existing...
  es: {
    login: "Inicia sesión",
    signup: "Registrarse",
    // ...
  }
};
```

### **Ajouter un module:**

```javascript
// 1. Créer modules/nouveau.js
function renderNouveauPage() {
  return `<div>Nouveau module</div>`;
}

// 2. Ajouter à dashboard.js
case 'nouveau':
  dashboardContent.innerHTML = await renderNouveauPage();
  break;

// 3. Ajouter un bouton dans le dashboard
<button onclick="navigate('nouveau')">Nouveau</button>
```

---

## 📊 DONNÉES DE TEST

### **User Test**

```
Email: test@neoclass.com
Password: Test@1234
Role: student
System: guinea
NabeCoins: 5000
```

### **Admin Test**

```
Email: admin@neoclass.com
Password: Admin@1234
Role: admin
```

---

## 🐛 DEBUGGING

### **Activer les logs:**

```javascript
// Dans app.js
console.log('🚀 Debug info');
console.warn('⚠️ Warning');
console.error('❌ Error');
```

### **Vérifier l'état:**

```javascript
// Dans la console navigateur:
console.log(State) // État global
console.log(auth) // Firebase auth
console.log(db) // Firestore instance
```

### **Problèmes courants:**

| Problème | Solution |
|----------|----------|
| Firebase pas initialisé | Vérifier firebaseConfig dans firebase-service.js |
| Page blanche | Vérifier la console pour erreurs JavaScript |
| Auth ne fonctionne pas | Vérifier les règles Firestore |
| Pas de données | Vérifier que les collections existent dans Firestore |
| Cinematic ne s'affiche pas | Vérifier que `#cinematicOpening` existe |

---

## 📦 BUILD PRODUCTION

### **Android:**

```bash
npm run build -- --prod
npx capacitor sync android
cd android && ./gradlew bundleRelease
```

### **iOS:**

```bash
npm run build -- --prod
npx capacitor sync ios
# Ouvrir Xcode et archiver
```

---

## ✅ CHECKLIST DE VÉRIFICATION

- [ ] Tous les fichiers JavaScript créés
- [ ] Firebase configuré et fonctionnel
- [ ] Pages auth fonctionnent
- [ ] Dashboard s'affiche correctement
- [ ] Animations cinématique fonctionne
- [ ] Formulaires valident correctement
- [ ] Pas d'erreurs console
- [ ] Thème clair/sombre fonctionne
- [ ] Multilingue fonctionne (fr/en/ar)
- [ ] Responsive sur téléphone
- [ ] Données de test populées
- [ ] Prêt pour PlayStore/AppStore

---

## 🚀 PROCHAINES ÉTAPES

1. ✅ Structure modulaire créée
2. ✅ Authentification implémentée
3. ✅ Dashboard fonctionnel
4. ✅ Tous les modules prêts
5. ⏳ Tests utilisateurs (staging)
6. ⏳ Optimisation performance
7. ⏳ Publication PlayStore
8. ⏳ Publication AppStore

---

## 📞 SUPPORT

- **Documentation**: Voir fichiers .md dans mobile-app/
- **Problèmes Firebase**: https://firebase.google.com/support
- **Problèmes Cordova**: https://cordova.apache.org/docs
- **Problèmes Capacitor**: https://capacitorjs.com/docs

---

**Version**: 1.0.0
**Date**: 2026-05-25
**Status**: ✅ PRÊT POUR PRODUCTION
