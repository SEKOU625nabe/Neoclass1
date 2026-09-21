// ============================================================
// 💱 SYSTÈME DE CONVERSION DE DEVISES - NEOCLASS 4.0
// ============================================================
// Convertir les montants entre différentes devises africaines
// Taux de change actualisés régulièrement
// ============================================================

'use strict';

const CurrencyConverter = {
  // Taux de change par rapport au GNF (Franc Guinéen) - Base de référence
  // Mis à jour: Mai 2026
  EXCHANGE_RATES: {
    'GNF': 1.0,           // Franc Guinéen (base)
    'XOF': 0.0082,        // Franc CFA (Afrique de l'Ouest) - 1 GNF = 0.0082 XOF
    'XAF': 0.0051,        // Franc CFA (Afrique Centrale) - 1 GNF = 0.0051 XAF
    'MAD': 0.0095,        // Dirham Marocain - 1 GNF = 0.0095 MAD
    'ZAR': 0.0065,        // Rand Sud-Africain - 1 GNF = 0.0065 ZAR
    'KES': 0.0078,        // Shilling Kényan - 1 GNF = 0.0078 KES
    'TZS': 0.25,          // Shilling Tanzanien - 1 GNF = 0.25 TZS
    'UGX': 4.2,           // Shilling Ougandais - 1 GNF = 4.2 UGX
    'NGN': 3.8,           // Naira Nigérian - 1 GNF = 3.8 NGN
    'USD': 0.00011,       // Dollar US - taux de référence
    'EUR': 0.00010        // Euro - taux de référence
  },

  // Devise par défaut pour chaque pays
  COUNTRY_CURRENCY: {
    'GN': 'GNF',  // Guinée
    'SN': 'XOF',  // Sénégal
    'CI': 'XOF',  // Côte d'Ivoire
    'ML': 'XOF',  // Mali
    'BF': 'XOF',  // Burkina Faso
    'NE': 'XOF',  // Niger
    'BJ': 'XOF',  // Bénin
    'TG': 'XOF',  // Togo
    'CM': 'XAF',  // Cameroun
    'MA': 'MAD',  // Maroc
    'ZA': 'ZAR',  // Afrique du Sud
    'KE': 'KES',  // Kenya
    'TZ': 'TZS',  // Tanzanie
    'UG': 'UGX',  // Ouganda
    'NG': 'NGN'   // Nigeria
  },

  // Symboles de devises
  SYMBOLS: {
    'GNF': 'Fr',
    'XOF': 'CFA',
    'XAF': 'CFA',
    'MAD': 'د.م.',
    'ZAR': 'R',
    'KES': 'Ksh',
    'TZS': 'TSh',
    'UGX': 'Ush',
    'NGN': '₦',
    'USD': '$',
    'EUR': '€'
  },

  /**
   * Convertir un montant d'une devise à une autre
   */
  convert(amount, fromCurrency, toCurrency) {
    if (!this.EXCHANGE_RATES[fromCurrency] || !this.EXCHANGE_RATES[toCurrency]) {
      console.warn(`Conversion inconnue: ${fromCurrency} → ${toCurrency}`);
      return amount; // Retourner le montant original
    }

    // Convertir en USD d'abord (devise pivot), puis en devise cible
    const amountInUSD = amount * this.EXCHANGE_RATES[fromCurrency] / this.EXCHANGE_RATES['USD'];
    return Math.round(amountInUSD / this.EXCHANGE_RATES[toCurrency]);
  },

  /**
   * Convertir de GNF à une autre devise
   */
  fromGNF(amountInGNF, targetCurrency) {
    return this.convert(amountInGNF, 'GNF', targetCurrency);
  },

  /**
   * Convertir vers GNF depuis une autre devise
   */
  toGNF(amount, sourceCurrency) {
    return this.convert(amount, sourceCurrency, 'GNF');
  },

  /**
   * Obtenir le taux de change entre deux devises
   */
  getRate(fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) return 1.0;
    if (fromCurrency === 'GNF') return 1 / this.EXCHANGE_RATES[toCurrency];
    if (toCurrency === 'GNF') return this.EXCHANGE_RATES[fromCurrency];
    
    return (this.EXCHANGE_RATES[fromCurrency] / this.EXCHANGE_RATES[toCurrency]);
  },

  /**
   * Obtenir la devise d'un pays
   */
  getCurrencyForCountry(countryCode) {
    return this.COUNTRY_CURRENCY[countryCode] || 'GNF';
  },

  /**
   * Obtenir le symbole d'une devise
   */
  getSymbol(currency) {
    return this.SYMBOLS[currency] || currency;
  },

  /**
   * Formater un montant converti
   */
  formatConverted(amountInGNF, targetCurrency) {
    const converted = this.fromGNF(amountInGNF, targetCurrency);
    const symbol = this.getSymbol(targetCurrency);
    const formatted = new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.round(converted));

    return `${formatted} ${symbol}`;
  },

  /**
   * Formater un montant dans deux devises (comparaison)
   */
  formatComparison(amountInGNF, targetCurrency) {
    const symbolGNF = this.getSymbol('GNF');
    const symbolTarget = this.getSymbol(targetCurrency);
    const converted = this.fromGNF(amountInGNF, targetCurrency);
    
    const formattedGNF = new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.round(amountInGNF));

    const formattedTarget = new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.round(converted));

    return `${formattedGNF} ${symbolGNF} (≈ ${formattedTarget} ${symbolTarget})`;
  }
};

