# 🧪 GUIDE DE TEST - Système Finance V2

## Environnement de test
- **Navigateur**: Chrome/Firefox (dernière version)
- **Localisation**: Français (FR-FR)
- **Devise**: Franc Guinéen (Fr)
- **Données**: localStorage (pas Firebase nécessaire)

---

## ✅ Tests fonctionnels par module

### Module 1: Gestion Élèves

#### Test 1.1: Inscrire un élève
```javascript
// Dans la console browser
GestionEleves.inscrireEleve({
  nom: 'Diallo',
  prenom: 'Aissatou',
  dateNaissance: '2015-03-20',
  classe: 'CM2',
  parentNom: 'Diallo Mamadou',
  parentContact: '+224 620 12 34 56',
  email: 'aissatou@example.com'
}).then(r => {
  console.log('✅ Élève inscrit');
  console.log('Matricule:', r.matricule);
  console.log('Réponse:', r);
});
```

**Résultat attendu**:
- `r.success === true`
- `r.matricule` commence par "STU-"
- localStorage contient l'élève

#### Test 1.2: Récupérer la liste des élèves
```javascript
GestionEleves.obtenirEleves().then(eleves => {
  console.log(`✅ ${eleves.length} élèves trouvés`);
  console.log('Premiers élève:', eleves[0]);
});
```

**Résultat attendu**:
- Array de 1+ élève
- Chaque élève a: `id, nom, prenom, classe, statut`

#### Test 1.3: Obtenir le dossier d'un élève
```javascript
// D'abord obtenir un matricule
GestionEleves.obtenirEleves().then(async eleves => {
  const matricule = eleves[0].id;
  const dossier = await GestionEleves.obtenirDossier(matricule);
  console.log('✅ Dossier obtenu');
  console.log('Dossier complet?', dossier.dossierComplet);
  console.log('Documents:', dossier.documents);
});
```

**Résultat attendu**:
- `dossier.dossierComplet === false` (initialement)
- `dossier.documents === []` (vide)

#### Test 1.4: Ajouter un document
```javascript
GestionEleves.obtenirEleves().then(async eleves => {
  const matricule = eleves[0].id;
  const result = await GestionEleves.ajouterDocument(
    matricule,
    'certificatNaissance',
    'https://example.com/cert.pdf'
  );
  console.log('✅ Document ajouté:', result.success);
});
```

**Résultat attendu**:
- `result.success === true`
- Document visible dans `obtenirDossier()`

#### Test 1.5: Transfert de classe
```javascript
GestionEleves.obtenirEleves().then(async eleves => {
  const matricule = eleves[0].id;
  const result = await GestionEleves.transfererClasse(matricule, 'CM1');
  console.log('✅ Transfert:', result.success);
  
  const dossier = await GestionEleves.obtenirDossier(matricule);
  console.log('Nouvelle classe:', dossier.classe);
});
```

**Résultat attendu**:
- `result.success === true`
- Classe changée dans les données

#### Test 1.6: Statistiques élèves
```javascript
GestionEleves.obtenirStatistiques().then(stats => {
  console.log('✅ Stats élèves:');
  console.log('Total:', stats.totalEleves);
  console.log('Dossiers complets:', stats.dossiersComplets);
  console.log('Par classe:', stats.parClasse);
});
```

**Résultat attendu**:
- `stats.totalEleves >= 1`
- `stats.parClasse` contient les classes avec counts

---

### Module 2: Gestion Scolarités

#### Test 2.1: Créer une facture
```javascript
GestionEleves.obtenirEleves().then(async eleves => {
  const matricule = eleves[0].id;
  const facture = await GestionScolarites.creerFacture(
    matricule,
    'janvier',
    50000  // ou 60000 selon classe
  );
  console.log('✅ Facture créée');
  console.log('Facture:', facture);
  console.log('ID:', facture.id);
});
```

**Résultat attendu**:
- `facture.id` commence par "FAC-"
- `facture.statut === 'impaye'` (initialement)
- `facture.montantDu === 50000`

