// ============================================================
// 💰 NEOCLASS - SYSTÈME FINANCIER COMPLET
// ============================================================
// Gestion des abonnements, paiements de cours, portefeuilles,
// transactions et retraits
// ============================================================

'use strict';

// ============================================================
// 📊 CONFIGURATION FINANCIÈRE
// ============================================================
const FINANCE_CONFIG = {
  // Commission plateforme (70%) - Professeur reçoit 30%
  PLATFORM_COMMISSION_RATE: 0.70,
  TEACHER_COMMISSION_RATE: 0.30,
  
  // Abonnement mensuel
  SUBSCRIPTION_PRICE: 50000, // 50,000 GNF/mois
  SUBSCRIPTION_DURATION_DAYS: 30,
  
  // Retrait minimum
  MIN_WITHDRAWAL_AMOUNT: 50000, // 50,000 GNF minimum
  WITHDRAWAL_FEE_RATE: 0.02, // 2% de frais de retrait
  
  // Méthodes de paiement supportées
  PAYMENT_METHODS: {
    ORANGE_MONEY: {
      id: 'orange_money',
      name: 'Orange Money',
      icon: '🟠',
      fee: 0.01, // 1% de frais
      minAmount: 1000,
      maxAmount: 5000000
    },
    MTN_MONEY: {
      id: 'mtn_money', 
      name: 'MTN Mobile Money',
      icon: '🟡',
      fee: 0.01,
      minAmount: 1000,
      maxAmount: 5000000
    },
    CARD: {
      id: 'card',
      name: 'Carte Bancaire',
      icon: '💳',
      fee: 0.025, // 2.5% de frais
      minAmount: 5000,
      maxAmount: 10000000
    }
  },
  
  // Modes de paiement professeur
  TEACHER_PAYMENT_MODES: {
    DAILY: { id: 'daily', name: 'Journalier', days: 1 },
    WEEKLY: { id: 'weekly', name: 'Hebdomadaire', days: 7 },
    MONTHLY: { id: 'monthly', name: 'Mensuel', days: 30 }
  },
  
  // Types de transactions
  TRANSACTION_TYPES: {
    SUBSCRIPTION: 'subscription',
    COURSE_PURCHASE: 'course_purchase',
    WITHDRAWAL: 'withdrawal',
    TEACHER_PAYOUT: 'teacher_payout',
    REFUND: 'refund',
    PLATFORM_FEE: 'platform_fee'
  },
  
  // Statuts des transactions
  TRANSACTION_STATUS: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded'
  }
};

