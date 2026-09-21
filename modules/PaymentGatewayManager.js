// ============================================================
// 💳 PAYMENT GATEWAY MANAGER - Gestionnaire de passerelles
// Gère Orange Money, MTN Money, Stripe et Wave
// ============================================================

class PaymentGatewayManager {
  constructor() {
    this.gateways = {
      'orange': new OrangeMoneyGateway(),
      'mtn': new MTNMoneyGateway(),
      'card': new CardGateway(),
      'wave': new WaveGateway()
    };
    this.transactions = new Map();
    this.webhooks = [];
  }

  /**
   * Initier un paiement
   * @param {Object} params - { operator, amount, phone, name, email, orderId }
   */
  async initiate(params) {
    const { operator, amount, phone, name, email, orderId = this.generateOrderId() } = params;

    if (!this.gateways[operator]) {
      throw new Error(`Opérateur invalide: ${operator}`);
    }

    if (amount <= 0 || amount > 50000000) {
      throw new Error('Montant invalide');
    }

    try {
      const gateway = this.gateways[operator];
      const response = await gateway.initiate({
        amount,
        phone,
        name,
        email,
        orderId
      });

      // Sauvegarder la transaction
      this.transactions.set(orderId, {
        id: orderId,
        operator,
        amount,
        phone,
        email,
        status: 'pending',
        createdAt: new Date(),
        gatewayResponse: response
      });

      return {
        success: true,
        orderId,
        operator,
        amount,
        phone: this.maskPhone(phone),
        status: 'pending',
        message: `Paiement initié via ${operator}. Vérifiez votre téléphone.`,
        gatewayData: response
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        orderId
      };
    }
  }

  /**
   * Vérifier le statut d'une transaction
   */
  async checkStatus(orderId) {
    const transaction = this.transactions.get(orderId);
    if (!transaction) {
      throw new Error('Transaction non trouvée');
    }

    const gateway = this.gateways[transaction.operator];
    const status = await gateway.checkStatus(orderId);

    transaction.lastCheckAt = new Date();
    transaction.status = status.status;
    transaction.lastGatewayCheck = status;

    return { success: true, data: transaction };
  }

  /**
   * Confirmer un paiement (appelé par webhook)
   */
  confirmPayment(orderId, gatewayData) {
    const transaction = this.transactions.get(orderId);
    if (!transaction) {
      throw new Error('Transaction non trouvée');
    }

    transaction.status = 'completed';
    transaction.gatewayTransactionId = gatewayData.transactionId;
    transaction.completedAt = new Date();

    // Appeler les webhooks enregistrés
    this.webhooks.forEach(hook => {
      hook({
        type: 'payment.completed',
        orderId,
        amount: transaction.amount,
        operator: transaction.operator,
        timestamp: new Date()
      });
    });

    return { success: true, message: 'Paiement confirmé' };
  }

  /**
   * Annuler un paiement
   */
  cancelPayment(orderId, reason = 'user_cancelled') {
    const transaction = this.transactions.get(orderId);
    if (!transaction) {
      throw new Error('Transaction non trouvée');
    }

    transaction.status = 'cancelled';
    transaction.cancellationReason = reason;
    transaction.cancelledAt = new Date();

    return { success: true, message: 'Paiement annulé' };
  }

  /**
   * Obtenir l'historique des transactions
   */
  getTransactionHistory(filters = {}) {
    let transactions = Array.from(this.transactions.values());

    if (filters.operator) {
      transactions = transactions.filter(t => t.operator === filters.operator);
    }
    if (filters.status) {
      transactions = transactions.filter(t => t.status === filters.status);
    }
    if (filters.fromDate) {
      transactions = transactions.filter(t => t.createdAt >= filters.fromDate);
    }
    if (filters.toDate) {
      transactions = transactions.filter(t => t.createdAt <= filters.toDate);
    }

    return transactions.sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * S'enregistrer pour les webhooks
   */
  onPaymentEvent(callback) {
    this.webhooks.push(callback);
  }

  /**
   * Générer un ID de commande unique
   */
  generateOrderId() {
    return `NEO-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  }

  /**
   * Masquer le numéro de téléphone
   */
  maskPhone(phone) {
    if (phone.length < 4) return '****';
    return phone.slice(0, -4) + '****';
  }

  /**
   * Obtenir un montant formaté
   */
  formatAmount(amount, currency = 'GNF') {
    const formatter = new Intl.NumberFormat('fr-GN', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    });
    return formatter.format(amount);
  }
}

// ============================================================
// 🟠 ORANGE MONEY GATEWAY
// ============================================================
class OrangeMoneyGateway {
  constructor() {
    this.apiBase = process.env.ORANGE_API_BASE || 'https://api.orange.com/orange-money-webpay';
    this.merchantKey = process.env.ORANGE_MERCHANT_KEY || 'DEMO_KEY';
    this.token = process.env.ORANGE_ACCESS_TOKEN || 'DEMO_TOKEN';
  }

  async initiate(params) {
    // Mode démo - pas d'appel API réel
    if (this.token.startsWith('DEMO')) {
      return {
        status: 'pending',
        paymentCode: `OM-${Date.now()}`,
        ussdCode: `*144*${params.amount}*${params.orderId}#`,
        message: 'DEMO MODE: Utilisez le code USSD fourni'
      };
    }

