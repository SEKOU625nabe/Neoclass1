// ============================================================
// 📚 ACADEMIC STRUCTURE - Structure académique stricte
// Hiérarchie: Level → Class → Subject → Module → Lesson
// ============================================================

const express = require('express');
const router = express.Router();

// ============================================================
// 🌍 CONFIGURATION MULTI-PAYS
// ============================================================
const COUNTRY_PROGRAMS = {
  GN: {
    code: 'GN',
    name: 'Guinée',
    currency: 'GNF',
    language: 'fr',
    academicSystem: 'français'
  },
  SN: {
    code: 'SN',
    name: 'Sénégal',
    currency: 'XOF',
    language: 'fr',
    academicSystem: 'français'
  },
  CI: {
    code: 'CI',
    name: "Côte d'Ivoire",
    currency: 'XOF',
    language: 'fr',
    academicSystem: 'français'
  },
  ML: {
    code: 'ML',
    name: 'Mali',
    currency: 'XOF',
    language: 'fr',
    academicSystem: 'français'
  },
  BF: {
    code: 'BF',
    name: 'Burkina Faso',
    currency: 'XOF',
    language: 'fr',
    academicSystem: 'français'
  },
  NE: {
    code: 'NE',
    name: 'Niger',
    currency: 'XOF',
    language: 'fr',
    academicSystem: 'français'
  },
  BJ: {
    code: 'BJ',
    name: 'Bénin',
    currency: 'XOF',
    language: 'fr',
    academicSystem: 'français'
  },
  TG: {
    code: 'TG',
    name: 'Togo',
    currency: 'XOF',
    language: 'fr',
    academicSystem: 'français'
  },
  CM: {
    code: 'CM',
    name: 'Cameroun',
    currency: 'XAF',
    language: 'fr',
    academicSystem: 'bilingue'
  },
  MA: {
    code: 'MA',
    name: 'Maroc',
    currency: 'MAD',
    language: 'fr-ar',
    academicSystem: 'franco-arabe'
  }
};

// ============================================================
// 📊 NIVEAUX SCOLAIRES (LEVELS)
// ============================================================
const EDUCATION_LEVELS = {
  primaire: {
    id: 'primaire',
    name: 'Primaire',
    order: 1,
    description: 'Enseignement primaire (CP à CM2)',
    ageRange: '6-11 ans',
    classes: ['CP', 'CE1', 'CE2', 'CM1', 'CM2']
  },
  college: {
    id: 'college',
    name: 'Collège',
    order: 2,
    description: 'Enseignement secondaire premier cycle',
    ageRange: '12-15 ans',
    classes: ['6eme', '7eme', '8eme', '9eme']
  },
  lycee: {
    id: 'lycee',
    name: 'Lycée',
    order: 3,
    description: 'Enseignement secondaire second cycle',
    ageRange: '16-18 ans',
    classes: ['10eme', '11eme', '12eme']
  }
};

// ============================================================
// 🏫 CLASSES PAR NIVEAU ET PAYS
// ============================================================
const CLASSES_BY_COUNTRY = {
  GN: { // Guinée
    primaire: [
      { id: 'CP', name: 'Cours Préparatoire', level: 'primaire', order: 1 },
      { id: 'CE1', name: 'Cours Élémentaire 1', level: 'primaire', order: 2 },
      { id: 'CE2', name: 'Cours Élémentaire 2', level: 'primaire', order: 3 },
      { id: 'CM1', name: 'Cours Moyen 1', level: 'primaire', order: 4 },
      { id: 'CM2', name: 'Cours Moyen 2', level: 'primaire', order: 5 }
    ],
    college: [
      { id: '7eme', name: '7ème Année', level: 'college', order: 6 },
      { id: '8eme', name: '8ème Année', level: 'college', order: 7 },
      { id: '9eme', name: '9ème Année', level: 'college', order: 8 },
      { id: '10eme', name: '10ème Année (Seconde)', level: 'college', order: 9 }
    ],
    lycee: [
      { id: '11eme', name: '11ème Année (Première)', level: 'lycee', order: 10, hasSeries: true },
      { id: '12eme', name: '12ème Année (Terminale)', level: 'lycee', order: 11, hasSeries: true }
    ]
  },
  // Configuration par défaut pour autres pays (système français standard)
  DEFAULT: {
    primaire: [
      { id: 'CP', name: 'Cours Préparatoire', level: 'primaire', order: 1 },
      { id: 'CE1', name: 'Cours Élémentaire 1', level: 'primaire', order: 2 },
      { id: 'CE2', name: 'Cours Élémentaire 2', level: 'primaire', order: 3 },
      { id: 'CM1', name: 'Cours Moyen 1', level: 'primaire', order: 4 },
      { id: 'CM2', name: 'Cours Moyen 2', level: 'primaire', order: 5 }
    ],
    college: [
      { id: '6eme', name: 'Sixième', level: 'college', order: 6 },
      { id: '5eme', name: 'Cinquième', level: 'college', order: 7 },
      { id: '4eme', name: 'Quatrième', level: 'college', order: 8 },
      { id: '3eme', name: 'Troisième', level: 'college', order: 9 }
    ],
    lycee: [
      { id: 'seconde', name: 'Seconde', level: 'lycee', order: 10 },
      { id: 'premiere', name: 'Première', level: 'lycee', order: 11, hasSeries: true },
      { id: 'terminale', name: 'Terminale', level: 'lycee', order: 12, hasSeries: true }
    ]
  }
};

