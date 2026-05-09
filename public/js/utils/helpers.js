/**
 * ============================================================
 * 🧰 NEOCLASS - Utilitaires
 * Fonctions helpers communes
 * ============================================================
 */

const Utils = {
  // ═══════════════════════════════════════════════════════════
  // DOM MANIPULATION
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Sélecteur raccourci
   * @param {string} selector
   * @param {Element} parent
   */
  $(selector, parent = document) {
    return parent.querySelector(selector);
  },
  
  /**
   * Sélecteur multiple
   * @param {string} selector
   * @param {Element} parent
   */
  $$(selector, parent = document) {
    return Array.from(parent.querySelectorAll(selector));
  },
  
  /**
   * Créer un élément avec attributs
   * @param {string} tag
   * @param {object} attrs
   * @param {string|Element|Element[]} children
   */
  createElement(tag, attrs = {}, children = null) {
    const el = document.createElement(tag);
    
    for (const [key, value] of Object.entries(attrs)) {
      if (key === 'class' || key === 'className') {
        el.className = value;
      } else if (key === 'style' && typeof value === 'object') {
        Object.assign(el.style, value);
      } else if (key.startsWith('on') && typeof value === 'function') {
        el.addEventListener(key.slice(2).toLowerCase(), value);
      } else if (key === 'dataset' && typeof value === 'object') {
        Object.assign(el.dataset, value);
      } else {
        el.setAttribute(key, value);
      }
    }
    
    if (children) {
      if (typeof children === 'string') {
        el.innerHTML = children;
      } else if (children instanceof Element) {
        el.appendChild(children);
      } else if (Array.isArray(children)) {
        children.forEach(child => {
          if (typeof child === 'string') {
            el.appendChild(document.createTextNode(child));
          } else if (child instanceof Element) {
            el.appendChild(child);
          }
        });
      }
    }
    
    return el;
  },
  
  /**
   * Afficher un élément
   * @param {Element|string} el
   */
  show(el) {
    const element = typeof el === 'string' ? this.$(el) : el;
    if (element) {
      element.style.display = '';
      element.classList.remove('hidden');
    }
  },
  
  /**
   * Cacher un élément
   * @param {Element|string} el
   */
  hide(el) {
    const element = typeof el === 'string' ? this.$(el) : el;
    if (element) {
      element.style.display = 'none';
      element.classList.add('hidden');
    }
  },
  
  /**
   * Toggle un élément
   * @param {Element|string} el
   */
  toggle(el) {
    const element = typeof el === 'string' ? this.$(el) : el;
    if (element) {
      if (element.style.display === 'none' || element.classList.contains('hidden')) {
        this.show(element);
      } else {
        this.hide(element);
      }
    }
  },
  
  // ═══════════════════════════════════════════════════════════
  // STRING UTILITIES
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Échapper le HTML
   * @param {string} str
   */
  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  },
  
  /**
   * Capitaliser la première lettre
   * @param {string} str
   */
  capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },
  
  /**
   * Tronquer un texte
   * @param {string} str
   * @param {number} length
   * @param {string} suffix
   */
  truncate(str, length = 100, suffix = '...') {
    if (!str || str.length <= length) return str;
    return str.slice(0, length).trim() + suffix;
  },
  
  /**
   * Slugifier une chaîne
   * @param {string} str
   */
  slugify(str) {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  },
  
  /**
   * Générer un ID unique
   * @param {string} prefix
   */
  uniqueId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },
  
  // ═══════════════════════════════════════════════════════════
  // NUMBER UTILITIES
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Formater un nombre avec séparateurs
   * @param {number} num
   * @param {string} locale
   */
  formatNumber(num, locale = 'fr-FR') {
    return new Intl.NumberFormat(locale).format(num);
  },
  
  /**
   * Formater en devise
   * @param {number} amount
   * @param {string} currency
   * @param {string} locale
   */
  formatCurrency(amount, currency = 'GNF', locale = 'fr-GN') {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0
    }).format(amount);
  },
  
  /**
   * Formater en pourcentage
   * @param {number} value
   * @param {number} decimals
   */
  formatPercent(value, decimals = 0) {
    return `${(value * 100).toFixed(decimals)}%`;
  },
  
  /**
   * Clamper une valeur entre min et max
   * @param {number} value
   * @param {number} min
   * @param {number} max
   */
  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  },
  
  /**
   * Formater les XP de manière compacte
   * @param {number} xp
   */
  formatXP(xp) {
    if (xp >= 1000000) return `${(xp / 1000000).toFixed(1)}M`;
    if (xp >= 1000) return `${(xp / 1000).toFixed(1)}K`;
    return xp.toString();
  },
  
  // ═══════════════════════════════════════════════════════════
  // DATE UTILITIES
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Formater une date
   * @param {Date|string|number} date
   * @param {string} format - 'short', 'long', 'relative'
   */
  formatDate(date, format = 'short') {
    const d = new Date(date);
    const locale = 'fr-FR';
    
    switch (format) {
      case 'short':
        return d.toLocaleDateString(locale);
      case 'long':
        return d.toLocaleDateString(locale, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      case 'time':
        return d.toLocaleTimeString(locale, {
          hour: '2-digit',
          minute: '2-digit'
        });
      case 'datetime':
        return d.toLocaleString(locale);
      case 'relative':
        return this.timeAgo(date);
      default:
        return d.toLocaleDateString(locale);
    }
  },
  
  /**
   * Temps écoulé depuis une date
   * @param {Date|string|number} date
   */
  timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    const intervals = [
      { label: 'an', seconds: 31536000 },
      { label: 'mois', seconds: 2592000 },
      { label: 'semaine', seconds: 604800 },
      { label: 'jour', seconds: 86400 },
      { label: 'heure', seconds: 3600 },
      { label: 'minute', seconds: 60 }
    ];
    
    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.seconds);
      if (count >= 1) {
        const plural = count > 1 && interval.label !== 'mois' ? 's' : '';
        return `il y a ${count} ${interval.label}${plural}`;
      }
    }
    
    return "à l'instant";
  },
  
  /**
   * Formater une durée en minutes/heures
   * @param {number} minutes
   */
  formatDuration(minutes) {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  },
  
  // ═══════════════════════════════════════════════════════════
  // VALIDATION
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Valider un email
   * @param {string} email
   */
  isValidEmail(email) {
    const regex = CONFIG?.validation?.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },
  
  /**
   * Valider un téléphone
   * @param {string} phone
   */
  isValidPhone(phone) {
    const regex = CONFIG?.validation?.phone || /^[\d\s+()-]{8,20}$/;
    return regex.test(phone);
  },
  
  /**
   * Valider un mot de passe
   * @param {string} password
   */
  validatePassword(password) {
    const rules = CONFIG?.validation?.password || {
      minLength: 8,
      requireUppercase: true,
      requireNumber: true
    };
    
    const errors = [];
    
    if (password.length < rules.minLength) {
      errors.push(`Minimum ${rules.minLength} caractères`);
    }
    if (rules.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Au moins une majuscule');
    }
    if (rules.requireNumber && !/\d/.test(password)) {
      errors.push('Au moins un chiffre');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  },
  
  /**
   * Vérifier si une URL est valide
   * @param {string} url
   */
  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
  
  /**
   * URL sûre (éviter les templates non résolus)
   * @param {string} url
   * @param {string} fallback
   */
  safeUrl(url, fallback = '') {
    if (!url) return fallback;
    if (url.includes('${') || url.includes('%7B') || url.includes('%24%7B')) {
      return fallback;
    }
    return url;
  },
  
  /**
   * Nombre sûr
   * @param {*} value
   * @param {number} fallback
   */
  safeNumber(value, fallback = 0) {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'string' && value.includes('${')) return fallback;
    const num = Number(value);
    return isNaN(num) ? fallback : num;
  },
  
  // ═══════════════════════════════════════════════════════════
  // ASYNC UTILITIES
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Attendre un délai
   * @param {number} ms
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
  
  /**
   * Debounce une fonction
   * @param {function} fn
   * @param {number} delay
   */
  debounce(fn, delay = 300) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
  },
  
  /**
   * Throttle une fonction
   * @param {function} fn
   * @param {number} limit
   */
  throttle(fn, limit = 300) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        fn.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },
  
  /**
   * Réessayer une fonction async
   * @param {function} fn
   * @param {number} retries
   * @param {number} delay
   */
  async retry(fn, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === retries - 1) throw error;
        await this.sleep(delay * (i + 1));
      }
    }
  },
  
  // ═══════════════════════════════════════════════════════════
  // STORAGE UTILITIES
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Lire du localStorage
   * @param {string} key
   * @param {*} defaultValue
   */
  getStorage(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  
  /**
   * Écrire dans localStorage
   * @param {string} key
   * @param {*} value
   */
  setStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  
  /**
   * Supprimer du localStorage
   * @param {string} key
   */
  removeStorage(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },
  
  // ═══════════════════════════════════════════════════════════
  // DEVICE/BROWSER UTILITIES
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Détecter si c'est un mobile
   */
  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  },
  
  /**
   * Détecter si c'est une tablette
   */
  isTablet() {
    return /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(
      navigator.userAgent
    );
  },
  
  /**
   * Détecter si touche
   */
  isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },
  
  /**
   * Obtenir la préférence de thème système
   */
  getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  },
  
  /**
   * Copier dans le presse-papier
   * @param {string} text
   */
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback pour les anciens navigateurs
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    }
  },
  
  // ═══════════════════════════════════════════════════════════
  // ARRAY/OBJECT UTILITIES
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Grouper un tableau par clé
   * @param {array} array
   * @param {string|function} key
   */
  groupBy(array, key) {
    return array.reduce((groups, item) => {
      const groupKey = typeof key === 'function' ? key(item) : item[key];
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(item);
      return groups;
    }, {});
  },
  
  /**
   * Trier un tableau par clé
   * @param {array} array
   * @param {string} key
   * @param {string} direction
   */
  sortBy(array, key, direction = 'asc') {
    return [...array].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  },
  
  /**
   * Filtrer les valeurs uniques
   * @param {array} array
   * @param {string} key - Clé pour les objets
   */
  unique(array, key = null) {
    if (key) {
      const seen = new Set();
      return array.filter(item => {
        const val = item[key];
        if (seen.has(val)) return false;
        seen.add(val);
        return true;
      });
    }
    return [...new Set(array)];
  },
  
  /**
   * Deep clone un objet
   * @param {object} obj
   */
  deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  },
  
  /**
   * Deep merge deux objets
   * @param {object} target
   * @param {object} source
   */
  deepMerge(target, source) {
    const output = { ...target };
    
    for (const key of Object.keys(source)) {
      if (source[key] instanceof Object && key in target) {
        output[key] = this.deepMerge(target[key], source[key]);
      } else {
        output[key] = source[key];
      }
    }
    
    return output;
  },
  
  /**
   * Vérifier si un objet est vide
   * @param {object} obj
   */
  isEmpty(obj) {
    if (!obj) return true;
    if (Array.isArray(obj)) return obj.length === 0;
    if (typeof obj === 'object') return Object.keys(obj).length === 0;
    return false;
  }
};

// ─── Export ───
window.Utils = Utils;

// ─── Raccourcis globaux ───
window.$ = Utils.$.bind(Utils);
window.$$ = Utils.$$.bind(Utils);

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Utils;
}
