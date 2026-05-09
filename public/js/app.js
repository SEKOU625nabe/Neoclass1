/**
 * ============================================================
 * 🚀 NEOCLASS - Application Principale
 * Point d'entrée de l'application
 * ============================================================
 */

class NeoclassApp {
  constructor() {
    this.initialized = false;
    this.version = '2.0.0';
  }
  
  /**
   * Initialiser l'application
   */
  async init() {
    if (this.initialized) return;
    
    console.log(`🎓 Neoclass v${this.version} - Initialisation...`);
    
    try {
      // 1. Initialiser Firebase
      await this.initFirebase();
      
      // 2. Initialiser le Store
      this.initStore();
      
      // 3. Initialiser l'UI
      this.initUI();
      
      // 4. Initialiser le Router
      this.initRouter();
      
      // 5. Initialiser l'authentification
      await this.initAuth();
      
      // 6. Charger les données initiales
      await this.loadInitialData();
      
      // 7. Bind des événements
      this.bindEvents();
      
      // 8. Masquer le loader
      this.hideAppLoader();
      
      this.initialized = true;
      console.log('✅ Neoclass initialisé avec succès !');
      
    } catch (error) {
      console.error('❌ Erreur initialisation:', error);
      this.showErrorState();
    }
  }
  
  /**
   * Initialiser Firebase
   */
  async initFirebase() {
    if (!window.Firebase) {
      throw new Error('Module Firebase non chargé');
    }
    
    await window.Firebase.init();
    console.log('🔥 Firebase initialisé');
  }
  
  /**
   * Initialiser le Store
   */
  initStore() {
    // Le Store est déjà créé dans store.js
    if (window.store) {
      // Restaurer l'état persisté
      const savedState = Utils.getStorage('nc_app_state');
      if (savedState) {
        window.store.state = { ...window.store.state, ...savedState };
      }
      console.log('📦 Store initialisé');
    }
  }
  
  /**
   * Initialiser l'UI
   */
  initUI() {
    if (!window.UI) {
      throw new Error('Module UI non chargé');
    }
    
    // Initialiser les composants UI
    window.UI.initTooltips();
    window.UI.initDropdowns();
    window.UI.initTabs();
    window.UI.initAccordions();
    window.UI.initScrollToTop();
    
    // Appliquer le thème sauvegardé
    const savedTheme = Utils.getStorage('nc_theme') || 'light';
    window.UI.setTheme(savedTheme);
    
    // Mettre à jour le select de thème
    const themeSelect = document.getElementById('setting-theme');
    if (themeSelect) {
      themeSelect.value = savedTheme;
    }
    
    console.log('🎨 UI initialisée');
  }
  
  /**
   * Initialiser le Router
   */
  initRouter() {
    if (!window.router) {
      throw new Error('Module Router non chargé');
    }
    
    // Enregistrer les routes
    window.router.register('/', 'home', 'Accueil');
    window.router.register('/home', 'home', 'Accueil');  // Alias pour /home
    window.router.register('/404', 'not-found', 'Page non trouvée');  // Route 404
    window.router.register('/courses', 'courses', 'Cours');
    window.router.register('/courses/:id', 'course-detail', 'Détail du cours');
    window.router.register('/lesson/:id', 'lesson', 'Leçon');
    window.router.register('/quiz/:id', 'quiz', 'Quiz');
    window.router.register('/practice', 'practice', "S'entraîner");
    window.router.register('/leaderboard', 'leaderboard', 'Classement');
    window.router.register('/shop', 'shop', 'Boutique');
    window.router.register('/profile', 'profile', 'Mon Profil');
    window.router.register('/settings', 'settings', 'Paramètres');
    
    // Guards
    window.router.addGuard('authGuard', () => {
      return window.Auth?.isAuthenticated() || false;
    });
    
    window.router.addGuard('adminGuard', () => {
      return window.Auth?.isAdmin() || false;
    });
    
    // Routes protégées
    window.router.protectedRoutes = ['/profile', '/settings'];
    
    // Before each navigation
    window.router.beforeEach((to, from) => {
      // Vérifier si la route nécessite une auth
      if (window.router.protectedRoutes.includes(to.path)) {
        if (!window.Auth?.isAuthenticated()) {
          window.Auth?.setRedirectAfterLogin(to.path);
          window.Auth?.showLoginForm();
          return false;
        }
      }
      return true;
    });
    
    // After each navigation
    window.router.afterEach((route) => {
      // Mettre à jour la navigation active
      this.updateActiveNav(route.page);
      
      // Scroll to top
      window.scrollTo(0, 0);
      
      // Analytics si disponible
      if (window.gtag) {
        window.gtag('event', 'page_view', {
          page_path: route.path,
          page_title: route.title
        });
      }
    });
    
    // Démarrer le router
    window.router.init();
    
    console.log('🧭 Router initialisé');
  }
  
