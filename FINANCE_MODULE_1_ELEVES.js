// ============================================================
// 👨‍🎓 MODULE 1 - GESTION DES ÉLÈVES
// ============================================================
// Inscription, dossiers, classes, matricules
// ============================================================

'use strict';

const GestionEleves = {
  // Données temporaires (en attente Firebase)
  eleves: [],
  classes: ['CP', 'CE1', 'CE2', 'CM1', 'CM2', '7eme', '8eme', '9eme', '10eme', '11eme', '12eme'],

  /**
   * Générer un matricule unique
   */
  genererMatricule() {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `STU-${random}${timestamp}`;
  },

  /**
   * Inscrire un nouvel élève
   */
  async inscrireEleve(data) {
    try {
      const eleve = {
        id: this.genererMatricule(),
        nom: data.nom,
        prenom: data.prenom,
        dateNaissance: data.dateNaissance,
        classe: data.classe,
        parentNom: data.parentNom,
        parentContact: data.parentContact,
        email: data.email,
        statut: 'actif',
        dateInscription: new Date().toISOString(),
        dossierComplet: false,
        documents: []
      };

      // Sauvegarder
      if (typeof db !== 'undefined') {
        await db.collection('eleves').doc(eleve.id).set(eleve);
      } else {
        let eleves = JSON.parse(localStorage.getItem('eleves') || '[]');
        eleves.push(eleve);
        localStorage.setItem('eleves', JSON.stringify(eleves));
      }

      this.eleves.push(eleve);
      return { success: true, id: eleve.id, message: `Élève ${eleve.nom} inscrit avec succès` };
    } catch (error) {
      console.error('Erreur inscription:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Récupérer tous les élèves
   */
  async obtenirEleves(classe = null) {
    try {
      let eleves = [];

      if (typeof db !== 'undefined') {
        const query = classe 
          ? db.collection('eleves').where('classe', '==', classe)
          : db.collection('eleves');
        const snapshot = await query.get();
        snapshot.forEach(doc => eleves.push(doc.data()));
      } else {
        eleves = JSON.parse(localStorage.getItem('eleves') || '[]');
        if (classe) {
          eleves = eleves.filter(e => e.classe === classe);
        }
      }

      this.eleves = eleves;
      return eleves;
    } catch (error) {
      console.error('Erreur lecture élèves:', error);
      return [];
    }
  },

  /**
   * Récupérer dossier d'un élève
   */
  async obtenirDossier(eleveId) {
    try {
      let eleve = null;

      if (typeof db !== 'undefined') {
        const doc = await db.collection('eleves').doc(eleveId).get();
        eleve = doc.data();
      } else {
        const eleves = JSON.parse(localStorage.getItem('eleves') || '[]');
        eleve = eleves.find(e => e.id === eleveId);
      }

      if (!eleve) {
        throw new Error('Élève non trouvé');
      }

      return {
        ...eleve,
        dossierComplet: this.verifierDossierComplet(eleve)
      };
    } catch (error) {
      console.error('Erreur dossier:', error);
      return null;
    }
  },

  /**
   * Vérifier la complétude du dossier
   */
  verifierDossierComplet(eleve) {
    const docsRequis = ['certificatNaissance', 'bulletinScolaire', 'certificatVaccin'];
    const docsPresents = eleve.documents || [];
    return docsRequis.every(doc => docsPresents.some(d => d.type === doc));
  },

  /**
   * Ajouter un document au dossier
   */
  async ajouterDocument(eleveId, typeDoc, url) {
    try {
      const eleve = await this.obtenirDossier(eleveId);
      if (!eleve) throw new Error('Élève non trouvé');

      const doc = {
        type: typeDoc,
        url: url,
        dateAjout: new Date().toISOString()
      };

      eleve.documents = eleve.documents || [];
      eleve.documents.push(doc);
      eleve.dossierComplet = this.verifierDossierComplet(eleve);

      // Sauvegarder
      if (typeof db !== 'undefined') {
        await db.collection('eleves').doc(eleveId).update({
          documents: eleve.documents,
          dossierComplet: eleve.dossierComplet
        });
      } else {
        let eleves = JSON.parse(localStorage.getItem('eleves') || '[]');
        const idx = eleves.findIndex(e => e.id === eleveId);
        if (idx >= 0) {
          eleves[idx] = eleve;
          localStorage.setItem('eleves', JSON.stringify(eleves));
        }
      }

      return { success: true, message: 'Document ajouté' };
    } catch (error) {
      console.error('Erreur document:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Transférer un élève de classe
   */
  async transfererClasse(eleveId, nouvelleClasse) {
    try {
      if (typeof db !== 'undefined') {
        await db.collection('eleves').doc(eleveId).update({
          classe: nouvelleClasse,
          dateTransfert: new Date().toISOString()
        });
      } else {
        let eleves = JSON.parse(localStorage.getItem('eleves') || '[]');
        const idx = eleves.findIndex(e => e.id === eleveId);
        if (idx >= 0) {
          eleves[idx].classe = nouvelleClasse;
          eleves[idx].dateTransfert = new Date().toISOString();
          localStorage.setItem('eleves', JSON.stringify(eleves));
        }
      }

      return { success: true, message: 'Élève transféré' };
    } catch (error) {
      console.error('Erreur transfert:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Statistiques élèves
   */
  async obtenirStatistiques() {
    const eleves = await this.obtenirEleves();
    const parClasse = {};
    let dossiersComplets = 0;

    eleves.forEach(eleve => {
      parClasse[eleve.classe] = (parClasse[eleve.classe] || 0) + 1;
      if (eleve.dossierComplet) dossiersComplets++;
    });

    return {
      total: eleves.length,
      parClasse,
      dossiersComplets,
      dossiersIncomplets: eleves.length - dossiersComplets,
      tauxCompletude: ((dossiersComplets / eleves.length) * 100).toFixed(1)
    };
  }
};

// ============================================================
// Exporter
// ============================================================
window.GestionEleves = GestionEleves;
