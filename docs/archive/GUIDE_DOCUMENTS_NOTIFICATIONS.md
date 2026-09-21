# Guide d'Intégration - Système de Documents & Publicités

## 📋 Vue d'ensemble

Ce guide explique comment intégrer deux nouvelles fonctionnalités dans le système Neoclass:

1. **📂 Gestionnaire de Documents** - Pour que les écoles gèrent et organisent leurs documents
2. **📢 Système de Publicités Ciblées** - Pour l'admin d'envoyer des notifications aux utilisateurs

---

## 🚀 Installation & Activation

### Étape 1: Ajouter les Modules

Les fichiers suivants ont été créés:

```
modules/
├── DocumentManager.js          ← Gestion des documents
├── NotificationManager.js      ← Gestion des notifications/publicités
```

Interfaces utilisateur:
```
├── school-documents-manager.html  ← Pour les écoles
├── admin-advertisements.html      ← Pour l'admin
```

### Étape 2: Intégrer dans Firestore

Ajoutez ces règles de sécurité dans `firestore.rules`:

```firestore
// Permettre aux écoles de gérer leurs documents
match /schools/{schoolId}/documents/{document=**} {
  allow create, read, update, delete: if 
    request.auth.uid != null && 
    (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'school' ||
     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.school_id == schoolId);
}

// Permitre aux écoles de gérer leurs catégories
match /schools/{schoolId}/document_categories/{category=**} {
  allow create, read, update, delete: if 
    request.auth.uid != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'school';
}

// Notifications - Seulement admin peut créer
match /advertisements/{ad=**} {
  allow create, update, delete: if 
    request.auth.uid != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
  allow read: if request.auth.uid != null;
}

// Notifications utilisateur - Lecture seule
match /user_notifications/{notification=**} {
  allow read, update: if 
    request.auth.uid != null && 
    resource.data.user_id == request.auth.uid;
  allow create: if 
    request.auth.uid != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

### Étape 3: Ajouter les Liens dans l'Interface École

Dans `school-finance-integration.html` ou le menu principale, ajouter:

```html
<!-- Lien vers gestion documents -->
<a href="school-documents-manager.html" class="menu-item">
  <i class="fas fa-book"></i>
  Gestion des Documents
</a>
```

### Étape 4: Ajouter le Lien Admin

Dans l'interface admin (ex: `admin-pricing-panel.html`), ajouter:

```html
<!-- Lien vers publicités -->
<a href="admin-advertisements.html" class="menu-item">
  <i class="fas fa-megaphone"></i>
  Publicités & Notifications
</a>
```

---

## 📚 Utilisation: Gestionnaire de Documents

### Pour les Écoles

1. **Accéder à la page**: `school-documents-manager.html`
2. **Créer une catégorie**:
   - Entrer le nom de la catégorie (ex: "Bulletins", "Contrats", "Financier")
   - Ajouter une description (optionnel)
   - Le système génère automatiquement une couleur
   - Cliquer "Ajouter"

3. **Ajouter des documents**:
   - Cliquer "Ajouter Document"
   - Remplir: Nom, Catégorie, Description, Visibilité
   - Ajouter des tags si nécessaire (ex: "important", "urgent")
   - Cliquer "Ajouter"

4. **Gérer la visibilité**:
   - **École uniquement** 🔒 - Seulement l'école peut voir
   - **Parents** 👥 - Les parents de l'école peuvent voir
   - **Public** 🌐 - Accessible à tous

5. **Télécharger les statistiques**:
   - Cliquer "Exporter" pour télécharger un CSV des documents

### Structure des Données (Firestore)

```
schools/{schoolId}/
  documents/
    {docId}: {
      name: "Bulletin Scolaire",
      category_id: "cat123",
      visibility: "parents",
      uploaded_at: "2024-01-15T10:30:00",
      download_count: 5,
      ...
    }
  document_categories/
    {catId}: {
      name: "Bulletins",
      description: "Bulletins scolaires",
      color: "#FF6B6B",
      order: 1,
      ...
    }
