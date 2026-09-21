/**
 * NotificationManager.js
 * Gère les notifications et publicités ciblées pour le système Neoclass
 * Permet à l'admin d'envoyer des pubs aux écoles, parents, etc.
 */

class NotificationManager {
  constructor(firebaseApp, userId, userRole) {
    this.db = firebaseApp.firestore();
    this.userId = userId;
    this.userRole = userRole;
    this.notificationsRef = this.db.collection('notifications');
    this.advertisementsRef = this.db.collection('advertisements');
    this.userNotificationsRef = this.db.collection('user_notifications');
  }

  /**
   * Crée une nouvelle publicité/notification
   * Réservé aux administrateurs
   */
  async createAdvertisement(adData) {
    try {
      if (this.userRole !== 'admin') {
        throw new Error('Seuls les administrateurs peuvent créer des publicités');
      }

      const advertisement = {
        title: adData.title,
        content: adData.content,
        description: adData.description || '',
        type: adData.type || 'announcement', // 'announcement', 'promotion', 'warning', 'info'
        target_audience: adData.targetAudience || ['all'], // ['school', 'parent', 'teacher', 'student', 'admin']
        target_schools: adData.targetSchools || [], // IDs d'écoles spécifiques, [] = toutes
        target_regions: adData.targetRegions || [], // Par région
        image_url: adData.imageUrl || null,
        link: adData.link || null,
        priority: adData.priority || 'normal', // 'low', 'normal', 'high', 'urgent'
        start_date: adData.startDate || new Date().toISOString(),
        end_date: adData.endDate || null,
        created_by: this.userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'draft', // 'draft', 'scheduled', 'active', 'ended', 'archived'
        views: 0,
        clicks: 0,
        conversions: 0,
        budget: adData.budget || 0,
        currency: adData.currency || 'USD',
        active: true,
        require_sync: true // Marquer pour synchronisation avec les écoles
      };

      const docRef = await this.advertisementsRef.add(advertisement);
      
      // Sauvegarder en localStorage
      localStorage.setItem(`ad_${docRef.id}`, JSON.stringify(advertisement));

      return { id: docRef.id, ...advertisement };
    } catch (error) {
      console.error('Erreur création publicité:', error);
      throw error;
    }
  }

