// ============================================================
// NEOCLASS MOBILE - DATA & CONSTANTS
// ============================================================

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDgng4aei5klroWYW-b5CUUPs3CjQwpje8",
  authDomain: "neoclass-73b86.firebaseapp.com",
  projectId: "neoclass-73b86",
  storageBucket: "neoclass-73b86.firebasestorage.app",
  messagingSenderId: "929829476921",
  appId: "1:929829476921:web:e1339769ec968886ae8be8",
  measurementId: "G-TMPPC3GD42"
};

// ============================================================
// GLOBAL STATE
// ============================================================
window.State = {
  user: null,
  profile: { role: 'guest' },
  currentPage: 'auth',
  pageData: {},
  lang: localStorage.getItem('neo_lang') || 'fr',
  theme: localStorage.getItem('neo_theme') || 'light',
  blueLightFilter: false,
  unreadInbox: 0,
  unreadChat: 0,
};

// ============================================================
// INTERNATIONALIZATION
// ============================================================
const i18n = {
  fr: {
    login: "Se connecter",
    signup: "S'inscrire",
    logout: "Déconnexion",
    email: "Email",
    password: "Mot de passe",
    confirmPassword: "Confirmer",
    fullName: "Nom complet",
    phoneNumber: "Téléphone",
    chooseProfile: "Choisis ton profil",
    chooseSystem: "Choisis ton système",
    student: "Élève",
    teacher: "Professeur",
    school: "École",
    parent: "Parent",
    guineaSystem: "Système guinéen 🇬🇳",
    frenchSystem: "Système français 🇫🇷",
    dashboard: "Tableau de bord",
    myCourses: "Mes cours",
    quizzes: "Quiz",
    games: "Jeux",
    quran: "Coran",
    nabecoins: "NabeCoins",
    withdrawal: "Retrait",
    settings: "Paramètres",
    social: "Réseau",
    chat: "Discussions",
    inbox: "Boîte de réception",
    profile: "Profil",
    save: "Enregistrer",
    cancel: "Annuler",
    close: "Fermer",
    delete: "Supprimer",
    edit: "Modifier",
    loading: "Chargement...",
    error: "Erreur",
    success: "Succès",
    noData: "Aucune donnée",
    offline: "Hors ligne",
    online: "En ligne",
    search: "Rechercher",
    filter: "Filtrer",
    sort: "Trier",
    back: "Retour",
  },
  en: {
    login: "Log in",
    signup: "Sign up",
    logout: "Log out",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm",
    fullName: "Full name",
    phoneNumber: "Phone",
    dashboard: "Dashboard",
    myCourses: "My courses",
    quizzes: "Quizzes",
    games: "Games",
    nabecoins: "NabeCoins",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    noData: "No data",
    close: "Close",
  },
  ar: {
    login: "دخول",
    signup: "تسجيل",
    logout: "خروج",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
  }
};

function t(key) {
  return (i18n[State.lang] && i18n[State.lang][key]) || 
         (i18n.fr && i18n.fr[key]) || key;
}

// ============================================================
// EDUCATION DATA
// ============================================================
const EDU_DATA = {
  guinea: {
    primary: ['1ère année','2ème année','3ème année','4ème année','5ème année','6ème année'],
    middle: ['7ème année','8ème année','9ème année','10ème année'],
    highschool: {
      tracks: ['Sciences mathématiques','Sciences expérimentales','Sciences sociales'],
      levels: ['11ème année','12ème année','Terminale']
    },
    subjects: {
      primary: ['Français','Mathématiques','Sciences','Histoire-Géographie','Éducation civique','Arabe'],
      middle: ['Français','Mathématiques','Physique-Chimie','Sciences naturelles','Histoire-Géographie','Anglais','Arabe'],
      'Sciences mathématiques': ['Mathématiques','Physique-Chimie','Français','Anglais','Philosophie','Informatique'],
      'Sciences expérimentales': ['Sciences naturelles','Physique-Chimie','Mathématiques','Français','Anglais','Philosophie'],
      'Sciences sociales': ['Histoire-Géographie','Philosophie','Français','Anglais','Mathématiques','Économie']
    }
  },
  france: {
    primary: ['CP','CE1','CE2','CM1','CM2'],
    middle: ['6ème','5ème','4ème','3ème'],
    highschool: {
      tracks: ['Sciences mathématiques','Sciences expérimentales','Sciences sociales'],
      levels: ['Seconde','Première','Terminale']
    },
    subjects: {
      primary: ['Français','Mathématiques','Sciences','Histoire-Géographie','EMC','Arts','EPS'],
      middle: ['Français','Mathématiques','Physique-Chimie','SVT','Histoire-Géographie','Anglais','Technologie'],
      'Sciences mathématiques': ['Mathématiques','Physique-Chimie','NSI','Français','Anglais','Philosophie'],
      'Sciences expérimentales': ['SVT','Physique-Chimie','Mathématiques','Français','Anglais','Philosophie'],
      'Sciences sociales': ['SES','Histoire-Géographie','Philosophie','Français','Anglais','Mathématiques']
    }
  }
};

