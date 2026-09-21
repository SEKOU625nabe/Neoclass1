// ============================================================
// 💰 PRICING CONFIGURATION - SYSTÈME DE TARIFICATION FLEXIBLE
// ============================================================
// Gestion centralisée des prix pour toutes les interfaces
// Support: Web, Flutter, Android, iOS, Capacitor

class PricingConfig {
  constructor() {
    this.db = null;
    this.defaultPrices = {
      // ÉLÈVES - Tarifs par défaut
      student: {
        monthly: {
          price: 20000,
          currency: 'XOF',
          duration: 1,
          name: 'Mensuel Élève',
          description: '20 000 XOF par mois',
        },
        quarterly: {
          price: 50000,
          currency: 'XOF',
          duration: 3,
          name: 'Trimestriel Élève',
          description: '50 000 XOF par trimestre',
        },
        annual: {
          price: 200000,
          currency: 'XOF',
          duration: 12,
          name: 'Annuel Élève',
          description: '200 000 XOF par an',
        },
      },
      // ÉCOLES - Tarifs par défaut
      school: {
        monthly: {
          price: 500000,
          currency: 'XOF',
          duration: 1,
          name: 'Mensuel École',
          description: '500 000 XOF par mois',
        },
        quarterly: {
          price: 1400000,
          currency: 'XOF',
          duration: 3,
          name: 'Trimestriel École',
          description: '1 400 000 XOF par trimestre',
        },
        annual: {
          price: 5000000,
          currency: 'XOF',
          duration: 12,
          name: 'Annuel École',
          description: '5 000 000 XOF par an',
        },
      },
      // PARENTS - Tarifs par défaut
      parent: {
        monthly: {
          price: 15000,
          currency: 'XOF',
          duration: 1,
          name: 'Mensuel Parent',
          description: '15 000 XOF par mois',
        },
      },
    };

    this.trialDays = 30; // Premier mois gratuit
  }

  // ✅ Initialiser avec Firestore
  async init(firebaseDb) {
    this.db = firebaseDb;
    await this.loadPricingFromFirestore();
  }

  // ✅ Charger les tarifs depuis Firestore
  async loadPricingFromFirestore() {
    try {
      const pricingDoc = await this.db.collection('settings').doc('pricing').get();
      if (pricingDoc.exists) {
        this.defaultPrices = {
          ...this.defaultPrices,
          ...pricingDoc.data().prices,
        };
      }
      console.log('✅ Pricing config chargé:', this.defaultPrices);
    } catch (error) {
      console.log('ℹ️ Utilisation pricing par défaut:', error);
    }
  }

  // ✅ Obtenir tarifs pour un type d'utilisateur
  getPricesForUserType(userType) {
    return this.defaultPrices[userType] || this.defaultPrices.student;
  }

  // ✅ Obtenir prix spécifique
  getPrice(userType, planType) {
    const prices = this.getPricesForUserType(userType);
    return prices[planType] || null;
  }

  // ✅ Vérifier si en période d'essai
  isTrialPeriod(subscriptionDate) {
    if (!subscriptionDate) return true;
    const now = new Date();
    const diff = (now - subscriptionDate) / (1000 * 60 * 60 * 24);
    return diff <= this.trialDays;
  }

  // ✅ Obtenir jours restants d'essai
  getTrialDaysRemaining(subscriptionDate) {
    if (!subscriptionDate) return this.trialDays;
    const now = new Date();
    const diff = (now - subscriptionDate) / (1000 * 60 * 60 * 24);
    const remaining = this.trialDays - Math.floor(diff);
    return Math.max(0, remaining);
  }

  // ✅ Calculer prochaine date de facturation
  getNextBillingDate(subscriptionDate, plan) {
    if (!subscriptionDate) return null;
    const date = new Date(subscriptionDate);
    const daysToAdd = this.getPricesForUserType(plan).monthly.duration * 30;
    date.setDate(date.getDate() + daysToAdd);
    return date;
  }

  // ✅ Formater prix pour affichage
  formatPrice(price, currency = 'XOF') {
    return `${price.toLocaleString('fr-FR')} ${currency}`;
  }
}

// ============================================================
// 💼 ADMIN PRICING MANAGER - Gestion des tarifs par admin
// ============================================================

class AdminPricingManager {
  constructor() {
    this.db = null;
    this.auth = null;
    this.pricing = new PricingConfig();
  }

  async init(firebaseDb, firebaseAuth) {
    this.db = firebaseDb;
    this.auth = firebaseAuth;
    await this.pricing.init(firebaseDb);
  }