// ============================================================
// 📖 MATIÈRES PAR CLASSE
// ============================================================
const SUBJECTS_BY_CLASS = {
  // ====== PRIMAIRE ======
  CP: [
    { id: 'francais_cp', name: 'Français', icon: '📝', color: '#3b82f6' },
    { id: 'maths_cp', name: 'Mathématiques', icon: '🔢', color: '#10b981' },
    { id: 'eveil_cp', name: 'Éveil', icon: '🌍', color: '#f59e0b' }
  ],
  CE1: [
    { id: 'francais_ce1', name: 'Français', icon: '📝', color: '#3b82f6' },
    { id: 'maths_ce1', name: 'Mathématiques', icon: '🔢', color: '#10b981' },
    { id: 'eveil_ce1', name: 'Éveil', icon: '🌍', color: '#f59e0b' },
    { id: 'arabe_ce1', name: 'Arabe', icon: '🕌', color: '#8b5cf6' }
  ],
  CE2: [
    { id: 'francais_ce2', name: 'Français', icon: '📝', color: '#3b82f6' },
    { id: 'maths_ce2', name: 'Mathématiques', icon: '🔢', color: '#10b981' },
    { id: 'sciences_ce2', name: 'Sciences', icon: '🔬', color: '#ef4444' },
    { id: 'histoire_geo_ce2', name: 'Histoire-Géographie', icon: '🌍', color: '#f59e0b' },
    { id: 'arabe_ce2', name: 'Arabe', icon: '🕌', color: '#8b5cf6' }
  ],
  CM1: [
    { id: 'francais_cm1', name: 'Français', icon: '📝', color: '#3b82f6' },
    { id: 'maths_cm1', name: 'Mathématiques', icon: '🔢', color: '#10b981' },
    { id: 'sciences_cm1', name: 'Sciences', icon: '🔬', color: '#ef4444' },
    { id: 'histoire_geo_cm1', name: 'Histoire-Géographie', icon: '🌍', color: '#f59e0b' },
    { id: 'arabe_cm1', name: 'Arabe', icon: '🕌', color: '#8b5cf6' }
  ],
  CM2: [
    { id: 'francais_cm2', name: 'Français', icon: '📝', color: '#3b82f6' },
    { id: 'maths_cm2', name: 'Mathématiques', icon: '🔢', color: '#10b981' },
    { id: 'sciences_cm2', name: 'Sciences', icon: '🔬', color: '#ef4444' },
    { id: 'histoire_geo_cm2', name: 'Histoire-Géographie', icon: '🌍', color: '#f59e0b' },
    { id: 'arabe_cm2', name: 'Arabe', icon: '🕌', color: '#8b5cf6' },
    { id: 'anglais_cm2', name: 'Anglais', icon: '🇬🇧', color: '#ec4899' }
  ],
  
  // ====== COLLÈGE ======
  '7eme': [
    { id: 'francais_7', name: 'Français', icon: '📝', color: '#3b82f6' },
    { id: 'maths_7', name: 'Mathématiques', icon: '🔢', color: '#10b981' },
    { id: 'physique_chimie_7', name: 'Physique-Chimie', icon: '⚗️', color: '#ef4444' },
    { id: 'svt_7', name: 'Sciences de la Vie et de la Terre', icon: '🧬', color: '#22c55e' },
    { id: 'histoire_geo_7', name: 'Histoire-Géographie', icon: '🌍', color: '#f59e0b' },
    { id: 'anglais_7', name: 'Anglais', icon: '🇬🇧', color: '#ec4899' },
    { id: 'arabe_7', name: 'Arabe', icon: '🕌', color: '#8b5cf6' },
    { id: 'education_civique_7', name: 'Éducation Civique', icon: '🏛️', color: '#6366f1' }
  ],
  '8eme': [
    { id: 'francais_8', name: 'Français', icon: '📝', color: '#3b82f6' },
    { id: 'maths_8', name: 'Mathématiques', icon: '🔢', color: '#10b981' },
    { id: 'physique_chimie_8', name: 'Physique-Chimie', icon: '⚗️', color: '#ef4444' },
    { id: 'svt_8', name: 'Sciences de la Vie et de la Terre', icon: '🧬', color: '#22c55e' },
    { id: 'histoire_geo_8', name: 'Histoire-Géographie', icon: '🌍', color: '#f59e0b' },
    { id: 'anglais_8', name: 'Anglais', icon: '🇬🇧', color: '#ec4899' },
    { id: 'arabe_8', name: 'Arabe', icon: '🕌', color: '#8b5cf6' },
    { id: 'education_civique_8', name: 'Éducation Civique', icon: '🏛️', color: '#6366f1' }
  ],
  '9eme': [
    { id: 'francais_9', name: 'Français', icon: '📝', color: '#3b82f6' },
    { id: 'maths_9', name: 'Mathématiques', icon: '🔢', color: '#10b981' },
    { id: 'physique_chimie_9', name: 'Physique-Chimie', icon: '⚗️', color: '#ef4444' },
    { id: 'svt_9', name: 'Sciences de la Vie et de la Terre', icon: '🧬', color: '#22c55e' },
    { id: 'histoire_geo_9', name: 'Histoire-Géographie', icon: '🌍', color: '#f59e0b' },
    { id: 'anglais_9', name: 'Anglais', icon: '🇬🇧', color: '#ec4899' },
    { id: 'arabe_9', name: 'Arabe', icon: '🕌', color: '#8b5cf6' },
    { id: 'education_civique_9', name: 'Éducation Civique', icon: '🏛️', color: '#6366f1' }
  ],
  '10eme': [
    { id: 'francais_10', name: 'Français', icon: '📝', color: '#3b82f6' },
    { id: 'maths_10', name: 'Mathématiques', icon: '🔢', color: '#10b981' },
    { id: 'physique_chimie_10', name: 'Physique-Chimie', icon: '⚗️', color: '#ef4444' },
    { id: 'svt_10', name: 'Sciences de la Vie et de la Terre', icon: '🧬', color: '#22c55e' },
    { id: 'histoire_geo_10', name: 'Histoire-Géographie', icon: '🌍', color: '#f59e0b' },
    { id: 'anglais_10', name: 'Anglais', icon: '🇬🇧', color: '#ec4899' },
    { id: 'philosophie_10', name: 'Philosophie', icon: '🤔', color: '#8b5cf6' },
    { id: 'arabe_10', name: 'Arabe', icon: '🕌', color: '#a855f7' }
  ],
  
  // ====== LYCÉE ======
  '11eme': [
    { id: 'francais_11', name: 'Français', icon: '📝', color: '#3b82f6' },
    { id: 'maths_11', name: 'Mathématiques', icon: '🔢', color: '#10b981' },
    { id: 'physique_chimie_11', name: 'Physique-Chimie', icon: '⚗️', color: '#ef4444' },
    { id: 'svt_11', name: 'Sciences de la Vie et de la Terre', icon: '🧬', color: '#22c55e' },
    { id: 'histoire_geo_11', name: 'Histoire-Géographie', icon: '🌍', color: '#f59e0b' },
    { id: 'anglais_11', name: 'Anglais', icon: '🇬🇧', color: '#ec4899' },
    { id: 'philosophie_11', name: 'Philosophie', icon: '🤔', color: '#8b5cf6' },
    { id: 'arabe_11', name: 'Arabe', icon: '🕌', color: '#a855f7' }
  ],
  '12eme': [
    { id: 'francais_12', name: 'Français', icon: '📝', color: '#3b82f6' },
    { id: 'maths_12', name: 'Mathématiques', icon: '🔢', color: '#10b981' },
    { id: 'physique_chimie_12', name: 'Physique-Chimie', icon: '⚗️', color: '#ef4444' },
    { id: 'svt_12', name: 'Sciences de la Vie et de la Terre', icon: '🧬', color: '#22c55e' },
    { id: 'histoire_geo_12', name: 'Histoire-Géographie', icon: '🌍', color: '#f59e0b' },
    { id: 'anglais_12', name: 'Anglais', icon: '🇬🇧', color: '#ec4899' },
    { id: 'philosophie_12', name: 'Philosophie', icon: '🤔', color: '#8b5cf6' },
    { id: 'arabe_12', name: 'Arabe', icon: '🕌', color: '#a855f7' }
  ]
};

