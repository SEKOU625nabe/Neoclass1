# 🚀 SYSTÈME FINANCE NEOCLASS V2 - GUIDE DE DÉMARRAGE RAPIDE

## Bienvenue! 👋

Vous venez de recevoir le **Système de Gestion Financière Neoclass V2**, une solution modulaire pour gérer:
- 👨‍🎓 Les élèves et leurs dossiers
- 💳 La facturation et les paiements
- 🏷️ Les dépenses (5 catégories)
- 📊 Le tableau de bord financier
- 🔔 Les notifications et rappels

**C'est GRATUIT, SANS DÉPENDANCES, 100% FRANÇAIS et prêt à l'emploi!**

---

## ⚡ Démarrage en 5 secondes

### 1️⃣ Ouvrir l'application
Ouvrez simplement **Neoclass3.html** dans votre navigateur.

```
Fichier → Ouvrir → Neoclass3.html
```

### 2️⃣ Se connecter comme ADMIN
Vous devez être administrateur pour accéder à la finance.

**Dans Neoclass3.html**:
- Cliquer "Admin Login" ou "Connexion Admin"
- Identifiants de test: 
  - Email: `admin@neoclass.gu`
  - Mot de passe: voir configuration

### 3️⃣ Aller au menu Finances
Regardez le menu latéral gauche → **"Finances V2"** → Cliquez pour déplier

### 4️⃣ Choisir un module
```
📋 Finances V2
├─ 👨‍🎓 Gestion Élèves
├─ 💳 Gestion Scolarités
├─ 🏷️ Gestion Dépenses
├─ 🔔 Notifications
├─ 📈 Tableau Bord
└─ 📊 Dashboard (ancien)
```

### 5️⃣ Commencer à utiliser!
Chaque module a 3-4 onglets. Cliquez pour explorer.

---

## 📖 Guide rapide par module

### 👨‍🎓 Gestion Élèves
**Vous pouvez**:
- Inscrire un nouvel élève (obtient matricule auto: STU-XXXX)
- Voir liste élèves (filtrer par classe)
- Ajouter documents (certificat, bulletin, vaccin)
- Transférer élève à autre classe
- Voir statistiques (total, complets, incomplets)

**Exemple**: 
```
Onglet "Inscrire" → Remplir formulaire → Cliquer "✅ Inscrire Élève"
```

---

### 💳 Gestion Scolarités
**Vous pouvez**:
- Enregistrer un paiement de scolarité
- Voir toutes les factures
- Voir les élèves en retard (avec montant dû)
- Statistiques paiements (collecté, dû, taux)

**Exemple**:
```
Onglet "Enregistrer Paiement" 
→ Sélectionner élève
→ Entrer montant (ex: 50000 Fr)
→ Cliquer "✅ Enregistrer"
→ Reçu généré automatiquement
```

**Tarifs par classe** (Guinée - 2026):
- CP/CE1/CE2: 50 000 Fr
- CM1/CM2: 60 000 Fr
- 7-9ème: 80 000 Fr
- 10-12ème: 100 000 Fr

---

### 🏷️ Gestion Dépenses
**Vous pouvez**:
- Ajouter une dépense (5 catégories):
  - 👨‍💼 Salaires
  - 📚 Fournitures
  - 🚌 Transport
  - 🔧 Entretien
  - 📦 Autres
- Voir liste dépenses
- Valider dépenses (workflow enregistrée → validée)
- Voir dépenses par catégorie
- Statistiques

**Exemple**:
```
Onglet "Ajouter"
→ Catégorie: "Salaires"
→ Description: "Salaire Mme Diallo"
→ Montant: 500000
→ Date: 2026-05-20
→ Bénéficiaire: "Mme Diallo"
→ Cliquer "✅ Ajouter Dépense"
```

---

### 🔔 Notifications
**Vous pouvez**:
- Voir inbox (notifications non lues)
- Générer rappels de paiement (auto pour retards)
- Générer alertes dossiers incomplets
- Créer notification manuelle

**Types de notifications**:
- 💰 Rappel de paiement
- ⚠️ Retard de scolarité
- 📋 Dossier incomplet
- 💸 Alerte budget
- ✅ Paiement reçu

**Exemple**:
```
Onglet "Générer rappels"
→ Cliquer "🔄 Générer rappels de paiement"
→ Rappels créés automatiquement pour élèves en retard
```

---

### 📊 Tableau Bord Financier
**Vous voyez**:
- Élèves total
- À jour / En retard
- Revenus total (Fr)
- Dépenses total (Fr)
- Bénéfices (Fr)
- Dossiers complets/incomplets
- 5 graphiques de données
- Détails complets

**Onglets**:
- 📋 Résumé: Vue d'ensemble rapide
- 📈 Graphiques: Visualisation données
- 🔍 Détails: Informations complètes

---

## 💰 Utilisation de la devise

Toutes les montants sont en **Franc Guinéen (Fr)**.

**Formatage automatique**:
```
50000           →  "50 000 Fr"
1500000         →  "1 500 000 Fr"
100             →  "100 Fr"
```

Vous n'avez rien à faire - c'est automatique! ✨

---

## 📊 Exemple de workflow complet

### Scénario: Inscrire élève → Payer → Voir rapport

**Étape 1: Inscrire l'élève**
```
Menu → Finances V2 → Gestion Élèves
Onglet "Inscrire"
  Nom: Diallo
  Prénom: Aissatou
  Classe: CM2
  Contact parent: +224 620 12 34 56
  → Cliquer "✅ Inscrire Élève"
  → Reçoit matricule: STU-ABC123DEF456
```

**Étape 2: Voir dans la liste**
```
Onglet "Liste"
  → Voit "Diallo Aissatou" (STU-ABC123DEF456)
  → Classe: CM2
  → Dossier: ⚠️ Incomplet
```