  /**
   * Initialiser l'authentification
   */
  async initAuth() {
    if (!window.Auth) {
      throw new Error('Module Auth non chargé');
    }
    
    await window.Auth.init();
    console.log('🔐 Auth initialisée');
  }
  
  /**
   * Charger les données initiales
   */
  async loadInitialData() {
    try {
      // Charger les catégories
      if (window.Courses) {
        const categories = await window.Courses.getCategories();
        this.renderCategories(categories);
      }
      
      // Charger le top du leaderboard
      if (window.Gamification) {
        const leaderboard = await window.Gamification.getLeaderboard('global', 5);
        this.renderLeaderboardPreview(leaderboard);
      }
      
      // Si connecté, charger les cours en cours
      if (window.Auth?.isAuthenticated()) {
        await this.loadUserData();
      }
      
      console.log('📊 Données initiales chargées');
      
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  }
  
  /**
   * Charger les données utilisateur
   */
  async loadUserData() {
    const user = window.Auth.getUser();
    if (!user) return;
    
    try {
      // Progression utilisateur
      const progress = await window.Courses.getUserProgress(user.uid);
      if (progress) {
        const lessonsEl = document.getElementById('lessons-completed');
        if (lessonsEl) lessonsEl.textContent = progress.lessonsCompleted;
      }
      
      // Rang utilisateur
      const rank = await window.Gamification.getUserRank(user.uid);
      if (rank) {
        const rankEl = document.getElementById('rank');
        if (rankEl) rankEl.textContent = `#${rank}`;
      }
      
      // Recommandations
      const recommendations = await window.Courses.getRecommendations(user.uid);
      this.renderCourses(recommendations, 'recommended-courses');
      
    } catch (error) {
      console.error('Erreur chargement données utilisateur:', error);
    }
  }
  
  /**
   * Bind des événements globaux
   */
  bindEvents() {
    // Toggle sidebar
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    
    const toggleSidebar = () => {
      sidebar?.classList.toggle('collapsed');
      document.body.classList.toggle('sidebar-collapsed');
    };
    
    sidebarToggle?.addEventListener('click', toggleSidebar);
    menuToggle?.addEventListener('click', () => {
      sidebar?.classList.toggle('open');
    });
    
    // Fermer sidebar sur mobile au clic en dehors
    document.addEventListener('click', (e) => {
      if (sidebar?.classList.contains('open') && 
          !sidebar.contains(e.target) && 
          e.target !== menuToggle) {
        sidebar.classList.remove('open');
      }
    });
    
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle?.addEventListener('click', () => {
      window.UI?.toggleTheme();
    });
    
    // Theme select
    const themeSelect = document.getElementById('setting-theme');
    themeSelect?.addEventListener('change', (e) => {
      window.UI?.setTheme(e.target.value);
    });
    
    // Boutons d'authentification
    document.getElementById('login-btn')?.addEventListener('click', () => {
      window.Auth?.showLoginForm();
    });
    
    document.getElementById('signup-btn')?.addEventListener('click', () => {
      window.Auth?.showSignupForm();
    });
    
    document.getElementById('hero-signup-btn')?.addEventListener('click', () => {
      window.Auth?.showSignupForm();
    });
    
    document.getElementById('logout-btn')?.addEventListener('click', () => {
      window.Auth?.signOut();
    });
    
    document.getElementById('logout-dropdown-btn')?.addEventListener('click', () => {
      window.Auth?.signOut();
    });
    
    // Recherche
    const searchInput = document.getElementById('search-input');
    searchInput?.addEventListener('input', Utils.debounce((e) => {
      this.handleSearch(e.target.value);
    }, 300));
    
    // Navigation links
    document.querySelectorAll('[data-page]').forEach(link => {
      link.addEventListener('click', (e) => {
        if (link.tagName === 'A') {
          e.preventDefault();
          const href = link.getAttribute('href');
          window.router?.navigate(href);
        }
      });
    });
    
    // Settings
    document.getElementById('delete-account-btn')?.addEventListener('click', () => {
      window.Auth?.deleteAccount();
    });
    
    document.getElementById('change-password-btn')?.addEventListener('click', async () => {
      const user = window.Auth?.getUser();
      if (user?.email) {
        await window.Auth?.resetPassword(user.email);
      }
    });
    
    // Daily goal setting
    document.getElementById('setting-daily-goal')?.addEventListener('change', (e) => {
      Utils.setStorage('nc_daily_goal', parseInt(e.target.value));
      this.updateDailyGoal();
    });
    
    // Sounds setting
    document.getElementById('setting-sounds')?.addEventListener('change', (e) => {
      Utils.setStorage('nc_sounds', e.target.checked);
    });
    
    // Avatar edit
    document.getElementById('avatar-edit-btn')?.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (e) => {
        const file = e.target.files?.[0];
        if (file) {
          await window.Auth?.uploadProfilePhoto(file);
        }
      };
      input.click();
    });
    
