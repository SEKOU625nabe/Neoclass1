// ============================================================
// 🔔 MODULE 5 - SYSTÈME DE NOTIFICATIONS
// ============================================================
// Rappels de paiement, alertes retard
// ============================================================

'use strict';

const SystemeNotifications = {
  notifications: [],

  TYPES: {
    'rappel_paiement': {
      title: '💰 Rappel de paiement',
      icon: '💰',
      couleur: '#f59e0b',
      gravite: 'info'
    },
    'retard_scolarite': {
      title: '⚠️ Retard de scolarité',
      icon: '⚠️',
      couleur: '#ef4444',
      gravite: 'error'
    },
    'dossier_incomplet': {
      title: '📋 Dossier incomplet',
      icon: '📋',
      couleur: '#f59e0b',
      gravite: 'warning'
    },
    'alerte_budget': {
      title: '💸 Alerte budget',
      icon: '💸',
      couleur: '#ef4444',
      gravite: 'error'
    },
    'paiement_recu': {
      title: '✅ Paiement reçu',
      icon: '✅',
      couleur: '#10b981',
      gravite: 'success'
    }
  },

  /**
   * Créer une notification
   */
  async creerNotification(data) {
    try {
      const { type, destinataire, titre, message, eleveId, montant } = data;

      if (!this.TYPES[type]) {
        throw new Error('Type de notification invalide');
      }

      const notification = {
        id: `NOT-${Date.now()}`,
        type,
        titre: titre || this.TYPES[type].title,
        message,
        destinataire,
        eleveId,
        montant,
        dateCreation: new Date().toISOString(),
        lu: false,
        envoye: false,
        ...this.TYPES[type]
      };

      // Sauvegarder
      if (typeof db !== 'undefined') {
        await db.collection('notifications').doc(notification.id).set(notification);
      } else {
        let notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        notifications.push(notification);
        localStorage.setItem('notifications', JSON.stringify(notifications));
      }

      this.notifications.push(notification);
      return { success: true, notification };
    } catch (error) {
      console.error('Erreur notification:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Générer rappels automatiques
   */
  async genererRappelsAutomatiques() {
    try {
      const elevesRetard = await GestionScolarites.obtenirElevesEnRetard();
      const rappels = [];

      for (let eleve of elevesRetard) {
        // Créer rappel s'il n'existe pas déjà
        const notif = await this.creerNotification({
          type: 'retard_scolarite',
          destinataire: eleve.eleveId,
          titre: `⚠️ Retard de paiement - ${eleve.nom}`,
          message: `Votre scolarité n'est pas à jour. Montant à payer: ${eleve.resteAPayer.toLocaleString('fr-FR')} Fr`,
          eleveId: eleve.eleveId,
          montant: eleve.resteAPayer
        });

        if (notif.success) {
          rappels.push(notif.notification);
        }
      }

      return rappels;
    } catch (error) {
      console.error('Erreur rappels:', error);
      return [];
    }
  },

  /**
   * Alertes dossiers incomplets
   */
  async creerAlertesDossiersIncomplets() {
    try {
      const eleves = await GestionEleves.obtenirEleves();
      const alertes = [];

      for (let eleve of eleves) {
        const dossier = await GestionEleves.obtenirDossier(eleve.id);
        if (dossier && !dossier.dossierComplet) {
          const notif = await this.creerNotification({
            type: 'dossier_incomplet',
            destinataire: eleve.id,
            titre: `📋 Dossier incomplet - ${eleve.nom}`,
            message: 'Veuillez compléter le dossier de votre enfant avec les documents requis.',
            eleveId: eleve.id
          });

          if (notif.success) {
            alertes.push(notif.notification);
          }
        }
      }

      return alertes;
    } catch (error) {
      console.error('Erreur alertes dossiers:', error);
      return [];
    }
  },

  /**
   * Alerte budget (si dépenses > revenus)
   */
  async creerAlerteBudget() {
    try {
      const benefices = await TableauBordFinancier.calculerBenefices();

      if (benefices.benefices < 0) {
        const notif = await this.creerNotification({
          type: 'alerte_budget',
          destinataire: 'admin',
          titre: '💸 Alerte budget - Déficit détecté',
          message: `Les dépenses dépassent les revenus. Déficit: ${Math.abs(benefices.benefices).toLocaleString('fr-FR')} Fr`,
          montant: Math.abs(benefices.benefices)
        });

        return notif.success ? notif.notification : null;
      }

      return null;
    } catch (error) {
      console.error('Erreur alerte budget:', error);
      return null;
    }
  },

  /**
   * Obtenir les notifications d'un utilisateur
   */
  async obtenirNotifications(destinataire, nonLues = false) {
    try {
      let notifications = [];

      if (typeof db !== 'undefined') {
        let query = db.collection('notifications').where('destinataire', '==', destinataire);
        if (nonLues) {
          query = query.where('lu', '==', false);
        }
        const snapshot = await query.orderBy('dateCreation', 'desc').get();
        snapshot.forEach(doc => notifications.push(doc.data()));
      } else {
        notifications = JSON.parse(localStorage.getItem('notifications') || '[]')
          .filter(n => n.destinataire === destinataire)
          .sort((a, b) => new Date(b.dateCreation) - new Date(a.dateCreation));

        if (nonLues) {
          notifications = notifications.filter(n => !n.lu);
        }
      }

      return notifications;
    } catch (error) {
      console.error('Erreur lecture notifications:', error);
      return [];
    }
  },

  /**
   * Marquer une notification comme lue
   */
  async marquerCommeNonLue(notificationId) {
    try {
      if (typeof db !== 'undefined') {
        await db.collection('notifications').doc(notificationId).update({ lu: false });
      } else {
        let notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        const idx = notifications.findIndex(n => n.id === notificationId);
        if (idx >= 0) {
          notifications[idx].lu = true;
          localStorage.setItem('notifications', JSON.stringify(notifications));
        }
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Marquer une notification comme non lue
   */
  async marquerCommeNonLue(notificationId) {
    try {
      if (typeof db !== 'undefined') {
        await db.collection('notifications').doc(notificationId).update({ lu: false });
      } else {
        let notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        const idx = notifications.findIndex(n => n.id === notificationId);
        if (idx >= 0) {
          notifications[idx].lu = false;
          localStorage.setItem('notifications', JSON.stringify(notifications));
        }
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Supprimer une notification
   */
  async supprimerNotification(notificationId) {
    try {
      if (typeof db !== 'undefined') {
        await db.collection('notifications').doc(notificationId).delete();
      } else {
        let notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        notifications = notifications.filter(n => n.id !== notificationId);
        localStorage.setItem('notifications', JSON.stringify(notifications));
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Compter notifications non lues
   */
  async compteurNonLues(destinataire) {
    try {
      const notifications = await this.obtenirNotifications(destinataire, true);
      return notifications.length;
    } catch (error) {
      return 0;
    }
  },

  /**
   * Envoyer notification par SMS/Email (simulations)
   */
  async envoyerNotification(notificationId) {
    try {
      // En production, intégrer avec service SMS/Email
      // Pour maintenant, juste marquer comme envoyée

      if (typeof db !== 'undefined') {
        await db.collection('notifications').doc(notificationId).update({
          envoye: true,
          dateEnvoi: new Date().toISOString()
        });
      }

      return { success: true, message: 'Notification envoyée' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// ============================================================
// Exporter
// ============================================================
window.SystemeNotifications = SystemeNotifications;
