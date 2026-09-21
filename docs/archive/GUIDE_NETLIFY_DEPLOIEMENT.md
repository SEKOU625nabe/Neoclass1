# 🚀 DÉPLOIEMENT NETLIFY - GUIDE COMPLET

**Objectif**: Héberger Neoclass sur Netlify (responsive + sécurisé)  
**Durée**: 15-20 minutes  
**Difficulté**: 🟡 Moyen

---

## 📋 TABLE DES MATIÈRES

1. [Préparation locale](#preparation)
2. [Configuration Netlify](#netlify-config)
3. [Variables d'environnement](#env)
4. [Déploiement](#deploy)
5. [Test & Validation](#test)
6. [Troubleshooting](#troubleshoot)

---

## 🔧 PRÉPARATION LOCALE {#preparation}

### Étape 1: Créer fichier `.env.example`

**Créer**: `c:\Users\HP\Desktop\neoclass\.env.example`

```env
# ============================================================
# FIREBASE CONFIG
# ============================================================
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=neoclass-73b86.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=neoclass-73b86
VITE_FIREBASE_STORAGE_BUCKET=neoclass-73b86.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
VITE_FIREBASE_APP_ID=xxx

# ============================================================
# AI / MISTRAL API
# ============================================================
VITE_MISTRAL_API_KEY=hFRgf0WjvZ6AjYu30LpHc2UxxK74IU9GG
VITE_MISTRAL_AGENT_ID=ag_019cd3825811734e9e4211f15d53c211
VITE_MISTRAL_API_URL=https://api.mistral.ai/v1/conversations

# ============================================================
# APP CONFIG
# ============================================================
VITE_APP_NAME=Neoclass
VITE_APP_VERSION=2.0.0
VITE_APP_ENV=production
VITE_API_BASE_URL=https://neoclass.netlify.app
```

**Importer dans Neoclass3.html** (avant Firebase init):
```html
<!-- À ajouter dans <head> -->
<script>
  // Charger config depuis .env
  const config = {
    firebase: {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    },
    mistral: {
      apiKey: import.meta.env.VITE_MISTRAL_API_KEY,
      agentId: import.meta.env.VITE_MISTRAL_AGENT_ID,
      apiUrl: import.meta.env.VITE_MISTRAL_API_URL
    }
  };
</script>
```

### Étape 2: Créer `.gitignore`

```
# Environment variables
.env
.env.local
.env.*.local

# Dependencies
node_modules/
/.pnp

# Build
/dist
/build

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*

# Credentials (NE JAMAIS commit!)
firebase-credentials.json
service-account.json
signing_config.json
```

### Étape 3: Créer `netlify.toml`

**Créer**: `c:\Users\HP\Desktop\neoclass\netlify.toml`

```toml
# ============================================================
# NETLIFY BUILD & DEPLOY CONFIG
# ============================================================

[build]
  command = "npm run build"
  publish = "dist"
  # Si pas de build, servir fichiers statiques
  # publish = "."

[build.environment]
  # Node version
  NODE_VERSION = "18.17.0"

# ============================================================
# REDIRECTS & REWRITES
# ============================================================

[[redirects]]
  from = "/*"
  to = "/Neoclass3.html"
  status = 200

# ============================================================
# HEADERS (Sécurité)
# ============================================================

[[headers]]
  for = "/*"
  [headers.values]
    X-Content-Type-Options = "nosniff"
    X-Frame-Options = "SAMEORIGIN"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/api/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
    Access-Control-Allow-Methods = "GET, POST, PUT, DELETE"
    Access-Control-Allow-Headers = "Content-Type, Authorization"

# ============================================================
# FUNCTIONS (Serverless - optionnel)
# ============================================================

[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"

# ============================================================
# ENV VARIABLES (À configurer dans Netlify UI)
# ============================================================

[env.production]
  environment = "production"

[env.staging]
  environment = "staging"
```

---

## 🌐 CONFIGURATION NETLIFY {#netlify-config}

### Étape 1: Créer Compte Netlify

1. Allez: [netlify.com](https://netlify.com)
2. **Sign Up** (gratuit)
3. Connectez-vous avec GitHub (recommandé)

### Étape 2: Créer Git Repository

**Créer repo GitHub**:
1. Allez: [github.com/new](https://github.com/new)
2. **Repository name**: `neoclass` (ou autre)
3. **Description**: `Neoclass - Platform éducative`
4. **Public** ou **Private** (sécurisé)
5. **Create repository**

**Ajouter au repo local**:
```bash
cd c:\Users\HP\Desktop\neoclass

# Initialiser Git
git init
git add .
git commit -m "Initial commit - Neoclass v2.0"

# Ajouter remote
git remote add origin https://github.com/VOTRE_USERNAME/neoclass.git
git branch -M main
git push -u origin main
```

### Étape 3: Déployer sur Netlify

**Option 1: Via Netlify UI** (Recommandé pour débuter)

1. Allez: [Netlify Dashboard](https://app.netlify.com)
2. **Add new site** → **Import an existing project**
3. Choisissez **GitHub**
4. Sélectionnez votre repository `neoclass`
5. **Build settings**:
   - Build command: `npm run build` (ou `npm install && npm start`)
   - Publish directory: `dist` (ou laissez vide si pas de build)
6. **Deploy site**

**Option 2: Via CLI** (Plus rapide pour développeurs)

```bash
npm install -g netlify-cli

netlify init
# Répondre aux questions:
# - Create new site? Yes
# - Team? Personal
# - Site name? neoclass
# - Build command? npm run build
# - Directory to publish? dist (ou . si pas de build)

netlify deploy --prod
```

---

## 🔐 VARIABLES D'ENVIRONNEMENT {#env}

### Étape 1: Ajouter Variables dans Netlify

**Netlify Dashboard** → **Site settings** → **Build & deploy** → **Environment**

Ajouter variables:

```
Key: VITE_FIREBASE_API_KEY
Value: [Votre clé Firebase]

Key: VITE_FIREBASE_PROJECT_ID
Value: neoclass-73b86

Key: VITE_MISTRAL_API_KEY
Value: hFRgf0WjvZ6AjYu30LpHc2UxxK74IU9GG

Key: VITE_MISTRAL_AGENT_ID
Value: ag_019cd3825811734e9e4211f15d53c211

Key: VITE_APP_ENV
Value: production
```

### Étape 2: Protéger les Clés API

#### **Option 1: Netlify Functions** (RECOMMANDÉ) ✅

**Créer**: `c:\Users\HP\Desktop\neoclass\netlify\functions\mistral-api.js`

```javascript
// Proxy Netlify pour Mistral API
// Cela cache la clé API du client

const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  const { method, body, headers } = event;

  try {
    const response = await fetch('https://api.mistral.ai/v1/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VITE_MISTRAL_API_KEY}`
      },
      body: body
    });

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
```

**Utiliser dans Neoclass3.html**:
```javascript
// Au lieu d'utiliser l'API directement
// const response = await fetch('https://api.mistral.ai/v1/conversations', {...});

// Utiliser le proxy Netlify
const response = await fetch('/.netlify/functions/mistral-api', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({...})
});
```

#### **Option 2: Variables d'environnement Netlify** ✅

**Dans Netlify Dashboard**:

```
Site settings → Build & deploy → Environment
→ Add environment variables
```

Ajouter:
- `VITE_MISTRAL_API_KEY`
- `VITE_FIREBASE_API_KEY`
- Etc.

**Dans Neoclass3.html**:
```javascript
// Les variables sont disponibles à build time
const mistralKey = process.env.VITE_MISTRAL_API_KEY;
const firebaseKey = process.env.VITE_FIREBASE_API_KEY;
```

#### **Option 3: Netlify Secrets** (Plus sûr) ✅

```toml
# netlify.toml
[env.production]
  VITE_MISTRAL_API_KEY = "@vite_mistral_api_key"
  VITE_FIREBASE_API_KEY = "@vite_firebase_api_key"
```

**Dans Netlify Dashboard**:
```
Site settings → Build & deploy → Environment
→ Sensitive information (Encrypted)
→ Add variables
```

---

## 📦 STRUCTURE À HÉBERGER {#structure}

### Ce qu'il faut héberger (Option A - Recommandé)

```
Héberger sur Netlify:
│
├── Neoclass3.html              ✅ (Main app)
├── pricing-display.html        ✅ (Pricing page)
├── admin-pricing-panel.html    ✅ (Admin panel)
├── *.js files:
│   ├── pricing-system-pro.js   ✅
│   ├── finance-system.js       ✅
│   ├── gamification.js         ✅
│   └── Tous les autres .js     ✅
├── netlify.toml                ✅ (Config)
├── netlify/functions/          ✅ (API proxy)
└── .env (JAMAIS commit!)       ❌
```

### Ce qu'il ne faut PAS héberger

```
NE PAS héberger:
├── .env                        ❌ (Contient clés API)
├── .git/                       ❌ (Historique Git)
├── node_modules/               ❌ (Trop gros)
├── FIREBASE_CONFIG.js          ⚠️  (Verifier)
├── Service Account JSON        ❌ (Credentials)
├── /mobile-app/                ⚠️  (Si publi sur Play Store)
└── /Configurations privées/    ❌
```

---

## 🚀 DÉPLOIEMENT ÉTAPE PAR ÉTAPE {#deploy}

### Étape 1: Préparer le code

```bash
cd c:\Users\HP\Desktop\neoclass

# Vérifier .gitignore
cat .gitignore

# S'assurer .env n'est pas committé
git rm --cached .env 2>/dev/null
echo ".env" >> .gitignore

# Ajouter et commit
git add .
git commit -m "Prepare for Netlify deployment"
git push origin main
```

### Étape 2: Créer netlify.toml

✅ Déjà fourni ci-dessus (Section "Configuration Netlify")

### Étape 3: Configuration Netlify Dashboard

**Netlify Dashboard** → **Team overview** → **Add new site** → **Import an existing project**

```
1. GitHub
2. Select repository: neoclass
3. Build settings:
   - Branch: main
   - Build command: (laisser vide - site statique)
   - Publish directory: . (racine du projet)
4. Environment variables:
   - Ajouter VITE_MISTRAL_API_KEY
   - Ajouter VITE_FIREBASE_API_KEY
   - Etc.
5. Deploy site
```

### Étape 4: Vérifier Déploiement

Une fois déployé:
- ✅ URL: `https://neoclass.netlify.app` (ou votre nom)
- ✅ Voir logs: Netlify Dashboard → Deploys → logs
- ✅ Test sur mobile: Ouvrir URL sur téléphone

### Étape 5: Setup Custom Domain (optionnel)

```
Netlify Dashboard → Domain settings → Add custom domain
Exemple: neoclass.com ou neoclass.me
```

---

## ✅ RESPONSIVE & OPTIMISATION {#test}

### Vérifier Responsive

**Neoclass3.html utilise déjà**:
```css
/* Breakpoints pour mobile/tablet/desktop */
@media (max-width: 768px) { /* Mobile */ }
@media (max-width: 1024px) { /* Tablet */ }
@media (min-width: 1025px) { /* Desktop */ }
```

**Tester sur**:
1. 📱 Chrome DevTools (F12 → Toggle device toolbar)
2. 📱 Accès réel téléphone: `https://neoclass.netlify.app`
3. 💻 Desktop: Normal

### Performance Check

**Netlify Analytics**:
```
Netlify Dashboard → Analytics
├─ Page views
├─ Unique visitors
├─ Top pages
└─ Performance metrics
```

**Web Performance**:
```
Tester: https://pagespeed.web.dev
Insérer: https://neoclass.netlify.app
```

---

## 📊 FICHIERS FINAUX À HÉBERGER

### Structure Git à committer

```
neoclass/
├── .gitignore                  ✅ (Commit)
├── netlify.toml                ✅ (Commit)
├── .env.example                ✅ (Commit)
├── Neoclass3.html              ✅ (Commit)
├── pricing-display.html        ✅ (Commit)
├── *.js files                  ✅ (Commit)
├── netlify/
│   └── functions/
│       └── mistral-api.js      ✅ (Commit)
└── README.md                   ✅ (Commit)
```

### Variables à configurer dans Netlify UI

```
VITE_MISTRAL_API_KEY = "hFRgf0WjvZ6AjYu30LpHc2UxxK74IU9GG"
VITE_MISTRAL_AGENT_ID = "ag_019cd3825811734e9e4211f15d53c211"
VITE_FIREBASE_API_KEY = "[Your key]"
VITE_FIREBASE_PROJECT_ID = "neoclass-73b86"
VITE_APP_ENV = "production"
```

---

## 🐛 TROUBLESHOOTING {#troubleshoot}

### ❌ Erreur: "Site deploy failed"

**Solution**:
```
1. Netlify Dashboard → Deploys → Failed deploy
2. Cliquer sur deploy → Voir logs
3. Chercher l'erreur
4. Fix + Push to GitHub
5. Redeploy automatique
```

### ❌ API Mistral ne fonctionne pas

**Solution**:
```javascript
// Problème: Clé API exposed au client
// Solution: Utiliser Netlify Functions (proxy)

// Au lieu de:
const response = await fetch('https://api.mistral.ai/v1/conversations', {
  headers: { 'Authorization': 'Bearer ' + API_KEY }
});

// Utiliser:
const response = await fetch('/.netlify/functions/mistral-api', {
  method: 'POST',
  body: JSON.stringify({...})
});
```

### ❌ Variables d'env non chargées

**Solution**:
```
1. Netlify Dashboard → Build & deploy → Environment
2. Vérifier variables ajoutées
3. Trigger redeploy: Deploys → Trigger deploy
```

### ❌ Site montre "Not found"

**Solution**:
```toml
# netlify.toml - Ajouter redirect
[[redirects]]
  from = "/*"
  to = "/Neoclass3.html"
  status = 200
```

---

## 🎯 CHECKLIST DE DÉPLOIEMENT

### Avant Deploy
- [ ] Créer .env.example
- [ ] Créer .gitignore
- [ ] Créer netlify.toml
- [ ] Créer Netlify Functions (API proxy)
- [ ] Tester localement: `npm start` ou ouvrir HTML

### Deploy GitHub
- [ ] Git init/add/commit/push
- [ ] Repository public ou private

### Netlify Setup
- [ ] Compte Netlify créé
- [ ] Repository connecté
- [ ] Build settings configurés
- [ ] Variables d'env ajoutées
- [ ] Déploiement réussi ✅

### Post-Deploy
- [ ] Tester sur desktop
- [ ] Tester sur mobile
- [ ] Tester API Mistral
- [ ] Tester Firebase
- [ ] Vérifier performance
- [ ] Configurer domain (optionnel)

---

## 📞 SUPPORT NETLIFY

**Problèmes déploiement**:
→ [Netlify Docs](https://docs.netlify.com)

**Netlify Support**:
→ [support.netlify.com](https://support.netlify.com)

**Community**:
→ [Netlify Community](https://community.netlify.com)

---

## 🚀 URL FINALE

Une fois déployé:
```
🌐 https://neoclass.netlify.app
```

**Ou votre domain custom** (si configuré):
```
🌐 https://neoclass.com
```

---

## 📋 RÉSUMÉ COMPLET

| Étape | Durée | Actions |
|-------|-------|---------|
| 1. Préparer code | 5 min | .env, .gitignore, netlify.toml |
| 2. GitHub Setup | 5 min | Créer repo + push code |
| 3. Netlify Setup | 5 min | Connecter repo + configure |
| 4. Variables | 5 min | Ajouter env variables |
| 5. Deploy | < 1 min | Click "Deploy" |
| 6. Test | 5 min | Tester desktop + mobile |

**Total**: ~25 minutes

---

**Version**: 1.0  
**Status**: ✅ Complet  
**Date**: 24 janvier 2025

