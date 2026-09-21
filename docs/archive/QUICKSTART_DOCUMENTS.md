# 🎯 GUIDE DE DÉMARRAGE RAPIDE

## Bienvenue dans le système Documents & Notifications !

Voici comment commencer en 5 minutes.

---

## 1️⃣ INSTALLATION (2 minutes)

### Étape 1: Copier les modules
```
✓ Copier DocumentManager.js → modules/
✓ Copier NotificationManager.js → modules/
```

### Étape 2: Copier les interfaces
```
✓ Copier school-documents-manager.html → root
✓ Copier admin-advertisements.html → root
✓ Copier documents-notifications-hub.html → root
```

### Étape 3: Mettre à jour Firestore
```
✓ Ouvrir Firebase Console
✓ Aller dans Firestore → Rules
✓ Ajouter les règles (voir GUIDE_DOCUMENTS_NOTIFICATIONS.md)
```

---

## 2️⃣ ACCÈS AUX FONCTIONNALITÉS

### Pour les Écoles 🏫
```
URL: http://votresite.com/school-documents-manager.html

FONCTIONNALITÉS:
1. Créer des catégories de documents
2. Ajouter des documents
3. Définir la visibilité
4. Voir les statistiques
5. Exporter en CSV
```

**Exemple d'utilisation:**
1. Cliquez sur "Ajouter Document"
2. Remplissez: Nom, Catégorie, Description
3. Choisissez la visibilité (École/Parents/Public)
4. Cliquez "Ajouter"

### Pour l'Admin ⚙️
```
URL: http://votresite.com/admin-advertisements.html

FONCTIONNALITÉS:
1. Créer des publicités
2. Cibler les audiences
3. Planifier les dates
4. Voir les analytics
5. Exporter les rapports
```

**Exemple d'utilisation:**
1. Allez sur l'onglet "Créer"
2. Remplissez le formulaire
3. Cliquez "Créer Publicité"
4. Allez sur "Campagnes"
5. Cliquez "Envoyer"

### Pour Tous 👥
```
URL: http://votresite.com/documents-notifications-hub.html

HUB CENTRALISÉ:
- Accès rapide aux deux interfaces
- Documentation
- Informations de rôle
```

---

## 3️⃣ CAS D'USAGE COURANTS

### Cas 1: Partager des bulletins avec les parents

```
1. École ouvre: school-documents-manager.html
2. Crée la catégorie "Bulletins"
3. Ajoute le fichier PDF du bulletin
4. Définit la visibilité: "Parents"
5. ✓ Les parents reçoivent une notification
6. ✓ Les parents téléchargent le bulletin
```

### Cas 2: Annoncer une mise à jour aux écoles

```
1. Admin ouvre: admin-advertisements.html
2. Onglet "Créer"
3. Remplit:
   - Titre: "Nouvelle fonctionnalité de paiement"
   - Contenu: "Découvrez..."
   - Type: "Announcement"
   - Audience: "Écoles"
4. Cliquez "Créer Publicité"
5. Onglet "Campagnes"
6. Cliquez "Envoyer"
7. ✓ Les écoles reçoivent la notification
8. Onglet "Analytics" pour voir les statistiques
```

### Cas 3: Partager un contrat avec l'école uniquement

```
1. École ouvre: school-documents-manager.html
2. Ajoute un document
3. Visibilité: "École uniquement"
4. ✓ Seule l'école peut voir ce document
5. Les parents ne voient pas
```

---

## 4️⃣ FONCTIONNALITÉS PRINCIPALES

### 📚 Gestionnaire de Documents

```
POUR LES ÉCOLES

Créer une catégorie:
├─ Nom: "Bulletins"
├─ Description: "Bulletins scolaires 2024"
└─ Couleur: Auto-générée

Ajouter un document:
├─ Nom: "Bulletin Janvier"
├─ Catégorie: Sélectionner
├─ Description: Optionnel
├─ Visibilité: École / Parents / Public
├─ Tags: Optionnel
└─ ✓ Automatiquement synchronisé

Gérer les documents:
├─ Voir les statistiques (téléchargements)
├─ Rechercher rapidement
├─ Filtrer par catégorie
└─ Exporter en CSV
```

### 📢 Gestionnaire de Publicités

```
POUR L'ADMIN

Créer une publicité:
├─ Titre: "Maintenance système"
├─ Type: Annonce / Promotion / Avertissement / Info
├─ Priorité: Basse / Normale / Haute / Urgente
├─ Contenu: Texte détaillé
├─ Dates: Start & End
├─ Audience: Écoles / Parents / Profs / Étudiants / Admin / Tous
├─ Lien: URL optionnel
└─ Image: URL optionnel

Publier une publicité:
├─ Status: Brouillon → Actif
├─ Les utilisateurs reçoivent une notification
└─ ✓ Automatiquement enregistré

Suivi analytics:
├─ Total envoyés
├─ Nombre lues
├─ Nombre de clics
├─ Taux de lecture
└─ Taux de clic
```