**Étape 3: Enregistrer paiement**
```
Menu → Finances V2 → Gestion Scolarités
Onglet "Enregistrer Paiement"
  Élève: Diallo Aissatou (STU-ABC123DEF456)
  Mois: janvier
  Montant: 60000 (CM2)
  Méthode: Espèces
  Référence: CASH-001
  → Cliquer "✅ Enregistrer"
  → Reçu généré et sauvegardé
```

**Étape 4: Vérifier le tableau de bord**
```
Menu → Finances V2 → Tableau Bord Financier
Onglet "Résumé"
  → Élèves: 1
  → À jour: 1
  → Revenus: 60 000 Fr
  → Bénéfices: (selon dépenses)
```

**Étape 5: Générer rappels**
```
Menu → Finances V2 → Notifications
Onglet "Générer rappels"
  → Cliquer "🔄 Générer rappels de paiement"
  → Élève en retard reçoit notification rappel
```

---

## ⚙️ Configuration

### Données sauvegardées où?
**Par défaut**: Dans le navigateur (`localStorage`)
- Automatique, pas de config nécessaire
- Partagées entre onglets du navigateur
- Effacées si cache vidé

**Production**: Sur Firebase Firestore (à configurer)
- Plus sécurisé
- Sauvegarde cloud
- Accessible de n'importe où
- Demandez à votre dev Firebase

### Comment changer tarif d'une classe?
Fichier: `FINANCE_MODULE_2_SCOLARITES.js`

Ligne ~10:
```javascript
TARIFS_PAR_CLASSE: {
  'CP': 50000,      // Modifier ici
  'CE1': 50000,
  // ...
}
```

### Comment ajouter nouvelle catégorie dépense?
Fichier: `FINANCE_MODULE_4_DEPENSES.js`

Ligne ~15:
```javascript
CATEGORIES: {
  'salaire': { label: 'Salaires', icon: '👨‍💼', couleur: '#6366f1' },
  'nouvellecat': { label: 'Nouvelle Catégorie', icon: '🎯', couleur: '#ff0000' },
  // ...
}
```

---

## 🆘 Aide et dépannage

### Q: Je ne vois pas le menu Finance V2
**A**: Vous n'êtes peut-être pas admin. Vérifier:
- Connecté en tant que admin
- Role = 'admin' ou 'school'

### Q: Les données ne se sauvegardent pas
**A**: Vérifier:
- JavaScript activé
- localStorage pas désactivé
- Cache de navigateur pas plein

### Q: Comment exporter les données?
**A**: Dans la console du navigateur:
```javascript
const data = {
  eleves: JSON.parse(localStorage.getItem('eleves') || '[]'),
  factures: JSON.parse(localStorage.getItem('factures') || '[]'),
  // ... etc
};
console.save(data, 'finance.json');
```

### Q: Comment supprimer TOUTES les données?
**A**: Dans la console:
```javascript
localStorage.clear();
location.reload();
```
⚠️ Attention: irréversible!

---

## 📚 Documentation complète

Si vous voulez des détails techniques:

| Document | Contenu |
|----------|---------|
| **GUIDE_FINANCE_V2_COMPLETE.md** | API technique, tous les paramètres |
| **GUIDE_TEST_FINANCE_V2.md** | Comment tester chaque fonction |
| **CHANGELOG_FINANCE_V2.md** | Historique features |
| **RESUME_FINAL_FINANCE_V2.md** | Vue d'ensemble architecte |

---

## 🎓 Cas d'usage réels

### Cas 1: Directeur d'école
**Chaque matin**:
1. Ouvre Tableau de Bord
2. Voit revenus du jour
3. Voit élèves en retard
4. Crée rappels pour retards
5. Prend decisions budgétaires

### Cas 2: Secrétaire
**Quotidien**:
1. Reçoit paiement élève
2. Enregistre dans Scolarités
3. Reçu généré et imprimé
4. Sauvegardé automatiquement
5. Parent a confirmation

### Cas 3: Comptable
**Fin de mois**:
1. Ouvre Gestion Dépenses
2. Voit toutes dépenses catégoriées
3. Valide dépenses
4. Génère rapport
5. Livre au directeur

---

## ✨ Points forts du système

- ✅ **Gratuit**: 0 coût de licence
- ✅ **Modulaire**: Chaque fonction indépendante
- ✅ **Français**: Interface 100% français
- ✅ **Local**: Marche offline
- ✅ **Rapide**: Pas de lag
- ✅ **Beau**: Moderne et responsive
- ✅ **Sûr**: Données locales
- ✅ **Documenté**: Guides complets

---

## 🚀 Prochaines étapes

**À court terme**:
- Configurer Firebase (optionnel)
- Intégrer SMS/Email
- Exporter en PDF

**À long terme**:
- App mobile
- Portal parents en ligne
- Rapports automatiques

---

## 📞 Support technique

Pour questions techniques:
- Consultez `GUIDE_FINANCE_V2_COMPLETE.md`
- Consultez `GUIDE_TEST_FINANCE_V2.md`
- Ouvrez console navigateur (F12) pour erreurs

---

## 🎉 C'est prêt!

Vous avez maintenant un **système complet de gestion financière** pour votre école en Guinée.

**Bon déploiement!** 🚀

```
     ___
    /   \___
   /      _/
  /   \__/
 /___/
```

---

**Version**: 2.0
**Date**: 20 Mai 2026
**Pays**: 🇬🇳 Guinée
**Devise**: Fr (Franc Guinéen)
**Langue**: Français
**Statut**: ✅ PRODUCTION-READY

---

**Créé avec ❤️ pour Neoclass School Management**
