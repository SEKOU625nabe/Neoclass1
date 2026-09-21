# 🚀 DÉMARRAGE RAPIDE MISTRAL - 5 MINUTES

## 📦 Étape 1: Installer LM Studio (2 min)

**Système Windows:**

1. Aller sur: **https://lmstudio.ai/**
2. Cliquer **"Download"** → Windows (x64)
3. Lancer le fichier `.exe` téléchargé
4. Suivre l'installation

---

## ⬇️ Étape 2: Télécharger Mistral (2-3 min en background)

**Dans LM Studio:**

1. Cliquer l'icône **"Search"** (loupe)
2. Taper: `mistral-7b-instruct`
3. Sélectionner le modèle avec 7.3B (Q4)
4. Cliquer **"Download"**
5. Attendre l'onglet vert "✓ Downloaded"

**Combien de temps?** ~7GB, ~5-10 min en 4G, ~1-2 min en fibre

---

## ▶️ Étape 3: Lancer le serveur (30 sec)

**Dans LM Studio:**

1. Aller à l'onglet **"Local Server"** (en bas à gauche)
2. Sélectionner le modèle Mistral
3. Cliquer le grand bouton **"Start Server"**

**Vérifier que ça marche:**

Ouvrir PowerShell et taper:

```powershell
curl http://127.0.0.1:1234/v1/models
```

✅ **Si vous voyez une réponse JSON:** C'est bon!

---

## 🔌 Étape 4: Vérifier l'intégration dans Neoclass

**Fichiers créés:**
```
✓ www/modules/mistral-ai.js
✓ www/modules/ai-chat.js
✓ www/index-complete.html (mis à jour)
✓ www/modules/dashboard.js (mis à jour)
```

**Vérifier:**

1. Ouvrir `www/index-complete.html` dans le navigateur
2. Cliquer sur **"Assistant IA"** ou **"Tuteur IA"** depuis le dashboard
3. Envoyer une message test
4. Vérifier la réponse ✓

---

## 🎯 UTILISATION

### **Assistant IA (Accueil)**
- Chat général avec Mistral
- Pose tes questions
- Discussions libres

### **Tuteur IA (Sujet spécifique)**
- Choix du sujet (Maths, Français, etc.)
- Questions pédagogiques
- Explications détaillées

---

## ⚡ COMMANDES UTILES

### **Vérifier le serveur:**
```powershell
curl -Method Get http://127.0.0.1:1234/v1/models | ConvertFrom-Json
```

### **Vérifier le modèle chargé:**
```powershell
curl -Method Get http://127.0.0.1:1234/v1/models
```

### **Tester un message direct:**
```powershell
$body = @{
    model = "mistral-7b-instruct-v0.1"
    messages = @(@{
        role = "user"
        content = "Bonjour!"
    })
} | ConvertTo-Json

curl -Method Post `
  -Uri "http://127.0.0.1:1234/v1/chat/completions" `
  -ContentType "application/json" `
  -Body $body
```

---

## 🔧 TROUBLESHOOTING

### ❌ "Cannot reach server"
```
→ LM Studio est lancé?
→ Cliquer "Start Server" (devrait être vert)
→ Port 1234 pas bloqué?
→ Vérifier dans les paramètres: Local Server → Port
```

### ❌ "Out of memory"
```
→ Fermer d'autres applications
→ Vérifier: RAM disponible > 8GB
→ Réduire max_tokens (512 → 256)
```

### ❌ "Réponses très lentes"
```
→ Activer GPU (Paramètres → GPU Acceleration)
→ Fermer les applications gourmandes
→ Vérifier la CPU usage (Task Manager)
```

### ❌ "Pas de réponse du serveur"
```
→ Firewall bloque LM Studio?
→ Ajouter LM Studio à l'exception firewall
→ Ou désactiver temporairement le firewall
```

---

## 📊 ARCHITECTURE

```
Utilisateur
    ↓
Neoclass (index-complete.html)
    ↓
ai-chat.js (Interface)
    ↓
mistral-ai.js (Service)
    ↓
HTTP Request
    ↓
LM Studio (http://127.0.0.1:1234)
    ↓
Mistral-7B Model
    ↓
Réponse IA
```

---

## 💻 STRUCTURE DES APPELS

### **Appel simple:**

```javascript
// Dans la console du navigateur:
const result = await window.mistral.sendMessage("Bonjour!");
console.log(result.message);
```

### **Correction d'exercice:**

```javascript
const result = await window.mistral.correctExercise(
  "2+2=5",        // Réponse étudiant
  "2+2=4",        // Réponse correcte
  { title: "Addition simple" }
);
console.log(result);
```

### **Générer un quiz:**

```javascript
const result = await window.mistral.generateQuizQuestions(
  "Photosynthèse",
  5,
  "moyen"
);
console.log(result.questions);
```

---

## ✅ CHECKLIST

- [ ] LM Studio installé
- [ ] Mistral téléchargé (7.3B Q4)
- [ ] Serveur lancé (port 1234)
- [ ] `curl http://127.0.0.1:1234/v1/models` fonctionne
- [ ] Fichiers créés: mistral-ai.js, ai-chat.js
- [ ] Dashboard a 2 nouveaux boutons (IA, Tuteur)
- [ ] Cliquer sur "Assistant IA" affiche le chat
- [ ] Envoyer un message reçoit une réponse
- [ ] Tuteur IA fonctionne aussi

---

## 📱 TESTER SUR TÉLÉPHONE

```bash
# Depuis votre ordinateur, récupérer l'IP:
ipconfig

# Chercher "IPv4 Address" (ex: 192.168.1.15)
# Puis modifier mistral-ai.js:

const mistral = new MistralAI('http://192.168.1.15:1234/v1');
```

---

## 🎓 EXEMPLES D'UTILISATION

### **Question simple:**
```
Utilisateur: "Explique la photosynthèse"
Mistral: "La photosynthèse est le processus par lequel les plantes..."
```

### **Correction d'exercice:**
```
Étudiant: "La capitale de la France est Berlin"
Correct: "La capitale de la France est Paris"
Mistral: {
  score: 0,
  feedback: "Non, Paris est la capitale de la France, pas Berlin.",
  suggestion: "Apprends les capitales européennes"
}
```

### **Générer un quiz:**
```
Topic: "Historique"
Mistral: [
  {
    question: "En quelle année Napoléon est né?",
    options: ["1769", "1799", "1850", "1801"],
    answer: 0
  },
  ...
]
```

---

## 🚀 PROCHAINES ÉTAPES

1. ✅ Mistral lancé localement
2. ✅ Intégré dans Neoclass
3. ⏳ Tester avec des étudiants
4. ⏳ Optimiser pour différents sujets
5. ⏳ Ajouter d'autres modèles (Mistral Medium, etc.)

---

## 📞 SUPPORT

- **Problèmes LM Studio**: https://lmstudio.ai/docs
- **Problèmes Mistral**: https://mistral.ai/
- **Problèmes intégration**: Vérifier les logs console (F12)

---

**Durée totale:** ~10-15 minutes ✓
**Complexité:** Très simple ⭐
**Résultat:** IA complètement fonctionnelle dans Neoclass 🎉

---

*Créé: 2026-05-25*
*Mistral-7B Local Edition*
