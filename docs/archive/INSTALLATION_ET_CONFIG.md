# ⚙️ GUIDE D'INSTALLATION ET CONFIGURATION

## 🚀 Installation (5 minutes)

### Option 1: Installation locale (Recommandé pour démarrage)

#### Étape 1: Télécharger les fichiers
```bash
# Les fichiers sont déjà dans:
c:\Users\HP\Desktop\neoclass\
```

#### Étape 2: Ouvrir dans un navigateur
```bash
# Double-cliquez sur:
finance-dashboard-pro.html

# Ou dans l'adresse du navigateur:
file:///C:/Users/HP/Desktop/neoclass/finance-dashboard-pro.html
```

#### Étape 3: Vérifier l'installation
- La page charge sans erreur ✓
- Le dashboard s'affiche ✓
- Les données de démo se chargent ✓

### Option 2: Serveur local (Pour développement)

#### Avec Python 3
```bash
cd C:\Users\HP\Desktop\neoclass\
python -m http.server 8000

# Ouvrir: http://localhost:8000/finance-dashboard-pro.html
```

#### Avec Node.js (http-server)
```bash
npm install -g http-server
cd C:\Users\HP\Desktop\neoclass\
http-server

# Ouvrir: http://localhost:8080/finance-dashboard-pro.html
```

#### Avec PHP
```bash
cd C:\Users\HP\Desktop\neoclass\
php -S localhost:8000

# Ouvrir: http://localhost:8000/finance-dashboard-pro.html
```

---

## 📦 Configuration initiale

### 1. Configuration de l'école

#### Dans finance-dashboard-pro.html (ligne ~210)
```javascript
// Modifier:
<div class="sidebar-logo">
  <div class="name">Neo<span>class</span></div>
  <div class="school">VOTRE ÉCOL ICI</div>  <!-- ← MODIFIER -->
</div>

// Et au bottom du fichier, dans le script:
const schoolName = "NOM DE VOTRE ÉCOLE";
const schoolId = "school_001";
```

### 2. Ajouter vos utilisateurs

#### Dans modules/RoleManager.js (ligne ~130)
```javascript
loadMembers() {
  this.members = [
    {
      id: 'member_1',
      name: 'VOTRE NOM',  // ← À modifier
      email: 'votre.email@neoclass.edu',  // ← À modifier
      phone: '+224 6XX XXX XXX',
      role: 'comptable',
      avatar: 'VN'
    },
    // ... Ajouter d'autres membres
  ];
}
```

### 3. Configurer les catégories

#### Dans modules/FinanceOperationManager.js (ligne ~20)
```javascript
this.categories = [
  { id: 'scolarite', name: 'Frais de Scolarité', type: 'revenue' },
  // ... Ajouter vos catégories
];
```

### 4. Configurer les départements

#### Dans modules/BudgetManager.js (ligne ~15)
```javascript
this.departments = [
  { id: 'pedagogy', name: 'Pédagogie' },
  // ... Ajouter vos départements
];
```

---

## 🔐 Configuration de sécurité

### Authentification basique

#### Créer un fichier login.html
```html
<!DOCTYPE html>
<html>
<head>
  <title>Neoclass - Connexion</title>
</head>
<body>
  <div class="login-form">
    <input type="text" id="username" placeholder="Utilisateur">
    <input type="password" id="password" placeholder="Mot de passe">
    <button onclick="login()">Connexion</button>
  </div>

  <script src="modules/NeoclassFinanceSystem.js"></script>
  <script>
    function login() {
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      
      // Vérifier les credentials
      if (verifyLogin(username, password)) {
        // Sauvegarder la session
        sessionStorage.setItem('user_id', username);
        window.location.href = 'finance-dashboard-pro.html';
      } else {
        alert('Identifiants incorrects');
      }
    }
    
    function verifyLogin(username, password) {
      // À intégrer avec votre système d'auth
      return true;
    }
  </script>
</body>
</html>
```

### Session utilisateur

#### Dans finance-dashboard-pro.html
```javascript
// Au démarrage:
window.addEventListener('DOMContentLoaded', function() {
  const userId = sessionStorage.getItem('user_id');
  if (!userId) {
    window.location.href = 'login.html';
  }
  
  // Charger l'utilisateur
  financeSystem.login(userId);
});

// À la déconnexion:
function logout() {
  sessionStorage.removeItem('user_id');
  window.location.href = 'login.html';
}
```

---

## 💾 Configuration des données