  // ✅ Vérifier si utilisateur est admin
  async isAdmin() {
    const user = this.auth.currentUser;
    if (!user) return false;

    const adminDoc = await this.db
      .collection('admins')
      .doc(user.uid)
      .get();
    return adminDoc.exists;
  }

  // ✅ Obtenir tous les tarifs configurés
  async getAllPricingConfigs() {
    try {
      const configs = await this.db
        .collection('pricingConfigs')
        .orderBy('createdAt', 'desc')
        .get();

      return configs.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('❌ Erreur chargement configs:', error);
      return [];
    }
  }

  // ✅ Créer/Mettre à jour configuration de tarif
  async savePricingConfig(config) {
    if (!(await this.isAdmin())) {
      throw new Error('❌ Accès admin requis');
    }

    const configData = {
      ...config,
      updatedAt: new Date(),
      updatedBy: this.auth.currentUser.email,
    };

    if (!config.id) {
      configData.createdAt = new Date();
      const docRef = await this.db.collection('pricingConfigs').add(configData);
      return { id: docRef.id, ...configData };
    } else {
      await this.db
        .collection('pricingConfigs')
        .doc(config.id)
        .update(configData);
      return { id: config.id, ...configData };
    }
  }

  // ✅ Supprimer configuration
  async deletePricingConfig(configId) {
    if (!(await this.isAdmin())) {
      throw new Error('❌ Accès admin requis');
    }

    await this.db.collection('pricingConfigs').doc(configId).delete();
  }

  // ✅ Publier configuration (rendre active)
  async publishPricingConfig(configId) {
    if (!(await this.isAdmin())) {
      throw new Error('❌ Accès admin requis');
    }

    const config = await this.db
      .collection('pricingConfigs')
      .doc(configId)
      .get();

    if (!config.exists) {
      throw new Error('❌ Configuration non trouvée');
    }

    // Désactiver toutes les autres configs
    const allConfigs = await this.getAllPricingConfigs();
    for (const cfg of allConfigs) {
      if (cfg.id !== configId && cfg.isActive) {
        await this.db
          .collection('pricingConfigs')
          .doc(cfg.id)
          .update({ isActive: false });
      }
    }

    // Activer la config sélectionnée
    await this.db
      .collection('pricingConfigs')
      .doc(configId)
      .update({
        isActive: true,
        publishedAt: new Date(),
        publishedBy: this.auth.currentUser.email,
      });

    // Mettre à jour le pricing central
    const config_data = config.data();
    await this.db
      .collection('settings')
      .doc('pricing')
      .set(config_data, { merge: true });

    console.log('✅ Configuration publiée:', configId);
  }

  // ✅ Obtenir configuration active
  async getActivePricingConfig() {
    try {
      const configs = await this.db
        .collection('pricingConfigs')
        .where('isActive', '==', true)
        .limit(1)
        .get();

      if (configs.empty) {
        return this.getDefaultPricingConfig();
      }

      return {
        id: configs.docs[0].id,
        ...configs.docs[0].data(),
      };
    } catch (error) {
      console.error('❌ Erreur chargement config active:', error);
      return this.getDefaultPricingConfig();
    }
  }

  // ✅ Obtenir configuration par défaut
  getDefaultPricingConfig() {
    return {
      id: 'default',
      name: 'Configuration par défaut',
      description: 'Tarifs standard Neoclass',
      prices: this.pricing.defaultPrices,
      isActive: true,
      createdAt: new Date(),
    };
  }

  // ✅ Personnaliser tarif pour une interface
  async setCustomPriceForInterface(interfaceId, userType, planType, customPrice) {
    if (!(await this.isAdmin())) {
      throw new Error('❌ Accès admin requis');
    }

    await this.db
      .collection('customPricing')
      .doc(`${interfaceId}_${userType}_${planType}`)
      .set({
        interfaceId,
        userType,
        planType,
        customPrice,
        updatedAt: new Date(),
      });
  }

  // ✅ Obtenir prix personnalisé pour une interface
  async getCustomPrice(interfaceId, userType, planType) {
    try {
      const customDoc = await this.db
        .collection('customPricing')
        .doc(`${interfaceId}_${userType}_${planType}`)
        .get();

      if (customDoc.exists) {
        return customDoc.data().customPrice;
      }
    } catch (error) {
      console.error('❌ Erreur chargement prix personnalisé:', error);
    }

    return null;
  }

