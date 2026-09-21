// ============================================================
// 📊 MODULE 3 - TABLEAU DE BORD FINANCIER
// ============================================================
// Revenus, dépenses, bénéfices, élèves non à jour
// ============================================================

'use strict';

const TableauBordFinancier = {
  
  /**
   * Calculer les revenus
   */
  async calculerRevenus(periode = 'mois') {
    try {
      const eleves = await GestionEleves.obtenirEleves();
      let revenus = 0;
      let details = {};

      for (let eleve of eleves) {
        const solde = await GestionScolarites.calculerSolde(eleve.id);
        if (solde) {
          revenus += solde.totalPay;
          details[eleve.classe] = (details[eleve.classe] || 0) + solde.totalPay;
        }
      }

      return {
        total: revenus,
        parClasse: details,
        nombre: eleves.length
      };
    } catch (error) {
      console.error('Erreur revenus:', error);
      return { total: 0, parClasse: {}, nombre: 0 };
    }
  },

  /**
   * Obtenir les dépenses
   */
  async obtenirDépenses() {
    try {
      let depenses = [];

      if (typeof db !== 'undefined') {
        const snapshot = await db.collection('depenses').get();
        snapshot.forEach(doc => depenses.push(doc.data()));
      } else {
        depenses = JSON.parse(localStorage.getItem('depenses') || '[]');
      }

      const resume = {
        salaires: depenses.filter(d => d.categorie === 'salaire').reduce((sum, d) => sum + d.montant, 0),
        fournitures: depenses.filter(d => d.categorie === 'fourniture').reduce((sum, d) => sum + d.montant, 0),
        transport: depenses.filter(d => d.categorie === 'transport').reduce((sum, d) => sum + d.montant, 0),
        entretien: depenses.filter(d => d.categorie === 'entretien').reduce((sum, d) => sum + d.montant, 0),
        autres: depenses.filter(d => d.categorie === 'autre').reduce((sum, d) => sum + d.montant, 0)
      };

      resume.total = resume.salaires + resume.fournitures + resume.transport + resume.entretien + resume.autres;

      return resume;
    } catch (error) {
      console.error('Erreur dépenses:', error);
      return { salaires: 0, fournitures: 0, transport: 0, entretien: 0, autres: 0, total: 0 };
    }
  },

  /**
   * Calculer les bénéfices
   */
  async calculerBenefices() {
    try {
      const revenus = await this.calculerRevenus();
      const depenses = await this.obtenirDépenses();

      return {
        revenus: revenus.total,
        depenses: depenses.total,
        benefices: revenus.total - depenses.total,
        marge: ((((revenus.total - depenses.total) / revenus.total) * 100) || 0).toFixed(2)
      };
    } catch (error) {
      console.error('Erreur bénéfices:', error);
      return { revenus: 0, depenses: 0, benefices: 0, marge: 0 };
    }
  },

  /**
   * Lister les élèves non à jour
   */
  async obtenirElevesNonAJour() {
    try {
      return await GestionScolarites.obtenirElevesEnRetard();
    } catch (error) {
      console.error('Erreur élèves retard:', error);
      return [];
    }
  },

  /**
   * Résumé complet du tableau de bord
   */
  async obtenirResume() {
    try {
      const revenus = await this.calculerRevenus();
      const depenses = await this.obtenirDépenses();
      const benefices = await this.calculerBenefices();
      const elevesRetard = await this.obtenirElevesNonAJour();
      const statsScolarites = await GestionScolarites.obtenirStatistiques();
      const statsEleves = await GestionEleves.obtenirStatistiques();

      return {
        // Finances
        revenus: revenus.total,
        depenses: depenses.total,
        benefices: benefices.benefices,
        margeNet: benefices.marge,

        // Élèves
        totalEleves: statsEleves.total,
        eleveAJour: statsScolarites.eleveAJour,
        eleveEnRetard: elevesRetard.length,
        tauxReussite: (((statsScolarites.eleveAJour / statsEleves.total) * 100) || 0).toFixed(1),

        // Scolarité
        scolariteCollectee: statsScolarites.totalCollecte,
        scolariteDue: statsScolarites.totalDu,
        scolariteRestante: statsScolarites.resteAPayer,
        tauxPaiement: statsScolarites.tauxPaiement,

        // Dossiers
        dossiersComplets: statsEleves.dossiersComplets,
        dossiersIncomplets: statsEleves.dossiersIncomplets,
        tauxCompletude: statsEleves.tauxCompletude,

        // Liste élèves retard
        elevesEnRetard: elevesRetard,

        // Détails dépenses
        depensesDetail: depenses
      };
    } catch (error) {
      console.error('Erreur résumé:', error);
      return null;
    }
  },

  /**
   * Obtenir un graphique (données pour visualisation)
   */
  async obtenirDonneesGraphiques() {
    try {
      const resume = await this.obtenirResume();
      const revenus = await this.calculerRevenus();

      return {
        financier: {
          labels: ['Revenus', 'Dépenses', 'Bénéfices'],
          values: [resume.revenus, resume.depenses, resume.benefices],
          colors: ['#10b981', '#ef4444', '#3b82f6']
        },
        eleves: {
          labels: ['À jour', 'En retard'],
          values: [resume.eleveAJour, resume.eleveEnRetard],
          colors: ['#10b981', '#ef4444']
        },
        scolarite: {
          labels: ['Collectée', 'Restante'],
          values: [resume.scolariteCollectee, resume.scolariteRestante],
          colors: ['#10b981', '#f59e0b']
        },
        depenses: {
          labels: ['Salaires', 'Fournitures', 'Transport', 'Entretien', 'Autres'],
          values: [
            resume.depensesDetail.salaires,
            resume.depensesDetail.fournitures,
            resume.depensesDetail.transport,
            resume.depensesDetail.entretien,
            resume.depensesDetail.autres
          ],
          colors: ['#6366f1', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6']
        },
        parClasse: {
          labels: Object.keys(revenus.parClasse),
          values: Object.values(revenus.parClasse),
          colors: ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6', '#6366f1']
        }
      };
    } catch (error) {
      console.error('Erreur graphiques:', error);
      return null;
    }
  }
};

// ============================================================
// Exporter
// ============================================================
window.TableauBordFinancier = TableauBordFinancier;
