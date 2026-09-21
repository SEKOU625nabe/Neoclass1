// ============================================================
// 💰 SYSTÈME FINANCE AMÉLIORÉ - NEOCLASS 4.0
// ============================================================
// Gestion complète de la monnaie, formatage, navigation
// et tableaux de bord financiers professionnels
// ============================================================

'use strict';

// ============================================================
// 💵 GESTION CENTRALISÉE DE LA MONNAIE
// ============================================================

const CurrencyManager = {
  // Configuration des devises par pays
  CURRENCIES: {
    'GN': { code: 'GNF', symbol: 'Fr', name: 'Franc Guinéen', position: 'after', locale: 'fr-GN' },
    'SN': { code: 'XOF', symbol: 'CFA', name: 'Franc CFA', position: 'after', locale: 'fr-SN' },
    'CI': { code: 'XOF', symbol: 'CFA', name: 'Franc CFA', position: 'after', locale: 'fr-CI' },
    'ML': { code: 'XOF', symbol: 'CFA', name: 'Franc CFA', position: 'after', locale: 'fr-ML' },
    'BF': { code: 'XOF', symbol: 'CFA', name: 'Franc CFA', position: 'after', locale: 'fr-BF' },
    'CM': { code: 'XAF', symbol: 'CFA', name: 'Franc CFA', position: 'after', locale: 'fr-CM' },
    'MA': { code: 'MAD', symbol: 'د.م.', name: 'Dirham Marocain', position: 'before', locale: 'ar-MA' }
  },

  // Devise par défaut (Guinée)
  DEFAULT_CURRENCY: 'GNF',
  DEFAULT_COUNTRY: 'GN',

  /**
   * Formater un montant selon la devise d'un pays
   */
  formatAmount(amount, countryCode = null) {
    const country = countryCode || State?.profile?.countryCode || this.DEFAULT_COUNTRY;
    const currency = this.CURRENCIES[country] || this.CURRENCIES[this.DEFAULT_COUNTRY];
    
    // Formater avec séparateurs
    const formatted = new Intl.NumberFormat(currency.locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.round(amount));

    // Position du symbole
    if (currency.position === 'after') {
      return `${formatted} ${currency.symbol}`;
    } else {
      return `${currency.symbol} ${formatted}`;
    }
  },

  /**
   * Formater pour affichage court (dashboard)
   */
  formatShort(amount, countryCode = null) {
    const country = countryCode || State?.profile?.countryCode || this.DEFAULT_COUNTRY;
    const currency = this.CURRENCIES[country] || this.CURRENCIES[this.DEFAULT_COUNTRY];
    
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M ${currency.symbol}`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K ${currency.symbol}`;
    }
    return `${amount} ${currency.symbol}`;
  },

  /**
   * Obtenir le code devise d'un pays
   */
  getCurrencyCode(countryCode = null) {
    const country = countryCode || State?.profile?.countryCode || this.DEFAULT_COUNTRY;
    return this.CURRENCIES[country]?.code || this.DEFAULT_CURRENCY;
  },

  /**
   * Formater pour HTML (avec couleurs)
   */
  formatHTML(amount, type = 'normal', countryCode = null) {
    const formatted = this.formatAmount(amount, countryCode);
    
    let color = '#1a1a2e'; // Défaut
    if (type === 'income' || type === 'success') color = '#10b981';
    else if (type === 'expense' || type === 'danger') color = '#ef4444';
    else if (type === 'pending' || type === 'warning') color = '#f59e0b';
    
    return `<span style="color: ${color}; font-weight: 600;">${formatted}</span>`;
  }
};

// ============================================================
// 🔄 GESTIONNAIRE DE NAVIGATION AMÉLIORÉ
// ============================================================

