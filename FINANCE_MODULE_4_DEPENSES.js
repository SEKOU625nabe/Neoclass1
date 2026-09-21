// ============================================================
// 🧾 MODULE 4 - GESTION DES DÉPENSES
// ============================================================
// Salaires, fournitures, transport, entretien, autres
// ============================================================

'use strict';

const GestionDepenses = {
  depenses: [],

  CATEGORIES: {
    'salaire': { label: 'Salaires', icon: '👨‍💼', couleur: '#6366f1' },
    'fourniture': { label: 'Fournitures', icon: '📚', couleur: '#f59e0b' },
    'transport': { label: 'Transport', icon: '🚌', couleur: '#3b82f6' },
    'entretien': { label: 'Entretien', icon: '🔧', couleur: '#ec4899' },
    'autre': { label: 'Autres', icon: '📦', couleur: '#8b5cf6' }
  },

  /**
   * Ajouter une dépense
   */
  async ajouterDepense(data) {
    try {
      const { categorie, description, montant, date, beneficiaire } = data;

      if (!this.CATEGORIES[categorie]) {
        throw new Error('Catégorie invalide');
      }

      const depense = {
        id: `DEP-${Date.now()}`,
        categorie,
        description,
        montant: parseFloat(montant),
        date,
        beneficiaire,
        dateCreation: new Date().toISOString(),
        statut: 'enregistree',
        justificatif: null
      };

      // Sauvegarder
      if (typeof db !== 'undefined') {
        await db.collection('depenses').doc(depense.id).set(depense);
      } else {
        let depenses = JSON.parse(localStorage.getItem('depenses') || '[]');
        depenses.push(depense);
        localStorage.setItem('depenses', JSON.stringify(depenses));
      }

      this.depenses.push(depense);
      return { success: true, depense };
    } catch (error) {
      console.error('Erreur dépense:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtenir toutes les dépenses
   */
  async obtenirDepenses(categorie = null, mois = null) {
    try {
      let depenses = [];

      if (typeof db !== 'undefined') {
        let query = db.collection('depenses');
        if (categorie) {
          query = query.where('categorie', '==', categorie);
        }
        const snapshot = await query.orderBy('date', 'desc').get();
        snapshot.forEach(doc => depenses.push(doc.data()));
      } else {
        depenses = JSON.parse(localStorage.getItem('depenses') || '[]')
          .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        if (categorie) {
          depenses = depenses.filter(d => d.categorie === categorie);
        }
      }

      // Filtrer par mois si demandé
      if (mois) {
        depenses = depenses.filter(d => {
          const dateDep = new Date(d.date);
          return dateDep.getMonth() === mois;
        });
      }

      this.depenses = depenses;
      return depenses;
    } catch (error) {
      console.error('Erreur lecture dépenses:', error);
      return [];
    }
  },

  /**
   * Obtenir les dépenses par catégorie
   */
  async obtenirDepensesParCategorie(mois = null) {
    try {
      const depenses = await this.obtenirDepenses(null, mois);
      const resume = {};

      for (let cat in this.CATEGORIES) {
        resume[cat] = depenses
          .filter(d => d.categorie === cat)
          .reduce((sum, d) => sum + d.montant, 0);
      }

      const total = Object.values(resume).reduce((sum, v) => sum + v, 0);
      
      return {
        categories: resume,
        total,
        detentaille: depenses
      };
    } catch (error) {
      console.error('Erreur catégories:', error);
      return { categories: {}, total: 0 };
    }
  },

  /**
   * Calculer les dépenses mensuelles
   */
  async obtenirDépensesParMois(annee) {
    try {
      const mois = {};
      const moisNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

      for (let i = 0; i < 12; i++) {
        const deps = await this.obtenirDepenses(null, i);
        const total = deps.reduce((sum, d) => {
          const dateD = new Date(d.date);
          if (dateD.getFullYear() === annee) {
            return sum + d.montant;
          }
          return sum;
        }, 0);
        mois[moisNames[i]] = total;
      }

      return mois;
    } catch (error) {
      console.error('Erreur dépenses mensuelles:', error);
      return {};
    }
  },

  /**
   * Modifier une dépense
   */
  async modifierDepense(depenseId, nouvellesDonnees) {
    try {
      if (typeof db !== 'undefined') {
        await db.collection('depenses').doc(depenseId).update(nouvellesDonnees);
      } else {
        let depenses = JSON.parse(localStorage.getItem('depenses') || '[]');
        const idx = depenses.findIndex(d => d.id === depenseId);
        if (idx >= 0) {
          depenses[idx] = { ...depenses[idx], ...nouvellesDonnees };
          localStorage.setItem('depenses', JSON.stringify(depenses));
        }
      }

      return { success: true, message: 'Dépense modifiée' };
    } catch (error) {
      console.error('Erreur modification:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Supprimer une dépense
   */
  async supprimerDepense(depenseId) {
    try {
      if (typeof db !== 'undefined') {
        await db.collection('depenses').doc(depenseId).delete();
      } else {
        let depenses = JSON.parse(localStorage.getItem('depenses') || '[]');
        depenses = depenses.filter(d => d.id !== depenseId);
        localStorage.setItem('depenses', JSON.stringify(depenses));
      }

      return { success: true, message: 'Dépense supprimée' };
    } catch (error) {
      console.error('Erreur suppression:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtenir statistiques dépenses
   */
  async obtenirStatistiques() {
    try {
      const depenses = await this.obtenirDepenses();
      const parCategorie = await this.obtenirDepensesParCategorie();

      const totalDépenses = depenses.reduce((sum, d) => sum + d.montant, 0);

      return {
        totalDépenses,
        parCategorie: parCategorie.categories,
        nombreDépenses: depenses.length,
        moyenneParDépense: depenses.length > 0 ? (totalDépenses / depenses.length).toFixed(0) : 0
      };
    } catch (error) {
      console.error('Erreur stats dépenses:', error);
      return { totalDépenses: 0, parCategorie: {}, nombreDépenses: 0 };
    }
  },

  /**
   * Valider une dépense (approuver)
   */
  async validerDepense(depenseId) {
    try {
      await this.modifierDepense(depenseId, { statut: 'validee' });
      return { success: true, message: 'Dépense validée' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// ============================================================
// Exporter
// ============================================================
window.GestionDepenses = GestionDepenses;