    try {
      // Appel réel à Orange Money API (en production)
      const response = await fetch(`${this.apiBase}/webpay/initiate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: params.amount,
          currency: 'GNF',
          merchant_key: this.merchantKey,
          customer_number: params.phone,
          order_id: params.orderId,
          customer_email: params.email
        })
      });

      if (!response.ok) {
        throw new Error(`Orange API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async checkStatus(orderId) {
    if (this.token.startsWith('DEMO')) {
      return { status: 'pending', message: 'DEMO MODE' };
    }

    try {
      const response = await fetch(`${this.apiBase}/webpay/status/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      return await response.json();
    } catch (error) {
      throw error;
    }
  }
}

// ============================================================
// 🟡 MTN MONEY GATEWAY
// ============================================================
class MTNMoneyGateway {
  constructor() {
    this.apiBase = process.env.MTN_API_BASE || 'https://api.mtn.com/';
    this.apiKey = process.env.MTN_ACCESS_TOKEN || 'DEMO_KEY';
    this.subscriptionKey = process.env.MTN_SUBSCRIPTION_KEY || 'DEMO_KEY';
  }

  async initiate(params) {
    if (this.apiKey.startsWith('DEMO')) {
      return {
        status: 'pending',
        paymentCode: `MTN-${Date.now()}`,
        ussdCode: `*170*${params.amount}*${params.orderId}#`,
        message: 'DEMO MODE: Utilisez le code USSD fourni'
      };
    }

    try {
      const response = await fetch(`${this.apiBase}collection/v1_0/requesttopay`, {
        method: 'POST',
        headers: {
          'X-Reference-Id': params.orderId,
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Target-Environment': 'production',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: String(params.amount),
          currency: 'GNF',
          externalId: params.orderId,
          payer: {
            partyIdType: 'MSISDN',
            partyId: params.phone
          },
          payerMessage: 'Paiement Neoclass',
          payeeNote: 'Neoclass Platform'
        })
      });

      if (!response.ok) {
        throw new Error(`MTN API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async checkStatus(orderId) {
    if (this.apiKey.startsWith('DEMO')) {
      return { status: 'pending', message: 'DEMO MODE' };
    }

    try {
      const response = await fetch(`${this.apiBase}collection/v1_0/requesttopay/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Target-Environment': 'production'
        }
      });

      return await response.json();
    } catch (error) {
      throw error;
    }
  }
}

// ============================================================
// 💳 CARD GATEWAY (Stripe/Flutterwave)
// ============================================================
class CardGateway {
  constructor() {
    this.provider = process.env.CARD_PROVIDER || 'stripe'; // stripe | flutterwave
    this.apiKey = process.env.STRIPE_KEY || process.env.FLUTTERWAVE_KEY || 'DEMO_KEY';
  }

  async initiate(params) {
    if (this.apiKey.startsWith('DEMO')) {
      return {
        status: 'pending',
        sessionId: `demo_session_${Date.now()}`,
        redirectUrl: `/checkout?session=${Date.now()}`,
        message: 'DEMO MODE: Simulé'
      };
    }

    if (this.provider === 'stripe') {
      return await this.initiateStripe(params);
    } else {
      return await this.initiateFlutterwave(params);
    }
  }

  async initiateStripe(params) {
    try {
      const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          'payment_method_types[]': 'card',
          'line_items[0][price_data][currency]': 'gnf',
          'line_items[0][price_data][unit_amount]': params.amount * 100,
          'line_items[0][quantity]': '1',
          'mode': 'payment',
          'success_url': `${process.env.BACKEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
          'cancel_url': `${process.env.BACKEND_URL}/payment/cancel`
        })
      });

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async initiateFlutterwave(params) {
    try {
      const response = await fetch('https://api.flutterwave.com/v3/payments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: params.amount,
          currency: 'GNF',
          email: params.email,
          phone_number: params.phone,
          customer_name: params.name,
          tx_ref: params.orderId,
          redirect_url: `${process.env.BACKEND_URL}/payment/verify`
        })
      });

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async checkStatus(orderId) {
    if (this.apiKey.startsWith('DEMO')) {
      return { status: 'pending', message: 'DEMO MODE' };
    }

    // Implémenter selon le provider
    return { status: 'unknown', message: 'Check not implemented' };
  }
}

// ============================================================
// 🌊 WAVE GATEWAY (Afrique de l'Ouest)
// ============================================================
class WaveGateway {
  constructor() {
    this.apiBase = process.env.WAVE_API_BASE || 'https://api.sendwave.com';
    this.apiKey = process.env.WAVE_API_KEY || 'DEMO_KEY';
  }

  async initiate(params) {
    if (this.apiKey.startsWith('DEMO')) {
      return {
        status: 'pending',
        transactionId: `WAVE-${Date.now()}`,
        message: 'DEMO MODE'
      };
    }

    try {
      const response = await fetch(`${this.apiBase}/v1/transactions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: params.amount,
          currency: 'GNF',
          destination_phone: params.phone,
          reference: params.orderId
        })
      });

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async checkStatus(orderId) {
    if (this.apiKey.startsWith('DEMO')) {
      return { status: 'pending' };
    }

    try {
      const response = await fetch(`${this.apiBase}/v1/transactions/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return await response.json();
    } catch (error) {
      throw error;
    }
  }
}

// ============================================================
// Exporter l'instance unique
// ============================================================
const paymentGateway = new PaymentGatewayManager();

// Support CommonJS et ESM
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { paymentGateway, PaymentGatewayManager };
}

// Pour le navigateur (si inclus directement)
if (typeof window !== 'undefined') {
  window.paymentGateway = paymentGateway;
}