#### Test 2.2: Enregistrer un paiement
```javascript
GestionScolarites.obtenirHistorique('').then(async factures => {
  if (factures.length === 0) {
    console.log('❌ Pas de factures, créez-en une d\'abord');
    return;
  }
  
  const facture = factures[0];
  const paiement = await GestionScolarites.enregistrerPaiement({
    eleveId: facture.eleveId,
    mois: facture.mois,
    montantPay: 50000,
    methodePaiement: 'especes',
    reference: 'CASH-001'
  });
  
  console.log('✅ Paiement enregistré');
  console.log('Paiement ID:', paiement.id);
  console.log('Reçu:', paiement.recu);
});
```

**Résultat attendu**:
- `paiement.id` commence par "PAY-"
- `paiement.statut === 'completed'`
- `paiement.recu` contient "Reçu #PAY-..."

#### Test 2.3: Calcul du solde
```javascript
GestionEleves.obtenirEleves().then(async eleves => {
  const matricule = eleves[0].id;
  const solde = await GestionScolarites.calculerSolde(matricule);
  console.log('✅ Solde élève:');
  console.log('À payer:', solde.amountDue);
  console.log('Payé:', solde.paid);
  console.log('Reste:', solde.remaining);
  console.log('Statut:', solde.status);
});
```

**Résultat attendu**:
- `solde.status === 'a-jour'` si tout payé
- `solde.status === 'retard'` si reste à payer

#### Test 2.4: Élèves en retard
```javascript
GestionScolarites.obtenirElevesEnRetard().then(retards => {
  console.log(`✅ ${retards.length} élèves en retard`);
  if (retards.length > 0) {
    console.log('Premier retard:', retards[0]);
    console.log('Montant dû:', retards[0].resteAPayer);
  }
});
```

**Résultat attendu**:
- Array (peut être vide)
- Chaque item a: `eleveId, nom, classe, resteAPayer`

#### Test 2.5: Statistiques scolarités
```javascript
GestionScolarites.obtenirStatistiques().then(stats => {
  console.log('✅ Stats scolarités:');
  console.log('Collecté:', stats.totalCollecte, 'Fr');
  console.log('À recevoir:', stats.totalDu, 'Fr');
  console.log('Reste à payer:', stats.resteAPayer, 'Fr');
  console.log('Taux paiement:', stats.tauxPaiement, '%');
});
```

**Résultat attendu**:
- `stats.totalCollecte > 0`
- `stats.tauxPaiement` entre 0 et 100

---

### Module 3: Tableau de Bord

#### Test 3.1: Calcul revenus
```javascript
TableauBordFinancier.calculerRevenus('2026-05').then(revenus => {
  console.log('✅ Revenus mai 2026:');
  console.log('Total:', revenus.total, 'Fr');
  console.log('Par classe:', revenus.parClasse);
});
```

**Résultat attendu**:
- `revenus.total >= 0`
- `revenus.parClasse` object avec classes clé

#### Test 3.2: Calcul bénéfices
```javascript
TableauBordFinancier.calculerBenefices().then(benef => {
  console.log('✅ Bénéfices:');
  console.log('Revenus:', benef.revenus, 'Fr');
  console.log('Dépenses:', benef.depenses, 'Fr');
  console.log('Bénéfices:', benef.benefices, 'Fr');
  console.log('Marge:', benef.marginePct, '%');
});
```

**Résultat attendu**:
- Tous les nombres >= 0 (format GNF)

#### Test 3.3: Résumé complet (15+ champs)
```javascript
TableauBordFinancier.obtenirResume().then(resume => {
  console.log('✅ Résumé financier complet:');
  console.log('Élèves total:', resume.totalEleves);
  console.log('À jour:', resume.eleveAJour);
  console.log('En retard:', resume.eleveRetard);
  console.log('Revenus:', resume.revenusTotal, 'Fr');
  console.log('Dépenses:', resume.depensesTotal, 'Fr');
  console.log('Bénéfices:', resume.benefices, 'Fr');
});
```

**Résultat attendu**:
- Tous les champs présents
- Nombres cohérents (total = à jour + retard)