  /**
   * Publie une publicité (change son statut)
   */
  async publishAdvertisement(adId, scheduledDate = null) {
    try {
      if (this.userRole !== 'admin') {
        throw new Error('Seuls les administrateurs peuvent publier des publicités');
      }

      const updates = {
        status: scheduledDate ? 'scheduled' : 'active',
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (scheduledDate) {
        updates.scheduled_date = scheduledDate;
      }

      await this.advertisementsRef.doc(adId).update(updates);

      // Déclencher la notification aux utilisateurs
      await this.notifyUsers(adId, updates);

      return true;
    } catch (error) {
      console.error('Erreur publication publicité:', error);
      throw error;
    }
  }

  /**
   * Envoie une notification à tous les utilisateurs cibles
   */
  async notifyUsers(adId, adData) {
    try {
      // Récupérer l'annonce complète
      const adSnapshot = await this.advertisementsRef.doc(adId).get();
      const advertisement = adSnapshot.data();

      if (!advertisement) {
        throw new Error('Publicité non trouvée');
      }

      // Déterminer les utilisateurs cibles
      const targetUsers = await this.getTargetUsers(advertisement);

      // Créer une notification pour chaque utilisateur
      const batch = this.db.batch();
      const timestamp = new Date().toISOString();

      targetUsers.forEach(user => {
        const notifRef = this.userNotificationsRef.doc();
        batch.set(notifRef, {
          user_id: user.id,
          user_role: user.role,
          user_email: user.email,
          advertisement_id: adId,
          title: advertisement.title,
          content: advertisement.content,
          type: advertisement.type,
          priority: advertisement.priority,
          image_url: advertisement.image_url,
          link: advertisement.link,
          status: 'unread',
          created_at: timestamp,
          read_at: null,
          clicked_at: null,
          read: false,
          clicked: false
        });
      });

      await batch.commit();

      // Marquer la pub comme synchronisée
      await this.advertisementsRef.doc(adId).update({
        require_sync: false,
        synced_at: timestamp,
        notified_count: targetUsers.length
      });

      return {
        success: true,
        notified_count: targetUsers.length,
        message: `Notification envoyée à ${targetUsers.length} utilisateurs`
      };
    } catch (error) {
      console.error('Erreur notification utilisateurs:', error);
      throw error;
    }
  }

  /**
   * Récupère la liste des utilisateurs cibles
   */
  async getTargetUsers(advertisement) {
    try {
      let users = [];

      // Si audience = 'all', récupérer tous les utilisateurs
      if (advertisement.target_audience.includes('all')) {
        const snapshot = await this.db.collection('users').get();
        snapshot.forEach(doc => {
          users.push({ id: doc.id, ...doc.data() });
        });
      } else {
        // Récupérer par audience spécifique
        for (const audience of advertisement.target_audience) {
          const snapshot = await this.db.collection('users')
            .where('role', '==', audience)
            .get();
          
          snapshot.forEach(doc => {
            const user = { id: doc.id, ...doc.data() };
            // Éviter les doublons
            if (!users.find(u => u.id === user.id)) {
              users.push(user);
            }
          });
        }
      }

      // Filtrer par écoles spécifiques si nécessaire
      if (advertisement.target_schools && advertisement.target_schools.length > 0) {
        users = users.filter(u => advertisement.target_schools.includes(u.school_id));
      }

      // Filtrer par régions si nécessaire
      if (advertisement.target_regions && advertisement.target_regions.length > 0) {
        users = users.filter(u => advertisement.target_regions.includes(u.region));
      }

      return users;
    } catch (error) {
      console.error('Erreur récupération utilisateurs cibles:', error);
      return [];
    }
  }

  /**
   * Récupère les notifications pour un utilisateur
   */
  async getUserNotifications(userId = null, limit = 20) {
    try {
      const uid = userId || this.userId;
      const snapshot = await this.userNotificationsRef
        .where('user_id', '==', uid)
        .orderBy('created_at', 'desc')
        .limit(limit)
        .get();

      const notifications = [];
      snapshot.forEach(doc => {
        notifications.push({ id: doc.id, ...doc.data() });
      });

      return notifications;
    } catch (error) {
      console.error('Erreur récupération notifications:', error);
      return [];
    }
  }

  /**
   * Marque une notification comme lue
   */
  async markAsRead(notificationId) {
    try {
      await this.userNotificationsRef.doc(notificationId).update({
        read: true,
        read_at: new Date().toISOString(),
        status: 'read'
      });

      return true;
    } catch (error) {
      console.error('Erreur marquage notification:', error);
      throw error;
    }
  }

  /**
   * Enregistre un clic sur une notification
   */
  async recordClick(notificationId, adId) {
    try {
      // Mettre à jour la notification
      await this.userNotificationsRef.doc(notificationId).update({
        clicked: true,
        clicked_at: new Date().toISOString()
      });

      // Mettre à jour le compteur de clics de la pub
      await this.advertisementsRef.doc(adId).update({
        clicks: firebase.firestore.FieldValue.increment(1)
      });

      return true;
    } catch (error) {
      console.error('Erreur enregistrement clic:', error);
      throw error;
    }
  }

  /**
   * Récupère toutes les publicités (pour l'admin)
   */
  async getAdvertisements(filters = {}) {
    try {
      if (this.userRole !== 'admin') {
        throw new Error('Accès non autorisé');
      }

      let query = this.advertisementsRef;

      if (filters.status) {
        query = query.where('status', '==', filters.status);
      }

      if (filters.type) {
        query = query.where('type', '==', filters.type);
      }

      if (filters.active !== undefined) {
        query = query.where('active', '==', filters.active);
      }

      const snapshot = await query.orderBy('created_at', 'desc').get();
      const advertisements = [];

      snapshot.forEach(doc => {
        advertisements.push({ id: doc.id, ...doc.data() });
      });

      return advertisements;
    } catch (error) {
      console.error('Erreur récupération publicités:', error);
      throw error;
    }
  }

  /**
   * Met à jour une publicité
   */
  async updateAdvertisement(adId, updates) {
    try {
      if (this.userRole !== 'admin') {
        throw new Error('Seuls les administrateurs peuvent modifier les publicités');
      }

      updates.updated_at = new Date().toISOString();
      await this.advertisementsRef.doc(adId).update(updates);

      return { id: adId, ...updates };
    } catch (error) {
      console.error('Erreur mise à jour publicité:', error);
      throw error;
    }
  }

  /**
   * Archive une publicité
   */
  async archiveAdvertisement(adId) {
    try {
      if (this.userRole !== 'admin') {
        throw new Error('Seuls les administrateurs peuvent archiver les publicités');
      }

      await this.advertisementsRef.doc(adId).update({
        status: 'archived',
        active: false,
        archived_at: new Date().toISOString()
      });

      return true;
    } catch (error) {
      console.error('Erreur archivage publicité:', error);
      throw error;
    }
  }

  /**
   * Obtient les statistiques d'une publicité
   */
  async getAdvertisementStats(adId) {
    try {
      const adSnapshot = await this.advertisementsRef.doc(adId).get();
      const ad = adSnapshot.data();

      // Compter les notifications envoyées
      const notifSnapshot = await this.userNotificationsRef
        .where('advertisement_id', '==', adId)
        .get();

      const stats = {
        total_sent: notifSnapshot.size,
        read_count: 0,
        click_count: 0,
        read_rate: 0,
        click_rate: 0,
        views: ad?.views || 0,
        clicks: ad?.clicks || 0,
        conversions: ad?.conversions || 0
      };

      notifSnapshot.forEach(doc => {
        const notif = doc.data();
        if (notif.read) stats.read_count++;
        if (notif.clicked) stats.click_count++;
      });

      stats.read_rate = stats.total_sent > 0 ? ((stats.read_count / stats.total_sent) * 100).toFixed(2) : 0;
      stats.click_rate = stats.total_sent > 0 ? ((stats.click_count / stats.total_sent) * 100).toFixed(2) : 0;

      return stats;
    } catch (error) {
      console.error('Erreur calcul statistiques:', error);
      return {};
    }
  }

  /**
   * Obtient le nombre de notifications non lues pour un utilisateur
   */
  async getUnreadCount(userId = null) {
    try {
      const uid = userId || this.userId;
      const snapshot = await this.userNotificationsRef
        .where('user_id', '==', uid)
        .where('read', '==', false)
        .get();

      return snapshot.size;
    } catch (error) {
      console.error('Erreur comptage non lues:', error);
      return 0;
    }
  }

  /**
   * Exporte les statistiques des publicités en CSV
   */
  async exportStatsToCSV() {
    try {
      if (this.userRole !== 'admin') {
        throw new Error('Accès non autorisé');
      }

      const advertisements = await this.getAdvertisements();
      let csv = 'Titre,Type,Audience,Statut,Envoyés,Lus,Clics,Taux Lecture,Taux Clic,Date Création\n';

      for (const ad of advertisements) {
        const stats = await this.getAdvertisementStats(ad.id);
        const row = [
          ad.title,
          ad.type,
          ad.target_audience.join('; '),
          ad.status,
          stats.total_sent,
          stats.read_count,
          stats.click_count,
          stats.read_rate + '%',
          stats.click_rate + '%',
          new Date(ad.created_at).toLocaleDateString()
        ];
        csv += row.map(cell => `"${cell}"`).join(',') + '\n';
      }

      return csv;
    } catch (error) {
      console.error('Erreur export CSV:', error);
      throw error;
    }
  }

  /**
   * Récupère les notifications système non lues
   */
  async getSystemNotifications() {
    try {
      const snapshot = await this.userNotificationsRef
        .where('user_id', '==', this.userId)
        .where('read', '==', false)
        .where('priority', 'in', ['high', 'urgent'])
        .get();

      const notifications = [];
      snapshot.forEach(doc => {
        notifications.push({ id: doc.id, ...doc.data() });
      });

      return notifications;
    } catch (error) {
      console.error('Erreur notifications système:', error);
      return [];
    }
  }
}

// Export pour utilisation en module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NotificationManager;
}
