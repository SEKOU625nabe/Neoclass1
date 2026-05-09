// ============================================================
// 💎 SUBSCRIPTION SYSTEM - Système d'abonnement à 3 niveaux
// FREE | STANDARD | PREMIUM
// ============================================================

const express = require('express');
const router = express.Router();

// ============================================================
// 📊 CONFIGURATION DES PLANS D'ABONNEMENT
// ============================================================
const SUBSCRIPTION_PLANS = {
  FREE: {
    id: 'FREE',
    name: 'Gratuit',
    nameEn: 'Free',
    icon: '🆓',
    price: 0,
    priceMonthly: 0,
    priceYearly: 0,
    color: '#6b7280',
    accessLevel: 1,
    features: [
      'Accès aux cours gratuits',
      'Exercices de base',
      'Support communautaire',
      'Publicités présentes',
      'Vies limitées (5 max)'
    ],
    restrictions: [
      'Pas d\'accès aux cours standard',
      'Pas d\'accès aux cours premium',
      'Téléchargements limités',
      'Pas de mode hors ligne',
      'Pas de certificats'
    ],
    limits: {
      maxDownloads: 3,
      maxLives: 5,
      lifeRegenTime: 30, // minutes
      adFrequency: 'always',
      offlineAccess: false,
      certificates: false,
      prioritySupport: false,
      aiQuestionsPerDay: 5
    }
  },
  
  STANDARD: {
    id: 'STANDARD',
    name: 'Standard',
    nameEn: 'Standard',
    icon: '⭐',
    price: 5000, // Prix en monnaie locale (GNF)
    priceMonthly: 5000,
    priceYearly: 45000, // 25% de réduction
    color: '#3b82f6',
    accessLevel: 2,
    features: [
      'Tous les avantages FREE',
      'Accès aux cours standard',
      'Exercices avancés',
      'Support par email',
      'Publicités réduites',
      'Vies illimitées',
      'Téléchargements illimités',
      'Mode révision'
    ],
    restrictions: [
      'Pas d\'accès aux cours premium',
      'Pas de mode hors ligne complet',
      'Pas de certificats premium'
    ],
    limits: {
      maxDownloads: -1, // illimité
      maxLives: -1, // illimité
      lifeRegenTime: 0,
      adFrequency: 'reduced',
      offlineAccess: 'partial',
      certificates: 'basic',
      prioritySupport: false,
      aiQuestionsPerDay: 50
    }
  },
  
  PREMIUM: {
    id: 'PREMIUM',
    name: 'Premium',
    nameEn: 'Premium',
    icon: '👑',
    price: 15000,
    priceMonthly: 15000,
    priceYearly: 120000, // 33% de réduction
    color: '#fbbf24',
    accessLevel: 3,
    features: [
      'Accès TOTAL à tous les contenus',
      'Tous les avantages STANDARD',
      'Cours exclusifs premium',
      'Préparation intensive BAC',
      'Support prioritaire 24/7',
      'Zéro publicité',
      'Mode hors ligne complet',
      'Certificats vérifiés',
      'Sessions live avec profs',
      'Analyse IA personnalisée',
      'Parcours sur mesure'
    ],
    restrictions: [],
    limits: {
      maxDownloads: -1,
      maxLives: -1,
      lifeRegenTime: 0,
      adFrequency: 'never',
      offlineAccess: 'full',
      certificates: 'verified',
      prioritySupport: true,
      aiQuestionsPerDay: -1 // illimité
    }
  }
};