```

---

## 📢 Utilisation: Système de Publicités

### Pour l'Admin

1. **Accéder à la page**: `admin-advertisements.html`

2. **Créer une publicité**:
   - Aller sur l'onglet "Créer"
   - Remplir le formulaire:
     - **Titre**: Ex "Nouvelle fonctionnalité de paiement"
     - **Type**: Annonce, Promotion, Avertissement, Info
     - **Priorité**: Basse, Normale, Haute, Urgente
     - **Contenu**: Le message détaillé
     - **Audience**: Sélectionner qui reçoit la pub (Écoles, Parents, Profs, etc.)
     - **Dates**: Quand afficher la pub
     - **Lien**: URL optionnel (ex: vers une page de documentation)
   - Cliquer "Créer Publicité"

3. **Publier la publicité**:
   - Une fois créée, elle est en "Brouillon"
   - Aller à l'onglet "Campagnes"
   - Cliquer le bouton "Envoyer" sur la carte de la pub
   - La pub change le statut à "Active" et les utilisateurs reçoivent une notification

4. **Suivi Analytics**:
   - Aller à l'onglet "Analytics"
   - Voir:
     - Nombre de notifications envoyées
     - Nombre de lectures
     - Nombre de clics
     - Taux de lecture et de clic

### Workflow Complet: Créer et Envoyer une Pub

```
1. Admin crée une pub (statut: "draft")
   ↓
2. Admin remplit le formulaire
   ↓
3. Publicité créée avec statut "draft"
   ↓
4. Admin clique "Publier"
   ↓
5. Système détermine l'audience cible
   ↓
6. Crée des notifications pour chaque utilisateur
   ↓
7. Utilisateurs reçoivent les notifications
   ↓
8. Admin voit les statistiques (lues, clics, etc)
```

### Structure des Données (Firestore)

```
advertisements/{adId}: {
  title: "Nouvelle notification de paiement",
  content: "Vous avez reçu une nouvelle notification...",
  type: "announcement",
  priority: "high",
  target_audience: ["school", "parent"],
  status: "active",
  notified_count: 250,
  views: 185,
  clicks: 45,
  ...
}

user_notifications/{notifId}: {
  user_id: "user123",
  advertisement_id: "ad456",
  title: "Nouvelle notification de paiement",
  read: false,
  clicked: false,
  created_at: "2024-01-15T10:30:00",
  ...
}
```

---

## 🔌 Intégration Avancée

### Utiliser DocumentManager en JavaScript

```javascript
// Initialiser
const documentManager = new DocumentManager(schoolId, schoolName, firebase);

// Créer une catégorie
const category = await documentManager.createCategory('Factures', 'Documents de facturation');

// Ajouter un document
const doc = await documentManager.addDocument({
  name: 'Facture Janvier 2024',
  categoryId: category.id,
  description: 'Facture du mois de janvier',
  visibility: 'school',
  tags: ['financier', 'janvier']
});

// Obtenir les documents
const documents = await documentManager.getDocuments(categoryId, visibility);

// Rechercher
const results = await documentManager.searchDocuments('facture');

// Statistiques
const stats = await documentManager.getDocumentStats();
console.log(stats); // { total_documents: 5, total_downloads: 12, ... }

// Export CSV
const csv = await documentManager.exportToCSV();
```

### Utiliser NotificationManager en JavaScript

```javascript
// Initialiser
const notificationManager = new NotificationManager(firebase, userId, 'admin');

// Créer une publicité
const ad = await notificationManager.createAdvertisement({
  title: 'Maintenance système',
  content: 'Le système sera en maintenance le 20 janvier...',
  type: 'warning',
  targetAudience: ['all'],
  priority: 'high',
  startDate: '2024-01-20T22:00:00'
});

// Publier
await notificationManager.publishAdvertisement(ad.id);

// Récupérer les notifications d'un utilisateur
const notifications = await notificationManager.getUserNotifications(userId);

