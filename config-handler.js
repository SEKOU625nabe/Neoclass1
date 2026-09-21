# 🔐 INTÉGRER LES VARIABLES D'ENV DANS NEOCLASS3.HTML

**Objectif**: Charger config depuis variables d'env (.env) de manière SÉCURISÉE  
**Durée**: 10 minutes  
**Difficulté**: 🟡 Moyen

---

## 🎯 APPROCHE RECOMMANDÉE

### 3 Niveaux de Sécurité

```
Niveau 1: DÉVELOPPEMENT LOCAL
  Variables .env → Code source (OK localement)
  
Niveau 2: PRODUCTION NETLIFY
  Variables Netlify UI → Build time → Code minifié (OK)
  
Niveau 3: API SENSIBLE (Mistral)
  Proxy Netlify Function → Caché backend (TRÈS BON)
```

---

## 📝 ÉTAPE 1: CRÉER CONFIG HANDLER

**Créer fichier**: `c:\Users\HP\Desktop\neoclass\config-handler.js`

```javascript
/**
 * 🔧 CONFIG HANDLER
 * Charge la configuration depuis:
 * 1. Variables d'env (production)
 * 2. Fichier .env (développement)
 */

const CONFIG = {
  // ============================================================
  // FIREBASE
  // ============================================================
  firebase: {
    apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || 'AIzaSyDfhRXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || 'neoclass-73b86.firebaseapp.com',
    projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || 'neoclass-73b86',
    storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || 'neoclass-73b86.appspot.com',
    messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
    appId: import.meta.env?.VITE_FIREBASE_APP_ID || '1:123456789:web:xxxxx'
  },

  // ============================================================
  // MISTRAL AI (VIA PROXY NETLIFY)
  // ============================================================
  mistral: {
    // ✅ API Key JAMAIS exposée au client!
    // Au lieu de: const key = import.meta.env.VITE_MISTRAL_API_KEY
    // Utiliser le proxy Netlify Function
    apiUrl: import.meta.env?.VITE_MISTRAL_API_URL || 'https://api.mistral.ai/v1/conversations',
    agentId: import.meta.env?.VITE_MISTRAL_AGENT_ID || 'ag_019e93673fb171c889fb4c2c6bd32176',
    
    // URL du proxy local
    proxyUrl: '/.netlify/functions/mistral-api' // ← SÉCURISÉ!
  },

  // ============================================================
  // APP CONFIG
  // ============================================================
  app: {
    name: import.meta.env?.VITE_APP_NAME || 'Neoclass',
    version: import.meta.env?.VITE_APP_VERSION || '2.0.0',
    env: import.meta.env?.VITE_APP_ENV || 'development',
    apiBase: import.meta.env?.VITE_API_BASE_URL || 'http://localhost:3000'
  },

  // ============================================================
  // LOGGING & DEBUG
  // ============================================================
  debug: {
    enabled: import.meta.env?.VITE_DEBUG_MODE === 'true' || false,
    logLevel: import.meta.env?.VITE_LOG_LEVEL || 'info'
  }
};

/**
 * Logger avec niveau
 */
function log(level, message, data = null) {
  const timestamp = new Date().toLocaleTimeString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  
  if (CONFIG.debug.enabled) {
    console.log(`${prefix} ${message}`, data || '');
  }
}

/**
 * Valider config Firebase
 */
function validateFirebaseConfig() {
  const { apiKey, projectId } = CONFIG.firebase;
  
  if (!apiKey || apiKey.includes('xxx')) {
    log('warn', '❌ Firebase API Key manquante ou invalide!');
    return false;
  }
  
  if (!projectId) {
    log('warn', '❌ Firebase Project ID manquant!');
    return false;
  }
  
  log('info', '✅ Firebase config validée');
  return true;
}

/**
 * Appeler Mistral AI via proxy SÉCURISÉ
 */
async function callMistralAPI(payload) {
  try {
    log('info', 'Appel Mistral API via proxy', payload);
    
    const response = await fetch(CONFIG.mistral.proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    log('info', '✅ Mistral API réponse reçue');
    return data;
    
  } catch (error) {
    log('error', '❌ Mistral API erreur', error);
    throw error;
  }
}

// Exporter la config
window.CONFIG = CONFIG;
window.log = log;
window.validateFirebaseConfig = validateFirebaseConfig;
window.callMistralAPI = callMistralAPI;

/**
 * UTILISATION DANS NEOCLASS3.HTML
 * ═════════════════════════════════
 * 
 * // 1. Importer ce fichier dans <head>
 * <script src="config-handler.js"></script>
 * 
 * // 2. Initialiser Firebase
 * const firebaseApp = firebase.initializeApp(CONFIG.firebase);
 * const db = firebaseApp.firestore();
 * const auth = firebaseApp.auth();
 * 
 * // 3. Utiliser Mistral API (SÉCURISÉ)
 * const response = await callMistralAPI({
 *   agent_id: CONFIG.mistral.agentId,
 *   message: "Bonjour!"
 * });
 * 
 * // 4. Logger avec debug mode
 * log('info', 'Application démarrée', CONFIG);
 * 
 */