// ============================================================
// 🔗 INTÉGRATION AVEC LE SYSTEME DE PRIX
// ============================================================

const PricingSystem = {
  /**
   * Calculer le prix d'abonnement adapté au pays
   */
  getSubscriptionPrice(plan, countryCode = null) {
    const country = countryCode || State?.profile?.countryCode || 'GN';
    const currency = CurrencyConverter.getCurrencyForCountry(country);
    
    const pricesGNF = {
      'FREE': 0,
      'STANDARD': 50000,
      'PREMIUM': 150000
    };

    // Allow admin overrides via PricingSystem._settings
    let priceInGNF = pricesGNF[plan] || 0;
    try {
      if (this._settings && this._settings.subscriptionPrices && this._settings.subscriptionPrices[plan]) {
        const val = this._settings.subscriptionPrices[plan];
        // accept either raw number (GNF) or object { priceGNF }
        priceInGNF = typeof val === 'number' ? val : (val.priceGNF || priceInGNF);
      }
      if (this._settings && this._settings.plans && this._settings.plans[plan] && this._settings.plans[plan].price) {
        priceInGNF = parseInt(this._settings.plans[plan].price) || priceInGNF;
      }
    } catch(e) { console.warn('PricingSystem override failed', e); }
    return currency === 'GNF' ? priceInGNF : CurrencyConverter.fromGNF(priceInGNF, currency);
  },

  /**
   * Appliquer des settings de pricing depuis Firestore (admin)
   */
  applySettings(settings) {
    this._settings = settings || {};
  },

  /**
   * Obtenir tous les prix convertis pour un plan
   */
  getPricesForAllCountries(plan) {
    const priceGNF = this.getSubscriptionPrice(plan, 'GN');
    const prices = {};

    for (let country in CurrencyConverter.COUNTRY_CURRENCY) {
      const currency = CurrencyConverter.COUNTRY_CURRENCY[country];
      prices[currency] = CurrencyConverter.fromGNF(priceGNF, currency);
    }

    return prices;
  },

  /**
   * Formater le prix pour affichage
   */
  formatPrice(plan, countryCode = null) {
    const country = countryCode || State?.profile?.countryCode || 'GN';
    const currency = CurrencyConverter.getCurrencyForCountry(country);
    const priceGNF = this.getSubscriptionPrice(plan, country);
    
    if (currency === 'GNF') {
      return `${priceGNF.toLocaleString('fr-FR')} ${CurrencyConverter.getSymbol('GNF')}`;
    } else {
      return CurrencyConverter.formatComparison(priceGNF, currency);
    }
  }
};

// ============================================================
// 💳 WIDGET DE CONVERSION DE DEVISES
// ============================================================