### Utiliser localStorage (Défaut)

Les données sont automatiquement sauvegardées dans localStorage.

```javascript
// Accéder aux données:
const members = JSON.parse(localStorage.getItem('neoclass_members'));
const operations = JSON.parse(localStorage.getItem('neoclass_operations_school_001'));
const budgets = JSON.parse(localStorage.getItem('neoclass_budgets_school_001'));
```

### Intégration Firebase Firestore (Production)

#### 1. Créer un projet Firebase
- Aller sur console.firebase.google.com
- Créer un nouveau projet
- Copier la config

#### 2. Ajouter Firebase SDK
```html
<!-- Dans finance-dashboard-pro.html -->
<script src="https://www.gstatic.com/firebaseapps/11.0.0/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebaseapps/11.0.0/firebase-firestore.js"></script>

<script>
  const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_ID",
    appId: "YOUR_APP_ID"
  };

  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();
</script>
```

#### 3. Modifier NeoclassFinanceSystem.js
```javascript
// Remplacer les sauvegardes localStorage par Firebase:
saveMembersToDB() {
  db.collection('schools').doc(this.schoolId)
    .collection('members')
    .doc('all')
    .set({ data: this.members }, { merge: true });
}

// Charger depuis Firebase:
loadMembers() {
  db.collection('schools').doc(this.schoolId)
    .collection('members')
    .doc('all')
    .onSnapshot(doc => {
      if (doc.exists) {
        this.members = doc.data().data;
      }
    });
}
```

---

## 🎨 Personnalisation du design

### Changer les couleurs

#### Dans le CSS (finance-dashboard-pro.html, ligne ~20)
```css
:root {
  --navy:   #1A3A6B;    /* Couleur primaire */
  --gold:   #C8A84B;    /* Accent */
  --green:  #059669;    /* Succès */
  --red:    #DC2626;    /* Danger */
  --amber:  #D97706;    /* Warning */
  --blue:   #2563EB;    /* Info */
  /* ... autres couleurs ... */
}
```

### Changer la police

#### Dans le CSS
```css
html,body {
  font-family: 'DM Sans', 'Votre Police', sans-serif;
}

.topbar-title {
  font-family: 'Playfair Display', 'Votre Police Serif', serif;
}
```

### Ajouter un logo

#### Dans le sidebar
```html
<div class="sidebar-logo">
  <img src="logo.png" style="width: 40px; margin-bottom: 10px;">
  <div class="name">Neo<span>class</span></div>
  <div class="school">Mon Établissement</div>
</div>
```

---

## 🔧 Configuration avancée

### Multi-écoles

```javascript
// Créer une instance par école:
const school1 = new FinanceSystem('school_001', 'Lycée A');
const school2 = new FinanceSystem('school_002', 'Lycée B');

// Les données sont isolées par schoolId
// Chaque école a ses propres:
// - Opérations
// - Budgets
// - Membres
// - Rapports
```

### Devise personnalisée

#### Dans FinanceOperationManager
```javascript
constructor() {
  this.defaultCurrency = 'XOF'; // Changer ici
  this.currencySymbol = 'F';
  this.currencyRate = 1; // Si conversion nécessaire
}
```

### Exercice fiscal différent

```javascript
// Configuration de l'année fiscale:
const financeSystem = new FinanceSystem('school_001', 'Mon École');
financeSystem.currentYear = 2024; // Défaut 2025

// Ou dynamiquement:
function setFiscalYear(year) {
  financeSystem.currentYear = year;
  // Recharger les rapports
}
```

---

## 📱 Déploiement

### Sur un serveur web

#### 1. Via FTP
```bash
# Télécharger tous les fichiers:
- finance-dashboard-pro.html
- finance-system-integration.html
- modules/ (dossier complet)
- GUIDE_FINANCE_COMPLETE.md
- DEMARRAGE_RAPIDE_FINANCE.md

# Vers votre serveur:
ftp://votre-domaine.com/neoclass/
```

#### 2. Configurer l'URL
```
https://votre-domaine.com/neoclass/finance-dashboard-pro.html
```

### Sur un serveur VPS

#### Avec Node.js
```bash
# 1. Installer Node.js
sudo apt-get install nodejs npm

# 2. Créer un dossier
mkdir -p /var/www/neoclass
cd /var/www/neoclass

# 3. Copier les fichiers
scp -r ~/neoclass/* user@server:/var/www/neoclass/

# 4. Installer dépendances
npm init -y
npm install express cors body-parser

# 5. Créer server.js
cat > server.js << 'EOF'
const express = require('express');
const app = express();

app.use(express.static('.'));
app.listen(3000, () => console.log('Server running on port 3000'));
EOF

# 6. Démarrer
node server.js
```

