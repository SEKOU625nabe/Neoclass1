# 🛡️ Guide des Corrections de Sécurité — Neoclass

## 📋 Fichiers à remplacer dans ton projet

| Fichier corrigé         | Remplace                  | Faille corrigée                          |
|-------------------------|---------------------------|------------------------------------------|
| `constants.js`          | `constants.js`            | 🔴 Clé Agent ID retirée du frontend     |
| `security-middleware.js`| `security-middleware.js`  | 🔴 Vérification Firebase Admin réelle   |
| `ai.js`                 | `ai.js`                   | 🔴 Rate limiting + validation images    |
| `sanitize.js`           | *(nouveau fichier)*       | 🟡 Protection XSS sur contenu cours     |
| `firestore.rules`       | `firestore.rules`         | 🟡 Règles strictes par rôle/classe      |
| `.env.example`          | `.env.example`            | 📋 Toutes les variables nécessaires      |

---

## 🚀 Étapes d'installation

### 1. Mettre à jour le .env
```bash
cp .env.example .env
# Remplir les valeurs Firebase et Mistral
```

### 2. Installer les nouvelles dépendances
```bash
npm install firebase-admin isomorphic-dompurify jsdom
```

### 3. Remplacer les fichiers
```bash
# Copier les fichiers corrigés dans ton projet
cp fixes/constants.js ./constants.js
cp fixes/security-middleware.js ./security-middleware.js
cp fixes/ai.js ./ai.js
cp fixes/sanitize.js ./sanitize.js       # nouveau fichier
cp fixes/firestore.rules ./firestore.rules
```

### 4. Ajouter sanitize dans course-publication.js
```js
// En haut du fichier :
const { sanitizeMiddleware } = require('./sanitize');

// Sur chaque route de publication :
router.post('/publish/course', authenticate, sanitizeMiddleware, async (req, res) => {
  // ... ton code existant
});
```

### 5. Déployer les règles Firestore
```bash
firebase deploy --only firestore:rules
```

### 6. Vérifier que .env est dans .gitignore
```bash
echo ".env" >> .gitignore
```

---

## ✅ Vérification finale

```bash
# Tester que l'IA répond
curl -X POST http://localhost:3001/api/darx \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Bonjour", "userContext": {"subscription": "FREE"}}'

# Tester le health check
curl http://localhost:3001/api/health
```

---

## 🔴 Points critiques à ne JAMAIS oublier

1. **Ne jamais mettre MISTRAL_AGENT_ID dans le frontend** (HTML, JS côté client)
2. **Ne jamais commiter .env sur GitHub** (.gitignore obligatoire)
3. **Les NabeCoins ne se modifient que côté serveur** (règle Firestore : `allow write: if false`)
4. **Le rate limit est par utilisateur UID** — pas par IP (un VPN ne contourne pas la limite)
