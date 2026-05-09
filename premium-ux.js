// ============================================================
// 🔒 PREMIUM UX - Interface utilisateur pour contenus verrouillés
// Affichage Premium avec messages de déblocage
// ============================================================

// ============================================================
// 🎨 COMPOSANTS UI POUR CONTENU VERROUILLÉ
// ============================================================
const PremiumUX = {
  /**
   * Générer le badge de niveau d'accès
   */
  getAccessBadge(accessLevel) {
    const badges = {
      free: {
        html: '<span class="access-badge access-free">🆓 Gratuit</span>',
        class: 'access-free'
      },
      standard: {
        html: '<span class="access-badge access-standard">⭐ Standard</span>',
        class: 'access-standard'
      },
      premium: {
        html: '<span class="access-badge access-premium">👑 Premium</span>',
        class: 'access-premium'
      }
    };
    return badges[accessLevel] || badges.free;
  },

  /**
   * Générer la carte de cours verrouillé
   */
  getLockedContentCard(content) {
    const badge = this.getAccessBadge(content.access_level);
    
    return `
      <div class="content-card content-locked" data-content-id="${content.id}">
        <div class="locked-overlay">
          <div class="lock-icon">🔒</div>
          <p class="lock-message">${content.lockMessage || this.getDefaultLockMessage(content.access_level)}</p>
          <button class="btn btn-premium btn-unlock" onclick="PremiumUX.showUpgradeModal('${content.access_level}')">
            ${content.access_level === 'premium' ? '👑 Passer à Premium' : '⭐ Passer à Standard'}
          </button>
        </div>
        <div class="content-preview">
          <div class="content-header">
            ${badge.html}
            <h3 class="content-title">${content.name}</h3>
          </div>
          ${content.summary ? `<p class="content-summary">${content.summary}</p>` : ''}
          ${content.duration ? `<span class="content-duration">⏱️ ${content.duration} min</span>` : ''}
        </div>
      </div>
    `;
  },

  /**
   * Générer la carte de cours accessible
   */
  getUnlockedContentCard(content) {
    const badge = this.getAccessBadge(content.access_level);
    
    return `
      <div class="content-card content-unlocked" data-content-id="${content.id}">
        <div class="content-header">
          ${badge.html}
          <h3 class="content-title">${content.name}</h3>
        </div>
        ${content.description ? `<p class="content-description">${content.description}</p>` : ''}
        <div class="content-meta">
          ${content.duration ? `<span class="content-duration">⏱️ ${content.duration} min</span>` : ''}
          ${content.completions ? `<span class="content-completions">✅ ${content.completions} complétions</span>` : ''}
        </div>
        <button class="btn btn-primary btn-start" onclick="ContentViewer.openContent('${content.id}')">
          📖 Commencer
        </button>
      </div>
    `;
  },

  /**
   * Afficher une liste de contenus avec filtrage d'abonnement
   */
  renderContentList(contents, containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const html = contents.map(content => {
      if (content.locked) {
        return this.getLockedContentCard(content);
      }
      return this.getUnlockedContentCard(content);
    }).join('');

    container.innerHTML = html;
  },

  /**
   * Message de verrouillage par défaut
   */
  getDefaultLockMessage(accessLevel) {
    const messages = {
      standard: '🔒 Passez à Standard pour débloquer ce contenu',
      premium: '👑 Contenu exclusif Premium - Passez à Premium pour accéder'
    };
    return messages[accessLevel] || '🔒 Contenu verrouillé';
  },

  /**
   * Afficher la modal de mise à niveau
   */
  showUpgradeModal(requiredLevel) {
    const plans = {
      standard: {
        name: 'Standard',
        icon: '⭐',
        price: '5 000 GNF/mois',
        features: [
          'Tous les cours standard',
          'Exercices avancés',
          'Zéro publicité',
          'Vies illimitées',
          'Mode révision'
        ],
        color: '#3b82f6'
      },
      premium: {
        name: 'Premium',
        icon: '👑',
        price: '15 000 GNF/mois',
        features: [
          'TOUS les cours (Standard + Premium)',
          'Préparation intensive BAC',
          'Sessions live avec profs',
          'Certificats vérifiés',
          'Support prioritaire 24/7',
          'Mode hors ligne complet',
          'Analyse IA personnalisée'
        ],
        color: '#fbbf24'
      }
    };

    const plan = plans[requiredLevel] || plans.standard;
    
    const modalHtml = `
      <div class="upgrade-modal">
        <div class="upgrade-header" style="background: linear-gradient(135deg, ${plan.color}, ${plan.color}dd);">
          <span class="upgrade-icon">${plan.icon}</span>
          <h2>Passez à ${plan.name}</h2>
          <p class="upgrade-price">${plan.price}</p>
        </div>
        
        <div class="upgrade-body">
          <h3>Ce que vous obtenez :</h3>
          <ul class="upgrade-features">
            ${plan.features.map(f => `<li>✓ ${f}</li>`).join('')}
          </ul>
          
          <div class="upgrade-cta">
            <button class="btn btn-premium btn-lg" onclick="Subscription.upgrade('${requiredLevel.toUpperCase()}')">
              ${plan.icon} Passer à ${plan.name}
            </button>
            <button class="btn btn-outline" onclick="closeModal()">
              Plus tard
            </button>
          </div>
          
          <p class="upgrade-note">
            💡 Annulez à tout moment. Satisfait ou remboursé sous 7 jours.
          </p>
        </div>
        
        ${requiredLevel === 'standard' ? `
          <div class="upgrade-compare">
            <a href="#" onclick="PremiumUX.showUpgradeModal('premium'); return false;">
              Ou passez directement à Premium 👑
            </a>
          </div>
        ` : ''}
      </div>
    `;

    openModal(modalHtml);
  },

  /**
   * Afficher le comparatif des plans
   */
  showPlansComparison() {
    const modalHtml = `
      <div class="plans-comparison">
        <h2 class="text-center">Choisissez votre plan</h2>
        
        <div class="plans-grid">
          <!-- Plan FREE -->
          <div class="plan-card plan-free">
            <div class="plan-header">
              <span class="plan-icon">🆓</span>
              <h3>Gratuit</h3>
              <p class="plan-price">0 GNF</p>
            </div>
            <ul class="plan-features">
              <li>✓ Cours gratuits</li>
              <li>✓ Exercices de base</li>
              <li>✓ 5 vies maximum</li>
              <li class="disabled">✗ Cours standard</li>
              <li class="disabled">✗ Cours premium</li>
              <li class="disabled">✗ Mode hors ligne</li>
            </ul>
            <button class="btn btn-outline" disabled>Plan actuel</button>
          </div>
          
          <!-- Plan STANDARD -->
          <div class="plan-card plan-standard">
            <div class="plan-header">
              <span class="plan-icon">⭐</span>
              <h3>Standard</h3>
              <p class="plan-price">5 000 GNF<span>/mois</span></p>
            </div>
            <ul class="plan-features">
              <li>✓ Tout de Gratuit</li>
              <li>✓ Cours standard</li>
              <li>✓ Exercices avancés</li>
              <li>✓ Vies illimitées</li>
              <li>✓ Moins de pubs</li>
              <li class="disabled">✗ Cours premium</li>
            </ul>
            <button class="btn btn-primary" onclick="Subscription.upgrade('STANDARD')">
              Choisir Standard
            </button>
          </div>
          
          <!-- Plan PREMIUM -->
          <div class="plan-card plan-premium popular">
            <div class="popular-badge">🔥 Populaire</div>
            <div class="plan-header">
              <span class="plan-icon">👑</span>
              <h3>Premium</h3>
              <p class="plan-price">15 000 GNF<span>/mois</span></p>
            </div>
            <ul class="plan-features">
              <li>✓ TOUT inclus</li>
              <li>✓ Cours premium exclusifs</li>
              <li>✓ Préparation BAC</li>
              <li>✓ Sessions live</li>
              <li>✓ Certificats vérifiés</li>
              <li>✓ Support prioritaire</li>
            </ul>
            <button class="btn btn-premium" onclick="Subscription.upgrade('PREMIUM')">
              Choisir Premium 👑
            </button>
          </div>
        </div>
        
        <div class="plans-footer">
          <p>💰 Économisez 25% avec l'abonnement annuel</p>
          <button class="btn btn-link" onclick="PremiumUX.showAnnualPlans()">
            Voir les offres annuelles →
          </button>
        </div>
      </div>
    `;

    openModal(modalHtml);
  },

  /**
   * Afficher les offres annuelles
   */
  showAnnualPlans() {
    const modalHtml = `
      <div class="annual-plans">
        <h2 class="text-center">🎉 Offres Annuelles</h2>
        <p class="text-center text-secondary">Économisez jusqu'à 33% avec nos abonnements annuels</p>
        
        <div class="annual-grid">
          <div class="annual-card">
            <div class="annual-badge">-25%</div>
            <h3>⭐ Standard Annuel</h3>
            <p class="annual-price">
              <span class="old-price">60 000 GNF</span>
              <span class="new-price">45 000 GNF</span>
              <span class="per">/an</span>
            </p>
            <button class="btn btn-primary" onclick="Subscription.upgrade('STANDARD', 'yearly')">
              Souscrire à Standard Annuel
            </button>
          </div>
          
          <div class="annual-card premium">
            <div class="annual-badge">-33%</div>
            <h3>👑 Premium Annuel</h3>
            <p class="annual-price">
              <span class="old-price">180 000 GNF</span>
              <span class="new-price">120 000 GNF</span>
              <span class="per">/an</span>
            </p>
            <button class="btn btn-premium" onclick="Subscription.upgrade('PREMIUM', 'yearly')">
              Souscrire à Premium Annuel 👑
            </button>
          </div>
        </div>
        
        <button class="btn btn-link" onclick="PremiumUX.showPlansComparison()">
          ← Retour aux offres mensuelles
        </button>
      </div>
    `;

    openModal(modalHtml);
  },

  /**
   * Afficher la bannière d'abonnement actuel
   */
  renderSubscriptionBanner(subscription, containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const bannerData = {
      FREE: {
        icon: '🆓',
        title: 'Plan Gratuit',
        message: 'Passez à Premium pour débloquer tous les cours',
        cta: 'Voir les plans',
        color: '#6b7280'
      },
      STANDARD: {
        icon: '⭐',
        title: 'Plan Standard',
        message: 'Passez à Premium pour les cours exclusifs et le BAC',
        cta: 'Passer à Premium',
        color: '#3b82f6'
      },
      PREMIUM: {
        icon: '👑',
        title: 'Plan Premium',
        message: 'Vous avez accès à tous les contenus !',
        cta: null,
        color: '#fbbf24'
      }
    };

    const data = bannerData[subscription] || bannerData.FREE;

    container.innerHTML = `
      <div class="subscription-banner" style="border-left: 4px solid ${data.color}">
        <span class="banner-icon">${data.icon}</span>
        <div class="banner-content">
          <h4>${data.title}</h4>
          <p>${data.message}</p>
        </div>
        ${data.cta ? `
          <button class="btn btn-sm btn-premium" onclick="PremiumUX.showPlansComparison()">
            ${data.cta}
          </button>
        ` : ''}
      </div>
    `;
  },

  /**
   * Vérifier l'accès et afficher le contenu ou le verrouillage
   */
  checkAndRenderContent(content, userSubscription, containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const accessLevels = {
      FREE: ['free'],
      STANDARD: ['free', 'standard'],
      PREMIUM: ['free', 'standard', 'premium']
    };

    const allowedLevels = accessLevels[userSubscription] || accessLevels.FREE;
    const canAccess = allowedLevels.includes(content.access_level);

    if (canAccess) {
      // Afficher le contenu complet
      container.innerHTML = `
        <div class="content-full">
          <div class="content-header">
            ${this.getAccessBadge(content.access_level).html}
            <h1>${content.name}</h1>
          </div>
          <div class="content-body">
            ${content.content}
          </div>
          ${content.videoUrl ? `
            <div class="content-video">
              <iframe src="${content.videoUrl}" allowfullscreen></iframe>
            </div>
          ` : ''}
        </div>
      `;
    } else {
      // Afficher le preview verrouillé
      container.innerHTML = `
        <div class="content-locked-full">
          <div class="locked-header">
            ${this.getAccessBadge(content.access_level).html}
            <h1>${content.name}</h1>
          </div>
          
          <div class="locked-preview">
            ${content.summary || 'Ce contenu est réservé aux abonnés ' + content.access_level}
          </div>
          
          <div class="locked-overlay-full">
            <div class="lock-icon-large">🔒</div>
            <h2>${this.getDefaultLockMessage(content.access_level)}</h2>
            <p>Débloquez ce contenu et tous les autres en passant au plan supérieur.</p>
            <button class="btn btn-premium btn-lg" onclick="PremiumUX.showUpgradeModal('${content.access_level}')">
              ${content.access_level === 'premium' ? '👑 Passer à Premium' : '⭐ Passer à Standard'}
            </button>
          </div>
        </div>
      `;
    }
  }
};

