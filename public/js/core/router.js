/**
 * ============================================================
 * 🛣️ NEOCLASS - Routeur SPA
 * Navigation sans rechargement de page
 * ============================================================
 */

class Router {
  constructor() {
    this._routes = new Map();
    this._currentRoute = null;
    this._guards = [];
    this._hooks = {
      beforeEach: [],
      afterEach: []
    };
    
    // ─── Bind methods ───
    this.navigate = this.navigate.bind(this);
    this.back = this.back.bind(this);
    this._handlePopState = this._handlePopState.bind(this);
    
    // ─── Setup event listeners ───
    window.addEventListener('popstate', this._handlePopState);
    
    // ─── Intercept link clicks ───
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[data-link]');
      if (link) {
        e.preventDefault();
        this.navigate(link.getAttribute('href') || link.dataset.link);
      }
    });
  }
  
  /**
   * Enregistrer une route
   * @param {string} path - Chemin de la route
   * @param {object} config - Configuration de la route
   */
  register(path, config) {
    this._routes.set(path, {
      path,
      title: config.title || 'Neoclass',
      component: config.component,
      guard: config.guard || null,
      meta: config.meta || {},
      onEnter: config.onEnter,
      onLeave: config.onLeave
    });
    
    return this;
  }
  
  /**
   * Enregistrer plusieurs routes
   * @param {object} routes - Objet {path: config}
   */
  registerAll(routes) {
    for (const [path, config] of Object.entries(routes)) {
      this.register(path, config);
    }
    return this;
  }
  
  /**
   * Ajouter un garde global
   * @param {function} guard - (to, from) => boolean|string
   */
  addGuard(guard) {
    this._guards.push(guard);
    return this;
  }
  
  /**
   * Ajouter un hook beforeEach
   * @param {function} hook - (to, from, next) => void
   */
  beforeEach(hook) {
    this._hooks.beforeEach.push(hook);
    return this;
  }
  
  /**
   * Ajouter un hook afterEach
   * @param {function} hook - (to, from) => void
   */
  afterEach(hook) {
    this._hooks.afterEach.push(hook);
    return this;
  }
  
  /**
   * Naviguer vers une route
   * @param {string} path - Chemin de destination
   * @param {object} options - Options de navigation
   */
  async navigate(path, options = {}) {
    const { replace = false, data = null, silent = false } = options;
    
    // ─── Normaliser le chemin ───
    path = this._normalizePath(path);
    
    // ─── Trouver la route ───
    const route = this._matchRoute(path);
    
    if (!route) {
      console.warn(`[Router] Route not found: ${path}`);
      // Éviter la boucle infinie si /404 n'existe pas
      if (path === '/404' || path === '/home') {
        console.error('[Router] Critical route missing, staying on current page');
        return false;
      }
      // Essayer /home au lieu de /404 pour éviter les erreurs
      const homeRoute = this._matchRoute('/home');
      if (homeRoute) {
        return this.navigate('/home', { replace: true });
      }
      return false;
    }
    
    const from = this._currentRoute;
    const to = { ...route, path, data };
    
    // ─── Exécuter les gardes globaux ───
    for (const guard of this._guards) {
      const result = await guard(to, from);
      if (result === false) {
        console.log(`[Router] Navigation cancelled by guard`);
        return false;
      }
      if (typeof result === 'string') {
        return this.navigate(result, { replace: true });
      }
    }
    
    // ─── Exécuter le garde de la route ───
    if (route.guard) {
      const result = await route.guard(to, from);
      if (result === false) {
        console.log(`[Router] Navigation cancelled by route guard`);
        return false;
      }
      if (typeof result === 'string') {
        return this.navigate(result, { replace: true });
      }
    }
    
    // ─── Exécuter les hooks beforeEach ───
    for (const hook of this._hooks.beforeEach) {
      await new Promise((resolve) => hook(to, from, resolve));
    }
    
    // ─── Quitter l'ancienne route ───
    if (from?.onLeave) {
      await from.onLeave(to);
    }
    
    // ─── Mettre à jour l'historique ───
    if (!silent) {
      const url = path === '/home' ? '/' : path;
      if (replace) {
        history.replaceState({ path, data }, '', url);
      } else {
        history.pushState({ path, data }, '', url);
      }
    }
    
    // ─── Mettre à jour le state ───
    this._currentRoute = to;
    State.set({
      currentPage: this._getPageName(path),
      previousPage: from ? this._getPageName(from.path) : null
    });
    
    // ─── Mettre à jour le titre ───
    document.title = route.title;
    
    // ─── Afficher la page ───
    this._showPage(path, route);
    
    // ─── Entrer dans la nouvelle route ───
    if (route.onEnter) {
      await route.onEnter(from, data);
    }
    
    // ─── Exécuter les hooks afterEach ───
    for (const hook of this._hooks.afterEach) {
      hook(to, from);
    }
    
    // ─── Scroll to top ───
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    if (CONFIG?.app?.debug) {
      console.log(`%c[Router] Navigated to: ${path}`, 'color: #10b981; font-weight: bold;');
    }
    
    return true;
  }
  
  /**
   * Retour arrière
   */
  back() {
    history.back();
  }
  
  /**
   * Avancer
   */
  forward() {
    history.forward();
  }
  
  /**
   * Obtenir la route actuelle
   */
  getCurrentRoute() {
    return this._currentRoute;
  }
  
  /**
   * Vérifier si une route est active
   * @param {string} path - Chemin à vérifier
   */
  isActive(path) {
    return this._normalizePath(path) === this._currentRoute?.path;
  }
  
  /**
   * Handler pour popstate (boutons back/forward du navigateur)
   * @private
   */
  _handlePopState(event) {
    const path = event.state?.path || window.location.pathname;
    this.navigate(path, { silent: true });
  }
  
  /**
   * Normaliser un chemin
   * @private
   */
  _normalizePath(path) {
    // ─── Enlever les query strings et hash ───
    path = path.split('?')[0].split('#')[0];
    
    // ─── S'assurer que ça commence par / ───
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
    
    // ─── Convertir / en /home ───
    if (path === '/') {
      path = '/home';
    }
    
    return path;
  }
  
  /**
   * Trouver une route correspondante
   * @private
   */
  _matchRoute(path) {
    // ─── Match exact ───
    if (this._routes.has(path)) {
      return this._routes.get(path);
    }
    
    // ─── Match avec paramètres (/course/:id) ───
    for (const [routePath, route] of this._routes) {
      const paramMatch = this._matchParams(routePath, path);
      if (paramMatch) {
        return { ...route, params: paramMatch };
      }
    }
    
    // ─── Route par défaut 404 ───
    return this._routes.get('/404') || null;
  }
  
  /**
   * Matcher les paramètres de route
   * @private
   */
  _matchParams(routePath, actualPath) {
    const routeParts = routePath.split('/');
    const actualParts = actualPath.split('/');
    
    if (routeParts.length !== actualParts.length) return null;
    
    const params = {};
    
    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(':')) {
        params[routeParts[i].slice(1)] = actualParts[i];
      } else if (routeParts[i] !== actualParts[i]) {
        return null;
      }
    }
    
    return Object.keys(params).length > 0 ? params : null;
  }
  
  /**
   * Extraire le nom de page d'un chemin
   * @private
   */
  _getPageName(path) {
    if (!path) return 'home';
    const parts = path.split('/').filter(Boolean);
    return parts[0] || 'home';
  }
  
  /**
   * Afficher la page correspondante
   * @private
   */
  _showPage(path, route) {
    // ─── Cacher toutes les pages ───
    document.querySelectorAll('[data-page]').forEach(el => {
      el.classList.remove('is-active');
      el.style.display = 'none';
    });
    
    // ─── Afficher la page cible ───
    const pageName = this._getPageName(path);
    const pageEl = document.querySelector(`[data-page="${pageName}"]`);
    
    if (pageEl) {
      pageEl.style.display = 'block';
      // ─── Force reflow pour l'animation ───
      void pageEl.offsetHeight;
      pageEl.classList.add('is-active');
    }
    
    // ─── Mettre à jour la navigation ───
    document.querySelectorAll('[data-nav-link]').forEach(link => {
      const linkPage = link.dataset.navLink;
      link.classList.toggle('is-active', linkPage === pageName);
    });
    
    // ─── Si c'est un composant dynamique ───
    if (route.component && typeof route.component === 'function') {
      const container = document.querySelector('#app-content') || document.querySelector('.app-content');
      if (container) {
        const content = route.component(route.params, route.data);
        if (typeof content === 'string') {
          container.innerHTML = content;
        } else if (content instanceof HTMLElement) {
          container.innerHTML = '';
          container.appendChild(content);
        }
      }
    }
  }
  
  /**
   * Initialiser le routeur avec la route actuelle
   */
  init() {
    const path = window.location.pathname;
    this.navigate(path, { replace: true });
    return this;
  }
}

// ─── Créer l'instance singleton ───
const router = new Router();

// ─── Gardes par défaut ───

// Auth guard - Vérifier si l'utilisateur est connecté
const authGuard = (to, from) => {
  const requiresAuth = to.meta?.requiresAuth;
  const isAuthenticated = State.get('isAuthenticated');
  
  if (requiresAuth && !isAuthenticated) {
    console.log('[Router] Auth required, redirecting to login');
    return '/login';
  }
  
  return true;
};

// Admin guard - Vérifier les droits admin
const adminGuard = (to, from) => {
  const requiresAdmin = to.meta?.requiresAdmin;
  const user = State.get('user');
  
  if (requiresAdmin && user?.role !== 'admin') {
    console.log('[Router] Admin required, access denied');
    return '/home';
  }
  
  return true;
};

// ─── Export ───
window.router = router;
window.authGuard = authGuard;
window.adminGuard = adminGuard;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Router, router, authGuard, adminGuard };
}
