// constants.js - Configuration centralisée de l'application Neoclass

export const APP_CONFIG = {
  AGENT_ID: "ag_019c854b0be873b8ad0bc77f31f0e52a",
  NOM_IA: "Darx",
  SYSTEME: "Guinéen / Franco-Arabe",
  VERSION: "4.0",
  DEFAULT_COUNTRY: "GN"
};

// ============================================================
// 👤 RÔLES UTILISATEUR
// ============================================================
export const ROLES = {
  STUDENT: 'student',
  INDEP_STUDENT: 'indep_student',
  TEACHER: 'teacher',
  INDEP_TEACHER: 'indep_teacher',
  PARENT: 'parent',
  SCHOOL: 'school',
  ADMIN: 'admin'
};

// ============================================================
// 💎 PLANS D'ABONNEMENT
// ============================================================
export const SUBSCRIPTION_PLANS = {
  FREE: 'FREE',
  STANDARD: 'STANDARD',
  PREMIUM: 'PREMIUM'
};

// ============================================================
// 🔐 NIVEAUX D'ACCÈS AU CONTENU
// ============================================================
export const ACCESS_LEVELS = {
  FREE: 'free',
  STANDARD: 'standard',
  PREMIUM: 'premium'
};

// ============================================================
// 📚 NIVEAUX SCOLAIRES (LEVELS)
// ============================================================
export const EDUCATION_LEVELS = {
  PRIMAIRE: 'primaire',
  COLLEGE: 'college',
  LYCEE: 'lycee'
};

// ============================================================
// 🏫 CLASSES GUINÉE
// ============================================================
export const NIVEAUX_GUINEE = {
  // Primaire
  'CP': 'Cours Préparatoire',
  'CE1': 'Cours Élémentaire 1',
  'CE2': 'Cours Élémentaire 2',
  'CM1': 'Cours Moyen 1',
  'CM2': 'Cours Moyen 2',
  // Collège
  '7eme': '7ème Année',
  '8eme': '8ème Année', 
  '9eme': '9ème Année',
  '10eme': '10ème Année (Seconde)',
  // Lycée
  '11eme': '11ème Année (Première)',
  '12eme': '12ème Année (Terminale)'
};

// ============================================================
// 🎓 SÉRIES DU BAC
// ============================================================
export const SERIES_BAC = {
  'SM': 'Sciences Mathématiques',
  'SE': 'Sciences Expérimentales',
  'SS': 'Sciences Sociales',
  'MT': 'Mathématiques et Techniques',
  'SH': 'Sciences Humaines'
};

// ============================================================
// 🌍 PAYS SUPPORTÉS
// ============================================================
export const COUNTRY_PROGRAMS = {
  GN: { name: 'Guinée', currency: 'GNF', language: 'fr' },
  SN: { name: 'Sénégal', currency: 'XOF', language: 'fr' },
  CI: { name: "Côte d'Ivoire", currency: 'XOF', language: 'fr' },
  ML: { name: 'Mali', currency: 'XOF', language: 'fr' },
  BF: { name: 'Burkina Faso', currency: 'XOF', language: 'fr' },
  NE: { name: 'Niger', currency: 'XOF', language: 'fr' },
  BJ: { name: 'Bénin', currency: 'XOF', language: 'fr' },
  TG: { name: 'Togo', currency: 'XOF', language: 'fr' },
  CM: { name: 'Cameroun', currency: 'XAF', language: 'fr' },
  MA: { name: 'Maroc', currency: 'MAD', language: 'fr-ar' }
};

// ============================================================
// 📅 CONFIGURATION MIGRATION AUTOMATIQUE
// ============================================================
export const MIGRATION_CONFIG = {
  MIGRATION_MONTH: 9, // Septembre (fin d'année scolaire)
  MIGRATION_DAY: 1,   // 1er du mois
  AUTO_MIGRATION_ENABLED: true
};

// ============================================================
// 🔒 HIÉRARCHIE ACADÉMIQUE STRICTE
// ============================================================
export const ACADEMIC_HIERARCHY = {
  // Structure: level → class → subject → module → lesson
  structure: ['level', 'class', 'subject', 'module', 'lesson'],
  // Champs obligatoires pour publication
  requiredFields: {
    course: ['classId', 'subjectId', 'access_level', 'countryCode', 'name', 'content'],
    module: ['classId', 'subjectId', 'access_level', 'countryCode', 'name', 'description'],
    lesson: ['moduleId', 'classId', 'subjectId', 'access_level', 'countryCode', 'name', 'content']
  }
};

// ============================================================
// 💰 TARIFICATION PAR DÉFAUT (GNF)
// ============================================================
export const DEFAULT_PRICING = {
  FREE: { monthly: 0, yearly: 0 },
  STANDARD: { monthly: 50000, yearly: 450000 },
  PREMIUM: { monthly: 150000, yearly: 1200000 }
};

// ============================================================
// 📝 MESSAGES D'ABONNEMENT
// ============================================================
export const SUBSCRIPTION_MESSAGES = {
  LOCKED_STANDARD: '🔒 Passez à Standard pour débloquer ce contenu',
  LOCKED_PREMIUM: '👑 Contenu exclusif Premium - Passez à Premium pour accéder',
  UPGRADE_SUCCESS: '✓ Abonnement mis à jour avec succès !',
  UPGRADE_ERROR: '❌ Erreur lors de la mise à jour de l\'abonnement'
};

// Messages d'encouragement pour le BAC
export const ENCOURAGEMENTS_BAC = [
  "Courage, le chemin vers l'université commence ici ! 🎓",
  "Chaque effort te rapproche du succès au BAC ! 💪",
  "Tu es sur la bonne voie, futur bachelier ! 🌟",
  "Le BAC n'est qu'une étape, tu vas y arriver ! 🚀",
  "Continue comme ça, l'excellence est à portée de main ! ✨",
  "Les grands réussissent parce qu'ils n'abandonnent jamais ! 🏆",
  "Ton avenir brillant se construit maintenant ! 🌈"
];

// ============================================================
// 🛡️ CONFIGURATION SÉCURITÉ
// ============================================================
export const SECURITY_CONFIG = {
  // Rôles ayant accès à toutes les classes
  PRIVILEGED_ROLES: ['admin', 'teacher', 'indep_teacher', 'school'],
  // Rôles étudiants (accès restreint à leur classe)
  STUDENT_ROLES: ['student', 'indep_student'],
  // Rôles pouvant publier du contenu
  PUBLISHER_ROLES: ['admin', 'teacher', 'indep_teacher'],
  // Durée de session max (ms)
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 heures
  // Max tentatives de connexion
  MAX_LOGIN_ATTEMPTS: 5
};