#### Test 3.4: Données graphiques
```javascript
TableauBordFinancier.obtenirDonneesGraphiques().then(donnees => {
  console.log('✅ Données graphiques:');
  Object.keys(donnees).forEach(key => {
    console.log(`${key}:`, donnees[key].labels.length, 'points');
  });
});
```

**Résultat attendu**:
- 5 keys: `financier, eleves, scolarite, depenses, parClasse`
- Chaque dataset a `labels`, `values`, `couleur`

---

### Module 4: Gestion Dépenses

#### Test 4.1: Ajouter une dépense
```javascript
GestionDepenses.ajouterDepense({
  categorie: 'salaire',
  description: 'Salaire Mme Diallo',
  montant: 500000,
  date: '2026-05-20',
  beneficiaire: 'Mme Diallo'
}).then(result => {
  console.log('✅ Dépense ajoutée:', result.success);
  console.log('ID:', result.depense.id);
});
```

**Résultat attendu**:
- `result.success === true`
- `result.depense.id` commence par "DEP-"
- `result.depense.statut === 'enregistree'`

#### Test 4.2: Obtenir les dépenses
```javascript
GestionDepenses.obtenirDepenses().then(depenses => {
  console.log(`✅ ${depenses.length} dépenses trouvées`);
  if (depenses.length > 0) {
    console.log('Première:', depenses[0]);
    console.log('Montant:', depenses[0].montant, 'Fr');
  }
});
```

**Résultat attendu**:
- Array de dépenses
- Chaque item a: `id, categorie, montant, date, statut`

#### Test 4.3: Dépenses par catégorie
```javascript
GestionDepenses.obtenirDepensesParCategorie().then(data => {
  console.log('✅ Dépenses par catégorie:');
  console.log('Categories:', data.categories);
  console.log('Total:', data.total, 'Fr');
});
```

**Résultat attendu**:
- `data.categories` object avec salaire, fourniture, etc.
- `data.total` >= `data.categories` somme

#### Test 4.4: Modifier une dépense
```javascript
GestionDepenses.obtenirDepenses().then(async depenses => {
  if (depenses.length === 0) return;
  const depenseId = depenses[0].id;
  const result = await GestionDepenses.modifierDepense(depenseId, {
    description: 'MODIFIÉ - Salaire Mme Diallo (révision)',
    montant: 550000
  });
  console.log('✅ Dépense modifiée:', result.success);
});
```

**Résultat attendu**:
- `result.success === true`
- Données mises à jour

#### Test 4.5: Valider une dépense
```javascript
GestionDepenses.obtenirDepenses().then(async depenses => {
  const depenseId = depenses[0].id;
  const result = await GestionDepenses.validerDepense(depenseId);
  console.log('✅ Dépense validée:', result.success);
  
  const updated = await GestionDepenses.obtenirDepenses();
  const found = updated.find(d => d.id === depenseId);
  console.log('Nouveau statut:', found.statut);
});
```

**Résultat attendu**:
- `result.success === true`
- `found.statut === 'validee'`

#### Test 4.6: Statistiques dépenses
```javascript
GestionDepenses.obtenirStatistiques().then(stats => {
  console.log('✅ Stats dépenses:');
  console.log('Total:', stats.totalDépenses, 'Fr');
  console.log('Nombre:', stats.nombreDépenses);
  console.log('Moyenne:', stats.moyenneParDépense, 'Fr');
});
```

**Résultat attendu**:
- `stats.totalDépenses >= 0`
- `stats.nombreDépenses >= 1`

---

### Module 5: Système Notifications

#### Test 5.1: Créer une notification
```javascript
SystemeNotifications.creerNotification({
  type: 'rappel_paiement',
  destinataire: 'admin',
  titre: 'Test Rappel',
  message: 'Ceci est un test de notification'
}).then(result => {
  console.log('✅ Notification créée:', result.success);
  console.log('ID:', result.notification.id);
});
```

**Résultat attendu**:
- `result.success === true`
- `result.notification.id` commence par "NOT-"
- `result.notification.lu === false`

#### Test 5.2: Obtenir les notifications
```javascript
SystemeNotifications.obtenirNotifications('admin').then(notifs => {
  console.log(`✅ ${notifs.length} notifications pour admin`);
  if (notifs.length > 0) {
    console.log('Première:', notifs[0].titre);
  }
});
```

