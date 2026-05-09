/**
 * ============================================================
 * 📦 NEOCLASS - État Global de l'Application (Store)
 * Pattern: Observable State Management
 * ============================================================
 */

class Store {
  constructor() {
    this._state = {
      // ─── Utilisateur ───
      user: null,
      profile: null,
      isAuthenticated: false,
      
      // ─── Navigation ───
      currentPage: 'home',
      previousPage: null,
      pageHistory: [],
      
      // ─── UI ───
      theme: localStorage.getItem(CONFIG?.storage?.theme) || 'light',
      sidebarOpen: window.innerWidth >= 1024,
      loading: false,
      error: null,
      
      // ─── Gamification ───
      xp: 0,
      level: 1,
      streak: 0,
      lives: 5,
      coins: 0,
      
      // ─── Cours ───
      courses: [],
      currentCourse: null,
      currentLesson: null,
      progress: {},
      
      // ─── Notifications ───
      notifications: [],
      unreadCount: 0,
      
      // ─── Modals ───
      activeModal: null,
      modalData: null,
      
      // ─── Toasts ───
      toasts: [],
      
      // ─── Filtres ───
      filters: {
        subject: null,
        level: null,
        search: ''
      }
    };
    
    this._listeners = new Map();
    this._middlewares = [];
    
    // ─── Bind methods ───
    this.get = this.get.bind(this);
    this.set = this.set.bind(this);
    this.subscribe = this.subscribe.bind(this);
  }
  
  /**
   * Obtenir une valeur du state
   * @param {string} key - Clé de la propriété (supporte la notation point: 'user.name')
   * @returns {*} Valeur
   */
  get(key) {
    if (!key) return { ...this._state };
    
    const keys = key.split('.');
    let value = this._state;
    
    for (const k of keys) {
      if (value === null || value === undefined) return undefined;
      value = value[k];
    }
    
    return value;
  }
  
  /**
   * Mettre à jour le state
   * @param {string|object} keyOrObject - Clé ou objet de mise à jour
   * @param {*} value - Valeur (si keyOrObject est une string)
   * @returns {Store} this (pour le chaînage)
   */
  set(keyOrObject, value) {
    const updates = typeof keyOrObject === 'string' 
      ? { [keyOrObject]: value }
      : keyOrObject;
    
    // ─── Appliquer middlewares ───
    let processedUpdates = updates;
    for (const middleware of this._middlewares) {
      processedUpdates = middleware(processedUpdates, this._state);
    }
    
    // ─── Mémoriser les anciennes valeurs pour les listeners ───
    const oldValues = {};
    for (const key of Object.keys(processedUpdates)) {
      oldValues[key] = this.get(key);
    }
    
    // ─── Appliquer les mises à jour ───
    for (const [key, val] of Object.entries(processedUpdates)) {
      if (key.includes('.')) {
        // Notation point pour les propriétés imbriquées
        const keys = key.split('.');
        let target = this._state;
        
        for (let i = 0; i < keys.length - 1; i++) {
          if (!(keys[i] in target)) {
            target[keys[i]] = {};
          }
          target = target[keys[i]];
        }
        
        target[keys[keys.length - 1]] = val;
      } else {
        this._state[key] = val;
      }
    }
    
    // ─── Notifier les listeners ───
    for (const [key, val] of Object.entries(processedUpdates)) {
      this._notifyListeners(key, val, oldValues[key]);
    }
    
    // ─── Debug logging ───
    if (CONFIG?.app?.debug) {
      console.log('%c[Store] Updated:', 'color: #6366f1; font-weight: bold;', processedUpdates);
    }
    
    return this;
  }
  
  /**
   * S'abonner aux changements d'une propriété
   * @param {string} key - Clé à observer
   * @param {function} callback - Fonction appelée lors des changements
   * @returns {function} Fonction de désabonnement
   */
  subscribe(key, callback) {
    if (!this._listeners.has(key)) {
      this._listeners.set(key, new Set());
    }
    
    this._listeners.get(key).add(callback);
    
    // ─── Appeler immédiatement avec la valeur actuelle ───
    callback(this.get(key), undefined);
    
    // ─── Retourner la fonction de désabonnement ───
    return () => {
      const listeners = this._listeners.get(key);
      if (listeners) {
        listeners.delete(callback);
      }
    };
  }
  