// Séries du Baccalauréat
const BAC_SERIES = {
  SM: { id: 'SM', name: 'Sciences Mathématiques', subjects: ['maths', 'physique_chimie'] },
  SE: { id: 'SE', name: 'Sciences Expérimentales', subjects: ['svt', 'physique_chimie'] },
  SS: { id: 'SS', name: 'Sciences Sociales', subjects: ['histoire_geo', 'philosophie'] },
  MT: { id: 'MT', name: 'Mathématiques et Techniques', subjects: ['maths', 'technologie'] },
  SH: { id: 'SH', name: 'Sciences Humaines', subjects: ['philosophie', 'histoire_geo'] }
};

// ============================================================
// 📦 STRUCTURE MODULE
// ============================================================
/**
 * Structure d'un module
 * {
 *   id: string,
 *   subjectId: string,          // Lien obligatoire avec matière
 *   classId: string,            // Lien obligatoire avec classe
 *   countryCode: string,        // Code pays
 *   name: string,
 *   description: string,
 *   order: number,
 *   lessons: Lesson[],
 *   access_level: 'free' | 'standard' | 'premium',
 *   status: 'draft' | 'published' | 'archived',
 *   createdAt: Date,
 *   updatedAt: Date,
 *   createdBy: string           // ID du créateur (prof/admin)
 * }
 */

