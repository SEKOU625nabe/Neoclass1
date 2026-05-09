/**
 * ============================================================
 * 🔐 NEOCLASS - Module Auth
 * Authentification et gestion utilisateur
 * ============================================================
 */

class AuthService {
  constructor() {
    this.currentUser = null;
    this.listeners = new Set();
    this.redirectAfterLogin = null;
  }
  
  /**
   * Initialiser le service d'authentification
   */
  async init() {
    const firebase = window.Firebase;
    if (!firebase) {
      console.error('Firebase non initialisé');
      return;
    }
    
    // Écouter les changements d'authentification
    firebase.onAuthStateChanged((user) => {
      this.handleAuthStateChange(user);
    });
    
    // Vérifier la série au chargement
    setTimeout(() => {
      if (this.currentUser && window.Gamification) {
        window.Gamification.checkStreak(this.currentUser.uid);
      }
    }, 2000);
  }
  
  /**
   * Gérer le changement d'état d'authentification
   * @param {object} user
   */
  async handleAuthStateChange(user) {
    const previousUser = this.currentUser;
    
    if (user) {
      // Utilisateur connecté
      const firebase = window.Firebase;
      const profile = await firebase?.getUserProfile(user.uid);
      
      this.currentUser = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || profile?.displayName || 'Utilisateur',
        photoURL: user.photoURL || profile?.photoURL,
        emailVerified: user.emailVerified,
        ...profile
      };
      
      // Mettre à jour le Store
      if (window.store) {
        window.store.set('user', this.currentUser);
        window.store.set('isAuthenticated', true);
      }
      
      // Vérifier si c'est une nouvelle connexion
      if (!previousUser) {
        this.onLogin();
      }
      
    } else {
      // Utilisateur déconnecté
      this.currentUser = null;
      
      if (window.store) {
        window.store.set('user', null);
        window.store.set('isAuthenticated', false);
      }
      
      if (previousUser) {
        this.onLogout();
      }
    }
    
    // Notifier les listeners
    this.emit('authStateChanged', this.currentUser);
    