// Marquer comme lue
await notificationManager.markAsRead(notificationId);

// Statistiques
const stats = await notificationManager.getAdvertisementStats(adId);
console.log(stats); // { total_sent: 250, read_count: 180, click_rate: 18, ... }
```

---

## 📊 Événements et Hooks

### DocumentManager

- **Chaque ajout de document** → Sauvegardé dans Firestore + localStorage
- **Chaque téléchargement** → Incrément le compteur `download_count`
- **Recherche offline** → Utilise les données en cache

### NotificationManager

- **Publicité publiée** → Crée automatiquement les notifications utilisateur
- **Synchronisation bidirectionnelle** → Firestore ↔ localStorage
- **Audit trail** → Chaque action est enregistrée

---

## ⚙️ Configuration Firestore

### Collections Requises

```
db.collection('schools').doc(schoolId).collection('documents')
db.collection('schools').doc(schoolId).collection('document_categories')
db.collection('advertisements')
db.collection('user_notifications')
```

### Indexes Recommandés

```
schools/{schoolId}/documents
- active (Ascending)
- visibility (Ascending)
- uploaded_at (Descending)

advertisements
- status (Ascending)
- created_at (Descending)

user_notifications
- user_id (Ascending)
- read (Ascending)
- created_at (Descending)
```

Créer ces indexes dans la Firebase Console pour optimiser les requêtes.

---

## 🔐 Sécurité & Permissions

### Permissions Écoles
- ✅ Créer/modifier/supprimer leurs propres documents
- ✅ Définir la visibilité des documents
- ❌ Accéder aux documents des autres écoles
- ❌ Voir les statistiques des autres écoles

### Permissions Admin
- ✅ Créer/modifier/publier les publicités
- ✅ Voir les statistiques de toutes les pubs
- ✅ Archiver les publicités
- ✅ Cibler n'importe quelle audience

### Permissions Utilisateurs
- ✅ Voir leurs notifications
- ✅ Marquer comme lues
- ✅ Cliquer sur les liens
- ❌ Créer des notifications

---

## 🐛 Dépannage

### Q: Les documents ne s'affichent pas
**R**: Vérifier que:
1. School ID est stocké dans localStorage
2. Firestore rules autorisent l'accès
3. Les documents sont marqués `active: true`

### Q: Les notifications ne sont pas envoyées
**R**: Vérifier que:
1. La publicité a un statut "active"
2. L'audience cible correspond aux utilisateurs
3. La date de début est dans le passé

### Q: Synchronisation lente
**R**: 
- Les opérations Firebase utilisent le cache
- Les requêtes sont optimisées avec les indexes
- Vérifier la connexion internet

---

## 📈 Cas d'Usage

### Cas 1: Notifier les écoles d'une mise à jour
1. Admin crée une pub: "Nouvelle fonctionnalité de rapports"
2. Cible: "Écoles"
3. Priorité: "Normal"
4. Publie
5. Toutes les écoles reçoivent la notification

### Cas 2: Partager des documents financiers avec les parents
1. École crée une catégorie: "Rapports Financiers"
2. Ajoute les documents
3. Visibilité: "Parents"
4. Les parents voir les documents dans l'app

### Cas 3: Alerte urgente
1. Admin crée une pub: "Panne système imminente"
2. Type: "Warning"
3. Priorité: "Urgent"
4. Cible: "All"
5. Tous les utilisateurs reçoivent une notification prioritaire

---

## 📞 Support

Pour toute question ou problème:
- Vérifier la console navigateur (F12) pour les erreurs
- Vérifier les logs Firestore
- Vérifier les permissions dans firestore.rules

---

## 📝 Changelog

### v1.0.0 (Janvier 2024)
- ✅ DocumentManager - Gestion complète des documents
- ✅ NotificationManager - Système de publicités ciblées
- ✅ Interfaces utilisateur
- ✅ Synchronisation Firestore
- ✅ Export CSV
- ✅ Analytics et statistiques