### Sur un cloud (AWS, Heroku, etc.)

#### AWS S3 + CloudFront
```bash
# Créer un bucket S3
aws s3 mb s3://neoclass-finance

# Uploader les fichiers
aws s3 cp . s3://neoclass-finance --recursive

# Configurer CloudFront pour HTTPS
# URL: https://votre-cdn.cloudfront.net/finance-dashboard-pro.html
```

---

## 🔍 Vérification de l'installation

### Checklist
```
✓ Tous les fichiers sont présents
✓ Le HTML s'ouvre sans erreur
✓ Les modules JS se chargent
✓ Les données de démo s'affichent
✓ Le dashboard est réactif
✓ Les modales fonctionnent
✓ Les formulaires valident
✓ Les permissions sont vérifiées
✓ Les rapports se génèrent
```

### Tests dans la console
```javascript
// Ouvrir F12 > Console

// Test 1: Vérifier le système
console.log(financeSystem);
// Doit afficher: NeoclassFinanceSystem {...}

// Test 2: Vérifier les données
console.table(financeSystem.roles.members);
// Doit afficher les 4-6 membres

// Test 3: Vérifier les opérations
console.table(financeSystem.operations.operations);
// Doit afficher les opérations

// Test 4: Tester une action
const income = financeSystem.recordIncome({
  date: '2025-05-20',
  amount: 1000000,
  category: 'scolarite',
  description: 'Test'
});
console.log(income);
// Doit créer l'opération sans erreur
```

---

## 🐛 Dépannage d'installation

### Erreur: "Finance system not found"
```javascript
// S'assurer que tous les modules sont chargés:
// 1. Vérifier l'ordre des scripts
// 2. Attendre le chargement complet
// 3. Utiliser setTimeout si nécessaire

setTimeout(() => {
  financeSystem.login('member_1');
}, 500);
```

### Erreur: "localStorage not available"
```javascript
// Safari privée ou navigateur bloqué
// Solution: Utiliser sessionStorage ou IndexedDB

// Ou ajouter un fallback:
const storage = {
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch(e) {
      console.warn('localStorage unavailable, using memory');
    }
  }
};
```

### Données perdues après rechargement
```javascript
// Vérifier que localStorage est activé
// Dans la console:
localStorage.setItem('test', 'value');
console.log(localStorage.getItem('test')); // Doit afficher 'value'

// Si vide, forcer la sauvegarde:
financeSystem.roles.saveMembersToDB();
financeSystem.operations.saveOperations();
financeSystem.budgets.saveBudgets();
```

---

## 📊 Performance et optimisation

### Optimiser le chargement
```html
<!-- Charger les modules de façon asynchrone -->
<script async src="modules/RoleManager.js"></script>
<script async src="modules/FinanceOperationManager.js"></script>
<script async src="modules/BudgetManager.js"></script>
<script async src="modules/FinancialReportGenerator.js"></script>
<script defer src="modules/NeoclassFinanceSystem.js"></script>
```

### Cache des données
```javascript
// Ajouter un système de cache:
const cache = {
  data: {},
  set(key, value, ttl = 3600000) { // 1 heure par défaut
    cache.data[key] = {
      value,
      expires: Date.now() + ttl
    };
  },
  get(key) {
    const item = cache.data[key];
    if (!item) return null;
    if (Date.now() > item.expires) {
      delete cache.data[key];
      return null;
    }
    return item.value;
  }
};
```

---

## ✅ Post-installation

### Actions recommandées
1. ✅ Lire le DEMARRAGE_RAPIDE_FINANCE.md
2. ✅ Ajouter vos utilisateurs
3. ✅ Configurer votre école
4. ✅ Tester avec des données réelles
5. ✅ Sauvegarde régulière
6. ✅ Former votre équipe
7. ✅ Mettre en place les backups

---

## 📞 Support

- Documentation: GUIDE_FINANCE_COMPLETE.md
- Quick start: DEMARRAGE_RAPIDE_FINANCE.md
- Dépannage: Ce guide
- Email: support@neoclass.edu

---

**Installation complète et système prêt!** 🎉

Pour plus d'informations, consultez la documentation complète.
