# 🎓 Neoclass - Architecture Backend Sécurisée

## 📋 Vue d'ensemble

Neoclass est une plateforme éducative avec une architecture backend sécurisée implémentant :
- **Segmentation stricte par classe** : Un élève ne voit que les contenus de sa classe
- **Système d'abonnement à 3 niveaux** : FREE, STANDARD, PREMIUM
- **Hiérarchie académique stricte** : Level → Class → Subject → Module → Lesson
- **Migration automatique de classe** : À la fin de l'année scolaire
- **Extensibilité multi-pays** : Afrique francophone

---

## 📁 Structure des fichiers

```
neoclass/
├── server.js               # Serveur principal Express
├── academic-structure.js   # Structure académique complète
├── subscription-system.js  # Système d'abonnement
├── security-middleware.js  # Middlewares de sécurité
├── course-publication.js   # Logique de publication
├── premium-ux.js           # Interface utilisateur premium
├── constants.js            # Configuration centralisée
├── ai.js                   # Assistant IA Darx
├── gamification.js         # Système de gamification
├── neoclass-features.js    # Fonctionnalités avancées
└── Neoclass3.html          # Interface frontend
```

---

## 🏗️ Architecture Académique

### Hiérarchie stricte

```
Level (Niveau scolaire)
├── primaire
├── college
└── lycee
    └── Class (Classe)
        ├── 7eme, 8eme, 9eme, 10eme
        ├── 11eme, 12eme (avec séries BAC)
        └── Subject (Matière) - LIÉE À LA CLASSE
            └── Module
                └── Lesson
```

### Classes supportées (Guinée)

| Niveau | Classes |
|--------|---------|
| Primaire | CP, CE1, CE2, CM1, CM2 |
| Collège | 7ème, 8ème, 9ème, 10ème |
| Lycée | 11ème, 12ème (avec séries BAC) |

---

## 💎 Système d'abonnement

### Plans disponibles

| Plan | Accès | Prix (GNF/mois) |
|------|-------|-----------------|
| **FREE** | Cours gratuits uniquement | 0 |
| **STANDARD** | Free + Standard | 50 000 |
| **PREMIUM** | Accès total | 150 000 |

### Logique d'accès

```javascript
// Niveaux d'accès au contenu
access_level: 'free' | 'standard' | 'premium'

// Matrice d'accès
FREE → accès 'free' seulement
STANDARD → accès 'free' + 'standard'
PREMIUM → accès 'free' + 'standard' + 'premium'
```

---

## 🔒 Middlewares de sécurité

### checkClassAccess()

Vérifie que l'utilisateur a accès à la classe demandée.

```javascript
// Un élève ne peut accéder qu'aux contenus de SA classe
// Les profs/admins ont accès à toutes les classes

// Usage
app.get('/api/courses/:classId',
  securityMiddleware.checkClassAccess,
  (req, res) => { ... }
);
```

### checkSubscriptionAccess()

Vérifie le niveau d'abonnement de l'utilisateur.

```javascript
// Ne bloque pas mais marque le contenu comme verrouillé
// Retourne req.subscriptionCheck avec les infos d'accès

app.get('/api/course/:id',
  securityMiddleware.checkSubscriptionAccess,
  (req, res) => {
    if (!req.subscriptionCheck.allowed) {
      // Retourner version verrouillée
    }
  }
);
```

### checkFullAccess()

Combine toutes les vérifications en un seul middleware.

```javascript
app.get('/api/content/:id',
  securityMiddleware.checkFullAccess,
  (req, res) => {
    // req.accessCheck contient tous les résultats
  }
);
```

---

## 📚 Publication de cours

### Champs obligatoires

| Champ | Description |
|-------|-------------|
| `classId` | ID de la classe (obligatoire) |
| `subjectId` | ID de la matière (obligatoire, doit appartenir à la classe) |
| `access_level` | Niveau d'accès : free, standard, premium (obligatoire) |
| `countryCode` | Code pays : GN, SN, CI, etc. (obligatoire) |
| `name` | Nom du cours |
| `content` | Contenu du cours |

### Endpoint de publication

```bash
POST /api/publish/course
Authorization: Bearer <token>

{
  "classId": "12eme",
  "subjectId": "maths_12",
  "access_level": "premium",
  "countryCode": "GN",
  "name": "Préparation BAC - Mathématiques",
  "content": "..."
}
```