---

## 5️⃣ SYNCHRONISATION

### Comment ça fonctionne?

```
1. Utilisateur crée un document/notification
   ↓
2. Sauvegarde IMMÉDIATE dans Firestore (cloud)
   ↓
3. Sauvegarde en localStorage (offline backup)
   ↓
4. Disponible pour les autres utilisateurs
   ↓
5. Synchronisation bidirectionnelle continue
```

### Offline?
- Les documents sont en cache en localStorage
- Vous pouvez voir les documents sans connexion
- Les changements se synchronisent quand vous êtes connecté

---

## 6️⃣ PERMISSIONS

### Qu'est-ce que chaque rôle peut faire?

```
🏫 ÉCOLE:
✓ Créer leurs propres catégories
✓ Ajouter leurs documents
✓ Définir la visibilité
✓ Voir les statistiques de téléchargement
✗ Voir les documents des autres écoles
✗ Créer des publicités

👥 PARENTS:
✓ Voir les documents partagés par leur école
✓ Recevoir les notifications
✓ Télécharger les documents
✗ Créer des documents
✗ Créer des publicités

⚙️ ADMIN:
✓ Créer les publicités
✓ Cibler n'importe quelle audience
✓ Voir les analytics complètes
✓ Archiver les publicités
✓ Exporter les rapports
✗ Modifier les documents des écoles

👨‍🏫 PROFESSEUR / ÉTUDIANT:
✓ Recevoir les notifications
✓ Télécharger les documents partagés
✗ Créer des documents
✗ Créer des publicités
```

---

## 7️⃣ TROUBLESHOOTING

### "Mes documents ne s'affichent pas"
```
1. Vérifier que vous êtes connecté
2. Vérifier que schoolId est dans localStorage
3. Rafraîchir la page (Ctrl+R)
4. Vérifier les permissions Firestore
5. Ouvrir la console (F12) et chercher les erreurs
```

### "Les notifications ne sont pas envoyées"
```
1. Vérifier que la publicité est au statut "Active"
2. Vérifier que vous avez sélectionné une audience
3. Vérifier la date de début (doit être aujourd'hui ou passée)
4. Vérifier que les utilisateurs cibles existent
```

### "Erreur lors de la synchronisation"
```
1. Vérifier la connexion internet
2. Vérifier les règles Firestore
3. Ouvrir Firebase Console et vérifier les logs
4. Essayer d'actualiser la page
```

---

## 8️⃣ EXPORTATION DE DONNÉES

### Export CSV - Documents
```
Écoles peuvent exporter leurs documents:
1. Ouvrir school-documents-manager.html
2. Cliquer "Exporter"
3. Télécharger le fichier CSV

Format CSV:
Nom, Catégorie, Description, Type, Taille, Uploadé par, Date, 
Téléchargements, Visibilité
```

### Export CSV - Publicités
```
Admin peut exporter les statistiques:
1. Ouvrir admin-advertisements.html
2. Onglet "Analytics"
3. Cliquer "Exporter"

Format CSV:
Titre, Type, Audience, Statut, Envoyés, Lus, Clics, 
Taux Lecture, Taux Clic, Date
```

---

## 9️⃣ API JAVASCRIPT

### Utiliser DocumentManager dans vos pages

```javascript
// Initialiser
const dm = new DocumentManager(schoolId, schoolName, firebase);

// Ajouter un document
await dm.addDocument({
  name: 'Mon Document',
  categoryId: 'cat123',
  visibility: 'school'
});

// Obtenir les documents
const docs = await dm.getDocuments();

// Chercher
const results = await dm.searchDocuments('mon');

// Statistiques
const stats = await dm.getDocumentStats();
```

### Utiliser NotificationManager dans vos pages

```javascript
// Initialiser
const nm = new NotificationManager(firebase, userId, 'admin');

// Créer une publicité
const ad = await nm.createAdvertisement({
  title: 'Ma publicité',
  content: 'Contenu',
  targetAudience: ['all']
});

// Publier
await nm.publishAdvertisement(ad.id);

// Récupérer les notifications
const notifications = await nm.getUserNotifications(userId);
```

---

## 🔟 SUIVANT

Après l'installation:

1. ✅ Tester avec une école - Ajouter des documents
2. ✅ Tester avec un parent - Voir les documents
3. ✅ Tester avec l'admin - Créer une publicité
4. ✅ Vérifier les statistiques
5. ✅ Personnaliser les couleurs (si nécessaire)
6. ✅ Documenter pour vos utilisateurs
7. ✅ Ajouter les liens dans vos menus

---

## ❓ QUESTIONS?

Consulter:
- 📖 `GUIDE_DOCUMENTS_NOTIFICATIONS.md` - Guide complet
- 🔌 `INTEGRATIONS_REQUISES.html` - Comment intégrer
- 📋 `RESUME_NOUVELLES_FONCTIONNALITES.md` - Résumé complet

---

**C'est tout! Vous êtes prêt à utiliser le système! 🚀**
