# 🤖 GUIDE MISTRAL LOCAL - NEOCLASS

## 📋 SOMMAIRE

1. [Installation LM Studio](#installation)
2. [Configuration Mistral](#configuration)
3. [Intégration dans Neoclass](#intégration)
4. [Utilisation API](#api)
5. [Troubleshooting](#troubleshooting)

---

## 🚀 Installation {#installation}

### **Étape 1: Télécharger LM Studio**

1. Aller sur: https://lmstudio.ai/
2. Cliquer "Download" → Sélectionner Windows
3. Installer le fichier `.exe`
4. Lancer l'application

### **Étape 2: Vérifier la configuration**

```
Prérequis:
- RAM: minimum 8GB (16GB recommandé)
- Disque: 15GB libre pour Mistral-7B
- GPU: Optionnel (NVIDIA/AMD recommandé)
```

**Vérifier RAM disponible (PowerShell):**

```powershell
Get-ComputerInfo | Select-Object CsTotalPhysicalMemory
# Diviser par 1GB = RAM en Go
```

---

## 🎯 Configuration Mistral {#configuration}

### **Étape 1: Démarrer LM Studio**

Lancez l'application `LM Studio` installée.

### **Étape 2: Chercher Mistral**

1. Cliquer sur **"Search"** (loupe)
2. Taper: `mistral-7b-instruct`
3. Sélectionner le modèle officiel

**Modèles recommandés:**

| Modèle | Taille | RAM Requise | Vitesse |
|--------|--------|------------|---------|
| Mistral-7B-Instruct | 4GB | 8GB | Rapide ⚡ |
| Mistral-7B-Q4 | 7GB | 12GB | Moyen |
| Mistral-7B-FP16 | 14GB | 16GB | Lent |

**Sélectionner:** `mistral-7b-instruct-v0.1` (Q4)

### **Étape 3: Télécharger le modèle**

1. Cliquer sur le modèle
2. Cliquer **"Download"**
3. Attendre le téléchargement (~7GB)

**Status de téléchargement:**
```
✓ En cours: barre de progression
✓ Complété: "Ready to use"
✓ Erreur: Vérifier la connexion internet
```

---

## 🔗 Lancer le serveur API {#api}

### **Démarrage du serveur**

**Dans LM Studio:**

1. Aller à l'onglet **"Local Server"** (en bas)
2. Sélectionner le modèle Mistral
3. Cliquer le bouton **"Start Server"**

**Output attendu:**

```
Loading model: mistral-7b-instruct-v0.1
Model loaded successfully ✓
Server running at: http://127.0.0.1:1234
API endpoint: http://127.0.0.1:1234/v1
```

### **Vérifier le serveur fonctionne**

Ouvrir un terminal PowerShell:

```powershell
# Tester la connexion
Invoke-WebRequest -Uri "http://127.0.0.1:1234/v1/models" -Method Get | ConvertTo-Json

# Résultat attendu:
# {
#   "object": "list",
#   "data": [
#     {"id": "mistral-7b-instruct-v0.1", ...}
#   ]
# }
```

✅ **Si ça marche:** Le serveur est prêt!

---

## 🔌 Intégration dans Neoclass {#intégration}

### **Étape 1: Créer le module Mistral**

Créer le fichier: `www/modules/mistral-ai.js`

```javascript
// Mistral AI Service pour Neoclass

class MistralAI {
  constructor(apiUrl = 'http://127.0.0.1:1234/v1') {
    this.apiUrl = apiUrl;
    this.modelId = 'mistral-7b-instruct-v0.1';
    this.conversationHistory = [];
  }

  // Vérifier si le serveur est actif
  async isServerActive() {
    try {
      const response = await fetch(`${this.apiUrl}/models`);
      return response.ok;
    } catch (e) {
      return false;
    }
  }

  // Envoyer un message à Mistral
  async sendMessage(userMessage, context = {}) {
    try {
      // Ajouter à l'historique
      this.conversationHistory.push({
        role: 'user',
        content: userMessage
      });

      // Préparer le prompt avec contexte
      const systemPrompt = this.buildSystemPrompt(context);

      // Appel API
      const response = await fetch(`${this.apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.modelId,
          messages: [
            { role: 'system', content: systemPrompt },
            ...this.conversationHistory
          ],
          temperature: 0.7,
          max_tokens: 512,
          top_p: 0.9
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage = data.choices[0].message.content;

      // Ajouter la réponse à l'historique
      this.conversationHistory.push({
        role: 'assistant',
        content: assistantMessage
      });

      return {
        success: true,
        message: assistantMessage,
        tokens: data.usage?.total_tokens || 0
      };

    } catch (error) {
      console.error('Erreur Mistral:', error);
      return {
        success: false,
        message: 'Erreur de connexion à Mistral',
        error: error.message
      };
    }
  }

  // Construire le prompt système selon le contexte
  buildSystemPrompt(context = {}) {
    const { role, language = 'fr' } = context;
    
    const prompts = {
      tutor: `Tu es un tuteur éducatif pour la plateforme Neoclass.
Tu aides les étudiants à comprendre les concepts.
Réponds de manière pédagogique et encourageante.
Utilise des exemples concrets si possible.
Langue: ${language === 'fr' ? 'Français' : 'English'}`,

      assistant: `Tu es un assistant IA pour la plateforme éducative Neoclass.
Tu aides avec des questions générales.
Sois concis et utile.
Langue: ${language === 'fr' ? 'Français' : 'English'}`,

      qacorrector: `Tu es un correcteur d'exercices.
Évalue les réponses de l'étudiant.
Donne des feedbacks constructifs.
Utilise un ton encourageant.
Langue: ${language === 'fr' ? 'Français' : 'English'}`,

      default: `Tu es un assistant IA pour la plateforme Neoclass.
Sois utile, honnête et concis.
Langue: ${language === 'fr' ? 'Français' : 'English'}`
    };

    return prompts[role] || prompts.default;
  }

  // Correction d'exercice
  async correctExercise(studentAnswer, correctAnswer, exercise = {}) {
    const message = `
L'exercice: "${exercise.title || 'Exercice'}"
La réponse de l'étudiant: "${studentAnswer}"
La réponse correcte: "${correctAnswer}"

Évalue cette réponse. Donne un score (0-100) et un feedback détaillé.
Format réponse: {"score": XX, "feedback": "..."}
    `;

    const result = await this.sendMessage(message, { role: 'qacorrector' });
    
    if (!result.success) return result;

    try {
      const parsed = JSON.parse(result.message);
      return { success: true, ...parsed };
    } catch {
      return { success: false, message: 'Erreur de parsing' };
    }
  }

  // Chat tutoriel
  async tutorChat(studentQuestion) {
    return await this.sendMessage(studentQuestion, { role: 'tutor' });
  }

  // Générer des questions de quiz
  async generateQuizQuestions(topic, count = 5) {
    const message = `
Génère ${count} questions de quiz sur: "${topic}"
Format: JSON array avec {"question": "...", "options": [...], "answer": 0}
    `;

    const result = await this.sendMessage(message);
    
    if (!result.success) return result;

    try {
      const questions = JSON.parse(result.message);
      return { success: true, questions };
    } catch {
      return { success: false, message: 'Erreur de parsing' };
    }
  }

  // Résumer un texte
  async summarizeText(text, length = 'moyen') {
    const messages = {
      court: '50 mots max',
      moyen: '100-150 mots',
      long: '200-300 mots'
    };

    const message = `
Résume ce texte en ${messages[length] || messages.moyen}:

${text}

Résumé concis et clair.
    `;

    return await this.sendMessage(message);
  }

  // Expliquer un concept
  async explainConcept(concept, level = 'beginner') {
    const levels = {
      beginner: 'simple et accessible',
      intermediate: 'moyen',
      advanced: 'technique et détaillé'
    };

    const message = `
Explique le concept de: "${concept}"
Niveau: ${levels[level] || levels.beginner}
Utilise des exemples si possible.
Reste concis.
    `;

    return await this.sendMessage(message);
  }

  // Effacer historique
  clearHistory() {
    this.conversationHistory = [];
  }

  // Obtenir historique
  getHistory() {
    return this.conversationHistory;
  }
}

// Export global
window.MistralAI = MistralAI;
window.mistral = new MistralAI();
```

### **Étape 2: Ajouter le script au HTML**

Dans `www/index-complete.html`, ajouter avant `app.js`:

```html
<!-- Mistral AI Service -->
<script src="modules/mistral-ai.js"></script>
```

### **Étape 3: Créer un module d'interface**

Créer: `www/modules/ai-chat.js`

```javascript
// Interface Chat Mistral pour Neoclass

async function renderAIChatPage() {
  const chatContainer = document.getElementById('dashboardContent');
  
  const html = `
    <div class="navbar">
      <h1>💬 Assistant IA</h1>
      <button class="btn btn-secondary" onclick="goBack()">← Retour</button>
    </div>

    <div style="flex: 1; display: flex; flex-direction: column; padding: 15px; overflow: hidden;">
      <!-- Messages -->
      <div id="aiChatMessages" style="
        flex: 1;
        overflow-y: auto;
        margin-bottom: 15px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 10px;
        background: var(--bg-hover);
        border-radius: 10px;
      "></div>

      <!-- Status Serveur -->
      <div id="serverStatus" style="
        padding: 10px;
        text-align: center;
        font-size: 0.9rem;
        background: rgba(16, 185, 129, 0.1);
        color: var(--success);
        border-radius: 8px;
        margin-bottom: 10px;
      ">
        ✓ Serveur Mistral actif
      </div>

      <!-- Input -->
      <form onsubmit="handleAIChatSubmit(event)" style="display: flex; gap: 10px;">
        <input
          type="text"
          id="aiMessageInput"
          placeholder="Posez votre question à l'IA..."
          class="form-input"
          style="flex: 1;"
          autocomplete="off"
        />
        <button type="submit" class="btn btn-primary">Envoyer</button>
      </form>
    </div>
  `;

  chatContainer.innerHTML = html;

  // Vérifier le serveur
  const isActive = await window.mistral.isServerActive();
  const statusDiv = document.getElementById('serverStatus');
  
  if (!isActive) {
    statusDiv.innerHTML = '❌ Serveur Mistral indisponible (LM Studio fermé?)';
    statusDiv.style.background = 'rgba(239, 68, 68, 0.1)';
    statusDiv.style.color = 'var(--danger)';
  }

  setupAIChatListeners();
}

async function handleAIChatSubmit(event) {
  event.preventDefault();

  const input = document.getElementById('aiMessageInput');
  const message = input.value.trim();

  if (!message) return;

  // Afficher le message utilisateur
  addAIChatMessage(message, 'user');
  input.value = '';

  // Afficher "en cours de réflexion..."
  const thinkingId = 'thinking_' + Date.now();
  addAIChatMessage('En cours de réflexion...', 'assistant', thinkingId);

  // Appeler Mistral
  const result = await window.mistral.sendMessage(message);

  // Supprimer "en cours..."
  document.getElementById(thinkingId)?.remove();

  if (result.success) {
    addAIChatMessage(result.message, 'assistant');
  } else {
    addAIChatMessage('❌ Erreur: ' + result.message, 'error');
  }
}

function addAIChatMessage(text, role = 'assistant', id = null) {
  const messagesDiv = document.getElementById('aiChatMessages');
  
  const messageEl = document.createElement('div');
  messageEl.id = id;
  
  const alignment = role === 'user' ? 'flex-end' : 'flex-start';
  const bgColor = role === 'user' ? 'var(--primary)' : 
                  role === 'error' ? 'var(--danger)' :
                  'var(--bg-card)';
  const textColor = role === 'user' ? 'white' : 'var(--text)';
  const icon = role === 'user' ? '👤' : role === 'error' ? '❌' : '🤖';

  messageEl.innerHTML = `
    <div style="
      display: flex;
      justify-content: ${alignment};
      margin-bottom: 10px;
      width: 100%;
    ">
      <div style="
        max-width: 80%;
        padding: 10px 15px;
        border-radius: 10px;
        background: ${bgColor};
        color: ${textColor};
        word-wrap: break-word;
        line-height: 1.5;
      ">
        <strong>${icon}</strong> ${text}
      </div>
    </div>
  `;

  messagesDiv.appendChild(messageEl);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function setupAIChatListeners() {
  document.getElementById('aiMessageInput').focus();
}

// Export
window.renderAIChatPage = renderAIChatPage;
```

---

## 🎯 Utilisation dans Neoclass

### **1. Ajouter le bouton au Dashboard**

Dans `www/modules/dashboard.js`, ajouter à la grille des actions:

```javascript
<button class="btn btn-primary" style="width: 100%; padding: 15px;" onclick="navigate('aichat')">
  💬 Assistant IA Mistral
</button>
```

### **2. Ajouter la route de navigation**

Dans `www/modules/dashboard.js`, dans `showPage()`:

```javascript
case 'aichat':
  dashboardContent.innerHTML = await renderAIChatPage();
  break;
```

### **3. Importer les scripts**

Dans `www/index-complete.html`, ajouter:

```html
<script src="modules/mistral-ai.js"></script>
<script src="modules/ai-chat.js"></script>
```

---

## 💻 Utilisation API Directe

### **Exemple JavaScript (fetch)**

```javascript
async function askMistral(question) {
  const response = await fetch('http://127.0.0.1:1234/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'mistral-7b-instruct-v0.1',
      messages: [
        { role: 'user', content: question }
      ],
      temperature: 0.7,
      max_tokens: 256
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

// Utiliser
const answer = await askMistral('Explique la gravité simplement');
console.log(answer);
```

### **Exemple cURL (Terminal)**

```bash
curl -X POST http://127.0.0.1:1234/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "mistral-7b-instruct-v0.1",
    "messages": [
      {"role": "user", "content": "Bonjour Mistral!"}
    ],
    "temperature": 0.7,
    "max_tokens": 256
  }'
```

---

## 🔧 Configuration Avancée {#troubleshooting}

### **Changer le port**

Si le port `1234` est occupé:

Dans LM Studio → Paramètres → Server → Port → Changer

Puis mettre à jour dans `mistral-ai.js`:

```javascript
const mistral = new MistralAI('http://127.0.0.1:VOTRE_PORT/v1');
```

### **Utiliser avec GPU NVIDIA**

LM Studio détecte automatiquement le GPU. Pour forcer:

```
Paramètres → GPU Acceleration → Sélectionner NVIDIA
```

### **Augmenter les tokens**

Pour des réponses plus longues:

```javascript
fetch(..., {
  body: JSON.stringify({
    ...
    max_tokens: 1024  // Augmenter ici
  })
})
```

---

## ⚡ Performance

### **Optimisations recommandées**

```javascript
// Limiter l'historique pour éviter les timeouts
if (this.conversationHistory.length > 10) {
  this.conversationHistory.shift(); // Supprimer le premier message
}

// Ajouter un timeout
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s

const response = await fetch(url, {
  signal: controller.signal
});
```

### **Benchmarks (i7, 16GB RAM)**

| Modèle | Temps/réponse | Qualité |
|--------|--------------|---------|
| Mistral-7B-Q4 | 3-5s | Excellente |
| Mistral-7B-Q5 | 5-8s | Très bonne |
| Mistral-Medium | 8-12s | Excellente+ |

---

## ✅ Checklist Final

- [ ] LM Studio installé
- [ ] Mistral téléchargé
- [ ] Serveur API lancé (`http://127.0.0.1:1234`)
- [ ] Module `mistral-ai.js` créé
- [ ] Module `ai-chat.js` créé
- [ ] Scripts importés dans `index.html`
- [ ] Route 'aichat' ajoutée
- [ ] Bouton au dashboard
- [ ] Test: envoyer un message
- [ ] Réponse reçue ✓

---

## 📞 Troubleshooting {#troubleshooting}

### **"Cannot reach server"**

```
✓ LM Studio est lancé?
✓ Serveur "started"? (voir LM Studio)
✓ Port correct? (127.0.0.1:1234)
✓ Firewall bloque? (autoriser LM Studio)
```

### **"Out of memory"**

```
✓ Fermer les apps gourmandes
✓ Utiliser un modèle plus petit (Q4 au lieu de FP16)
✓ Réduire max_tokens
✓ Ajouter une RAM ou utiliser un serveur distant
```

### **"Réponses lentes"**

```
✓ Activer GPU (NVIDIA/AMD)
✓ Réduire max_tokens
✓ Réduire temperature (0.3-0.5 = plus rapide)
✓ Fermer d'autres apps
```

### **"Erreur JSON/parsing"**

```
✓ Vérifier le format de la réponse
✓ Ajouter try/catch
✓ Augmenter max_tokens si la réponse est coupée
```

---

## 🚀 Prochaines Étapes

1. ✅ Installer et lancer Mistral
2. ✅ Intégrer dans Neoclass
3. ⏳ Utiliser pour correction d'exercices
4. ⏳ Générer des quiz automatiquement
5. ⏳ Tutoriel IA interactif
6. ⏳ Recommandations d'apprentissage

---

## 📚 Ressources

- **LM Studio**: https://lmstudio.ai/
- **Mistral Models**: https://mistral.ai/
- **API Documentation**: https://lmstudio.ai/docs/api
- **GPU Support**: https://lmstudio.ai/docs/gpu-support

---

**Version**: 1.0.0
**Date**: 2026-05-25
**Status**: ✅ PRÊT À L'EMPLOI