    // Mettre à jour l'interface
    this.updateAuthUI();
  }
  
  /**
   * Actions à la connexion
   */
  onLogin() {
    // Toast de bienvenue
    if (window.UI && this.currentUser) {
      window.UI.success(`Bienvenue, ${this.currentUser.displayName} ! 👋`);
    }
    
    // Vérifier la série
    if (window.Gamification && this.currentUser) {
      window.Gamification.checkStreak(this.currentUser.uid);
      window.Gamification.checkAchievements(this.currentUser.uid, 'session_start');
    }
    
    // Redirection si prévue
    if (this.redirectAfterLogin) {
      if (window.router) {
        window.router.navigate(this.redirectAfterLogin);
      }
      this.redirectAfterLogin = null;
    }
    
    this.emit('login', this.currentUser);
  }
  
  /**
   * Actions à la déconnexion
   */
  onLogout() {
    if (window.UI) {
      window.UI.info('Vous êtes déconnecté');
    }
    
    // Rediriger vers l'accueil
    if (window.router) {
      window.router.navigate('/');
    }
    
    this.emit('logout');
  }
  
  // ═══════════════════════════════════════════════════════════
  // AUTHENTIFICATION
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Inscription
   * @param {object} data
   */
  async signUp(data) {
    const firebase = window.Firebase;
    if (!firebase) throw new Error('Firebase non disponible');
    
    const { email, password, displayName, phone, country } = data;
    
    try {
      window.UI?.showLoader('Création du compte...');
      
      // Créer le compte Firebase
      const result = await firebase.signUp(email, password);
      
      // Créer le profil utilisateur
      const profile = {
        displayName: displayName || email.split('@')[0],
        email,
        phone: phone || '',
        country: country || 'GN',
        xp: 0,
        level: 1,
        streak: 0,
        maxStreak: 0,
        achievements: [],
        subscription: 'free',
        coins: 0,
        createdAt: new Date(),
        isPublicProfile: true
      };
      
      await firebase.updateDoc('users', result.uid, profile);
      
      // XP de bienvenue
      if (window.Gamification) {
        await window.Gamification.addXP(result.uid, 100, 'welcome');
      }
      
      window.UI?.hideLoader();
      window.UI?.success('Compte créé avec succès ! 🎉');
      
      return result;
      
    } catch (error) {
      window.UI?.hideLoader();
      
      let message = 'Erreur lors de l\'inscription';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          message = 'Cette adresse email est déjà utilisée';
          break;
        case 'auth/invalid-email':
          message = 'Adresse email invalide';
          break;
        case 'auth/weak-password':
          message = 'Le mot de passe est trop faible (minimum 6 caractères)';
          break;
      }
      
      window.UI?.error(message);
      throw error;
    }
  }
  
  /**
   * Connexion par email/password
   * @param {string} email
   * @param {string} password
   */
  async signIn(email, password) {
    const firebase = window.Firebase;
    if (!firebase) throw new Error('Firebase non disponible');
    
    try {
      window.UI?.showLoader('Connexion...');
      
      const result = await firebase.signIn(email, password);
      
      window.UI?.hideLoader();
      
      return result;
      
    } catch (error) {
      window.UI?.hideLoader();
      
      let message = 'Erreur de connexion';
      
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          message = 'Email ou mot de passe incorrect';
          break;
        case 'auth/invalid-email':
          message = 'Adresse email invalide';
          break;
        case 'auth/user-disabled':
          message = 'Ce compte a été désactivé';
          break;
        case 'auth/too-many-requests':
          message = 'Trop de tentatives. Réessayez plus tard';
          break;
      }
      
      window.UI?.error(message);
      throw error;
    }
  }
  
  /**
   * Connexion avec Google
   */
  async signInWithGoogle() {
    const firebase = window.Firebase;
    if (!firebase) throw new Error('Firebase non disponible');
    
    try {
      window.UI?.showLoader('Connexion avec Google...');
      
      const result = await firebase.signInWithGoogle();
      
      // Vérifier si c'est un nouvel utilisateur
      const profile = await firebase.getUserProfile(result.uid);
      
      if (!profile) {
        // Créer le profil pour les nouveaux utilisateurs Google
        const newProfile = {
          displayName: result.displayName || result.email.split('@')[0],
          email: result.email,
          photoURL: result.photoURL,
          country: 'GN',
          xp: 100,
          level: 1,
          streak: 0,
          maxStreak: 0,
          achievements: [],
          subscription: 'free',
          coins: 0,
          createdAt: new Date(),
          isPublicProfile: true
        };
        
        await firebase.updateDoc('users', result.uid, newProfile);
      }
      
      window.UI?.hideLoader();
      
      return result;
      
    } catch (error) {
      window.UI?.hideLoader();
      
      if (error.code !== 'auth/popup-closed-by-user') {
        window.UI?.error('Erreur de connexion Google');
      }
      
      throw error;
    }
  }
  
  /**
   * Déconnexion
   */
  async signOut() {
    const firebase = window.Firebase;
    if (!firebase) return;
    
    try {
      await firebase.signOut();
    } catch (error) {
      console.error('Erreur déconnexion:', error);
      window.UI?.error('Erreur lors de la déconnexion');
    }
  }
  
  /**
   * Réinitialisation du mot de passe
   * @param {string} email
   */
  async resetPassword(email) {
    const firebase = window.Firebase;
    if (!firebase) throw new Error('Firebase non disponible');
    
    try {
      window.UI?.showLoader('Envoi de l\'email...');
      
      await firebase.resetPassword(email);
      
      window.UI?.hideLoader();
      window.UI?.success('Email de réinitialisation envoyé ! 📧');
      
    } catch (error) {
      window.UI?.hideLoader();
      
      let message = 'Erreur lors de l\'envoi';
      
      if (error.code === 'auth/user-not-found') {
        message = 'Aucun compte associé à cet email';
      }
      
      window.UI?.error(message);
      throw error;
    }
  }
  
  // ═══════════════════════════════════════════════════════════
  // PROFIL
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Mettre à jour le profil
   * @param {object} data
   */
  async updateProfile(data) {
    const firebase = window.Firebase;
    if (!firebase || !this.currentUser) {
      throw new Error('Non authentifié');
    }
    
    try {
      window.UI?.showLoader('Mise à jour...');
      
      await firebase.updateDoc('users', this.currentUser.uid, {
        ...data,
        updatedAt: new Date()
      });
      
      // Mettre à jour localement
      this.currentUser = { ...this.currentUser, ...data };
      
      if (window.store) {
        window.store.set('user', this.currentUser);
      }
      
      window.UI?.hideLoader();
      window.UI?.success('Profil mis à jour !');
      
      this.emit('profileUpdated', this.currentUser);
      
    } catch (error) {
      window.UI?.hideLoader();
      window.UI?.error('Erreur lors de la mise à jour');
      throw error;
    }
  }
  
  /**
   * Uploader une photo de profil
   * @param {File} file
   */
  async uploadProfilePhoto(file) {
    const firebase = window.Firebase;
    if (!firebase || !this.currentUser) {
      throw new Error('Non authentifié');
    }
    
    // Valider le fichier
    if (!file.type.startsWith('image/')) {
      window.UI?.error('Veuillez sélectionner une image');
      return null;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      window.UI?.error('L\'image ne doit pas dépasser 5 Mo');
      return null;
    }
    
    try {
      window.UI?.showLoader('Upload de la photo...');
      
      const path = `users/${this.currentUser.uid}/profile.${file.name.split('.').pop()}`;
      const photoURL = await firebase.uploadFile(file, path);
      
      // Mettre à jour le profil
      await this.updateProfile({ photoURL });
      
      window.UI?.hideLoader();
      
      return photoURL;
      
    } catch (error) {
      window.UI?.hideLoader();
      window.UI?.error('Erreur lors de l\'upload');
      throw error;
    }
  }
  
  /**
   * Supprimer le compte
   */
  async deleteAccount() {
    const firebase = window.Firebase;
    if (!firebase || !this.currentUser) {
      throw new Error('Non authentifié');
    }
    
    const confirmed = await window.UI?.confirm(
      'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.',
      { title: 'Supprimer le compte', danger: true }
    );
    
    if (!confirmed) return false;
    
    try {
      window.UI?.showLoader('Suppression du compte...');
      
      // Supprimer les données utilisateur
      await firebase.deleteDoc('users', this.currentUser.uid);
      
      // Supprimer les progressions
      // TODO: Supprimer toutes les données liées
      
      // Supprimer le compte Firebase Auth
      // Note: Nécessite une ré-authentification récente
      
      window.UI?.hideLoader();
      window.UI?.success('Compte supprimé');
      
      return true;
      
    } catch (error) {
      window.UI?.hideLoader();
      window.UI?.error('Erreur lors de la suppression');
      throw error;
    }
  }
  
  // ═══════════════════════════════════════════════════════════
  // UI UPDATES
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Mettre à jour l'interface selon l'état d'auth
   */
  updateAuthUI() {
    const isLoggedIn = !!this.currentUser;
    
    // Éléments à afficher/cacher
    document.querySelectorAll('[data-auth="logged-in"]').forEach(el => {
      el.style.display = isLoggedIn ? '' : 'none';
    });
    
    document.querySelectorAll('[data-auth="logged-out"]').forEach(el => {
      el.style.display = isLoggedIn ? 'none' : '';
    });
    
    // Mettre à jour les infos utilisateur
    if (this.currentUser) {
      document.querySelectorAll('[data-user="name"]').forEach(el => {
        el.textContent = this.currentUser.displayName;
      });
      
      document.querySelectorAll('[data-user="email"]').forEach(el => {
        el.textContent = this.currentUser.email;
      });
      
      document.querySelectorAll('[data-user="avatar"]').forEach(el => {
        if (el.tagName === 'IMG') {
          el.src = this.currentUser.photoURL || '/assets/images/default-avatar.png';
          el.alt = this.currentUser.displayName;
        }
      });
      
      document.querySelectorAll('[data-user="xp"]').forEach(el => {
        el.textContent = Utils?.formatXP?.(this.currentUser.xp) || this.currentUser.xp;
      });
      
      document.querySelectorAll('[data-user="level"]').forEach(el => {
        el.textContent = this.currentUser.level || 1;
      });
      
      document.querySelectorAll('[data-user="streak"]').forEach(el => {
        el.textContent = this.currentUser.streak || 0;
      });
    }
  }
  
  /**
   * Afficher le formulaire de connexion
   */
  showLoginForm() {
    const content = `
      <form id="login-form" class="auth-form">
        <div class="form-group">
          <label for="login-email">Email</label>
          <input type="email" id="login-email" class="form-input" required 
                 placeholder="votre@email.com">
        </div>
        
        <div class="form-group">
          <label for="login-password">Mot de passe</label>
          <input type="password" id="login-password" class="form-input" required 
                 placeholder="••••••••">
        </div>
        
        <button type="submit" class="btn btn-primary btn-block">
          Se connecter
        </button>
        
        <div class="auth-divider">
          <span>ou</span>
        </div>
        
        <button type="button" id="google-login" class="btn btn-google btn-block">
          <svg class="google-icon" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continuer avec Google
        </button>
        
        <p class="auth-links">
          <a href="#" id="forgot-password-link">Mot de passe oublié ?</a>
          <span>•</span>
          <a href="#" id="signup-link">Créer un compte</a>
        </p>
      </form>
    `;
    
    const modalId = window.UI?.modal({
      title: 'Connexion',
      content,
      size: 'small',
      className: 'auth-modal'
    });
    
    // Event listeners
    setTimeout(() => {
      const form = document.getElementById('login-form');
      const googleBtn = document.getElementById('google-login');
      const forgotLink = document.getElementById('forgot-password-link');
      const signupLink = document.getElementById('signup-link');
      
      form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        try {
          await this.signIn(email, password);
          window.UI?.closeModal(modalId);
        } catch (error) {
          // Erreur gérée dans signIn
        }
      });
      
      googleBtn?.addEventListener('click', async () => {
        try {
          await this.signInWithGoogle();
          window.UI?.closeModal(modalId);
        } catch (error) {
          // Erreur gérée dans signInWithGoogle
        }
      });
      
      forgotLink?.addEventListener('click', (e) => {
        e.preventDefault();
        window.UI?.closeModal(modalId);
        this.showForgotPasswordForm();
      });
      
      signupLink?.addEventListener('click', (e) => {
        e.preventDefault();
        window.UI?.closeModal(modalId);
        this.showSignupForm();
      });
    }, 100);
  }
  
  /**
   * Afficher le formulaire d'inscription
   */
  showSignupForm() {
    const content = `
      <form id="signup-form" class="auth-form">
        <div class="form-group">
          <label for="signup-name">Nom complet</label>
          <input type="text" id="signup-name" class="form-input" required 
                 placeholder="Votre nom">
        </div>
        
        <div class="form-group">
          <label for="signup-email">Email</label>
          <input type="email" id="signup-email" class="form-input" required 
                 placeholder="votre@email.com">
        </div>
        
        <div class="form-group">
          <label for="signup-phone">Téléphone</label>
          <input type="tel" id="signup-phone" class="form-input" 
                 placeholder="+224 XXX XXX XXX">
        </div>
        
        <div class="form-group">
          <label for="signup-country">Pays</label>
          <select id="signup-country" class="form-select">
            <option value="GN" selected>🇬🇳 Guinée</option>
            <option value="SN">🇸🇳 Sénégal</option>
            <option value="CI">🇨🇮 Côte d'Ivoire</option>
            <option value="ML">🇲🇱 Mali</option>
            <option value="BF">🇧🇫 Burkina Faso</option>
            <option value="FR">🇫🇷 France</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="signup-password">Mot de passe</label>
          <input type="password" id="signup-password" class="form-input" required 
                 placeholder="Minimum 8 caractères">
          <small class="form-hint">Au moins 8 caractères, une majuscule et un chiffre</small>
        </div>
        
        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" id="signup-terms" required>
            J'accepte les <a href="/terms" target="_blank">conditions d'utilisation</a>
          </label>
        </div>
        
        <button type="submit" class="btn btn-primary btn-block">
          Créer mon compte
        </button>
        
        <p class="auth-links">
          Déjà un compte ? <a href="#" id="login-link">Se connecter</a>
        </p>
      </form>
    `;
    
    const modalId = window.UI?.modal({
      title: 'Créer un compte',
      content,
      size: 'small',
      className: 'auth-modal'
    });
    
    setTimeout(() => {
      const form = document.getElementById('signup-form');
      const loginLink = document.getElementById('login-link');
      
      form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const data = {
          displayName: document.getElementById('signup-name').value,
          email: document.getElementById('signup-email').value,
          phone: document.getElementById('signup-phone').value,
          country: document.getElementById('signup-country').value,
          password: document.getElementById('signup-password').value
        };
        
        // Valider le mot de passe
        const validation = Utils?.validatePassword?.(data.password);
        if (validation && !validation.valid) {
          window.UI?.error(validation.errors.join(', '));
          return;
        }
        
        try {
          await this.signUp(data);
          window.UI?.closeModal(modalId);
        } catch (error) {
          // Erreur gérée dans signUp
        }
      });
      
      loginLink?.addEventListener('click', (e) => {
        e.preventDefault();
        window.UI?.closeModal(modalId);
        this.showLoginForm();
      });
    }, 100);
  }
  
  /**
   * Afficher le formulaire mot de passe oublié
   */
  showForgotPasswordForm() {
    const content = `
      <form id="forgot-form" class="auth-form">
        <p>Entrez votre email pour recevoir un lien de réinitialisation.</p>
        
        <div class="form-group">
          <label for="forgot-email">Email</label>
          <input type="email" id="forgot-email" class="form-input" required 
                 placeholder="votre@email.com">
        </div>
        
        <button type="submit" class="btn btn-primary btn-block">
          Envoyer le lien
        </button>
        
        <p class="auth-links">
          <a href="#" id="back-to-login">Retour à la connexion</a>
        </p>
      </form>
    `;
    
    const modalId = window.UI?.modal({
      title: 'Mot de passe oublié',
      content,
      size: 'small',
      className: 'auth-modal'
    });
    
    setTimeout(() => {
      const form = document.getElementById('forgot-form');
      const backLink = document.getElementById('back-to-login');
      
      form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('forgot-email').value;
        
        try {
          await this.resetPassword(email);
          window.UI?.closeModal(modalId);
        } catch (error) {
          // Erreur gérée dans resetPassword
        }
      });
      
      backLink?.addEventListener('click', (e) => {
        e.preventDefault();
        window.UI?.closeModal(modalId);
        this.showLoginForm();
      });
    }, 100);
  }
  
  // ═══════════════════════════════════════════════════════════
  // GUARDS & UTILITIES
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Vérifier si l'utilisateur est connecté
   */
  isAuthenticated() {
    return !!this.currentUser;
  }
  
  /**
   * Vérifier si l'utilisateur est admin
   */
  isAdmin() {
    return this.currentUser?.role === 'admin' || this.currentUser?.isAdmin === true;
  }
  
  /**
   * Vérifier si l'utilisateur a un abonnement premium
   */
  isPremium() {
    return ['premium', 'pro', 'enterprise'].includes(this.currentUser?.subscription);
  }
  
  /**
   * Obtenir l'utilisateur actuel
   */
  getUser() {
    return this.currentUser;
  }
  
  /**
   * Définir la redirection après connexion
   * @param {string} path
   */
  setRedirectAfterLogin(path) {
    this.redirectAfterLogin = path;
  }
  
  /**
   * Émettre un événement
   * @param {string} event
   * @param {*} data
   */
  emit(event, data) {
    this.listeners.forEach(listener => {
      if (listener.event === event) {
        listener.callback(data);
      }
    });
    
    window.dispatchEvent(new CustomEvent(`auth:${event}`, { detail: data }));
  }
  
  /**
   * S'abonner à un événement
   * @param {string} event
   * @param {function} callback
   */
  on(event, callback) {
    const listener = { event, callback };
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

// ─── Instance globale ───
window.Auth = new AuthService();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AuthService;
}