// ============================================================
// 💳 GESTION DES ABONNEMENTS CÔTÉ CLIENT
// ============================================================
const Subscription = {
  /**
   * Mettre à niveau l'abonnement
   */
  async upgrade(planId, duration = 'monthly') {
    try {
      showToast('🔄 Redirection vers le paiement...', 'info');
      
      // Simuler la redirection vers paiement
      // En production, intégrer Orange Money, Wave, MTN MoMo, etc.
      const paymentData = {
        plan: planId,
        duration: duration,
        redirectUrl: window.location.href
      };
      
      // Appel API pour initialiser le paiement
      const response = await fetch('/api/subscription/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAuthToken()}`
        },
        body: JSON.stringify(paymentData)
      });

      const result = await response.json();
      
      if (result.success && result.paymentUrl) {
        // Rediriger vers la page de paiement
        window.location.href = result.paymentUrl;
      } else {
        showToast('❌ Erreur lors de l\'initialisation du paiement', 'error');
      }
    } catch (error) {
      console.error('Erreur upgrade:', error);
      showToast('❌ Une erreur est survenue', 'error');
    }
  },

  /**
   * Vérifier le statut de l'abonnement
   */
  async checkStatus() {
    try {
      const response = await fetch('/api/subscription/status', {
        headers: {
          'Authorization': `Bearer ${await getAuthToken()}`
        }
      });

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Erreur checkStatus:', error);
      return { plan: 'FREE' };
    }
  },

  /**
   * Annuler l'abonnement
   */
  async cancel() {
    if (!confirm('Êtes-vous sûr de vouloir annuler votre abonnement ? Vous conserverez l\'accès jusqu\'à la fin de la période.')) {
      return;
    }

    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await getAuthToken()}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        showToast('✓ Abonnement annulé', 'success');
      } else {
        showToast('❌ Erreur lors de l\'annulation', 'error');
      }
    } catch (error) {
      showToast('❌ Une erreur est survenue', 'error');
    }
  }
};