const NavigationManager = {
  // Historique pour breadcrumb
  history: [],
  maxHistory: 10,

  /**
   * Aller à une page avec historique
   */
  goto(page, data = {}, title = null) {
    // Sauvegarder la page précédente
    if (State.currentPage && State.currentPage !== page) {
      this.history.push({
        page: State.currentPage,
        data: State.pageData || {},
        title: title || State.currentPageTitle
      });
      
      // Limiter la taille de l'historique
      if (this.history.length > this.maxHistory) {
        this.history.shift();
      }
    }

    State.currentPage = page;
    State.pageData = data;
    State.currentPageTitle = title;
    window.history.pushState({ page, data }, '', `#${page}`);
    renderPage(page);
    window.scrollTo(0, 0);
    
    // Fermer menus mobiles
    const nav = $('#navbarNav');
    if (nav) nav.classList.remove('open');
    const sb = $('.sidebar');
    if (sb) sb.classList.remove('open');
  },

  /**
   * Revenir à la page précédente
   */
  back() {
    if (this.history.length > 0) {
      const previous = this.history.pop();
      State.currentPage = previous.page;
      State.pageData = previous.data;
      renderPage(previous.page);
      window.scrollTo(0, 0);
    } else {
      // Par défaut, retourner au dashboard
      this.goto('dashboard');
    }
  },

  /**
   * Aller à l'accueil
   */
  home() {
    this.history = [];
    this.goto('dashboard');
  },

  /**
   * Obtenir le breadcrumb
   */
  getBreadcrumb() {
    const items = [];
    items.push({ label: '🏠 Accueil', action: () => this.home() });
    
    // Ajouter l'historique
    for (let item of this.history) {
      items.push({ 
        label: item.title || item.page, 
        action: () => {
          // Retrouver et restaurer l'état
          const idx = this.history.indexOf(item);
          const restored = this.history.splice(idx, 1)[0];
          State.currentPage = restored.page;
          State.pageData = restored.data;
          renderPage(restored.page);
        }
      });
    }
    
    // Page actuelle
    if (State.currentPageTitle) {
      items.push({ label: State.currentPageTitle, disabled: true });
    }
    
    return items;
  },

  /**
   * Générer le HTML du breadcrumb
   */
  renderBreadcrumb() {
    const items = this.getBreadcrumb();
    let html = '<nav class="breadcrumb-nav" style="margin-bottom: 20px;">';
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.disabled) {
        html += `<span class="breadcrumb-item active">${item.label}</span>`;
      } else {
        html += `<a class="breadcrumb-item" onclick="${item.action.toString()}">${item.label}</a>`;
      }
      
      if (i < items.length - 1) {
        html += '<span class="breadcrumb-separator"> / </span>';
      }
    }
    
    html += '</nav>';
    return html;
  }
};

// ============================================================
// 📊 COMPOSANTS FINANCE RÉUTILISABLES
// ============================================================