// ============================================================
// 📄 STRUCTURE LESSON
// ============================================================
/**
 * Structure d'une leçon
 * {
 *   id: string,
 *   moduleId: string,           // Lien obligatoire avec module
 *   subjectId: string,          // Lien obligatoire avec matière
 *   classId: string,            // Lien obligatoire avec classe
 *   countryCode: string,        // Code pays
 *   name: string,
 *   content: string,            // Contenu HTML/Markdown
 *   summary: string,            // Résumé pour preview
 *   videoUrl: string,           // URL vidéo optionnel
 *   duration: number,           // Durée estimée en minutes
 *   order: number,
 *   access_level: 'free' | 'standard' | 'premium',
 *   exercises: Exercise[],
 *   status: 'draft' | 'published' | 'archived',
 *   createdAt: Date,
 *   updatedAt: Date,
 *   createdBy: string
 * }
 */

// ============================================================
// 🔧 SERVICE ACADÉMIQUE
// ============================================================
const AcademicService = {
  /**
   * Obtenir les classes pour un pays et niveau donné
   */
  getClassesByCountryAndLevel(countryCode, levelId) {
    const countryClasses = CLASSES_BY_COUNTRY[countryCode] || CLASSES_BY_COUNTRY.DEFAULT;
    return countryClasses[levelId] || [];
  },

  /**
   * Obtenir toutes les classes pour un pays
   */
  getAllClassesByCountry(countryCode) {
    const countryClasses = CLASSES_BY_COUNTRY[countryCode] || CLASSES_BY_COUNTRY.DEFAULT;
    const allClasses = [];
    
    Object.keys(countryClasses).forEach(level => {
      allClasses.push(...countryClasses[level]);
    });
    
    return allClasses.sort((a, b) => a.order - b.order);
  },

  /**
   * Obtenir les matières pour une classe donnée
   */
  getSubjectsByClass(classId) {
    return SUBJECTS_BY_CLASS[classId] || [];
  },

  /**
   * Vérifier si une matière appartient à une classe
   */
  isSubjectInClass(subjectId, classId) {
    const subjects = SUBJECTS_BY_CLASS[classId] || [];
    return subjects.some(s => s.id === subjectId);
  },

  /**
   * Obtenir le niveau (level) d'une classe
   */
  getLevelForClass(classId, countryCode = 'GN') {
    const countryClasses = CLASSES_BY_COUNTRY[countryCode] || CLASSES_BY_COUNTRY.DEFAULT;
    
    for (const level of Object.keys(countryClasses)) {
      const classes = countryClasses[level];
      if (classes.some(c => c.id === classId)) {
        return EDUCATION_LEVELS[level];
      }
    }
    return null;
  },

  /**
   * Obtenir la classe suivante (pour promotion)
   */
  getNextClass(currentClassId, countryCode = 'GN') {
    const allClasses = this.getAllClassesByCountry(countryCode);
    const currentIndex = allClasses.findIndex(c => c.id === currentClassId);
    
    if (currentIndex === -1 || currentIndex >= allClasses.length - 1) {
      return null; // Classe non trouvée ou dernière classe
    }
    
    return allClasses[currentIndex + 1];
  },

  /**
   * Valider la structure académique d'un contenu
   */
  validateAcademicStructure(content) {
    const errors = [];

    if (!content.classId) {
      errors.push('La classe est obligatoire');
    }

    if (!content.subjectId) {
      errors.push('La matière est obligatoire');
    }

    if (content.classId && content.subjectId) {
      if (!this.isSubjectInClass(content.subjectId, content.classId)) {
        errors.push(`La matière ${content.subjectId} n'appartient pas à la classe ${content.classId}`);
      }
    }

    if (!content.access_level || !['free', 'standard', 'premium'].includes(content.access_level)) {
      errors.push('Le niveau d\'accès est obligatoire (free, standard, premium)');
    }

    if (!content.countryCode) {
      errors.push('Le code pays est obligatoire');
    } else if (!COUNTRY_PROGRAMS[content.countryCode]) {
      errors.push(`Code pays invalide: ${content.countryCode}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

// ============================================================
// 🔄 SERVICE DE MIGRATION DE CLASSE
// ============================================================
const ClassMigrationService = {
  /**
   * Configuration de la migration
   */
  config: {
    migrationMonth: 9,  // Septembre (fin d'année scolaire)
    migrationDay: 1,    // 1er du mois
    autoMigrationEnabled: true
  },

  /**
   * Vérifier si c'est le moment de migrer
   */
  isMigrationTime() {
    const now = new Date();
    return now.getMonth() + 1 === this.config.migrationMonth && 
           now.getDate() === this.config.migrationDay;
  },

  /**
   * Migrer un élève vers la classe supérieure
   */
  async migrateStudent(student, db) {
    const currentClass = student.classId;
    const countryCode = student.countryCode || 'GN';
    
    const nextClass = AcademicService.getNextClass(currentClass, countryCode);
    
    if (!nextClass) {
      return {
        success: false,
        reason: 'FINAL_CLASS',
        message: `L'élève est déjà en dernière classe (${currentClass})`
      };
    }

    // Sauvegarder l'historique de classe
    const classHistory = student.classHistory || [];
    classHistory.push({
      classId: currentClass,
      endDate: new Date().toISOString(),
      academicYear: this.getCurrentAcademicYear()
    });

    // Mettre à jour l'élève
    const updateData = {
      classId: nextClass.id,
      level: nextClass.level,
      previousClassId: currentClass,
      classHistory: classHistory,
      migratedAt: new Date().toISOString(),
      academicYear: this.getNextAcademicYear()
    };

    try {
      await db.collection('users').doc(student.uid).update(updateData);
      
      return {
        success: true,
        previousClass: currentClass,
        newClass: nextClass.id,
        newLevel: nextClass.level,
        message: `Migration réussie: ${currentClass} → ${nextClass.id}`
      };
    } catch (error) {
      return {
        success: false,
        reason: 'DATABASE_ERROR',
        message: error.message
      };
    }
  },

  /**
   * Migration en masse de tous les élèves
   */
  async migrateAllStudents(db) {
    const results = {
      total: 0,
      migrated: 0,
      skipped: 0,
      errors: [],
      details: []
    };

    try {
      // Récupérer tous les élèves
      const studentsSnapshot = await db.collection('users')
        .where('role', 'in', ['student', 'indep_student'])
        .get();

      results.total = studentsSnapshot.docs.length;

      for (const doc of studentsSnapshot.docs) {
        const student = { uid: doc.id, ...doc.data() };
        const migrationResult = await this.migrateStudent(student, db);

        if (migrationResult.success) {
          results.migrated++;
          results.details.push({
            studentId: student.uid,
            name: student.nom || student.email,
            ...migrationResult
          });
        } else {
          if (migrationResult.reason === 'FINAL_CLASS') {
            results.skipped++;
          } else {
            results.errors.push({
              studentId: student.uid,
              error: migrationResult.message
            });
          }
        }
      }

      return results;
    } catch (error) {
      results.errors.push({ global: error.message });
      return results;
    }
  },

  /**
   * Obtenir l'année académique en cours
   */
  getCurrentAcademicYear() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    // Si on est avant septembre, l'année académique est année-1/année
    if (month < this.config.migrationMonth) {
      return `${year - 1}/${year}`;
    }
    return `${year}/${year + 1}`;
  },

  /**
   * Obtenir la prochaine année académique
   */
  getNextAcademicYear() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    if (month < this.config.migrationMonth) {
      return `${year}/${year + 1}`;
    }
    return `${year + 1}/${year + 2}`;
  },

  /**
   * Planifier la migration automatique (à appeler au démarrage du serveur)
   */
  scheduleMigration(db) {
    if (!this.config.autoMigrationEnabled) {
      console.log('Migration automatique désactivée');
      return;
    }

    // Vérifier chaque jour à minuit
    const checkMigration = async () => {
      if (this.isMigrationTime()) {
        console.log('🎓 Démarrage de la migration automatique des classes...');
        const results = await this.migrateAllStudents(db);
        console.log('📊 Résultats de la migration:', results);
      }
    };

    // Exécuter immédiatement si c'est le bon moment
    checkMigration();

    // Puis vérifier toutes les heures
    setInterval(checkMigration, 60 * 60 * 1000);
  }
};

