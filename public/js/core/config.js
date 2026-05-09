/**
 * ============================================================
 * 🛠️ NEOCLASS - Configuration Globale
 * ============================================================
 */

const CONFIG = {
  // ─── Application ───
  app: {
    name: 'Neoclass',
    version: '4.0.0',
    environment: 'development', // 'development' | 'production'
    debug: true
  },
  
  // ─── API Endpoints ───
  api: {
    baseUrl: '/api',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000
  },
  
  // ─── Firebase Configuration ───
  // NOTE: Ces valeurs sont des clés publiques client-side
  // La sécurité est gérée par les règles Firebase
  firebase: {
    apiKey: "AIzaSyA1_Yk3VAgpBl9p_fgJ6SibC7_DdIyJ1xI",
    authDomain: "neoclass-f07c5.firebaseapp.com",
    projectId: "neoclass-f07c5",
    storageBucket: "neoclass-f07c5.firebasestorage.app",
    messagingSenderId: "1022296169547",
    appId: "1:1022296169547:web:5c0a1da85d3e60f18d7c1f"
  },
  
  // ─── Gamification ───
  xp: {
    perLesson: 10,
    perQuiz: 25,
    perExercise: 15,
    perPerfectScore: 50,
    streakBonus: 5,
    dailyGoal: 50
  },
  
  levels: {
    baseXp: 100,
    multiplier: 1.5,
    maxLevel: 100
  },
  
  streak: {
    resetHour: 4, // 4 AM local time
    freezeDuration: 24 * 60 * 60 * 1000, // 24 hours
    maxFreeze: 2
  },
  
  // ─── Lives System ───
  lives: {
    max: 5,
    regenTime: 30 * 60 * 1000, // 30 minutes
    lossOnWrongAnswer: 1
  },
  
  // ─── UI Configuration ───
  ui: {
    defaultTheme: 'light',
    animationsEnabled: true,
    toastDuration: 4000,
    modalTransition: 300,
    sidebarBreakpoint: 1024
  },
  
  // ─── Storage Keys ───
  storage: {
    prefix: 'nc_',
    user: 'nc_user',
    theme: 'nc_theme',
    streak: 'nc_streak',
    progress: 'nc_progress',
    settings: 'nc_settings',
    cache: 'nc_cache'
  },
  
  // ─── Feature Flags ───
  features: {
    darkMode: true,
    quranNightMode: true,
    offlineMode: false,
    pushNotifications: false,
    socialFeatures: true,
    petSystem: true,
    leaderboard: true,
    achievements: true
  },
  
  // ─── Subscription Tiers ───
  subscriptions: {
    FREE: {
      name: 'Gratuit',
      maxLessonsPerDay: 5,
      hasAds: true,
      offlineAccess: false,
      premiumContent: false
    },
    STANDARD: {
      name: 'Standard',
      maxLessonsPerDay: Infinity,
      hasAds: false,
      offlineAccess: true,
      premiumContent: false
    },
    PREMIUM: {
      name: 'Premium',
      maxLessonsPerDay: Infinity,
      hasAds: false,
      offlineAccess: true,
      premiumContent: true
    }
  },
  
  // ─── Supported Countries ───
  countries: {
    GN: { name: 'Guinée', currency: 'GNF', locale: 'fr-GN' },
    ML: { name: 'Mali', currency: 'XOF', locale: 'fr-ML' },
    SN: { name: 'Sénégal', currency: 'XOF', locale: 'fr-SN' },
    CI: { name: "Côte d'Ivoire", currency: 'XOF', locale: 'fr-CI' },
    BF: { name: 'Burkina Faso', currency: 'XOF', locale: 'fr-BF' },
    NE: { name: 'Niger', currency: 'XOF', locale: 'fr-NE' }
  },
  
  // ─── Validation ───
  validation: {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^[\d\s+()-]{8,20}$/,
    password: {
      minLength: 8,
      requireUppercase: true,
      requireNumber: true
    }
  },
  
  // ─── Cache TTL (Time To Live) ───
  cache: {
    user: 5 * 60 * 1000, // 5 minutes
    courses: 15 * 60 * 1000, // 15 minutes
    lessons: 30 * 60 * 1000, // 30 minutes
    static: 24 * 60 * 60 * 1000 // 24 hours
  }
};

// ─── Freeze configuration to prevent modifications ───
Object.freeze(CONFIG);
Object.freeze(CONFIG.app);
Object.freeze(CONFIG.api);
Object.freeze(CONFIG.firebase);
Object.freeze(CONFIG.xp);
Object.freeze(CONFIG.levels);
Object.freeze(CONFIG.streak);
Object.freeze(CONFIG.lives);
Object.freeze(CONFIG.ui);
Object.freeze(CONFIG.storage);
Object.freeze(CONFIG.features);
Object.freeze(CONFIG.subscriptions);
Object.freeze(CONFIG.countries);
Object.freeze(CONFIG.validation);
Object.freeze(CONFIG.cache);

// ─── Export ───
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}

// ─── Make available globally ───
window.CONFIG = CONFIG;