**Résultat attendu**:
- Array de notifications
- Chaque item a: `id, type, titre, message, lu`

#### Test 5.3: Compteur notifications non lues
```javascript
SystemeNotifications.compteurNonLues('admin').then(count => {
  console.log('✅ Notifications non lues:', count);
});
```

**Résultat attendu**:
- Nombre >= 0

#### Test 5.4: Marquer comme lue
```javascript
SystemeNotifications.obtenirNotifications('admin', true).then(async notifs => {
  if (notifs.length === 0) {
    console.log('❌ Pas de notifications non lues');
    return;
  }
  
  const id = notifs[0].id;
  const result = await SystemeNotifications.marquerCommeNonLue(id);
  console.log('✅ Marquée comme lue:', result.success);
  
  const count = await SystemeNotifications.compteurNonLues('admin');
  console.log('Compteur avant:', notifs.length);
  console.log('Compteur après:', count);
});
```

**Résultat attendu**:
- `result.success === true`
- Compteur décrémenté

#### Test 5.5: Générer rappels automatiques
```javascript
SystemeNotifications.genererRappelsAutomatiques().then(rappels => {
  console.log(`✅ ${rappels.length} rappels générés`);
  if (rappels.length > 0) {
    console.log('Premier rappel:', rappels[0].titre);
  }
});
```

**Résultat attendu**:
- Array de rappels créés (peut être vide si no retards)
- Si des retards existent: rappels générés

#### Test 5.6: Alertes dossiers incomplets
```javascript
SystemeNotifications.creerAlertesDossiersIncomplets().then(alertes => {
  console.log(`✅ ${alertes.length} alertes dossiers créées`);
});
```

**Résultat attendu**:
- Array d'alertes (vide si tous dossiers complets)

#### Test 5.7: Alerte budget
```javascript
SystemeNotifications.creerAlerteBudget().then(alerte => {
  if (alerte) {
    console.log('⚠️ Alerte budget créée - déficit détecté');
  } else {
    console.log('✅ Budget sain, aucune alerte');
  }
});
```

**Résultat attendu**:
- Alerte OU null selon budget

---

## 🎬 Test workflow complet

### Scenario: Inscrire élève → Payer → Voir rapport

```javascript
// 1. INSCRIRE ÉLÈVE
console.log('1️⃣ INSCRIPTION ÉLÈVE');
const insc = await GestionEleves.inscrireEleve({
  nom: 'Bah', prenom: 'Ibrahima',
  dateNaissance: '2014-07-15',
  classe: 'CE2',
  parentNom: 'Bah Aminata',
  parentContact: '+224 621 12 34 56',
  email: 'bah@family.com'
});
console.log('✅ Matricule:', insc.matricule);

// 2. CRÉER FACTURE
console.log('\n2️⃣ CRÉATION FACTURE');
const fac = await GestionScolarites.creerFacture(insc.matricule, 'mai', 50000);
console.log('✅ Facture ID:', fac.id);
console.log('   Montant dû:', CurrencyManager.formatAmount(fac.montantDu));

// 3. ENREGISTRER PAIEMENT
console.log('\n3️⃣ ENREGISTREMENT PAIEMENT');
const paiement = await GestionScolarites.enregistrerPaiement({
  eleveId: insc.matricule,
  mois: 'mai',
  montantPay: 50000,
  methodePaiement: 'mobile',
  reference: 'MOOV-12345'
});
console.log('✅ Paiement ID:', paiement.id);
console.log('   Reçu:', paiement.recu.substring(0, 50) + '...');

// 4. AJOUTER DÉPENSE
console.log('\n4️⃣ AJOUT DÉPENSE');
const dep = await GestionDepenses.ajouterDepense({
  categorie: 'transport',
  description: 'Carburant bus - mai',
  montant: 200000,
  date: '2026-05-20',
  beneficiaire: 'SHELL Station'
});
console.log('✅ Dépense ID:', dep.id);

// 5. VOIR DASHBOARD
console.log('\n5️⃣ DASHBOARD');
const resume = await TableauBordFinancier.obtenirResume();
console.log('✅ Élèves:', resume.totalEleves);
console.log('   À jour:', resume.eleveAJour);
console.log('   Revenus:', CurrencyManager.formatAmount(resume.revenusTotal));
console.log('   Dépenses:', CurrencyManager.formatAmount(resume.depensesTotal));
console.log('   Bénéfices:', CurrencyManager.formatAmount(resume.benefices));

// 6. NOTIFICATIONS
console.log('\n6️⃣ NOTIFICATIONS');
const notifs = await SystemeNotifications.obtenirNotifications('admin');
console.log('✅ Notifications:', notifs.length);

console.log('\n🎉 WORKFLOW COMPLÈTE RÉUSSIE!');
```