### Validation stricte

```javascript
// La publication échoue si :
// - Un champ obligatoire manque
// - La matière n'appartient pas à la classe
// - Le niveau d'accès est invalide
// - Le code pays n'est pas supporté
```

---

## 🔄 Migration automatique de classe

### Configuration

```javascript
MIGRATION_CONFIG = {
  MIGRATION_MONTH: 9,  // Septembre
  MIGRATION_DAY: 1,    // 1er du mois
  AUTO_MIGRATION_ENABLED: true
}
```

### API Admin

```bash
# Migrer un élève
POST /api/admin/migrate-student/:studentId

# Migration en masse
POST /api/admin/migrate-all
```

### Logique de migration

```
CP → CE1 → CE2 → CM1 → CM2 → 7ème → 8ème → 9ème → 10ème → 11ème → 12ème
```

---

## 🌍 Multi-pays

### Pays supportés

| Code | Pays | Devise |
|------|------|--------|
| GN | Guinée | GNF |
| SN | Sénégal | XOF |
| CI | Côte d'Ivoire | XOF |
| ML | Mali | XOF |
| BF | Burkina Faso | XOF |
| CM | Cameroun | XAF |
| MA | Maroc | MAD |

### Tarification par pays

```javascript
PRICING_BY_COUNTRY = {
  GN: { plans: { STANDARD: { monthly: 50000 }, PREMIUM: { monthly: 150000 } } },
  SN: { plans: { STANDARD: { monthly: 2500 }, PREMIUM: { monthly: 7500 } } },
  // ...
}
```

---

## 🚀 Démarrage

### Installation

```bash
npm install express cors
```

### Lancement

```bash
node server.js
```

### Test de santé

```bash
curl http://localhost:3000/api/health
```

---

## 📡 API Endpoints principaux

### Public

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/health` | Santé du serveur |
| GET | `/api/public/countries` | Liste des pays |
| GET | `/api/public/plans` | Plans d'abonnement |
| GET | `/api/public/pricing/:countryCode` | Prix par pays |

### Authentifié

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/my/subjects` | Matières de l'utilisateur |
| GET | `/api/my/courses` | Cours de la classe |
| GET | `/api/my/subscription` | Statut d'abonnement |
| GET | `/api/course/:id` | Détail d'un cours |

### Publication (profs/admins)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/publish/course` | Publier un cours |
| POST | `/api/publish/module` | Publier un module |
| POST | `/api/publish/lesson` | Publier une leçon |
| POST | `/api/validate/course` | Valider avant publication |

### Admin

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/admin/migrate-student/:id` | Migrer un élève |
| POST | `/api/admin/migrate-all` | Migration en masse |
| GET | `/api/admin/academic-year` | Année académique |

---

## 🎨 UX Premium (Frontend)

### Affichage du contenu verrouillé

```javascript
// Le contenu verrouillé affiche :
// - Preview floutée
// - Message de verrouillage
// - Bouton "Passer à Premium" / "Passer à Standard"

PremiumUX.checkAndRenderContent(content, userSubscription, '#container');
```

### Modal de mise à niveau

```javascript
PremiumUX.showUpgradeModal('premium');
PremiumUX.showPlansComparison();
```

---

## 🔐 Sécurité

### Principes clés

1. **Segmentation stricte** : Aucun accès inter-classe possible
2. **Filtrage côté serveur** : Le contenu premium n'est jamais exposé à l'API
3. **Logging des accès** : Toutes les tentatives sont enregistrées
4. **Validation stricte** : Publication refusée si champs manquants

### Headers requis

```
Authorization: Bearer <firebase_token>
X-User-Id: <user_id>  (dev only)
```

---

## 📈 Extensibilité

L'architecture est conçue pour :

- ✅ Ajouter de nouveaux pays
- ✅ Ajouter de nouvelles classes/matières
- ✅ Modifier les tarifs par pays
- ✅ Ajouter de nouveaux niveaux d'abonnement
- ✅ Intégrer différents moyens de paiement (Orange Money, Wave, MTN MoMo)

---

## 📝 Changelog

### Version 4.0
- Structure académique stricte (level → class → subject → module → lesson)
- Système d'abonnement à 3 niveaux
- Middlewares de sécurité (checkClassAccess, checkSubscriptionAccess)
- Publication de cours avec validation stricte
- Migration automatique de classe
- Support multi-pays (Afrique francophone)
