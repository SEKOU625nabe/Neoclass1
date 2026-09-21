# 🏦 Système de Gestion Financière Neoclass V2 COMPLÈTE

## 📋 TABLE DES MATIÈRES
1. [Architecture globale](#architecture)
2. [Les 5 modules](#modules)
3. [API Utilisateur](#api)
4. [Guide d'utilisation](#utilisation)
5. [Intégration](#intégration)

---

## 🏗️ Architecture {#architecture}

### Vue d'ensemble
Le système finance V2 est composé de **5 modules indépendants** mais interconnectés:

```
┌─────────────────────────────────────────────────────┐
│         🔔 SYSTÈME NOTIFICATIONS                   │
│ (Rappels paiement, alertes retard, dossiers)       │
└──────────────────┬──────────────────────────────────┘
                   │
    ┌──────────────┼──────────────┐
    │              │              │
    ▼              ▼              ▼
┌────────────┐ ┌────────────┐ ┌─────────────┐
│👨‍🎓 ÉLÈVES │ │💳 SCOLARITÉS│ │🏷️ DÉPENSES│
│ • Matricule│ │• Factures   │ │• Catégories│
│ • Docs     │ │• Paiements  │ │• Suivi     │
│ • Transfert│ │• Reçus      │ │• Validation│
└────────────┘ └────────────┘ └─────────────┘
    │              │              │
    └──────────────┼──────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │📊 TABLEAU DE BORD    │
        │ • Agrégation totale  │
        │ • Statistiques       │
        │ • Graphiques         │
        └──────────────────────┘
```

### Stockage
- **Firebase Firestore** (production): Collections `eleves`, `factures`, `paiements`, `depenses`, `notifications`
- **localStorage** (fallback): Clés JSON pour développement offline

### Devise
- **Base**: Franc Guinéen (Fr / GNF)
- **Formatage**: `50000` → `"50 000 Fr"` via `CurrencyManager.formatAmount()`

---

## 📦 Les 5 Modules {#modules}

### Module 1: 👨‍🎓 Gestion Élèves
**Fichier**: `FINANCE_MODULE_1_ELEVES.js`

**Responsabilités**:
- Inscription d'élèves avec matricule auto-généré
- Suivi de la documentation requise
- Transferts de classe
- Statistiques par classe

**Données stockées**:
```javascript
eleve: {
  id: "STU-ABC123DEF456",
  nom, prenom, dateNaissance, classe,
  parentNom, parentContact, email,
  statut: "actif",
  dateInscription: "2026-05-20T...",
  dossierComplet: false,
  documents: [
    { type: "certificatNaissance", url: "...", dateAjout: "..." },
    { type: "bulletinScolaire", url: "...", dateAjout: "..." },
    { type: "certificatVaccin", url: "...", dateAjout: "..." }
  ]
}
```

**Méthodes principales**:
```javascript
// Enregistrement
await GestionEleves.inscrireEleve({nom, prenom, classe, ...})
  → {success: true, matricule: "STU-..."}

// Consultation
await GestionEleves.obtenirEleves(classe?)
  → [{id, nom, prenom, classe, ...}, ...]

await GestionEleves.obtenirDossier(eleveId)
  → {id, nom, dossierComplet, documents: [...]}

// Gestion documents
await GestionEleves.ajouterDocument(eleveId, typeDoc, url)
  → {success: true}

// Transferts
await GestionEleves.transfererClasse(eleveId, nouvelleClasse)
  → {success: true}

// Stats
await GestionEleves.obtenirStatistiques()
  → {totalEleves, dossiersComplets, parClasse: {...}}
```

---

### Module 2: 💳 Gestion Scolarités
**Fichier**: `FINANCE_MODULE_2_SCOLARITES.js`

**Responsabilités**:
- Facturation (création de factures)
- Enregistrement de paiements
- Génération de reçus
- Suivi de la délinquance

**Tarifs par classe** (GNF):
- CP, CE1, CE2: 50 000 Fr
- CM1, CM2: 60 000 Fr
- 7-9ème: 80 000 Fr
- 10-12ème: 100 000 Fr

**Données stockées**:
```javascript
facture: {
  id: "FAC-...",
  eleveId, nom, classe, mois,
  dateFacture, montantDu, montantPay,
  resteAPayer, statut: "paye"|"partiel"|"impaye"
}

paiement: {
  id: "PAY-...",
  factureId, eleveId, nom, classe,
  montant, methodePaiement: "especes"|"transfert"|"mobile",
  reference, datePaiement, statut: "completed"
}
```

**Méthodes principales**:
```javascript
// Créer facture
await GestionScolarites.creerFacture(eleveId, mois, montantPay)
  → {success: true, facture: {...}}

// Enregistrer paiement
await GestionScolarites.enregistrerPaiement({
  eleveId, mois, montantPay, methodePaiement, reference
})
  → {success: true, paiement: {...}, recu: "..."}

// Générer reçu
await GestionScolarites.genererRecuPDF(paiement, facture)
  → "Reçu #PAY-123..."

// Solde élève
await GestionScolarites.calculerSolde(eleveId)
  → {amountDue, paid, remaining, status: "a-jour"|"retard"}

// Élèves en retard
await GestionScolarites.obtenirElevesEnRetard()
  → [{eleveId, nom, classe, resteAPayer}, ...]

// Statistiques
await GestionScolarites.obtenirStatistiques()
  → {totalCollecte, totalDu, resteAPayer, tauxPaiement: 85}
```

---

### Module 3: 📊 Tableau de Bord Financier
**Fichier**: `FINANCE_MODULE_3_TABLEAU_DE_BORD.js`

**Responsabilités**:
- Agrégation de données de tous les modules
- Calculs financiers consolidés
- Génération de données pour graphiques
- Alertes automatiques

**Méthodes principales**:
```javascript
// Calcul revenus (par classe)
await TableauBordFinancier.calculerRevenus(periode)
  → {total, parClasse: {CP: 1500000, ...}}

// Récupérer dépenses
await TableauBordFinancier.obtenirDépenses()
  → [{categorie, montant, ...}, ...]

// Calcul bénéfices
await TableauBordFinancier.calculerBenefices()
  → {revenus, depenses, benefices, marginePct}

// RÉSUMÉ COMPLET (15+ champs)
await TableauBordFinancier.obtenirResume()
  → {
    revenusTotal: 5000000,
    depensesTotal: 2000000,
    benefices: 3000000,
    totalEleves: 250,
    eleveAJour: 210,
    eleveRetard: 40,
    dossiersComplets: 240,
    dossiersIncomplets: 10,
    paiementMoyenParEleve: 20000,
    ...
  }

// Données pour graphiques (5 types)
await TableauBordFinancier.obtenirDonneesGraphiques()
  → {
    financier: {labels: [...], values: [...], couleur: '#10b981'},
    eleves: {...},
    scolarite: {...},
    depenses: {...},
    parClasse: {...}
  }
```

---

### Module 4: 🏷️ Gestion Dépenses
**Fichier**: `FINANCE_MODULE_4_DEPENSES.js`

**Responsabilités**:
- Enregistrement des dépenses
- Catégorisation (5 types)
- Suivi et validation
- Statistiques par catégorie

**Catégories de dépenses**:
| Type | Icon | Couleur | Exemple |
|------|------|---------|---------|
| Salaires | 👨‍💼 | #6366f1 | Salaire prof, gardien |
| Fournitures | 📚 | #f59e0b | Cahiers, stylos |
| Transport | 🚌 | #3b82f6 | Carburant bus |
| Entretien | 🔧 | #ec4899 | Réparations |
| Autres | 📦 | #8b5cf6 | Divers |

**Données stockées**:
```javascript
depense: {
  id: "DEP-...",
  categorie: "salaire"|"fourniture"|"transport"|"entretien"|"autre",
  description, montant, date,
  beneficiaire, dateCreation,
  statut: "enregistree"|"validee",
  justificatif: null
}
```

**Méthodes principales**:
```javascript
// Ajouter dépense
await GestionDepenses.ajouterDepense({
  categorie, description, montant, date, beneficiaire
})
  → {success: true, depense: {...}}

// Obtenir dépenses (avec filtres)
await GestionDepenses.obtenirDepenses(categorie?, mois?)
  → [{id, categorie, montant, ...}, ...]

// Par catégorie
await GestionDepenses.obtenirDepensesParCategorie(mois?)
  → {categories: {salaire: 1000000, ...}, total: 1500000}

// Par mois
await GestionDepenses.obtenirDépensesParMois(annee)
  → {Jan: 500000, Fev: 600000, ...}

// Modification
await GestionDepenses.modifierDepense(depenseId, nouvellesDonnees)
  → {success: true}

// Validation
await GestionDepenses.validerDepense(depenseId)
  → {success: true}

// Stats
await GestionDepenses.obtenirStatistiques()
  → {totalDépenses, parCategorie: {...}, nombreDépenses, moyenneParDépense}
```

---

### Module 5: 🔔 Système Notifications
**Fichier**: `FINANCE_MODULE_5_NOTIFICATIONS.js`

**Responsabilités**:
- Création de notifications
- Génération automatique de rappels/alertes
- Gestion d'inbox (lu/non-lu)
- Historique des messages

**Types de notifications**:
```javascript
TYPES: {
  'rappel_paiement': {
    title: '💰 Rappel de paiement',
    gravite: 'info'
  },
  'retard_scolarite': {
    title: '⚠️ Retard de scolarité',
    gravite: 'error'
  },
  'dossier_incomplet': {
    title: '📋 Dossier incomplet',
    gravite: 'warning'
  },
  'alerte_budget': {
    title: '💸 Alerte budget',
    gravite: 'error'
  },
  'paiement_recu': {
    title: '✅ Paiement reçu',
    gravite: 'success'
  }
}
```

**Données stockées**:
```javascript
notification: {
  id: "NOT-...",
  type: "rappel_paiement"|"retard_scolarite"|...,
  titre, message,
  destinataire, eleveId?,
  dateCreation, lu: false,
  envoye: false
}
```

**Méthodes principales**:
```javascript
// Créer manuelle
await SystemeNotifications.creerNotification({
  type, destinataire, titre, message, eleveId?
})
  → {success: true, notification: {...}}

// Générer rappels auto (pour retards)
await SystemeNotifications.genererRappelsAutomatiques()
  → [{notification}, ...]

// Alertes dossiers incomplets
await SystemeNotifications.creerAlertesDossiersIncomplets()
  → [{notification}, ...]

// Alerte budget (si dépenses > revenus)
await SystemeNotifications.creerAlerteBudget()
  → {notification} | null

// Obtenir notifications
await SystemeNotifications.obtenirNotifications(destinataire, nonLues?)
  → [{id, titre, message, ...}, ...]

// Compteur
await SystemeNotifications.compteurNonLues(destinataire)
  → 3

// Marquer comme lue
await SystemeNotifications.marquerCommeNonLue(notificationId)
  → {success: true}

// Supprimer
await SystemeNotifications.supprimerNotification(notificationId)
  → {success: true}

// Envoyer (SMS/Email - simulation)
await SystemeNotifications.envoyerNotification(notificationId)
  → {success: true}
```

---

## 🎮 API Utilisateur {#api}

### Accès aux pages UI
Dans Neoclass3.html, utilisez:
```javascript
navigate('gestion-eleves');           // Gestion Élèves
navigate('gestion-scolarites');       // Gestion Scolarités
navigate('tableau-bord-finances');    // Tableau Bord
navigate('gestion-depenses');         // Gestion Dépenses
navigate('gestion-notifications');    // Notifications
navigate('admin-finances');           // Dashboard financier V1
```

### Appels directs depuis console
```javascript
// Module 1
GestionEleves.inscrireEleve({nom:'Ali', prenom:'Ahmed', classe:'CM1'})

// Module 2
GestionScolarites.obtenirElevesEnRetard()

// Module 3
TableauBordFinancier.obtenirResume()

// Module 4
GestionDepenses.obtenirStatistiques()

// Module 5
SystemeNotifications.genererRappelsAutomatiques()
```

---

## 📚 Guide d'utilisation {#utilisation}

### Workflow complet: Inscrire un élève + enregistrer paiement

```javascript
// 1. Inscrire élève
const inscrip = await GestionEleves.inscrireEleve({
  nom: 'Diallo',
  prenom: 'Aissatou',
  dateNaissance: '2015-03-20',
  classe: 'CM2',
  parentNom: 'Diallo Mamadou',
  parentContact: '+224 620 12 34 56',
  email: 'family@email.com'
});
console.log('Matricule:', inscrip.matricule);

// 2. Créer facture
const facture = await GestionScolarites.creerFacture(
  inscrip.matricule,
  'janvier',
  60000  // Tarif CM2
);

// 3. Enregistrer paiement
const paiement = await GestionScolarites.enregistrerPaiement({
  eleveId: inscrip.matricule,
  mois: 'janvier',
  montantPay: 60000,
  methodePaiement: 'especes',
  reference: 'CASH-001'
});
console.log('Reçu:', paiement.recu);

// 4. Créer notification
await SystemeNotifications.creerNotification({
  type: 'paiement_recu',
  destinataire: 'admin',
  titre: `Paiement ${inscrip.matricule}`,
  message: `${inscrip.matricule} - 60 000 Fr reçu`,
  eleveId: inscrip.matricule,
  montant: 60000
});

// 5. Voir résumé
const resume = await TableauBordFinancier.obtenirResume();
console.log('Revenus totaux:', CurrencyManager.formatAmount(resume.revenusTotal));
```

### Workflow: Ajouter dépense + générer rapport

```javascript
// 1. Ajouter dépense salaire
await GestionDepenses.ajouterDepense({
  categorie: 'salaire',
  description: 'Salaire Professeur Math',
  montant: 500000,
  date: '2026-05-20',
  beneficiaire: 'Mme Diallo'
});

// 2. Voir dépenses totales
const stats = await GestionDepenses.obtenirStatistiques();
console.log('Total:', CurrencyManager.formatAmount(stats.totalDépenses));

// 3. Ajouter dépense fourniture
await GestionDepenses.ajouterDepense({
  categorie: 'fourniture',
  description: 'Cahiers & Stylos',
  montant: 150000,
  date: '2026-05-21',
  beneficiaire: 'Librairie Fassou'
});

// 4. Voir par catégorie
const parCat = await GestionDepenses.obtenirDepensesParCategorie();
console.log('Par catégorie:', parCat.categories);

// 5. Vérifier si budget alarming
const benefices = await TableauBordFinancier.calculerBenefices();
if (benefices.benefices < 0) {
  await SystemeNotifications.creerAlerteBudget();
}
```

---

## 🔗 Intégration {#intégration}

### Fichiers à importer
Tous doivent être dans Neoclass3.html (déjà fait):

```html
<!-- Ordre IMPORTANT (dépendances) -->
<script src="FINANCE_SYSTEM_ENHANCED.js"></script>
<script src="CURRENCY_CONVERTER.js"></script>
<script src="FINANCE_MODULE_1_ELEVES.js"></script>
<script src="FINANCE_MODULE_2_SCOLARITES.js"></script>
<script src="FINANCE_MODULE_3_TABLEAU_DE_BORD.js"></script>
<script src="FINANCE_MODULE_4_DEPENSES.js"></script>
<script src="FINANCE_MODULE_5_NOTIFICATIONS.js"></script>
```

### Points de menu
Dans le menu "Finances V2" de l'interface admin:
- 👨‍🎓 Gestion Élèves
- 💳 Gestion Scolarités
- 🏷️ Gestion Dépenses
- 🔔 Notifications
- 📈 Tableau Bord

### Sécurité
- Seuls les `role==='admin'` ou `role==='school'` peuvent accéder
- Vérification `isAdmin()` dans chaque renderFunction
- Données sensibles en Firestore (non localStorage en prod)

---

## 🚀 Prochaines étapes

1. **Intégration SMS/Email**: Connecter `SystemeNotifications.envoyerNotification()` à service externe
2. **Charts**: Ajouter Chart.js pour `TableauBordFinancier.obtenirDonneesGraphiques()`
3. **Rapports PDF**: Exporter factures/reçus en PDF
4. **Audit trail**: Logger toutes les transactions
5. **Export Excel**: Exporter scolarités/dépenses

---

## 📞 Support

**Questions fréquentes**:
- **Les données ne se sauvegardent pas?** → Vérifier Firebase config ou localStorage
- **Un élève ne paie que la moitié?** → Facture "partiel", reste à payer visible
- **Budget négatif?** → Alerte auto-générée, check `genererAlerteBudget()`

**Erreurs connues**: Aucune - système neuf et testé ✅

---

**Dernière mise à jour**: 20 Mai 2026
**Version**: 2.0 COMPLÈTE
**Langue**: Français
**Devise**: Franc Guinéen (Fr)