**Résultat attendu**:
```
1️⃣ INSCRIPTION ÉLÈVE
✅ Matricule: STU-ABC123DEF456

2️⃣ CRÉATION FACTURE
✅ Facture ID: FAC-123...
   Montant dû: 50 000 Fr

3️⃣ ENREGISTREMENT PAIEMENT
✅ Paiement ID: PAY-456...
   Reçu: Reçu #PAY-456...

4️⃣ AJOUT DÉPENSE
✅ Dépense ID: DEP-789...

5️⃣ DASHBOARD
✅ Élèves: 1
   À jour: 1
   Revenus: 50 000 Fr
   Dépenses: 200 000 Fr
   Bénéfices: -150 000 Fr

6️⃣ NOTIFICATIONS
✅ Notifications: 0

🎉 WORKFLOW COMPLÈTE RÉUSSIE!
```

---

## 🚨 Tests de charge

### Tester avec 100 élèves
```javascript
// Générer 100 élèves
for (let i = 0; i < 100; i++) {
  const r = await GestionEleves.inscrireEleve({
    nom: `Élève${i}`,
    prenom: `Test`,
    classe: ['CP', 'CE1', 'CE2'][i % 3],
    dateNaissance: '2015-01-01',
    parentNom: 'Parent',
    parentContact: '+224 600 00 00 00',
    email: `eleve${i}@test.com`
  });
  if (i % 10 === 0) console.log(`✅ ${i} élèves créés`);
}
```

**Vérifier**:
- localStorage pas "full" (max 5-10MB)
- UI reste responsive
- Pas de lag en affichage liste

---

## 📊 Vérification données localStorage
```javascript
// Voir toutes les données sauvegardées
console.log('=== DONNÉES LOCALSTORAGE ===');
console.log('Élèves:', JSON.parse(localStorage.getItem('eleves') || '[]').length);
console.log('Factures:', JSON.parse(localStorage.getItem('factures') || '[]').length);
console.log('Paiements:', JSON.parse(localStorage.getItem('paiements') || '[]').length);
console.log('Dépenses:', JSON.parse(localStorage.getItem('depenses') || '[]').length);
console.log('Notifications:', JSON.parse(localStorage.getItem('notifications') || '[]').length);

// Exporter en JSON
const data = {
  eleves: JSON.parse(localStorage.getItem('eleves') || '[]'),
  factures: JSON.parse(localStorage.getItem('factures') || '[]'),
  paiements: JSON.parse(localStorage.getItem('paiements') || '[]'),
  depenses: JSON.parse(localStorage.getItem('depenses') || '[]'),
  notifications: JSON.parse(localStorage.getItem('notifications') || '[]')
};
console.log(JSON.stringify(data, null, 2));
```

---

## ✨ Tests UI

### Via l'interface
1. Ouvrir Neoclass3.html en navigateur
2. Login admin (ou role: 'admin' via console)
3. Aller à Menu → Finances V2 → Gestion Élèves
4. Tester les 4 tabs (Inscrire, Liste, Documents, Statistiques)
5. Même pour les 5 autres modules

**À vérifier**:
- ✅ Onglets changent smooth
- ✅ Formulaires sont responsive
- ✅ Boutons ont hover effect
- ✅ Données s'affichent correctement
- ✅ Pas d'erreurs console

---

**Bon test! 🚀**