const FinanceComponents = {
  /**
   * Carte de statistique avec monnaie formatée
   */
  statCard(icon, label, amount, type = 'normal', actions = []) {
    const formatted = CurrencyManager.formatAmount(amount);
    const backgroundColor = {
      'normal': '#f5f7fa',
      'success': 'linear-gradient(135deg, #10b981, #059669)',
      'danger': 'linear-gradient(135deg, #ef4444, #dc2626)',
      'warning': 'linear-gradient(135deg, #f59e0b, #d97706)',
      'info': 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
    }[type] || '#f5f7fa';

    const textColor = ['success', 'danger', 'warning', 'info'].includes(type) ? '#fff' : '#1a1a2e';

    let actionsHTML = '';
    if (actions.length > 0) {
      actionsHTML = `
        <div class="stat-actions" style="margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap;">
          ${actions.map(a => `<button class="btn btn-sm" onclick="${a.onclick}" style="background: rgba(255,255,255,0.2); border: none; color: ${textColor}; cursor: pointer; border-radius: 6px; padding: 6px 12px; font-size: 0.8rem;">${a.label}</button>`).join('')}
        </div>
      `;
    }

    return `
      <div class="card stat-card" style="background: ${backgroundColor}; color: ${textColor}; padding: 20px; border-radius: 12px; border: none;">
        <div style="font-size: 2.5rem; margin-bottom: 10px;">${icon}</div>
        <div style="font-size: 1.2rem; font-weight: 600; margin-bottom: 5px;">${formatted}</div>
        <div style="font-size: 0.9rem; opacity: 0.9;">${label}</div>
        ${actionsHTML}
      </div>
    `;
  },

  /**
   * Tableau de transactions
   */
  transactionTable(transactions) {
    if (!transactions || transactions.length === 0) {
      return '<div class="card"><div class="text-center p-4"><p style="color: var(--text-secondary);">Aucune transaction</p></div></div>';
    }

    let html = `
      <div class="card">
        <div class="table-responsive">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 2px solid var(--border);">
                <th style="padding: 12px; text-align: left; color: var(--text-secondary); font-weight: 600;">Date</th>
                <th style="padding: 12px; text-align: left; color: var(--text-secondary); font-weight: 600;">Description</th>
                <th style="padding: 12px; text-align: left; color: var(--text-secondary); font-weight: 600;">Montant</th>
                <th style="padding: 12px; text-align: left; color: var(--text-secondary); font-weight: 600;">Statut</th>
                <th style="padding: 12px; text-align: left; color: var(--text-secondary); font-weight: 600;">Actions</th>
              </tr>
            </thead>
            <tbody>
    `;

    for (let tx of transactions) {
      const date = new Date(tx.date || tx.createdAt).toLocaleDateString('fr-FR');
      const amount = CurrencyManager.formatAmount(tx.amount);
      const amountColor = tx.type === 'income' || tx.type === 'subscription' ? '#10b981' : 
                         tx.type === 'expense' || tx.type === 'withdrawal' ? '#ef4444' : '#3b82f6';
      
      const statusBadge = {
        'completed': { bg: '#d1fae5', text: '#065f46', label: '✓ Complété' },
        'pending': { bg: '#fef3c7', text: '#92400e', label: '⏳ En attente' },
        'failed': { bg: '#fee2e2', text: '#991b1b', label: '✗ Échoué' },
        'processing': { bg: '#dbeafe', text: '#1e40af', label: '⚙️ En cours' }
      }[tx.status] || { bg: '#f3f4f6', text: '#374151', label: tx.status };

      html += `
        <tr style="border-bottom: 1px solid var(--border); hover: background: var(--bg-hover);">
          <td style="padding: 12px;">${date}</td>
          <td style="padding: 12px;">${tx.description || tx.type}</td>
          <td style="padding: 12px; color: ${amountColor}; font-weight: 600;">${amount}</td>
          <td style="padding: 12px;">
            <span style="background: ${statusBadge.bg}; color: ${statusBadge.text}; padding: 4px 8px; border-radius: 6px; font-size: 0.85rem; font-weight: 500;">
              ${statusBadge.label}
            </span>
          </td>
          <td style="padding: 12px;">
            <a href="#" style="color: var(--primary); text-decoration: none; cursor: pointer;">Détails →</a>
          </td>
        </tr>
      `;
    }

    html += `
            </tbody>
          </table>
        </div>
      </div>
    `;

    return html;
  },

  /**
   * Boutons de navigation
   */
  navButtons(backLabel = '← Retour', homeLabel = '🏠 Accueil') {
    return `
      <div class="nav-buttons" style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;">
        <button class="btn btn-outline" onclick="NavigationManager.back()" style="background: rgba(108, 99, 255, 0.1); border: 2px solid var(--primary); color: var(--primary); cursor: pointer;">
          ${backLabel}
        </button>
        <button class="btn btn-outline" onclick="NavigationManager.home()" style="background: rgba(108, 99, 255, 0.1); border: 2px solid var(--primary); color: var(--primary); cursor: pointer;">
          ${homeLabel}
        </button>
      </div>
    `;
  }
};

// ============================================================
// 📱 INTERFACE DE PAIEMENT AMÉLIORÉE
// ============================================================