  /**
   * Notifier les listeners d'un changement
   * @private
   */
  _notifyListeners(key, newValue, oldValue) {
    // ─── Listeners exact key ───
    const exactListeners = this._listeners.get(key);
    if (exactListeners) {
      for (const callback of exactListeners) {
        try {
          callback(newValue, oldValue);
        } catch (error) {
          console.error('[Store] Listener error:', error);
        }
      }
    }
    
    // ─── Listeners parent keys (pour 'user' quand 'user.name' change) ───
    const parts = key.split('.');
    if (parts.length > 1) {
      for (let i = 1; i < parts.length; i++) {
        const parentKey = parts.slice(0, i).join('.');
        const parentListeners = this._listeners.get(parentKey);
        if (parentListeners) {
          const parentValue = this.get(parentKey);
          for (const callback of parentListeners) {
            try {
              callback(parentValue, undefined);
            } catch (error) {
              console.error('[Store] Listener error:', error);
            }
          }
        }
      }
    }
    
    // ─── Wildcard listeners '*' ───
    const wildcardListeners = this._listeners.get('*');
    if (wildcardListeners) {
      for (const callback of wildcardListeners) {
        try {
          callback({ key, newValue, oldValue });
        } catch (error) {
          console.error('[Store] Listener error:', error);
        }
      }
    }
  }
  
  /**
   * Ajouter un middleware
   * @param {function} middleware - Fonction (updates, state) => processedUpdates
   */
  use(middleware) {
    this._middlewares.push(middleware);
    return this;
  }
  
  /**
   * Réinitialiser une partie ou tout le state
   * @param {string} key - Clé à réinitialiser (optionnel)
   */
  reset(key) {
    if (key) {
      const defaultState = this._getDefaultState();
      this.set(key, defaultState[key]);
    } else {
      this._state = this._getDefaultState();
      this._notifyListeners('*', this._state, undefined);
    }
    return this;
  }
  
  /**
   * Obtenir l'état par défaut
   * @private
   */
  _getDefaultState() {
    return {
      user: null,
      profile: null,
      isAuthenticated: false,
      currentPage: 'home',
      previousPage: null,
      pageHistory: [],
      theme: 'light',
      sidebarOpen: window.innerWidth >= 1024,
      loading: false,
      error: null,
      xp: 0,
      level: 1,
      streak: 0,
      lives: 5,
      coins: 0,
      courses: [],
      currentCourse: null,
      currentLesson: null,
      progress: {},
      notifications: [],
      unreadCount: 0,
      activeModal: null,
      modalData: null,
      toasts: [],
      filters: {
        subject: null,
        level: null,
        search: ''
      }
    };
  }
  
  /**
   * Persister le state dans localStorage
   * @param {string[]} keys - Clés à persister
   */
  persist(keys) {
    const toPersist = {};
    for (const key of keys) {
      toPersist[key] = this.get(key);
    }
    
    try {
      localStorage.setItem(
        CONFIG?.storage?.prefix + 'state',
        JSON.stringify(toPersist)
      );
    } catch (error) {
      console.warn('[Store] Persist error:', error);
    }
    
    return this;
  }
  
  /**
   * Restaurer le state depuis localStorage
   */
  restore() {
    try {
      const stored = localStorage.getItem(CONFIG?.storage?.prefix + 'state');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.set(parsed);
      }
    } catch (error) {
      console.warn('[Store] Restore error:', error);
    }
    
    return this;
  }
}

// ─── Créer l'instance singleton ───
const State = new Store();

// ─── Middlewares par défaut ───

// Logger middleware (en dev)
if (CONFIG?.app?.debug) {
  State.use((updates, state) => {
    console.groupCollapsed('%c[Store] State Update', 'color: #6366f1');
    console.log('Previous:', { ...state });
    console.log('Updates:', updates);
    console.log('Next:', { ...state, ...updates });
    console.groupEnd();
    return updates;
  });
}

// Persist theme changes
State.subscribe('theme', (theme) => {
  if (theme) {
    localStorage.setItem(CONFIG?.storage?.theme || 'nc_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    document.body.classList.toggle('dark-mode', theme === 'dark');
  }
});

// ─── Export ───
window.State = State;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Store, State };
}