// ============================================================
// QURAN SURAHS (114)
// ============================================================
const QURAN_SURAHS = [
  {num:1,name:"الفاتحة",nameEn:"Al-Fatiha",nameFr:"L'Ouverture",verses:7},
  {num:2,name:"البقرة",nameEn:"Al-Baqarah",nameFr:"La Vache",verses:286},
  {num:3,name:"آل عمران",nameEn:"Ali 'Imran",nameFr:"La Famille d'Imran",verses:200},
  {num:4,name:"النساء",nameEn:"An-Nisa",nameFr:"Les Femmes",verses:176},
  {num:5,name:"المائدة",nameEn:"Al-Ma'idah",nameFr:"La Table Servie",verses:120},
];

// ============================================================
// SUBSCRIPTION PLANS
// ============================================================
const SUBSCRIPTION_PLANS = [
  {
    id: 'free',
    name: 'Gratuit',
    price: 0,
    features: ['Cours limités', 'Quiz basiques', '1 GB stockage'],
    color: '#6c63ff'
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 50000,
    features: ['Cours illimités', 'Quiz avancés', 'Support prioritaire', '50 GB stockage'],
    color: '#fbbf24'
  },
  {
    id: 'elite',
    name: 'Elite',
    price: 100000,
    features: ['Tout Premium +', 'Cours live', 'Mentor personnel', '500 GB stockage'],
    color: '#f59e0b'
  }
];

// ============================================================
// GAMIFICATION BADGES
// ============================================================
const BADGES = [
  { id: 'first_course', name: 'Premier pas', icon: '🎯', desc: 'Suivi ton premier cours' },
  { id: 'quiz_master', name: 'Quiz Master', icon: '🧠', desc: '10 quiz réussis' },
  { id: 'streak_7', name: 'Une semaine d\'or', icon: '🔥', desc: '7 jours d\'affilée' },
  { id: 'streak_30', name: 'Champion 30j', icon: '⚡', desc: '30 jours d\'affilée' },
  { id: 'coin_collector', name: 'Collecteur', icon: '💰', desc: '1000 NabeCoins' },
  { id: 'top_student', name: 'Top Élève', icon: '🏆', desc: 'Top 1% du classement' },
];

// ============================================================
// MINI GAMES
// ============================================================
const MINI_GAMES = [
  {
    id: 'math_quiz',
    name: 'Math Attack',
    icon: '🧮',
    desc: 'Résous des calculs rapides',
    reward: 100,
    difficulty: 'medium'
  },
  {
    id: 'vocabulary',
    name: 'Vocabulary Challenge',
    icon: '📝',
    desc: 'Complète les phrases',
    reward: 80,
    difficulty: 'easy'
  },
  {
    id: 'quran_quiz',
    name: 'Quran Masters',
    icon: '📿',
    desc: 'Questions sur le Coran',
    reward: 120,
    difficulty: 'hard'
  }
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================
function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, duration);
}

function formatCurrency(value, currency = 'GNF') {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency === 'GNF' ? 'GNF' : 'EUR'
  }).format(value);
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bonjour';
  if (hour < 18) return 'Bon après-midi';
  return 'Bonsoir';
}