  // ✅ Obtenir prix pour une interface
  async getPriceForInterface(interfaceId, userType, planType) {
    const customPrice = await this.getCustomPrice(interfaceId, userType, planType);
    if (customPrice) return customPrice;

    const activeConfig = await this.getActivePricingConfig();
    return activeConfig.prices[userType][planType].price;
  }
}

// ============================================================
// 📊 PRICING ANALYTICS - Statistiques des paiements
// ============================================================

class PricingAnalytics {
  constructor() {
    this.db = null;
  }

  async init(firebaseDb) {
    this.db = firebaseDb;
  }

  // ✅ Obtenir revenu total
  async getTotalRevenue(startDate, endDate) {
    try {
      const payments = await this.db
        .collection('payments')
        .where('status', '==', 'completed')
        .where('createdAt', '>=', startDate)
        .where('createdAt', '<=', endDate)
        .get();

      return payments.docs.reduce((total, doc) => total + doc.data().amount, 0);
    } catch (error) {
      console.error('❌ Erreur calcul revenu:', error);
      return 0;
    }
  }

  // ✅ Obtenir nombre d'abonnés actifs
  async getActiveSubscribers() {
    try {
      const subscriptions = await this.db
        .collection('subscriptions')
        .where('status', '==', 'active')
        .get();

      return subscriptions.size;
    } catch (error) {
      console.error('❌ Erreur calcul abonnés:', error);
      return 0;
    }
  }

  // ✅ Obtenir taux de conversion
  async getConversionRate() {
    try {
      const allUsers = await this.db.collection('users').get();
      const paidUsers = await this.db
        .collection('users')
        .where('hasPaidSubscription', '==', true)
        .get();

      if (allUsers.size === 0) return 0;
      return (paidUsers.size / allUsers.size) * 100;
    } catch (error) {
      console.error('❌ Erreur calcul conversion:', error);
      return 0;
    }
  }

  // ✅ Obtenir revenu MRR (Monthly Recurring Revenue)
  async getMRR() {
    try {
      const subscriptions = await this.db
        .collection('subscriptions')
        .where('status', '==', 'active')
        .get();

      let mrr = 0;
      for (const doc of subscriptions.docs) {
        const sub = doc.data();
        // Supposer price/duration pour mois
        mrr += sub.price / sub.duration;
      }

      return mrr;
    } catch (error) {
      console.error('❌ Erreur calcul MRR:', error);
      return 0;
    }
  }
}

// ============================================================
// 🎁 PROMOTION & DISCOUNT MANAGER
// ============================================================

class PromotionManager {
  constructor() {
    this.db = null;
  }

  async init(firebaseDb) {
    this.db = firebaseDb;
  }

  // ✅ Créer code de réduction
  async createPromoCode(code, discountPercent, maxUses, expiryDate) {
    const promoDoc = await this.db
      .collection('promotions')
      .doc(code)
      .set({
        code,
        discountPercent,
        maxUses,
        currentUses: 0,
        expiryDate,
        createdAt: new Date(),
        isActive: true,
      });

    return code;
  }

  // ✅ Valider et appliquer code
  async validateAndApplyPromo(code, price) {
    try {
      const promoDoc = await this.db.collection('promotions').doc(code).get();

      if (!promoDoc.exists) {
        return { valid: false, message: '❌ Code invalide' };
      }

      const promo = promoDoc.data();

      if (!promo.isActive) {
        return { valid: false, message: '❌ Code expiré' };
      }

      if (promo.currentUses >= promo.maxUses) {
        return { valid: false, message: '❌ Code utilisé au maximum' };
      }

      if (new Date() > promo.expiryDate) {
        return { valid: false, message: '❌ Code expiré' };
      }

      const discount = (price * promo.discountPercent) / 100;
      const finalPrice = price - discount;

      return {
        valid: true,
        discount,
        finalPrice,
        message: `✅ Réduction de ${promo.discountPercent}% appliquée!`,
      };
    } catch (error) {
      console.error('❌ Erreur validation promo:', error);
      return { valid: false, message: '❌ Erreur validation' };
    }
  }

  // ✅ Enregistrer utilisation du code
  async recordPromoUsage(code) {
    const promoDoc = await this.db.collection('promotions').doc(code).get();
    const promo = promoDoc.data();

    await this.db
      .collection('promotions')
      .doc(code)
      .update({
        currentUses: promo.currentUses + 1,
      });
  }
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  PricingConfig,
  AdminPricingManager,
  PricingAnalytics,
  PromotionManager,
};