// ============================================================
// 💼 SERVICE DE PORTEFEUILLE (WALLET SERVICE)
// ============================================================
const WalletService = {
  
  /**
   * Créer ou récupérer le portefeuille d'un professeur
   */
  async getTeacherWallet(teacherId) {
    try {
      const walletRef = db.collection('teacher_wallets').doc(teacherId);
      const walletSnap = await walletRef.get();
      
      if (!walletSnap.exists) {
        // Créer un nouveau portefeuille
        const newWallet = {
          teacherId,
          balance: 0,
          pendingBalance: 0,
          totalEarned: 0,
          totalWithdrawn: 0,
          currency: 'GNF',
          paymentMode: 'monthly',
          preferredPaymentMethod: null,
          paymentDetails: {},
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        await walletRef.set(newWallet);
        return { id: teacherId, ...newWallet };
      }
      
      return { id: walletSnap.id, ...walletSnap.data() };
    } catch (error) {
      console.error('Erreur récupération portefeuille:', error);
      throw error;
    }
  },
  
  /**
   * Récupérer le portefeuille de la plateforme
   */
  async getPlatformWallet() {
    try {
      const walletRef = db.collection('platform_wallet').doc('main');
      const walletSnap = await walletRef.get();
      
      if (!walletSnap.exists) {
        const newWallet = {
          balance: 0,
          totalRevenue: 0,
          totalSubscriptions: 0,
          totalCourseCommissions: 0,
          totalPayouts: 0,
          currency: 'GNF',
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        await walletRef.set(newWallet);
        return newWallet;
      }
      
      return walletSnap.data();
    } catch (error) {
      console.error('Erreur récupération portefeuille plateforme:', error);
      throw error;
    }
  },
  
  /**
   * Créditer le portefeuille d'un professeur
   */
  async creditTeacherWallet(teacherId, amount, transactionId, description) {
    try {
      const walletRef = db.collection('teacher_wallets').doc(teacherId);
      
      await db.runTransaction(async (transaction) => {
        const walletSnap = await transaction.get(walletRef);
        
        if (!walletSnap.exists) {
          // Créer le portefeuille s'il n'existe pas
          transaction.set(walletRef, {
            teacherId,
            balance: 0,
            pendingBalance: amount,
            totalEarned: amount,
            totalWithdrawn: 0,
            currency: 'GNF',
            paymentMode: 'monthly',
            preferredPaymentMethod: null,
            paymentDetails: {},
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        } else {
          const currentData = walletSnap.data();
          transaction.update(walletRef, {
            pendingBalance: (currentData.pendingBalance || 0) + amount,
            totalEarned: (currentData.totalEarned || 0) + amount,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        }
      });
      
      // Enregistrer dans l'historique
      await db.collection('wallet_transactions').add({
        walletType: 'teacher',
        walletId: teacherId,
        type: 'credit',
        amount,
        transactionId,
        description,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error('Erreur crédit portefeuille:', error);
      throw error;
    }
  },
  
  /**
   * Créditer le portefeuille de la plateforme
   */
  async creditPlatformWallet(amount, source, transactionId) {
    try {
      const walletRef = db.collection('platform_wallet').doc('main');
      
      await db.runTransaction(async (transaction) => {
        const walletSnap = await transaction.get(walletRef);
        const currentData = walletSnap.exists ? walletSnap.data() : {};
        
        const updates = {
          balance: (currentData.balance || 0) + amount,
          totalRevenue: (currentData.totalRevenue || 0) + amount,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        if (source === 'subscription') {
          updates.totalSubscriptions = (currentData.totalSubscriptions || 0) + amount;
        } else if (source === 'course_commission') {
          updates.totalCourseCommissions = (currentData.totalCourseCommissions || 0) + amount;
        }
        
        if (walletSnap.exists) {
          transaction.update(walletRef, updates);
        } else {
          transaction.set(walletRef, {
            ...updates,
            currency: 'GNF',
            totalPayouts: 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        }
      });
      
      return true;
    } catch (error) {
      console.error('Erreur crédit plateforme:', error);
      throw error;
    }
  },
  
  /**
   * Mettre à jour le mode de paiement du professeur
   */
  async updateTeacherPaymentMode(teacherId, paymentMode, paymentMethod, paymentDetails) {
    try {
      await db.collection('teacher_wallets').doc(teacherId).update({
        paymentMode,
        preferredPaymentMethod: paymentMethod,
        paymentDetails,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Erreur mise à jour mode paiement:', error);
      throw error;
    }
  },
  
  /**
   * Transférer le solde en attente vers le solde disponible
   */
  async releasePendingBalance(teacherId, amount) {
    try {
      const walletRef = db.collection('teacher_wallets').doc(teacherId);
      
      await db.runTransaction(async (transaction) => {
        const walletSnap = await transaction.get(walletRef);
        if (!walletSnap.exists) throw new Error('Portefeuille non trouvé');
        
        const data = walletSnap.data();
        if (data.pendingBalance < amount) {
          throw new Error('Solde en attente insuffisant');
        }
        
        transaction.update(walletRef, {
          balance: (data.balance || 0) + amount,
          pendingBalance: data.pendingBalance - amount,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      });
      
      return true;
    } catch (error) {
      console.error('Erreur libération solde:', error);
      throw error;
    }
  }
};

// ============================================================
// 💳 SERVICE DE PAIEMENT (PAYMENT SERVICE)
// ============================================================
const PaymentService = {
  
  /**
   * Simuler un paiement via mobile money ou carte
   * En production, ceci appellerait l'API réelle du provider
   */
  async simulatePayment(paymentData) {
    const { method, amount, phoneNumber, cardDetails, userId } = paymentData;
    
    // Validation
    const methodConfig = FINANCE_CONFIG.PAYMENT_METHODS[method.toUpperCase()] ||
                        FINANCE_CONFIG.PAYMENT_METHODS[method.toUpperCase().replace(' ', '_')];
    
    if (!methodConfig) {
      return { success: false, error: 'Méthode de paiement invalide' };
    }
    
    if (amount < methodConfig.minAmount) {
      return { success: false, error: `Montant minimum: ${methodConfig.minAmount.toLocaleString()} GNF` };
    }
    
    if (amount > methodConfig.maxAmount) {
      return { success: false, error: `Montant maximum: ${methodConfig.maxAmount.toLocaleString()} GNF` };
    }
    
    // Simuler un délai de traitement (1-3 secondes)
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Simuler un taux de succès de 95%
    const isSuccess = Math.random() > 0.05;
    
    if (!isSuccess) {
      return {
        success: false,
        error: 'Paiement refusé. Veuillez réessayer.',
        code: 'PAYMENT_DECLINED'
      };
    }
    
    // Calculer les frais
    const fee = Math.round(amount * methodConfig.fee);
    const netAmount = amount - fee;
    
    // Générer un ID de transaction unique
    const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    return {
      success: true,
      transactionId,
      amount,
      fee,
      netAmount,
      method: methodConfig.id,
      methodName: methodConfig.name,
      timestamp: new Date().toISOString(),
      reference: `REF${Date.now()}`
    };
  },
  
  /**
   * Traiter un paiement d'abonnement
   */
  async processSubscription(userId, paymentMethod, paymentDetails) {
    try {
      const amount = FINANCE_CONFIG.SUBSCRIPTION_PRICE;
      
      // Simuler le paiement
      const paymentResult = await this.simulatePayment({
        method: paymentMethod,
        amount,
        ...paymentDetails,
        userId
      });
      
      if (!paymentResult.success) {
        return paymentResult;
      }
      
      // Récupérer les informations de l'utilisateur pour les enregistrer avec l'abonnement
      let userName = '';
      let userEmail = '';
      try {
        const userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          userName = userData.fullName || userData.displayName || '';
          userEmail = userData.email || '';
        }
      } catch (e) {
        console.warn('Impossible de récupérer les infos utilisateur:', e);
      }
      
      // Calculer la date d'expiration
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + FINANCE_CONFIG.SUBSCRIPTION_DURATION_DAYS);
      
      // Créer l'enregistrement d'abonnement avec les infos utilisateur
      const subscriptionData = {
        userId,
        userName,
        userEmail,
        plan: 'premium',
        amount,
        paymentMethod,
        transactionId: paymentResult.transactionId,
        status: 'active',
        startedAt: firebase.firestore.FieldValue.serverTimestamp(),
        expiresAt: firebase.firestore.Timestamp.fromDate(expiresAt),
        autoRenew: true,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      
      const subRef = await db.collection('subscriptions').add(subscriptionData);
      
      // Mettre à jour le profil utilisateur
      await db.collection('users').doc(userId).update({
        subscriptionPlan: 'premium',
        subscriptionExpires: firebase.firestore.Timestamp.fromDate(expiresAt),
        subscriptionId: subRef.id
      });
      
      // Enregistrer la transaction
      await TransactionService.createTransaction({
        userId,
        type: FINANCE_CONFIG.TRANSACTION_TYPES.SUBSCRIPTION,
        amount,
        fee: paymentResult.fee,
        netAmount: paymentResult.netAmount,
        paymentMethod,
        status: FINANCE_CONFIG.TRANSACTION_STATUS.COMPLETED,
        reference: paymentResult.transactionId,
        description: `Abonnement Premium - ${FINANCE_CONFIG.SUBSCRIPTION_DURATION_DAYS} jours`
      });
      
      // Créditer le portefeuille plateforme
      await WalletService.creditPlatformWallet(
        paymentResult.netAmount,
        'subscription',
        paymentResult.transactionId
      );
      
      return {
        success: true,
        subscriptionId: subRef.id,
        expiresAt: expiresAt.toISOString(),
        transactionId: paymentResult.transactionId
      };
      
    } catch (error) {
      console.error('Erreur traitement abonnement:', error);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Traiter l'achat d'un cours payant
   */
  async processCoursePayment(userId, courseId, paymentMethod, paymentDetails) {
    try {
      // Récupérer les infos du cours
      const courseSnap = await db.collection('paidCourses').doc(courseId).get();
      if (!courseSnap.exists) {
        return { success: false, error: 'Cours non trouvé' };
      }
      
      const course = courseSnap.data();
      const amount = course.price;
      const teacherId = course.authorId;
      
      // Vérifier si déjà acheté
      const existingPurchase = await db.collection('purchases')
        .where('userId', '==', userId)
        .where('courseId', '==', courseId)
        .get();
      
      if (!existingPurchase.empty) {
        return { success: false, error: 'Vous avez déjà acheté ce cours' };
      }
      
      // Simuler le paiement
      const paymentResult = await this.simulatePayment({
        method: paymentMethod,
        amount,
        ...paymentDetails,
        userId
      });
      
      if (!paymentResult.success) {
        return paymentResult;
      }
      
      // Calculer la répartition
      const platformShare = Math.round(paymentResult.netAmount * FINANCE_CONFIG.PLATFORM_COMMISSION_RATE);
      const teacherShare = paymentResult.netAmount - platformShare;
      
      // Créer l'achat
      const purchaseData = {
        userId,
        courseId,
        courseTitle: course.title,
        teacherId,
        teacherName: course.authorName,
        amount,
        fee: paymentResult.fee,
        platformShare,
        teacherShare,
        paymentMethod,
        transactionId: paymentResult.transactionId,
        status: 'completed',
        purchasedAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      
      const purchaseRef = await db.collection('purchases').add(purchaseData);
      
      // Enregistrer la transaction principale
      await TransactionService.createTransaction({
        userId,
        type: FINANCE_CONFIG.TRANSACTION_TYPES.COURSE_PURCHASE,
        amount,
        fee: paymentResult.fee,
        netAmount: paymentResult.netAmount,
        paymentMethod,
        status: FINANCE_CONFIG.TRANSACTION_STATUS.COMPLETED,
        reference: paymentResult.transactionId,
        description: `Achat: ${course.title}`,
        metadata: { courseId, teacherId, platformShare, teacherShare }
      });
      
      // Créditer le portefeuille plateforme
      await WalletService.creditPlatformWallet(
        platformShare,
        'course_commission',
        paymentResult.transactionId
      );
      
      // Créditer le portefeuille professeur
      await WalletService.creditTeacherWallet(
        teacherId,
        teacherShare,
        paymentResult.transactionId,
        `Vente: ${course.title}`
      );
      
      // Mettre à jour les stats du cours
      await db.collection('paidCourses').doc(courseId).update({
        totalSales: firebase.firestore.FieldValue.increment(1),
        totalRevenue: firebase.firestore.FieldValue.increment(amount)
      });
      
      return {
        success: true,
        purchaseId: purchaseRef.id,
        transactionId: paymentResult.transactionId,
        teacherShare,
        platformShare
      };
      
    } catch (error) {
      console.error('Erreur achat cours:', error);
      return { success: false, error: error.message };
    }
  }
};

// ============================================================
// 📝 SERVICE DE TRANSACTIONS
// ============================================================
const TransactionService = {
  
  /**
   * Créer une nouvelle transaction
   */
  async createTransaction(data) {
    try {
      const transactionData = {
        ...data,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      
      const ref = await db.collection('transactions').add(transactionData);
      return { id: ref.id, ...transactionData };
    } catch (error) {
      console.error('Erreur création transaction:', error);
      throw error;
    }
  },
  
  /**
   * Récupérer les transactions d'un utilisateur
   */
  async getUserTransactions(userId, options = {}) {
    try {
      let query = db.collection('transactions')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc');
      
      if (options.type) {
        query = query.where('type', '==', options.type);
      }
      
      if (options.status) {
        query = query.where('status', '==', options.status);
      }
      
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Erreur récupération transactions:', error);
      return [];
    }
  },
  
  /**
   * Récupérer les transactions d'un professeur (ventes)
   */
  async getTeacherSalesTransactions(teacherId, options = {}) {
    try {
      let query = db.collection('purchases')
        .where('teacherId', '==', teacherId)
        .orderBy('purchasedAt', 'desc');
      
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Erreur récupération ventes:', error);
      return [];
    }
  },
  
  /**
   * Récupérer les stats financières pour l'admin
   */
  async getFinancialStats(startDate, endDate) {
    try {
      const stats = {
        totalRevenue: 0,
        subscriptionRevenue: 0,
        courseRevenue: 0,
        teacherPayouts: 0,
        platformEarnings: 0,
        transactionCount: 0,
        subscriptionCount: 0,
        purchaseCount: 0,
        activeSubscribers: 0,
        newUsers: 0
      };
      
      // Transactions dans la période
      const transactionsQuery = db.collection('transactions')
        .where('createdAt', '>=', startDate)
        .where('createdAt', '<=', endDate);
      
      const transSnap = await transactionsQuery.get();
      
      transSnap.forEach(doc => {
        const trans = doc.data();
        stats.transactionCount++;
        
        if (trans.type === FINANCE_CONFIG.TRANSACTION_TYPES.SUBSCRIPTION) {
          stats.subscriptionRevenue += trans.netAmount || 0;
          stats.subscriptionCount++;
        } else if (trans.type === FINANCE_CONFIG.TRANSACTION_TYPES.COURSE_PURCHASE) {
          stats.courseRevenue += trans.netAmount || 0;
          stats.purchaseCount++;
          if (trans.metadata) {
            stats.platformEarnings += trans.metadata.platformShare || 0;
            stats.teacherPayouts += trans.metadata.teacherShare || 0;
          }
        }
      });
      
      stats.totalRevenue = stats.subscriptionRevenue + stats.courseRevenue;
      
      // Abonnés actifs
      const activeSubsSnap = await db.collection('subscriptions')
        .where('status', '==', 'active')
        .where('expiresAt', '>=', new Date())
        .get();
      stats.activeSubscribers = activeSubsSnap.size;
      
      // Nouveaux utilisateurs
      const newUsersSnap = await db.collection('users')
        .where('createdAt', '>=', startDate)
        .where('createdAt', '<=', endDate)
        .get();
      stats.newUsers = newUsersSnap.size;
      
      return stats;
    } catch (error) {
      console.error('Erreur stats financières:', error);
      return null;
    }
  },
  
  /**
   * Récupérer le graphique des revenus
   */
  async getRevenueChart(period = 'month') {
    try {
      const now = new Date();
      let labels = [];
      let data = [];
      let startDate;
      
      if (period === 'week') {
        // 7 derniers jours
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          labels.push(date.toLocaleDateString('fr-FR', { weekday: 'short' }));
        }
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 6);
      } else if (period === 'month') {
        // 30 derniers jours (groupés par semaine)
        for (let i = 3; i >= 0; i--) {
          const weekStart = new Date(now);
          weekStart.setDate(weekStart.getDate() - (i * 7));
          labels.push(`Sem ${4 - i}`);
        }
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 28);
      } else {
        // 12 derniers mois
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now);
          date.setMonth(date.getMonth() - i);
          labels.push(date.toLocaleDateString('fr-FR', { month: 'short' }));
        }
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 11);
      }
      
      // Pour simplifier, retourner des données mock pour le graphique
      // En production, ceci devrait aggreger les vraies données
      data = labels.map(() => Math.floor(Math.random() * 500000) + 100000);
      
      return { labels, data };
    } catch (error) {
      console.error('Erreur graphique revenus:', error);
      return { labels: [], data: [] };
    }
  }
};

// ============================================================
// 💸 SERVICE DE RETRAIT
// ============================================================
const WithdrawalService = {
  
  /**
   * Créer une demande de retrait
   */
  async createWithdrawalRequest(teacherId, amount, paymentMethod, paymentDetails) {
    try {
      // Vérifier le solde
      const wallet = await WalletService.getTeacherWallet(teacherId);
      
      if (wallet.balance < amount) {
        return { success: false, error: 'Solde insuffisant' };
      }
      
      if (amount < FINANCE_CONFIG.MIN_WITHDRAWAL_AMOUNT) {
        return { 
          success: false, 
          error: `Montant minimum: ${FINANCE_CONFIG.MIN_WITHDRAWAL_AMOUNT.toLocaleString()} GNF` 
        };
      }
      
      // Calculer les frais
      const fee = Math.round(amount * FINANCE_CONFIG.WITHDRAWAL_FEE_RATE);
      const netAmount = amount - fee;
      
      // Créer la demande
      const requestData = {
        teacherId,
        amount,
        fee,
        netAmount,
        paymentMethod,
        paymentDetails,
        status: 'pending',
        requestedAt: firebase.firestore.FieldValue.serverTimestamp(),
        processedAt: null,
        processedBy: null,
        rejectionReason: null
      };
      
      const requestRef = await db.collection('withdraw_requests').add(requestData);
      
      // Bloquer le montant dans le portefeuille
      await db.collection('teacher_wallets').doc(teacherId).update({
        balance: firebase.firestore.FieldValue.increment(-amount),
        pendingWithdrawal: firebase.firestore.FieldValue.increment(amount),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      // Notifier l'admin (optionnel)
      await db.collection('admin_notifications').add({
        type: 'withdrawal_request',
        requestId: requestRef.id,
        teacherId,
        amount,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        read: false
      });
      
      return {
        success: true,
        requestId: requestRef.id,
        netAmount,
        fee,
        estimatedProcessingTime: '24-48 heures'
      };
      
    } catch (error) {
      console.error('Erreur demande retrait:', error);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Approuver une demande de retrait (Admin)
   */
  async approveWithdrawal(requestId, adminId) {
    try {
      const requestRef = db.collection('withdraw_requests').doc(requestId);
      const requestSnap = await requestRef.get();
      
      if (!requestSnap.exists) {
        return { success: false, error: 'Demande non trouvée' };
      }
      
      const request = requestSnap.data();
      
      if (request.status !== 'pending') {
        return { success: false, error: 'Demande déjà traitée' };
      }
      
      // Simuler le paiement au professeur
      const paymentResult = await PaymentService.simulatePayment({
        method: request.paymentMethod,
        amount: request.netAmount,
        ...request.paymentDetails
      });
      
      if (!paymentResult.success) {
        return paymentResult;
      }
      
      // Mettre à jour la demande
      await requestRef.update({
        status: 'completed',
        processedAt: firebase.firestore.FieldValue.serverTimestamp(),
        processedBy: adminId,
        paymentTransactionId: paymentResult.transactionId
      });
      
      // Mettre à jour le portefeuille du professeur
      await db.collection('teacher_wallets').doc(request.teacherId).update({
        pendingWithdrawal: firebase.firestore.FieldValue.increment(-request.amount),
        totalWithdrawn: firebase.firestore.FieldValue.increment(request.netAmount),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      // Enregistrer la transaction
      await TransactionService.createTransaction({
        userId: request.teacherId,
        type: FINANCE_CONFIG.TRANSACTION_TYPES.WITHDRAWAL,
        amount: request.amount,
        fee: request.fee,
        netAmount: request.netAmount,
        paymentMethod: request.paymentMethod,
        status: FINANCE_CONFIG.TRANSACTION_STATUS.COMPLETED,
        reference: paymentResult.transactionId,
        description: 'Retrait de gains'
      });
      
      return {
        success: true,
        transactionId: paymentResult.transactionId
      };
      
    } catch (error) {
      console.error('Erreur approbation retrait:', error);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Rejeter une demande de retrait (Admin)
   */
  async rejectWithdrawal(requestId, adminId, reason) {
    try {
      const requestRef = db.collection('withdraw_requests').doc(requestId);
      const requestSnap = await requestRef.get();
      
      if (!requestSnap.exists) {
        return { success: false, error: 'Demande non trouvée' };
      }
      
      const request = requestSnap.data();
      
      if (request.status !== 'pending') {
        return { success: false, error: 'Demande déjà traitée' };
      }
      
      // Mettre à jour la demande
      await requestRef.update({
        status: 'rejected',
        processedAt: firebase.firestore.FieldValue.serverTimestamp(),
        processedBy: adminId,
        rejectionReason: reason
      });
      
      // Restituer le montant au portefeuille
      await db.collection('teacher_wallets').doc(request.teacherId).update({
        balance: firebase.firestore.FieldValue.increment(request.amount),
        pendingWithdrawal: firebase.firestore.FieldValue.increment(-request.amount),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      return { success: true };
      
    } catch (error) {
      console.error('Erreur rejet retrait:', error);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Récupérer les demandes de retrait en attente (Admin)
   */
  async getPendingWithdrawals() {
    try {
      const snapshot = await db.collection('withdraw_requests')
        .where('status', '==', 'pending')
        .orderBy('requestedAt', 'asc')
        .get();
      
      const requests = [];
      for (const doc of snapshot.docs) {
        const data = doc.data();
        // Récupérer les infos du professeur
        const teacherSnap = await db.collection('users').doc(data.teacherId).get();
        const teacher = teacherSnap.exists ? teacherSnap.data() : {};
        
        requests.push({
          id: doc.id,
          ...data,
          teacherName: teacher.fullName || 'Inconnu',
          teacherEmail: teacher.email || ''
        });
      }
      
      return requests;
    } catch (error) {
      console.error('Erreur récupération retraits:', error);
      return [];
    }
  },
  
  /**
   * Récupérer l'historique des retraits d'un professeur
   */
  async getTeacherWithdrawals(teacherId) {
    try {
      const snapshot = await db.collection('withdraw_requests')
        .where('teacherId', '==', teacherId)
        .orderBy('requestedAt', 'desc')
        .get();
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Erreur historique retraits:', error);
      return [];
    }
  }
};

// ============================================================
// 🔄 SERVICE D'ABONNEMENT
// ============================================================
const SubscriptionServiceV2 = {
  
  /**
   * Vérifier si l'abonnement est actif
   */
  async checkSubscription(userId) {
    try {
      const userSnap = await db.collection('users').doc(userId).get();
      if (!userSnap.exists) return { active: false };
      
      const user = userSnap.data();
      
      if (user.subscriptionPlan === 'premium' && user.subscriptionExpires) {
        const expiresAt = user.subscriptionExpires.toDate ? 
          user.subscriptionExpires.toDate() : 
          new Date(user.subscriptionExpires);
        
        if (expiresAt > new Date()) {
          return {
            active: true,
            plan: 'premium',
            expiresAt,
            daysRemaining: Math.ceil((expiresAt - new Date()) / (1000 * 60 * 60 * 24))
          };
        }
      }
      
      return { active: false };
    } catch (error) {
      console.error('Erreur vérification abonnement:', error);
      return { active: false };
    }
  },
  
  /**
   * Renouveler automatiquement l'abonnement
   */
  async autoRenew(userId) {
    try {
      const subSnap = await db.collection('subscriptions')
        .where('userId', '==', userId)
        .where('autoRenew', '==', true)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();
      
      if (subSnap.empty) return { success: false, error: 'Pas d\'abonnement auto-renouvelable' };
      
      const sub = subSnap.docs[0].data();
      
      // Tenter le renouvellement avec la même méthode de paiement
      const result = await PaymentService.processSubscription(
        userId,
        sub.paymentMethod,
        {} // Les détails seraient stockés de manière sécurisée
      );
      
      return result;
    } catch (error) {
      console.error('Erreur renouvellement auto:', error);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Annuler l'abonnement
   */
  async cancelSubscription(userId) {
    try {
      const userRef = db.collection('users').doc(userId);
      
      // Désactiver le renouvellement auto
      const subSnap = await db.collection('subscriptions')
        .where('userId', '==', userId)
        .where('status', '==', 'active')
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();
      
      if (!subSnap.empty) {
        await subSnap.docs[0].ref.update({
          autoRenew: false,
          cancelledAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
      
      return { success: true, message: 'Renouvellement automatique désactivé' };
    } catch (error) {
      console.error('Erreur annulation:', error);
      return { success: false, error: error.message };
    }
  }
};

// ============================================================
// 📊 HELPERS ET UTILITAIRES
// ============================================================
const FinanceHelpers = {
  
  /**
   * Formater un montant en GNF
   */
  formatAmount(amount) {
    return new Intl.NumberFormat('fr-GN', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount) + ' GNF';
  },
  
  /**
   * Formater une date
   */
  formatDate(timestamp) {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },
  
  /**
   * Obtenir la couleur du statut
   */
  getStatusColor(status) {
    const colors = {
      pending: '#f59e0b',
      processing: '#3b82f6',
      completed: '#10b981',
      failed: '#ef4444',
      cancelled: '#6b7280',
      refunded: '#8b5cf6'
    };
    return colors[status] || '#6b7280';
  },
  
  /**
   * Obtenir le badge du statut
   */
  getStatusBadge(status) {
    const labels = {
      pending: 'En attente',
      processing: 'En cours',
      completed: 'Complété',
      failed: 'Échoué',
      cancelled: 'Annulé',
      refunded: 'Remboursé'
    };
    const color = this.getStatusColor(status);
    return `<span style="background:${color}20;color:${color};padding:2px 8px;border-radius:4px;font-size:.85rem;">${labels[status] || status}</span>`;
  },
  
  /**
   * Calculer le pourcentage de variation
   */
  calculateVariation(current, previous) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  },
  
  /**
   * Valider un numéro de téléphone guinéen
   */
  validatePhoneNumber(phone) {
    // Format: 6XX XXX XXX (9 chiffres commençant par 6)
    const cleaned = phone.replace(/\D/g, '');
    return /^6\d{8}$/.test(cleaned);
  }
};

// ============================================================
// 🎯 EXPORT GLOBAL
// ============================================================
if (typeof window !== 'undefined') {
  window.FINANCE_CONFIG = FINANCE_CONFIG;
  window.WalletService = WalletService;
  window.PaymentService = PaymentService;
  window.TransactionService = TransactionService;
  window.WithdrawalService = WithdrawalService;
  window.SubscriptionServiceV2 = SubscriptionServiceV2;
  window.FinanceHelpers = FinanceHelpers;
}

// Pour Node.js/modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    FINANCE_CONFIG,
    WalletService,
    PaymentService,
    TransactionService,
    WithdrawalService,
    SubscriptionServiceV2,
    FinanceHelpers
  };
}

console.log('💰 Système financier Neoclass chargé');