    // Écouter les événements de gamification
    window.addEventListener('gamification:xpGained', (e) => {
      this.updateUserStats();
    });
    
    window.addEventListener('gamification:levelUp', (e) => {
      this.updateUserStats();
    });
    
    window.addEventListener('gamification:streakUpdated', (e) => {
      this.updateUserStats();
    });
    
    // Auth events
    window.addEventListener('auth:login', () => {
      this.loadUserData();
    });
    
    console.log('🔗 Événements bindés');
  }
  
  /**
   * Mettre à jour la navigation active
   * @param {string} page
   */
  updateActiveNav(page) {
    // Sidebar links
    document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.page === page);
    });
    
    // Bottom nav
    document.querySelectorAll('.bottom-nav-item').forEach(link => {
      link.classList.toggle('active', link.dataset.page === page);
    });
    
    // Page title
    const pageTitle = document.getElementById('page-title');
    const route = window.router?.currentRoute;
    if (pageTitle && route?.title) {
      pageTitle.textContent = route.title;
    }
  }
  
  /**
   * Mettre à jour les stats utilisateur
   */
  updateUserStats() {
    const user = window.Auth?.getUser();
    if (!user) return;
    
    // XP
    document.querySelectorAll('[data-user="xp"]').forEach(el => {
      el.textContent = Utils.formatXP(user.xp || 0);
    });
    
    // Level
    document.querySelectorAll('[data-user="level"]').forEach(el => {
      el.textContent = user.level || 1;
    });
    
    // Streak
    document.querySelectorAll('[data-user="streak"]').forEach(el => {
      el.textContent = user.streak || 0;
    });
    
    // Coins
    document.querySelectorAll('[data-user="coins"]').forEach(el => {
      el.textContent = user.coins || 0;
    });
    
    // Daily goal progress
    this.updateDailyGoal();
  }
  
  /**
   * Mettre à jour l'objectif quotidien
   */
  updateDailyGoal() {
    const dailyGoal = Utils.getStorage('nc_daily_goal') || 50;
    const dailyXP = window.store?.get('dailyXP') || 0;
    
    const progress = Math.min((dailyXP / dailyGoal) * 100, 100);
    
    const dailyXpEl = document.getElementById('daily-xp');
    if (dailyXpEl) dailyXpEl.textContent = dailyXP;
    
    const dailyGoalEl = document.getElementById('daily-goal');
    if (dailyGoalEl) dailyGoalEl.textContent = dailyGoal;
    
    const progressBar = document.getElementById('daily-progress');
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }
    
    const goalMessage = document.getElementById('goal-message');
    if (goalMessage) {
      if (progress >= 100) {
        goalMessage.textContent = "🎉 Objectif atteint ! Bravo !";
        goalMessage.classList.add('success');
      } else {
        goalMessage.textContent = `Plus que ${dailyGoal - dailyXP} XP pour atteindre ton objectif !`;
        goalMessage.classList.remove('success');
      }
    }
  }
  
  /**
   * Recherche
   * @param {string} query
   */
  async handleSearch(query) {
    if (!query || query.length < 2) return;
    
    // TODO: Implémenter la recherche
    console.log('Recherche:', query);
  }
  
  /**
   * Rendre les catégories
   * @param {array} categories
   */
  renderCategories(categories) {
    const container = document.getElementById('categories-grid');
    if (!container || !categories) return;
    
    container.innerHTML = categories.map(cat => `
      <a href="/courses?category=${cat.id}" class="category-card" style="--cat-color: ${cat.color}">
        <span class="category-icon">${cat.icon}</span>
        <span class="category-name">${cat.name}</span>
      </a>
    `).join('');
  }
  
  /**
   * Rendre les cours
   * @param {array} courses
   * @param {string} containerId
   */
  renderCourses(courses, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (!courses || courses.length === 0) {
      container.innerHTML = '<p class="empty-state">Aucun cours disponible</p>';
      return;
    }
    
    container.innerHTML = courses.map(course => `
      <article class="course-card" data-course-id="${course.id}">
        <div class="course-cover" style="background-color: ${course.color || '#58CC02'}">
          <span class="course-icon">${course.icon || '📚'}</span>
          ${course.isPremium ? '<span class="course-badge premium">💎 Premium</span>' : ''}
        </div>
        <div class="course-body">
          <h3 class="course-title">${Utils.escapeHtml(course.title)}</h3>
          <p class="course-desc">${Utils.truncate(course.description, 80)}</p>
          <div class="course-meta">
            <span class="course-level">${course.level || 'Tous niveaux'}</span>
            <span class="course-lessons">${course.lessonsCount || 0} leçons</span>
          </div>
          ${course.progress ? `
            <div class="course-progress">
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${course.progress.percent}%"></div>
              </div>
              <span class="progress-text">${course.progress.percent}%</span>
            </div>
          ` : ''}
        </div>
        <a href="/courses/${course.id}" class="course-link-overlay" aria-label="Voir ${Utils.escapeHtml(course.title)}"></a>
      </article>
    `).join('');
  }
  
  /**
   * Rendre le leaderboard preview
   * @param {array} leaderboard
   */
  renderLeaderboardPreview(leaderboard) {
    const container = document.getElementById('leaderboard-preview');
    if (!container || !leaderboard) return;
    
    if (leaderboard.length === 0) {
      container.innerHTML = '<p class="empty-state">Aucun classement disponible</p>';
      return;
    }
    
    container.innerHTML = `
      <div class="leaderboard-list preview">
        ${leaderboard.slice(0, 5).map((user, index) => `
          <div class="leaderboard-item ${index < 3 ? 'top-' + (index + 1) : ''}">
            <span class="rank">${this.getRankMedal(index + 1)}</span>
            <img src="${Utils.safeUrl(user.photoURL, '/assets/images/default-avatar.png')}" 
                 alt="${Utils.escapeHtml(user.displayName)}" class="avatar">
            <span class="name">${Utils.escapeHtml(user.displayName)}</span>
            <span class="xp">⚡ ${Utils.formatXP(user.xp)}</span>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  /**
   * Obtenir la médaille pour un rang
   * @param {number} rank
   */
  getRankMedal(rank) {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  }
  
  /**
   * Masquer le loader initial
   */
  hideAppLoader() {
    const loader = document.getElementById('app-loader');
    if (loader) {
      loader.classList.add('fade-out');
      setTimeout(() => loader.remove(), 500);
    }
  }
  
  /**
   * Afficher l'état d'erreur
   */
  showErrorState() {
    const loader = document.getElementById('app-loader');
    if (loader) {
      loader.innerHTML = `
        <div class="error-state">
          <span class="error-icon">⚠️</span>
          <h2>Erreur de chargement</h2>
          <p>Une erreur est survenue. Veuillez rafraîchir la page.</p>
          <button class="btn btn-primary" onclick="location.reload()">
            Rafraîchir
          </button>
        </div>
      `;
    }
  }
}

// ─── Lancer l'application ───
document.addEventListener('DOMContentLoaded', () => {
  window.app = new NeoclassApp();
  window.app.init();
});

// ─── Service Worker (PWA) ───
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.log('Service Worker registration failed:', err);
    });
  });
}