// ============================================================
// 🏷️ NIVEAUX D'ACCÈS AU CONTENU
// ============================================================
const ACCESS_LEVELS = {
  free: {
    id: 'free',
    name: 'Gratuit',
    level: 1,
    icon: '🆓',
    color: '#6b7280',
    requiredPlan: 'FREE',
    description: 'Accessible à tous les utilisateurs'
  },
  standard: {
    id: 'standard',
    name: 'Standard',
    level: 2,
    icon: '⭐',
    color: '#3b82f6',
    requiredPlan: 'STANDARD',
    description: 'Nécessite un abonnement Standard ou supérieur'
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    level: 3,
    icon: '👑',
    color: '#fbbf24',
    requiredPlan: 'PREMIUM',
    description: 'Contenu exclusif pour abonnés Premium'
  }
};

// ============================================================
// 💰 PRIX PAR PAYS (Multi-pays extensible)
// ============================================================
const PRICING_BY_COUNTRY = {
  GN: { // Guinée
    currency: 'GNF',
    symbol: 'GNF',
    plans: {
      FREE: { monthly: 0, yearly: 0 },
      STANDARD: { monthly: 50000, yearly: 450000 },
      PREMIUM: { monthly: 150000, yearly: 1200000 }
    }
  },
  SN: { // Sénégal
    currency: 'XOF',
    symbol: 'FCFA',
    plans: {
      FREE: { monthly: 0, yearly: 0 },
      STANDARD: { monthly: 2500, yearly: 22500 },
      PREMIUM: { monthly: 7500, yearly: 60000 }
    }
  },
  CI: { // Côte d'Ivoire
    currency: 'XOF',
    symbol: 'FCFA',
    plans: {
      FREE: { monthly: 0, yearly: 0 },
      STANDARD: { monthly: 2500, yearly: 22500 },
      PREMIUM: { monthly: 7500, yearly: 60000 }
    }
  },
  ML: { // Mali
    currency: 'XOF',
    symbol: 'FCFA',
    plans: {
      FREE: { monthly: 0, yearly: 0 },
      STANDARD: { monthly: 2000, yearly: 18000 },
      PREMIUM: { monthly: 6000, yearly: 48000 }
    }
  },
  CM: { // Cameroun
    currency: 'XAF',
    symbol: 'FCFA',
    plans: {
      FREE: { monthly: 0, yearly: 0 },
      STANDARD: { monthly: 2500, yearly: 22500 },
      PREMIUM: { monthly: 7500, yearly: 60000 }
    }
  },
  MA: { // Maroc
    currency: 'MAD',
    symbol: 'DH',
    plans: {
      FREE: { monthly: 0, yearly: 0 },
      STANDARD: { monthly: 50, yearly: 450 },
      PREMIUM: { monthly: 150, yearly: 1200 }
    }
  }
};

