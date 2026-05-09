/**
 * ============================================================
 * 🔔 NEOCLASS - Module UI
 * Composants UI: Toast, Modal, Loader, Themes
 * ============================================================
 */

class UIService {
  constructor() {
    this.toastContainer = null;
    this.activeModals = [];
    this.loaderCount = 0;
    this.init();
  }
  
  /**
   * Initialiser le service UI
   */
  init() {
    // Créer le container pour les toasts
    this.createToastContainer();
    
    // Initialiser le thème
    this.initTheme();
    
    // Écouter les changements de thème système
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (Utils?.getStorage('nc_theme') === 'system') {
        this.applyTheme(e.matches ? 'dark' : 'light');
      }
    });
    
    // Fermer les modals avec Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activeModals.length > 0) {
        this.closeModal(this.activeModals[this.activeModals.length - 1]);
      }
    });
  }
  
  // ═══════════════════════════════════════════════════════════
  // TOAST NOTIFICATIONS
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Créer le container des toasts
   */
  createToastContainer() {
    if (!this.toastContainer) {
      this.toastContainer = document.createElement('div');
      this.toastContainer.className = 'toast-container';
      this.toastContainer.setAttribute('aria-live', 'polite');
      document.body.appendChild(this.toastContainer);
    }
  }
  
  /**
   * Afficher un toast
   * @param {string} message
   * @param {string} type - 'success', 'error', 'warning', 'info'
   * @param {number} duration
   */
  toast(message, type = 'info', duration = 4000) {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} animate-slide-up`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
      <span class="toast-icon">${icons[type]}</span>
      <span class="toast-message">${Utils?.escapeHtml?.(message) || message}</span>
      <button class="toast-close" aria-label="Fermer">&times;</button>
    `;
    
    // Bouton fermer
    toast.querySelector('.toast-close').addEventListener('click', () => {
      this.removeToast(toast);
    });
    
    this.toastContainer.appendChild(toast);
    
    // Auto-remove
    if (duration > 0) {
      setTimeout(() => this.removeToast(toast), duration);
    }
    
    return toast;
  }
  
  /**
   * Supprimer un toast
   * @param {Element} toast
   */
  removeToast(toast) {
    if (!toast || !toast.parentNode) return;
    
    toast.classList.remove('animate-slide-up');
    toast.classList.add('animate-slide-down');
    
    setTimeout(() => {
      toast.remove();
    }, 300);
  }
  
  /**
   * Raccourcis pour les types de toast
   */
  success(message, duration) {
    return this.toast(message, 'success', duration);
  }
  
  error(message, duration) {
    return this.toast(message, 'error', duration);
  }
  
  warning(message, duration) {
    return this.toast(message, 'warning', duration);
  }
  
  info(message, duration) {
    return this.toast(message, 'info', duration);
  }
  
  // ═══════════════════════════════════════════════════════════
  // MODAL SYSTEM
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Afficher une modal
   * @param {object} options
   */
  modal(options = {}) {
    const {
      title = '',
      content = '',
      size = 'medium', // small, medium, large, fullscreen
      closable = true,
      className = '',
      buttons = [],
      onClose = null
    } = options;
    
    const modalId = Utils?.uniqueId?.('modal') || `modal_${Date.now()}`;
    
    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = `modal-overlay animate-fade-in ${className}`;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    if (title) modal.setAttribute('aria-labelledby', `${modalId}-title`);
    
    modal.innerHTML = `
      <div class="modal modal-${size} animate-modal-in">
        ${title || closable ? `
          <div class="modal-header">
            ${title ? `<h3 id="${modalId}-title" class="modal-title">${title}</h3>` : ''}
            ${closable ? `<button class="modal-close" aria-label="Fermer">&times;</button>` : ''}
          </div>
        ` : ''}
        <div class="modal-body">
          ${typeof content === 'string' ? content : ''}
        </div>
        ${buttons.length > 0 ? `
          <div class="modal-footer">
            ${buttons.map(btn => `
              <button class="btn ${btn.class || 'btn-secondary'}" data-action="${btn.action || ''}">
                ${btn.label}
              </button>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
    
    // Si content est un élément, l'ajouter
    if (content instanceof Element) {
      modal.querySelector('.modal-body').appendChild(content);
    }
    
    // Gestionnaires d'événements
    if (closable) {
      // Fermer au clic sur l'overlay
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal(modalId);
        }
      });
      
      // Bouton fermer
      const closeBtn = modal.querySelector('.modal-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.closeModal(modalId));
      }
    }
    
    // Boutons d'action
    buttons.forEach(btn => {
      const btnEl = modal.querySelector(`[data-action="${btn.action}"]`);
      if (btnEl && btn.onClick) {
        btnEl.addEventListener('click', () => {
          btn.onClick();
          if (btn.closeOnClick !== false) {
            this.closeModal(modalId);
          }
        });
      }
    });
    
    // Stocker la callback onClose
    modal._onClose = onClose;
    
    document.body.appendChild(modal);
    document.body.classList.add('modal-open');
    this.activeModals.push(modalId);
    
    // Focus le premier élément focusable
    setTimeout(() => {
      const focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable) focusable.focus();
    }, 100);
    
    return modalId;
  }
  
  /**
   * Fermer une modal
   * @param {string} modalId
   */
  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    const modalContent = modal.querySelector('.modal');
    if (modalContent) {
      modalContent.classList.remove('animate-modal-in');
      modalContent.classList.add('animate-modal-out');
    }
    
    modal.classList.remove('animate-fade-in');
    modal.classList.add('animate-fade-out');
    
    setTimeout(() => {
      if (modal._onClose) modal._onClose();
      modal.remove();
      
      this.activeModals = this.activeModals.filter(id => id !== modalId);
      
      if (this.activeModals.length === 0) {
        document.body.classList.remove('modal-open');
      }
    }, 300);
  }
  
  /**
   * Modal de confirmation
   * @param {string} message
   * @param {object} options
   */
  confirm(message, options = {}) {
    const {
      title = 'Confirmation',
      confirmText = 'Confirmer',
      cancelText = 'Annuler',
      confirmClass = 'btn-primary',
      cancelClass = 'btn-secondary',
      danger = false
    } = options;
    
    return new Promise((resolve) => {
      this.modal({
        title,
        content: `<p class="text-center">${message}</p>`,
        size: 'small',
        buttons: [
          {
            label: cancelText,
            class: cancelClass,
            action: 'cancel',
            onClick: () => resolve(false)
          },
          {
            label: confirmText,
            class: danger ? 'btn-danger' : confirmClass,
            action: 'confirm',
            onClick: () => resolve(true)
          }
        ],
        onClose: () => resolve(false)
      });
    });
  }
  
  /**
   * Modal de prompt
   * @param {string} message
   * @param {object} options
   */
  prompt(message, options = {}) {
    const {
      title = '',
      placeholder = '',
      defaultValue = '',
      type = 'text',
      confirmText = 'OK',
      cancelText = 'Annuler'
    } = options;
    
    const inputId = Utils?.uniqueId?.('input') || `input_${Date.now()}`;
    
    return new Promise((resolve) => {
      const modalId = this.modal({
        title,
        content: `
          <p>${message}</p>
          <input type="${type}" id="${inputId}" class="form-input" 
                 placeholder="${placeholder}" value="${defaultValue}">
        `,
        size: 'small',
        buttons: [
          {
            label: cancelText,
            class: 'btn-secondary',
            action: 'cancel',
            onClick: () => resolve(null)
          },
          {
            label: confirmText,
            class: 'btn-primary',
            action: 'confirm',
            onClick: () => {
              const input = document.getElementById(inputId);
              resolve(input?.value || '');
            }
          }
        ],
        onClose: () => resolve(null)
      });
      
      // Focus l'input
      setTimeout(() => {
        const input = document.getElementById(inputId);
        if (input) {
          input.focus();
          input.select();
        }
      }, 150);
    });
  }
  
  /**
   * Modal d'alerte
   * @param {string} message
   * @param {string} title
   */
  alert(message, title = '') {
    return new Promise((resolve) => {
      this.modal({
        title,
        content: `<p class="text-center">${message}</p>`,
        size: 'small',
        buttons: [
          {
            label: 'OK',
            class: 'btn-primary',
            action: 'ok',
            onClick: () => resolve(true)
          }
        ],
        onClose: () => resolve(true)
      });
    });
  }
  
  // ═══════════════════════════════════════════════════════════
  // LOADER
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Afficher le loader global
   * @param {string} message
   */
  showLoader(message = 'Chargement...') {
    this.loaderCount++;
    
    let loader = document.getElementById('nc-global-loader');
    
    if (!loader) {
      loader = document.createElement('div');
      loader.id = 'nc-global-loader';
      loader.className = 'global-loader';
      loader.innerHTML = `
        <div class="loader-content">
          <div class="loader-spinner"></div>
          <p class="loader-message">${message}</p>
        </div>
      `;
      document.body.appendChild(loader);
    } else {
      const msg = loader.querySelector('.loader-message');
      if (msg) msg.textContent = message;
    }
    
    loader.classList.add('active');
    document.body.classList.add('loading');
  }
  
  /**
   * Cacher le loader global
   */
  hideLoader() {
    this.loaderCount = Math.max(0, this.loaderCount - 1);
    
    if (this.loaderCount === 0) {
      const loader = document.getElementById('nc-global-loader');
      if (loader) {
        loader.classList.remove('active');
        document.body.classList.remove('loading');
      }
    }
  }
  
  /**
   * Loader sur un élément spécifique
   * @param {Element|string} element
   * @param {boolean} show
   */
  setLoading(element, show = true) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return;
    
    if (show) {
      el.classList.add('is-loading');
      el.setAttribute('aria-busy', 'true');
      
      // Ajouter le skeleton si c'est un conteneur
      if (el.children.length === 0) {
        el.innerHTML = '<div class="skeleton skeleton-text"></div>'.repeat(3);
      }
    } else {
      el.classList.remove('is-loading');
      el.removeAttribute('aria-busy');
    }
  }
  
  // ═══════════════════════════════════════════════════════════
  // THEME SYSTEM
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Initialiser le thème
   */
  initTheme() {
    const savedTheme = Utils?.getStorage?.('nc_theme') || 'light';
    
    if (savedTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      this.applyTheme(systemTheme);
    } else {
      this.applyTheme(savedTheme);
    }
  }
  
  /**
   * Appliquer un thème
   * @param {string} theme - 'light', 'dark'
   */
  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    
    // Mettre à jour le meta theme-color
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.content = theme === 'dark' ? '#1a1a2e' : '#ffffff';
    }
  }
  
  /**
   * Changer le thème
   * @param {string} theme - 'light', 'dark', 'system'
   */
  setTheme(theme) {
    Utils?.setStorage?.('nc_theme', theme);
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      this.applyTheme(systemTheme);
    } else {
      this.applyTheme(theme);
    }
    
    // Mettre à jour le Store si disponible
    if (window.store) {
      window.store.set('theme', theme);
    }
    
    // Émettre un événement
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
  }
  
  /**
   * Basculer entre light et dark
   */
  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    this.setTheme(current === 'dark' ? 'light' : 'dark');
  }
  
  /**
   * Obtenir le thème actuel
   */
  getCurrentTheme() {
    return document.documentElement.getAttribute('data-theme') || 'light';
  }
  
  // ═══════════════════════════════════════════════════════════
  // TOOLTIPS
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Initialiser les tooltips
   * @param {string} selector
   */
  initTooltips(selector = '[data-tooltip]') {
    const elements = document.querySelectorAll(selector);
    
    elements.forEach(el => {
      el.addEventListener('mouseenter', (e) => this.showTooltip(e.target));
      el.addEventListener('mouseleave', () => this.hideTooltip());
      el.addEventListener('focus', (e) => this.showTooltip(e.target));
      el.addEventListener('blur', () => this.hideTooltip());
    });
  }
  
  /**
   * Afficher un tooltip
   * @param {Element} element
   */
  showTooltip(element) {
    const text = element.getAttribute('data-tooltip');
    if (!text) return;
    
    // Supprimer tout tooltip existant
    this.hideTooltip();
    
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip animate-fade-in';
    tooltip.textContent = text;
    tooltip.id = 'nc-tooltip';
    
    document.body.appendChild(tooltip);
    
    // Positionner
    const rect = element.getBoundingClientRect();
    const tipRect = tooltip.getBoundingClientRect();
    
    let top = rect.top - tipRect.height - 8;
    let left = rect.left + (rect.width - tipRect.width) / 2;
    
    // Ajuster si déborde
    if (top < 0) top = rect.bottom + 8;
    if (left < 0) left = 8;
    if (left + tipRect.width > window.innerWidth) {
      left = window.innerWidth - tipRect.width - 8;
    }
    
    tooltip.style.top = `${top + window.scrollY}px`;
    tooltip.style.left = `${left}px`;
  }
  
  /**
   * Cacher les tooltips
   */
  hideTooltip() {
    const tooltip = document.getElementById('nc-tooltip');
    if (tooltip) tooltip.remove();
  }
  
  // ═══════════════════════════════════════════════════════════
  // DROPDOWN
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Initialiser les dropdowns
   */
  initDropdowns() {
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-dropdown-toggle]');
      
      if (trigger) {
        e.preventDefault();
        const targetId = trigger.getAttribute('data-dropdown-toggle');
        const dropdown = document.getElementById(targetId);
        
        if (dropdown) {
          const isOpen = dropdown.classList.contains('active');
          
          // Fermer tous les autres
          document.querySelectorAll('.dropdown-menu.active').forEach(d => {
            if (d !== dropdown) d.classList.remove('active');
          });
          
          dropdown.classList.toggle('active', !isOpen);
        }
      } else {
        // Clic en dehors, fermer tous les dropdowns
        document.querySelectorAll('.dropdown-menu.active').forEach(d => {
          d.classList.remove('active');
        });
      }
    });
  }
  
  // ═══════════════════════════════════════════════════════════
  // TABS
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Initialiser les tabs
   */
  initTabs() {
    document.addEventListener('click', (e) => {
      const tab = e.target.closest('[data-tab]');
      if (!tab) return;
      
      e.preventDefault();
      
      const tabGroup = tab.closest('.tabs');
      const targetId = tab.getAttribute('data-tab');
      const targetPanel = document.getElementById(targetId);
      
      if (!tabGroup || !targetPanel) return;
      
      // Désactiver tous les tabs et panels
      tabGroup.querySelectorAll('[data-tab]').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      
      tabGroup.closest('.tab-container')?.querySelectorAll('.tab-panel').forEach(p => {
        p.classList.remove('active');
        p.hidden = true;
      });
      
      // Activer le tab et panel sélectionnés
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      targetPanel.classList.add('active');
      targetPanel.hidden = false;
    });
  }
  
  // ═══════════════════════════════════════════════════════════
  // ACCORDION
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Initialiser les accordions
   */
  initAccordions() {
    document.addEventListener('click', (e) => {
      const header = e.target.closest('.accordion-header');
      if (!header) return;
      
      const item = header.closest('.accordion-item');
      const content = item?.querySelector('.accordion-content');
      const accordion = item?.closest('.accordion');
      
      if (!item || !content) return;
      
      const isOpen = item.classList.contains('active');
      
      // Si accordion singl, fermer les autres
      if (accordion && !accordion.classList.contains('accordion-multi')) {
        accordion.querySelectorAll('.accordion-item.active').forEach(i => {
          if (i !== item) {
            i.classList.remove('active');
            i.querySelector('.accordion-content').style.maxHeight = null;
          }
        });
      }
      
      // Toggle
      item.classList.toggle('active', !isOpen);
      
      if (!isOpen) {
        content.style.maxHeight = content.scrollHeight + 'px';
      } else {
        content.style.maxHeight = null;
      }
    });
  }
  
  // ═══════════════════════════════════════════════════════════
  // SCROLL UTILITIES
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Scroll vers un élément
   * @param {Element|string} target
   * @param {object} options
   */
  scrollTo(target, options = {}) {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;
    
    const { offset = 0, behavior = 'smooth' } = options;
    
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    
    window.scrollTo({
      top,
      behavior
    });
  }
  
  /**
   * Scroll vers le haut
   */
  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
  
  /**
   * Initialiser le bouton scroll-to-top
   */
  initScrollToTop() {
    const btn = document.querySelector('.scroll-to-top');
    if (!btn) return;
    
    window.addEventListener('scroll', Utils?.throttle?.(() => {
      btn.classList.toggle('visible', window.scrollY > 300);
    }, 100) || (() => {}));
    
    btn.addEventListener('click', () => this.scrollToTop());
  }
}

// ─── Instance globale ───
window.UI = new UIService();

// ─── Raccourcis ───
window.toast = (msg, type, duration) => window.UI.toast(msg, type, duration);
window.confirm = (msg, opts) => window.UI.confirm(msg, opts);

if (typeof module !== 'undefined' && module.exports) {
  module.exports = UIService;
}