// ============================================================
// 🛣️ ROUTES API
// ============================================================

// Obtenir tous les niveaux
router.get('/levels', (req, res) => {
  res.json({
    success: true,
    data: Object.values(EDUCATION_LEVELS)
  });
});

// Obtenir tous les pays supportés
router.get('/countries', (req, res) => {
  res.json({
    success: true,
    data: Object.values(COUNTRY_PROGRAMS)
  });
});

// Obtenir les classes par pays et niveau
router.get('/classes/:countryCode/:levelId', (req, res) => {
  const { countryCode, levelId } = req.params;
  const classes = AcademicService.getClassesByCountryAndLevel(countryCode, levelId);
  
  res.json({
    success: true,
    data: classes
  });
});

// Obtenir toutes les classes d'un pays
router.get('/classes/:countryCode', (req, res) => {
  const { countryCode } = req.params;
  const classes = AcademicService.getAllClassesByCountry(countryCode);
  
  res.json({
    success: true,
    data: classes
  });
});

// Obtenir les matières d'une classe
router.get('/subjects/:classId', (req, res) => {
  const { classId } = req.params;
  const subjects = AcademicService.getSubjectsByClass(classId);
  
  if (subjects.length === 0) {
    return res.status(404).json({
      success: false,
      message: `Aucune matière trouvée pour la classe ${classId}`
    });
  }
  
  res.json({
    success: true,
    data: subjects
  });
});

// Obtenir les séries du BAC
router.get('/bac-series', (req, res) => {
  res.json({
    success: true,
    data: Object.values(BAC_SERIES)
  });
});

// Valider une structure académique
router.post('/validate', (req, res) => {
  const content = req.body;
  const validation = AcademicService.validateAcademicStructure(content);
  
  res.json({
    success: validation.isValid,
    errors: validation.errors
  });
});

// ============================================================
// 📤 EXPORTS
// ============================================================
module.exports = {
  router,
  COUNTRY_PROGRAMS,
  EDUCATION_LEVELS,
  CLASSES_BY_COUNTRY,
  SUBJECTS_BY_CLASS,
  BAC_SERIES,
  AcademicService,
  ClassMigrationService
};
