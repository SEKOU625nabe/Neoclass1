# ✅ CHECKLIST NETLIFY - PRÊT À DÉPLOYER

**Objectif**: Déployer Neoclass sur Netlify en 15 minutes  
**Checklist**: 8 étapes seulement

---

## ✅ CHECKLIST COMPLÈTE

### ÉTAPE 1: Configuration Locale (2 min)
```
☐ Créer .env.example
☐ Créer .gitignore (avec .env)
☐ Créer config-handler.js
☐ Créer netlify.toml
```

**Commandes**:
```bash
cd c:\Users\HP\Desktop\neoclass

# Ajouter à .gitignore
echo ".env" >> .gitignore
echo "node_modules/" >> .gitignore
echo "*.log" >> .gitignore

# Commit
git add .
git commit -m "Setup Netlify deployment"
```

---

### ÉTAPE 2: GitHub Repository (3 min)
```
☐ Créer repo GitHub
☐ Ajouter remote origin
☐ Push code sur GitHub
```

**Commandes**:
```bash
git remote add origin https://github.com/VOTRE_USERNAME/neoclass.git
git branch -M main
git push -u origin main
```

---

### ÉTAPE 3: Compte Netlify (2 min)
```
☐ Créer compte Netlify (gratuit)
☐ Connecter GitHub account
☐ Vérifier connexion
```

**URL**: https://netlify.com → Sign Up → GitHub

---

### ÉTAPE 4: Connecter Repository (3 min)
```
☐ Netlify Dashboard → New site
☐ Import from GitHub
☐ Sélectionner repository: neoclass
☐ Vérifier build settings
```

**Build Settings**:
```
Build command: (laisser vide pour site statique)
Publish directory: . (racine du projet)
```

---

### ÉTAPE 5: Ajouter Variables d'Env (3 min)
```
☐ Netlify Dashboard → Site settings
☐ Build & deploy → Environment
☐ Ajouter toutes les variables
```

**Variables à ajouter**:

| Clé | Valeur |
|-----|--------|
| `VITE_FIREBASE_API_KEY` | (votre clé Firebase) |
| `VITE_FIREBASE_PROJECT_ID` | `neoclass-73b86` |
| `VITE_MISTRAL_API_KEY` | `hFRgf0WjvZ6AjYu30LpHc2UxxK74IU9GG` |
| `VITE_MISTRAL_AGENT_ID` | `ag_019cd3825811734e9e4211f15d53c211` |
| `VITE_APP_ENV` | `production` |
| `NODE_ENV` | `production` |

---

### ÉTAPE 6: Déployer (1 min)
```
☐ Cliquer "Deploy site"
☐ Attendre déploiement (~2-5 min)
☐ ✅ "Deploy successful!"
```

---

### ÉTAPE 7: Tester (2 min)
```
☐ Ouvrir URL déployée
☐ Tester sur Desktop (F12 DevTools)
☐ Tester sur Mobile (téléphone)
☐ Vérifier console: pas d'erreurs
```

**Checklist test**:
- [ ] Page charge rapidement
- [ ] Menu visible
- [ ] Admin accessible
- [ ] Tarifs s'affichent
- [ ] Pas d'erreur CORS
- [ ] Mistral API fonctionne

---

### ÉTAPE 8: Custom Domain (Optionnel)
```
☐ Netlify Dashboard → Domain settings
☐ Add custom domain
☐ Configurer DNS (si domaine externe)
```

**Exemple**:
```
neoclass.netlify.app → neoclass.com
```

---

## 📊 RÉSUMÉ FICHIERS

### Fichiers CRÉÉS (À committer)
```
✅ .env.example
✅ .gitignore
✅ netlify.toml
✅ config-handler.js
✅ netlify/functions/mistral-api.js
```

### Fichiers À NE PAS committer
```
❌ .env (local uniquement)
❌ node_modules/
❌ Firebase credentials
```

### Fichiers EXISTANTS (À jour)
```
✅ Neoclass3.html
✅ pricing-display.html
✅ pricing-system-pro.js
✅ (Tous autres fichiers)
```

---

## 🚀 DÉPLOIEMENT RAPIDE (TLDR)

```bash
# 1. Setup local
echo ".env" >> .gitignore
git add . && git commit -m "Netlify setup"

# 2. Push GitHub
git push origin main

# 3. Netlify Dashboard
# - New site → GitHub → neoclass repo
# - Build: (vide)
# - Publish: .
# - Environment vars: AJOUTER

# 4. Redeploy
# Netlify Dashboard → Deploys → Trigger deploy

# 5. Vérifier
# https://neoclass.netlify.app
```

---

## 🔐 SÉCURITÉ CHECKLIST

```
✅ Clés API dans .env
✅ .env dans .gitignore
✅ Netlify UI pour prod keys
✅ Proxy API pour Mistral (caché)
✅ Headers de sécurité (netlify.toml)
✅ CORS configuré
✅ CSP (Content Security Policy)
```

---

## 📞 TROUBLESHOOTING RAPIDE

### Site montre "Not Found"
→ Ajouter dans netlify.toml:
```toml
[[redirects]]
  from = "/*"
  to = "/Neoclass3.html"
  status = 200
```

### Variables d'env non chargées
→ Redeploy: Netlify Dashboard → Deploys → Trigger deploy

### Mistral API erreur
→ Vérifier clé API dans Netlify UI  
→ Tester proxy: `fetch('/.netlify/functions/mistral-api', ...)`

### Responsive ne marche pas
→ Vérifier breakpoints CSS dans Neoclass3.html  
→ F12 DevTools → Toggle device toolbar

---

## ✨ VOS URLS FINALES

```
🌐 https://neoclass.netlify.app     (Auto-généré)
🌐 https://neoclass.com              (Custom - si configuré)
```

---

## 📋 RESSOURCES

| Ressource | URL |
|-----------|-----|
| **Netlify Docs** | https://docs.netlify.com |
| **Netlify CLI** | `npm install -g netlify-cli` |
| **Custom Domain** | https://docs.netlify.com/domains-https/custom-domains |
| **Environment Vars** | https://docs.netlify.com/configure-builds/environment-variables |
| **Functions** | https://docs.netlify.com/functions/overview |

---

## 🎉 BRAVO!

Vous avez maintenant:
✅ Configuration locale sécurisée  
✅ Repository GitHub setupé  
✅ Netlify connecté  
✅ Déploiement automatique  
✅ Variables d'env protégées  
✅ Site responsive  
✅ API sécurisée (proxy)  

---

**Status**: ✅ Prêt à déployer  
**Temps total**: ~15 minutes