const PaymentUI = {
  /**
   * Formulaire de paiement avec validations
   */
  paymentForm(config = {}) {
    const {
      title = '💳 Paiement',
      minAmount = 1000,
      maxAmount = 10000000,
      onSubmit = 'submitPayment()',
      methods = ['orange_money', 'mtn_money', 'card']
    } = config;

    const methodOptions = {
      'orange_money': { label: 'Orange Money', icon: '🟠', fee: '1%' },
      'mtn_money': { label: 'MTN Mobile Money', icon: '🟡', fee: '1%' },
      'card': { label: 'Carte Bancaire', icon: '💳', fee: '2.5%' }
    };

    let methodsHTML = methods.map(method => {
      const m = methodOptions[method];
      return `
        <label class="payment-method-option" style="display: flex; align-items: center; padding: 12px; border: 2px solid var(--border); border-radius: 10px; margin-bottom: 10px; cursor: pointer; transition: all 0.3s;">
          <input type="radio" name="paymentMethod" value="${method}" style="margin-right: 10px;" />
          <span style="font-size: 1.5rem; margin-right: 10px;">${m.icon}</span>
          <div style="flex: 1;">
            <div style="font-weight: 600;">${m.label}</div>
            <div style="font-size: 0.85rem; color: var(--text-secondary);">Frais: ${m.fee}</div>
          </div>
        </label>
      `;
    }).join('');

    return `
      <div class="card" style="padding: 20px;">
        <h3 style="margin-bottom: 20px;">${title}</h3>
        <form onsubmit="event.preventDefault(); ${onSubmit}" style="display: flex; flex-direction: column; gap: 15px;">
          
          <!-- Montant -->
          <div class="form-group">
            <label style="display: block; margin-bottom: 8px; font-weight: 500;">Montant (${CurrencyManager.DEFAULT_CURRENCY})</label>
            <div style="display: flex; gap: 10px;">
              <input type="number" name="amount" id="paymentAmount" min="${minAmount}" max="${maxAmount}" placeholder="${CurrencyManager.formatAmount(minAmount)}" 
                     class="form-input" style="flex: 1;" required />
              <div style="display: flex; align-items: center; padding: 10px 15px; background: var(--bg-hover); border-radius: 8px; color: var(--text-secondary); font-weight: 600;">
                ${CurrencyManager.DEFAULT_CURRENCY}
              </div>
            </div>
            <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 5px;">
              Min: ${CurrencyManager.formatAmount(minAmount)} | Max: ${CurrencyManager.formatAmount(maxAmount)}
            </div>
          </div>

          <!-- Méthode de paiement -->
          <div class="form-group">
            <label style="display: block; margin-bottom: 8px; font-weight: 500;">Méthode de paiement</label>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${methodsHTML}
            </div>
          </div>

          <!-- Description (optionnel) -->
          <div class="form-group">
            <label style="display: block; margin-bottom: 8px; font-weight: 500;">Description (optionnel)</label>
            <textarea name="description" class="form-input" style="resize: vertical; min-height: 80px;" placeholder="Raison du paiement..."></textarea>
          </div>

          <!-- Résumé -->
          <div style="background: var(--bg-hover); padding: 12px; border-radius: 8px; border-left: 4px solid var(--primary);">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: var(--text-secondary);">
              <span>Montant:</span>
              <span id="paymentSummaryAmount">0 ${CurrencyManager.DEFAULT_CURRENCY}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: var(--text-secondary);">
              <span>Frais:</span>
              <span id="paymentSummaryFee">0 ${CurrencyManager.DEFAULT_CURRENCY}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: 600; border-top: 1px solid var(--border); padding-top: 8px;">
              <span>Total:</span>
              <span id="paymentSummaryTotal">0 ${CurrencyManager.DEFAULT_CURRENCY}</span>
            </div>
          </div>

          <!-- Boutons -->
          <div style="display: flex; gap: 10px; margin-top: 15px;">
            <button type="submit" class="btn btn-primary" style="flex: 1;">💳 Payer maintenant</button>
            <button type="button" class="btn btn-outline" onclick="NavigationManager.back();">Annuler</button>
          </div>
        </form>
      </div>
    `;
  }
};

// ============================================================
// 📋 STYLES CSS POUR NAVIGATION
// ============================================================

const FinanceStyles = `
  .breadcrumb-nav {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
    color: var(--text-secondary);
    flex-wrap: wrap;
  }

  .breadcrumb-item {
    cursor: pointer;
    color: var(--primary);
    text-decoration: none;
    transition: all 0.2s;
    padding: 4px 8px;
    border-radius: 4px;
  }

  .breadcrumb-item:hover {
    background: rgba(108, 99, 255, 0.1);
    color: var(--primary-dark);
  }

  .breadcrumb-item.active {
    color: var(--text);
    cursor: default;
    font-weight: 500;
  }

  .breadcrumb-separator {
    color: var(--border);
  }

  .stat-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: var(--shadow);
    cursor: default;
  }

  .stat-card:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-lg);
  }

  .payment-method-option:has(input:checked) {
    border-color: var(--primary);
    background: rgba(108, 99, 255, 0.05);
  }

  .table-responsive {
    overflow-x: auto;
  }

  @media (max-width: 768px) {
    .breadcrumb-nav {
      font-size: 0.8rem;
    }

    .stat-card {
      min-height: 120px;
    }

    .payment-method-option {
      padding: 10px;
    }
  }
`;

// Injecter les styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = FinanceStyles;
  document.head.appendChild(style);
}

// Exporter les objets globalement
window.CurrencyManager = CurrencyManager;
window.NavigationManager = NavigationManager;
window.FinanceComponents = FinanceComponents;
window.PaymentUI = PaymentUI;