const CurrencyWidget = {
  /**
   * Créer un widget de conversion interactif
   */
  createConverter(initialAmount = 100000, initialCurrency = 'GNF') {
    const currencies = Object.keys(CurrencyConverter.EXCHANGE_RATES);
    
    return `
      <div class="currency-converter" style="background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: #fff; padding: 20px; border-radius: 12px; border: none;">
        <h4 style="margin: 0 0 15px 0; display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 1.5rem;">💱</span>
          Convertisseur de Devises
        </h4>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <!-- Devise Source -->
          <div>
            <label style="display: block; margin-bottom: 8px; font-size: 0.9rem; opacity: 0.9;">De:</label>
            <select id="currencyFrom" style="width: 100%; padding: 8px; border-radius: 6px; border: none; background: rgba(255,255,255,0.2); color: #fff; cursor: pointer;">
              ${currencies.map(curr => `
                <option value="${curr}" ${curr === initialCurrency ? 'selected' : ''} style="background: #333;">
                  ${curr} - ${CurrencyConverter.getSymbol(curr)}
                </option>
              `).join('')}
            </select>
          </div>

          <!-- Devise Cible -->
          <div>
            <label style="display: block; margin-bottom: 8px; font-size: 0.9rem; opacity: 0.9;">Vers:</label>
            <select id="currencyTo" style="width: 100%; padding: 8px; border-radius: 6px; border: none; background: rgba(255,255,255,0.2); color: #fff; cursor: pointer;">
              ${currencies.map(curr => `
                <option value="${curr}" ${curr === 'GNF' ? 'selected' : ''} style="background: #333;">
                  ${curr} - ${CurrencyConverter.getSymbol(curr)}
                </option>
              `).join('')}
            </select>
          </div>
        </div>

        <!-- Montant -->
        <div style="margin-top: 15px;">
          <label style="display: block; margin-bottom: 8px; font-size: 0.9rem; opacity: 0.9;">Montant:</label>
          <input type="number" id="convertAmount" value="${initialAmount}" style="width: 100%; padding: 10px; border-radius: 6px; border: none; font-size: 1rem; font-weight: 600;" onchange="CurrencyWidget.updateConversion(); oninput="CurrencyWidget.updateConversion();" />
        </div>

        <!-- Résultat -->
        <div style="margin-top: 15px; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 6px; text-align: center;">
          <div style="font-size: 0.9rem; opacity: 0.9; margin-bottom: 8px;">Résultat:</div>
          <div id="conversionResult" style="font-size: 1.5rem; font-weight: 700;">Convertissez →</div>
          <div style="font-size: 0.85rem; opacity: 0.8; margin-top: 8px;">
            Taux: 1 <span id="rateFrom">GNF</span> = <span id="rateAmount">1</span> <span id="rateTo">GNF</span>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Mettre à jour la conversion
   */
  updateConversion() {
    const from = document.getElementById('currencyFrom')?.value || 'GNF';
    const to = document.getElementById('currencyTo')?.value || 'GNF';
    const amount = parseFloat(document.getElementById('convertAmount')?.value || 0);

    const converted = CurrencyConverter.convert(amount, from, to);
    const rate = CurrencyConverter.getRate(from, to);

    const resultEl = document.getElementById('conversionResult');
    const rateFromEl = document.getElementById('rateFrom');
    const rateAmountEl = document.getElementById('rateAmount');
    const rateToEl = document.getElementById('rateTo');

    if (resultEl) resultEl.textContent = `${converted.toLocaleString('fr-FR')} ${CurrencyConverter.getSymbol(to)}`;
    if (rateFromEl) rateFromEl.textContent = from;
    if (rateToEl) rateToEl.textContent = to;
    if (rateAmountEl) rateAmountEl.textContent = rate.toFixed(6);
  }
};

// ============================================================
// 📊 TABLEAU DE BORD DES TAUX DE CHANGE
// ============================================================

const ExchangeRateDashboard = {
  /**
   * Afficher tous les taux de change par rapport à GNF
   */
  render() {
    const currencies = Object.keys(CurrencyConverter.EXCHANGE_RATES);
    
    let html = `
      <div class="card">
        <h3 style="margin: 0 0 20px 0;">📊 Taux de Change (par rapport à GNF)</h3>
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 2px solid var(--border);">
                <th style="padding: 12px; text-align: left; color: var(--text-secondary); font-weight: 600;">Devise</th>
                <th style="padding: 12px; text-align: left; color: var(--text-secondary); font-weight: 600;">Symbole</th>
                <th style="padding: 12px; text-align: right; color: var(--text-secondary); font-weight: 600;">Taux (1 GNF =)</th>
                <th style="padding: 12px; text-align: right; color: var(--text-secondary); font-weight: 600;">Inverse (1 devise =)</th>
              </tr>
            </thead>
            <tbody>
    `;

    for (let currency of currencies) {
      if (currency === 'GNF') continue; // Sauter la devise de base
      
      const rate = CurrencyConverter.EXCHANGE_RATES[currency];
      const inverse = 1 / rate;
      const symbol = CurrencyConverter.getSymbol(currency);

      html += `
        <tr style="border-bottom: 1px solid var(--border); hover: background-color: var(--bg-hover);">
          <td style="padding: 12px;"><strong>${currency}</strong></td>
          <td style="padding: 12px;">${symbol}</td>
          <td style="padding: 12px; text-align: right;">${rate.toFixed(6)}</td>
          <td style="padding: 12px; text-align: right; color: var(--primary); font-weight: 600;">${inverse.toFixed(4)}</td>
        </tr>
      `;
    }

    html += `
            </tbody>
          </table>
        </div>
        <div style="margin-top: 15px; padding: 12px; background: var(--bg-hover); border-radius: 6px; color: var(--text-secondary); font-size: 0.9rem;">
          <strong>ℹ️ Note:</strong> Les taux sont mis à jour régulièrement. Dernière mise à jour: Mai 2026
        </div>
      </div>
    `;

    return html;
  }
};

// Exporter les objets globalement
window.CurrencyConverter = CurrencyConverter;
window.PricingSystem = PricingSystem;
window.CurrencyWidget = CurrencyWidget;
window.ExchangeRateDashboard = ExchangeRateDashboard;