// ============================================================
// 🎨 STYLES CSS POUR LES COMPOSANTS PREMIUM
// ============================================================
const PremiumStyles = `
<style>
/* ============================================================ */
/* 🔒 CONTENU VERROUILLÉ */
/* ============================================================ */
.content-card {
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 20px;
  margin-bottom: 15px;
  border: 1px solid var(--border);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.content-locked {
  position: relative;
}

.content-locked .content-preview {
  filter: blur(3px);
  opacity: 0.6;
  pointer-events: none;
}

.locked-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  padding: 20px;
  text-align: center;
}

.lock-icon {
  font-size: 3rem;
  margin-bottom: 10px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.lock-message {
  color: #fff;
  font-size: 1rem;
  margin-bottom: 15px;
  font-weight: 500;
}

.btn-unlock {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #000;
  font-weight: 700;
  padding: 12px 24px;
  border-radius: 50px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-unlock:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(251, 191, 36, 0.4);
}

/* ============================================================ */
/* 🏷️ BADGES D'ACCÈS */
/* ============================================================ */
.access-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.access-free {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
}

.access-standard {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.access-premium {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.2));
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

/* ============================================================ */
/* 🎫 MODAL DE MISE À NIVEAU */
/* ============================================================ */
.upgrade-modal {
  max-width: 450px;
  margin: 0 auto;
}

.upgrade-header {
  padding: 30px;
  text-align: center;
  border-radius: var(--radius) var(--radius) 0 0;
  color: #000;
}

.upgrade-icon {
  font-size: 4rem;
  display: block;
  margin-bottom: 10px;
}

.upgrade-header h2 {
  margin: 0 0 10px;
  color: #000;
}

.upgrade-price {
  font-size: 1.5rem;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.8);
}

.upgrade-body {
  padding: 25px;
}

.upgrade-features {
  list-style: none;
  padding: 0;
  margin: 0 0 25px;
}

.upgrade-features li {
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
  color: var(--text);
}

.upgrade-features li:last-child {
  border-bottom: none;
}

.upgrade-cta {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn-lg {
  padding: 16px 32px;
  font-size: 1.1rem;
}

.upgrade-note {
  text-align: center;
  margin-top: 15px;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.upgrade-compare {
  text-align: center;
  padding: 15px;
  background: var(--bg-hover);
  border-radius: 0 0 var(--radius) var(--radius);
}

/* ============================================================ */
/* 📊 COMPARATIF DES PLANS */
/* ============================================================ */
.plans-comparison {
  padding: 20px;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 25px;
}

.plan-card {
  background: var(--bg-card);
  border: 2px solid var(--border);
  border-radius: var(--radius);
  padding: 25px;
  text-align: center;
  transition: all 0.3s ease;
}

.plan-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}

.plan-card.popular {
  border-color: #fbbf24;
  position: relative;
}

.popular-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #000;
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
}

.plan-header {
  margin-bottom: 20px;
}

.plan-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 10px;
}

.plan-header h3 {
  margin: 0;
  color: var(--text);
}

.plan-price {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--primary);
  margin-top: 5px;
}

.plan-price span {
  font-size: 0.9rem;
  font-weight: 400;
  color: var(--text-secondary);
}

.plan-features {
  list-style: none;
  padding: 0;
  margin: 0 0 20px;
  text-align: left;
}

.plan-features li {
  padding: 8px 0;
  color: var(--text);
}

.plan-features li.disabled {
  color: var(--text-secondary);
  text-decoration: line-through;
  opacity: 0.6;
}

.btn-premium {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #000;
  font-weight: 700;
}

.btn-premium:hover {
  background: linear-gradient(135deg, #fcd34d, #fbbf24);
  box-shadow: 0 6px 20px rgba(251, 191, 36, 0.4);
}

/* ============================================================ */
/* 📋 BANNIÈRE D'ABONNEMENT */
/* ============================================================ */
.subscription-banner {
  display: flex;
  align-items: center;
  gap: 15px;
  background: var(--bg-card);
  padding: 15px 20px;
  border-radius: var(--radius);
  margin-bottom: 20px;
}

.banner-icon {
  font-size: 2rem;
}

.banner-content {
  flex: 1;
}

.banner-content h4 {
  margin: 0;
  color: var(--text);
}

.banner-content p {
  margin: 5px 0 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

/* ============================================================ */
/* 🔒 CONTENU VERROUILLÉ PLEINE PAGE */
/* ============================================================ */
.content-locked-full {
  position: relative;
}

.locked-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.locked-preview {
  padding: 30px;
  background: var(--bg-hover);
  border-radius: var(--radius);
  text-align: center;
  color: var(--text-secondary);
  margin-bottom: 30px;
}

.locked-overlay-full {
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.95), rgba(10, 10, 18, 0.98));
  padding: 50px;
  border-radius: var(--radius);
  text-align: center;
}

.lock-icon-large {
  font-size: 5rem;
  margin-bottom: 20px;
  animation: pulse 2s infinite;
}

.locked-overlay-full h2 {
  color: #fff;
  margin-bottom: 15px;
}

.locked-overlay-full p {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 25px;
}

/* ============================================================ */
/* 📅 OFFRES ANNUELLES */
/* ============================================================ */
.annual-plans {
  padding: 30px;
}

.annual-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
  margin: 30px 0;
}

.annual-card {
  background: var(--bg-card);
  border: 2px solid var(--border);
  border-radius: var(--radius);
  padding: 30px;
  text-align: center;
  position: relative;
}

.annual-card.premium {
  border-color: #fbbf24;
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.05), rgba(245, 158, 11, 0.05));
}

.annual-badge {
  position: absolute;
  top: -12px;
  right: 20px;
  background: #ef4444;
  color: #fff;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
}

.annual-price {
  margin: 20px 0;
}

.old-price {
  text-decoration: line-through;
  color: var(--text-secondary);
  font-size: 1rem;
  display: block;
}

.new-price {
  font-size: 2rem;
  font-weight: 800;
  color: var(--primary);
}

.per {
  font-size: 0.9rem;
  color: var(--text-secondary);
}
</style>
`;

// ============================================================
// 🚀 INITIALISATION
// ============================================================
const initPremiumUX = () => {
  // Injecter les styles
  document.head.insertAdjacentHTML('beforeend', PremiumStyles);
  
  console.log('✓ Premium UX initialisé');
};

// Auto-init si DOM prêt
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPremiumUX);
} else {
  initPremiumUX();
}

// ============================================================
// 📤 EXPORTS (pour modules ES6)
// ============================================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PremiumUX, Subscription };
}
