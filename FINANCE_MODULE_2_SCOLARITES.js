// ============================================================
// 💵 MODULE 2 - GESTION DES SCOLARITÉS
// ============================================================
// Paiements partiels/totaux, reçus PDF, historique
// ============================================================

'use strict';

const GestionScolarites = {
  paiements: [],

  // Configuration des tarifs par classe
  TARIFS_PAR_CLASSE: {
    'CP': 50000, 'CE1': 50000, 'CE2': 55000,
    'CM1': 60000, 'CM2': 60000,
    '7eme': 75000, '8eme': 75000, '9eme': 80000,
    '10eme': 100000, '11eme': 100000, '12eme': 100000
  },

  /**
   * Créer une facture de scolarité
   */
  async creerFacture(eleveId, mois, montantPay) {
    try {
      const eleve = await GestionEleves.obtenirDossier(eleveId);
      if (!eleve) throw new Error('Élève non trouvé');

      const tarifMensuel = this.TARIFS_PAR_CLASSE[eleve.classe];
      const montantDu = tarifMensuel;

      const facture = {
        id: `FAC-${Date.now()}`,
        eleveId,
        nom: `${eleve.prenom} ${eleve.nom}`,
        classe: eleve.classe,
        mois,
        dateFacture: new Date().toISOString(),
        montantDu,
        montantPay: Math.min(montantPay, montantDu),
        resteAPayer: Math.max(0, montantDu - montantPay),
        statut: montantPay >= montantDu ? 'paye' : 'partiel',
        type: 'scolarite'
      };

      // Sauvegarder
      if (typeof db !== 'undefined') {
        await db.collection('factures').doc(facture.id).set(facture);
      } else {
        let factures = JSON.parse(localStorage.getItem('factures') || '[]');
        factures.push(facture);
        localStorage.setItem('factures', JSON.stringify(factures));
      }

      this.paiements.push(facture);
      return { success: true, facture };
    } catch (error) {
      console.error('Erreur facture:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Enregistrer un paiement
   */
  async enregistrerPaiement(data) {
    try {
      const { eleveId, montant, methodePaiement, reference, mois } = data;

      const eleve = await GestionEleves.obtenirDossier(eleveId);
      if (!eleve) throw new Error('Élève non trouvé');

      // Créer la facture
      const factureResult = await this.creerFacture(eleveId, mois, montant);
      if (!factureResult.success) throw new Error(factureResult.error);

      // Enregistrer le paiement
      const paiement = {
        id: `PAY-${Date.now()}`,
        factureId: factureResult.facture.id,
        eleveId,
        nom: `${eleve.prenom} ${eleve.nom}`,
        classe: eleve.classe,
        montant,
        methodePaiement,
        reference,
        datePaiement: new Date().toISOString(),
        statut: 'completed',
        recu: null
      };

      if (typeof db !== 'undefined') {
        await db.collection('paiements').doc(paiement.id).set(paiement);
      } else {
        let paiements = JSON.parse(localStorage.getItem('paiements') || '[]');
        paiements.push(paiement);
        localStorage.setItem('paiements', JSON.stringify(paiements));
      }

      // Générer reçu PDF
      const recuPDF = await this.genererRecuPDF(paiement, factureResult.facture);

      return {
        success: true,
        paiement,
        facture: factureResult.facture,
        recu: recuPDF
      };
    } catch (error) {
      console.error('Erreur paiement:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Générer reçu PDF (simplifié)
   */
  async genererRecuPDF(paiement, facture) {
    const contenu = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        REÇU DE PAIEMENT SCOLARITÉ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Établissement: NEOCLASS ÉCOLE
Adresse: Conakry, Guinée
SIRET/RCCM: XX-XXXXX-X

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INFORMATIONS ÉLÈVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Nom & Prénom: ${paiement.nom}
Classe: ${paiement.classe}
Matricule: ${facture.eleveId}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DÉTAILS DU PAIEMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Mois: ${facture.mois}
Montant Dû: ${facture.montantDu.toLocaleString('fr-FR')} Fr
Montant Payé: ${paiement.montant.toLocaleString('fr-FR')} Fr
Reste à Payer: ${facture.resteAPayer.toLocaleString('fr-FR')} Fr

Méthode: ${paiement.methodePaiement}
Référence: ${paiement.reference || 'N/A'}
Statut: ✓ PAYÉ

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DATE ET HEURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Date: ${new Date(paiement.datePaiement).toLocaleDateString('fr-FR')}
Heure: ${new Date(paiement.datePaiement).toLocaleTimeString('fr-FR')}

N° Reçu: ${paiement.id}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SIGNATURE AGENT

_________________________
    Caissier(ère)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Merci de votre confiance !
    `;

    return {
      id: `RECU-${Date.now()}`,
      paiementId: paiement.id,
      contenu,
      dateCréation: new Date().toISOString()
    };
  },

  /**
   * Obtenir historique paiements d'un élève
   */
  async obtenirHistorique(eleveId) {
    try {
      let paiements = [];

      if (typeof db !== 'undefined') {
        const snapshot = await db.collection('paiements')
          .where('eleveId', '==', eleveId)
          .orderBy('datePaiement', 'desc')
          .get();
        snapshot.forEach(doc => paiements.push(doc.data()));
      } else {
        paiements = JSON.parse(localStorage.getItem('paiements') || '[]')
          .filter(p => p.eleveId === eleveId)
          .sort((a, b) => new Date(b.datePaiement) - new Date(a.datePaiement));
      }

      return paiements;
    } catch (error) {
      console.error('Erreur historique:', error);
      return [];
    }
  },

  /**
   * Calculer reste à payer
   */
  async calculerSolde(eleveId) {
    try {
      const eleve = await GestionEleves.obtenirDossier(eleveId);
      if (!eleve) throw new Error('Élève non trouvé');

      const historique = await this.obtenirHistorique(eleveId);
      
      let totalDu = 0;
      let totalPay = 0;

      historique.forEach(paiement => {
        totalDu += paiement.montant;
        totalPay += paiement.montant;
      });

      // Estimation: scolarité mensuelle × nombre de mois année scolaire
      const tarifMensuel = this.TARIFS_PAR_CLASSE[eleve.classe];
      const moisScolarite = 9; // Septembre à Mai
      const totalScolariteAnnuelle = tarifMensuel * moisScolarite;

      return {
        eleveId,
        nom: `${eleve.prenom} ${eleve.nom}`,
        classe: eleve.classe,
        scolariteAnnuelle: totalScolariteAnnuelle,
        totalPay,
        resteAPayer: Math.max(0, totalScolariteAnnuelle - totalPay),
        statut: totalScolariteAnnuelle - totalPay <= 0 ? 'a-jour' : 'retard'
      };
    } catch (error) {
      console.error('Erreur solde:', error);
      return null;
    }
  },

  /**
   * Obtenir liste élèves retard
   */
  async obtenirElevesEnRetard() {
    try {
      const eleves = await GestionEleves.obtenirEleves();
      const retards = [];

      for (let eleve of eleves) {
        const solde = await this.calculerSolde(eleve.id);
        if (solde && solde.resteAPayer > 0) {
          retards.push(solde);
        }
      }

      return retards;
    } catch (error) {
      console.error('Erreur retards:', error);
      return [];
    }
  },

  /**
   * Statistiques scolarités
   */
  async obtenirStatistiques() {
    try {
      const eleves = await GestionEleves.obtenirEleves();
      const retards = await this.obtenirElevesEnRetard();

      let totalCollecte = 0;
      let totalDu = 0;

      for (let eleve of eleves) {
        const solde = await this.calculerSolde(eleve.id);
        if (solde) {
          totalCollecte += solde.totalPay;
          totalDu += solde.scolariteAnnuelle;
        }
      }

      return {
        eleveTotal: eleves.length,
        eleveAJour: eleves.length - retards.length,
        eleveEnRetard: retards.length,
        tauxPaiement: ((totalCollecte / totalDu) * 100).toFixed(1),
        totalDu,
        totalCollecte,
        resteAPayer: totalDu - totalCollecte
      };
    } catch (error) {
      console.error('Erreur stats:', error);
      return null;
    }
  }
};

// ============================================================
// Exporter
// ============================================================
window.GestionScolarites = GestionScolarites;
