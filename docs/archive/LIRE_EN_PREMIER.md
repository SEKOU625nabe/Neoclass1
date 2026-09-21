# 🛠️ Guide des corrections — Neoclass v4.0
# Lis ce fichier EN PREMIER, il te dit exactement quoi faire et où

## 📁 Fichiers de correction fournis

| Fichier correction         | Faille résolue                              |
|----------------------------|---------------------------------------------|
| CORRECTION_1_server.js     | CORS wildcard + XSS non connecté            |
| CORRECTION_2_subscription-system.js | `admin` non importé → crash       |
| CORRECTION_3_payment.js    | Tokens paiement dans le frontend            |
| CORRECTION_4_xss-vies-darx-cors.js  | XSS, vies client, darx, CORS gamif |

---

## 🔴 CORRECTION 1 — server.js
**Fichier à modifier :** `server.js`
**Ouvre le fichier et fais 3 modifications :**

### 1.1 — Ligne ~35 (après les autres require)
```js
// AJOUTER cette ligne
const { sanitizeMiddleware } = require('./sanitize');
```

### 1.2 — Ligne ~110 (bloc CORS)
Cherche `const allowedOrigins =` et remplace TOUT le bloc `app.use(cors({...}))` par le code dans `CORRECTION_1_server.js`.

### 1.3 — Lignes ~285, ~295, ~305 (3 routes publish)
Sur chacune des 3 routes `app.post('/api/publish/...')`, ajoute `sanitizeMiddleware,` après `requirePublisherRole,` :
```js
app.post('/api/publish/course',
  securityMiddleware.authenticateUser,
  requirePublisherRole,
  sanitizeMiddleware,    // ← AJOUTER ICI
  async (req, res) => { ... }
);
```
Faire pareil pour `/api/publish/module` et `/api/publish/lesson`.

---

## 🔴 CORRECTION 2 — subscription-system.js
**Fichier à modifier :** `subscription-system.js`
**1 seule modification :**

### 2.1 — Toute première ligne du fichier (avant `const express = require(...)`)
Copie-colle TOUT le bloc du fichier `CORRECTION_2_subscription-system.js` en toute première position.

---

## 🔴 CORRECTION 3 — neoclass-payment.html + server.js
**Fichiers à modifier :** `neoclass-payment.html` ET `server.js`

### 3.1 — Dans neoclass-payment.html (ligne ~620)
Cherche `async function apiOrange(p){` — sélectionne TOUTE la fonction jusqu'à son `}` fermant.
Remplace par la version dans `CORRECTION_3_payment.js` (section PARTIE A — apiOrange).

Cherche `async function apiMTN(p){` — même chose.
Remplace par la version dans `CORRECTION_3_payment.js` (section PARTIE A — apiMTN).

### 3.2 — Dans server.js
Cherche le commentaire :
```
// ============================================================
// 💎 ROUTES PROTÉGÉES - ABONNEMENT
```
Juste AVANT ce bloc, colle toute la section `PARTIE B` du fichier `CORRECTION_3_payment.js`.

### 3.3 — Dans .env
Ajoute ces 5 lignes à la fin de ton fichier `.env` :
```
ORANGE_ACCESS_TOKEN=ton_token_orange_ici
ORANGE_MERCHANT_KEY=ta_merchant_key_ici
MTN_ACCESS_TOKEN=ton_token_mtn_ici
MTN_SUBSCRIPTION_KEY=ta_subscription_key_ici
BACKEND_URL=https://api.neoclass.gn
```

---

## 🟠 CORRECTION 4 — 4 fichiers différents

### 4A — premium-ux.js
Ajoute la fonction `_esc()` en toute première ligne du fichier (avant `const PremiumUX`).
Ensuite remplace les templates HTML de `getLockedContentCard` et `getUnlockedContentCard` par les versions du fichier `CORRECTION_4_xss-vies-darx-cors.js` (section 4A).

### 4B — firestore.rules
Cherche la règle `allow update:` dans le bloc `match /users/{userId}` (la version pour l'utilisateur normal — PAS celle pour l'admin).
Ajoute les 3 lignes `lives`, `nabeCoins`, `xp` comme montré dans la section 4B.
**Ensuite :** `firebase deploy --only firestore:rules`

### 4C — netlify/functions/darx.js
Cherche `if (!prompt)` (ligne ~35 environ).
Remplace ce bloc par la version de la section 4C qui ajoute la limite de 2000 caractères.

### 4D — gamification.js
Cherche `app.use(cors());` (ligne 8).
Remplace par la version de la section 4D.

---

## ✅ Ordre recommandé d'application

```
1. subscription-system.js  (correction simple, 1 ajout en haut)
2. server.js               (3 petites modifications)
3. firestore.rules         (1 ligne à modifier) → firebase deploy
4. gamification.js         (1 ligne à modifier)
5. darx.js                 (1 bloc à remplacer)
6. premium-ux.js           (ajouter _esc + modifier 2 fonctions)
7. neoclass-payment.html   (remplacer 2 fonctions)
8. .env                    (ajouter 5 variables)
```

## ✅ Vérification finale après les corrections

```bash
# 1. Tester le serveur
curl http://localhost:3000/api/health

# 2. Tester que l'IA répond
curl -X POST http://localhost:3001/api/darx \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Bonjour", "userContext": {"subscription": "FREE"}}'

# 3. Vérifier les règles Firestore
firebase deploy --only firestore:rules

# 4. Vérifier que .env n'est pas dans git
git status  # .env ne doit pas apparaître
```