// ============================================================
// 🔧 SERVICE D'ABONNEMENT
// ============================================================
const SubscriptionService = {
  /**
   * Vérifier si un utilisateur peut accéder à un contenu
   * @param {string} userSubscription - Plan de l'utilisateur (FREE, STANDARD, PREMIUM)
   * @param {string} contentAccessLevel - Niveau d'accès du contenu (free, standard, premium)
   * @returns {boolean}
   */
  canAccessContent(userSubscription, contentAccessLevel) {
    const userPlan = SUBSCRIPTION_PLANS[userSubscription] || SUBSCRIPTION_PLANS.FREE;
    const contentLevel = ACCESS_LEVELS[contentAccessLevel] || ACCESS_LEVELS.free;
    
    return userPlan.accessLevel >= contentLevel.level;
  },

  /**
   * Obtenir les contenus accessibles pour un utilisateur
   * @param {string} userSubscription - Plan de l'utilisateur
   * @returns {string[]} - Liste des niveaux d'accès autorisés
   */
  getAccessibleLevels(userSubscription) {
    const userPlan = SUBSCRIPTION_PLANS[userSubscription] || SUBSCRIPTION_PLANS.FREE;
    
    return Object.values(ACCESS_LEVELS)
      .filter(level => level.level <= userPlan.accessLevel)
      .map(level => level.id);
  },

  /**
   * Filtrer les contenus selon l'abonnement
   * @param {Array} contents - Liste de contenus
   * @param {string} userSubscription - Plan de l'utilisateur
   * @returns {Array} - Contenus filtrés avec statut de verrouillage
   */
  filterContentsBySubscription(contents, userSubscription) {
    const accessibleLevels = this.getAccessibleLevels(userSubscription);
    
    return contents.map(content => {
      const isAccessible = accessibleLevels.includes(content.access_level);
      
      if (isAccessible) {
        return content; // Retourner le contenu complet
      } else {
        // Retourner une version verrouillée (sans le contenu sensible)
        return {
          id: content.id,
          name: content.name,
          description: content.description,
          summary: content.summary,
          access_level: content.access_level,
          icon: content.icon,
          color: content.color,
          duration: content.duration,
          // Champs de verrouillage
          locked: true,
          requiredPlan: this.getRequiredPlanForLevel(content.access_level),
          lockMessage: this.getLockMessage(content.access_level, userSubscription)
          // NE PAS inclure: content.content, content.videoUrl (sensibles)
        };
      }
    });
  },

  /**
   * Obtenir le plan requis pour un niveau d'accès
   */
  getRequiredPlanForLevel(accessLevel) {
    const level = ACCESS_LEVELS[accessLevel];
    if (!level) return 'FREE';
    return level.requiredPlan;
  },

  /**
   * Générer le message de verrouillage
   */
  getLockMessage(contentAccessLevel, userSubscription) {
    const requiredPlan = this.getRequiredPlanForLevel(contentAccessLevel);
    const requiredPlanData = SUBSCRIPTION_PLANS[requiredPlan];
    
    const messages = {
      standard: `🔒 Passez à ${requiredPlanData.name} pour débloquer ce contenu`,
      premium: `👑 Contenu exclusif - Passez à Premium pour accéder`
    };
    
    return messages[contentAccessLevel] || '🔒 Contenu verrouillé';
  },

  /**
   * Vérifier et mettre à jour le statut d'abonnement
   */
  async checkSubscriptionStatus(user, db) {
    if (!user.subscriptionEndDate) {
      return { active: false, plan: 'FREE' };
    }

    const endDate = new Date(user.subscriptionEndDate);
    const now = new Date();

    if (now > endDate) {
      // Abonnement expiré, rétrograder vers FREE
      await db.collection('users').doc(user.uid).update({
        subscription: 'FREE',
        previousSubscription: user.subscription,
        subscriptionExpiredAt: now.toISOString()
      });

      return { 
        active: false, 
        plan: 'FREE',
        expired: true,
        previousPlan: user.subscription
      };
    }

    return {
      active: true,
      plan: user.subscription,
      expiresAt: user.subscriptionEndDate,
      daysRemaining: Math.ceil((endDate - now) / (1000 * 60 * 60 * 24))
    };
  },

  /**
   * Créer un nouvel abonnement
   */
  async createSubscription(userId, planId, duration, countryCode, db) {
    const plan = SUBSCRIPTION_PLANS[planId];
    if (!plan) {
      throw new Error(`Plan invalide: ${planId}`);
    }

    const pricing = PRICING_BY_COUNTRY[countryCode] || PRICING_BY_COUNTRY.GN;
    const planPricing = pricing.plans[planId];

    const now = new Date();
    const endDate = new Date(now);
    
    if (duration === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    const subscriptionData = {
      subscription: planId,
      subscriptionStartDate: now.toISOString(),
      subscriptionEndDate: endDate.toISOString(),
      subscriptionDuration: duration,
      subscriptionPrice: duration === 'yearly' ? planPricing.yearly : planPricing.monthly,
      subscriptionCurrency: pricing.currency,
      subscriptionHistory: admin.firestore.FieldValue.arrayUnion({
        planId,
        duration,
        startDate: now.toISOString(),
        endDate: endDate.toISOString(),
        price: duration === 'yearly' ? planPricing.yearly : planPricing.monthly,
        currency: pricing.currency
      })
    };

    await db.collection('users').doc(userId).update(subscriptionData);

    return {
      success: true,
      plan: planId,
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
      price: subscriptionData.subscriptionPrice,
      currency: pricing.currency
    };
  },

  /**
   * Annuler un abonnement (à la fin de la période)
   */
  async cancelSubscription(userId, db) {
    await db.collection('users').doc(userId).update({
      subscriptionCancelled: true,
      subscriptionCancelledAt: new Date().toISOString()
    });

    return { success: true, message: 'Abonnement annulé. Vous conservez l\'accès jusqu\'à la fin de la période.' };
  },

  /**
   * Obtenir les prix pour un pays
   */
  getPricingForCountry(countryCode) {
    return PRICING_BY_COUNTRY[countryCode] || PRICING_BY_COUNTRY.GN;
  },

  /**
   * Comparer les plans
   */
  comparePlans() {
    return Object.values(SUBSCRIPTION_PLANS).map(plan => ({
      id: plan.id,
      name: plan.name,
      icon: plan.icon,
      color: plan.color,
      features: plan.features,
      restrictions: plan.restrictions,
      limits: plan.limits
    }));
  },

  /**
   * Obtenir les limites d'un plan
   */
  getPlanLimits(planId) {
    const plan = SUBSCRIPTION_PLANS[planId] || SUBSCRIPTION_PLANS.FREE;
    return plan.limits;
  },

  /**
   * Vérifier une limite spécifique
   */
  checkLimit(planId, limitType, currentValue) {
    const limits = this.getPlanLimits(planId);
    const limit = limits[limitType];
    
    if (limit === -1) return { allowed: true, unlimited: true };
    if (limit === false) return { allowed: false, reason: 'Feature not available' };
    
    return {
      allowed: currentValue < limit,
      current: currentValue,
      max: limit,
      remaining: Math.max(0, limit - currentValue)
    };
  }
};

// ============================================================
// 🛣️ ROUTES API
// ============================================================

// Obtenir tous les plans
router.get('/plans', (req, res) => {
  res.json({
    success: true,
    data: Object.values(SUBSCRIPTION_PLANS)
  });
});

// Obtenir les niveaux d'accès
router.get('/access-levels', (req, res) => {
  res.json({
    success: true,
    data: Object.values(ACCESS_LEVELS)
  });
});

// Obtenir les prix par pays
router.get('/pricing/:countryCode', (req, res) => {
  const { countryCode } = req.params;
  const pricing = SubscriptionService.getPricingForCountry(countryCode);
  
  res.json({
    success: true,
    data: pricing
  });
});

// Comparer les plans
router.get('/compare', (req, res) => {
  const comparison = SubscriptionService.comparePlans();
  
  res.json({
    success: true,
    data: comparison
  });
});

// Vérifier l'accès à un contenu
router.post('/check-access', (req, res) => {
  const { userSubscription, contentAccessLevel } = req.body;
  
  const canAccess = SubscriptionService.canAccessContent(userSubscription, contentAccessLevel);
  const accessibleLevels = SubscriptionService.getAccessibleLevels(userSubscription);
  
  res.json({
    success: true,
    canAccess,
    accessibleLevels,
    lockMessage: canAccess ? null : SubscriptionService.getLockMessage(contentAccessLevel, userSubscription)
  });
});

// Obtenir les niveaux accessibles pour un utilisateur
router.get('/accessible-levels/:subscription', (req, res) => {
  const { subscription } = req.params;
  const levels = SubscriptionService.getAccessibleLevels(subscription);
  
  res.json({
    success: true,
    data: levels
  });
});

// ============================================================
// 📤 EXPORTS
// ============================================================
module.exports = {
  router,
  SUBSCRIPTION_PLANS,
  ACCESS_LEVELS,
  PRICING_BY_COUNTRY,
  SubscriptionService
};
