// ============================================================
// 🚀 NEOCLASS SERVER - Serveur principal sécurisé
// Intégration complète de tous les modules
// ============================================================

// Charger les variables d'environnement
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// ============================================================
// 📦 IMPORTS DES MODULES
// ============================================================
const { 
  router: academicRouter, 
  AcademicService, 
  ClassMigrationService,
  COUNTRY_PROGRAMS,
  EDUCATION_LEVELS,
  SUBJECTS_BY_CLASS
} = require('./academic-structure');

const { 
  router: subscriptionRouter, 
  SubscriptionService,
  SUBSCRIPTION_PLANS,
  ACCESS_LEVELS,
  PRICING_BY_COUNTRY
} = require('./subscription-system');

const { 
  authenticateUser,
  checkClassAccess,
  checkSubjectAccess,
  checkSubscriptionAccess,
  checkCountryAccess,
  checkFullAccess,
  logAccess,
  createSecurityMiddleware
} = require('./security-middleware');

const { 
  router: courseRouter, 
  ValidationService,
  CoursePublicationService
} = require('./course-publication');

// ============================================================
// 🔧 CONFIGURATION
// ============================================================
const PORT = process.env.PORT || 3000;
const app = express();

// ============================================================
// 🛡️ MIDDLEWARES DE SÉCURITÉ
// ============================================================

// Protection des headers HTTP (désactivé en dev pour éviter les problèmes)
if (process.env.NODE_ENV === 'production') {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "cdn.jsdelivr.net", "www.gstatic.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
        fontSrc: ["'self'", "fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:", "*.firebasestorage.app", "*.googleapis.com"],
        connectSrc: ["'self'", "*.firebaseio.com", "*.googleapis.com", "api.mistral.ai"]
      }
    }
  }));
} else {
  // Mode dev: helmet avec CSP désactivé
  app.use(helmet({
    contentSecurityPolicy: false
  }));
}

// Compression des réponses (gzip/brotli)
app.use(compression());

// Rate limiting - protection contre DoS
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes par IP par fenêtre
  message: { success: false, error: 'RATE_LIMIT', message: 'Trop de requêtes, réessayez plus tard' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', apiLimiter);

// Rate limiting strict pour l'authentification
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 10, // 10 tentatives par heure
  message: { success: false, error: 'AUTH_LIMIT', message: 'Trop de tentatives de connexion' }
});
app.use('/api/auth/', authLimiter);

// Middleware de base avec limites sécurisées
app.use(express.json({ limit: '10mb' })); // Réduit de 50mb à 10mb
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS sécurisé
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'];
app.use(cors({
  origin: (origin, callback) => {
    // Permettre les requêtes sans origin (mobile apps, curl, etc.) en dev
    if (!origin && process.env.NODE_ENV !== 'production') return callback(null, true);
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Non autorisé par CORS'));
    }
  },
  credentials: true
}));

// ============================================================
// 📁 SERVIR LES FICHIERS STATIQUES
// ============================================================

// Servir le nouveau dossier public/ pour CSS, JS, assets (sans index.html par défaut)
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
  etag: true,
  lastModified: true,
  index: false  // Ne pas servir index.html automatiquement
}));

// Servir les assets (images, icons, sounds)
app.use('/assets', express.static(path.join(__dirname, 'public', 'assets'), {
  maxAge: '7d'
}));

// Fallback: servir le dossier racine (pour Neoclass3.html legacy)
app.use(express.static(path.join(__dirname), {
  maxAge: 0,
  index: false  // Ne pas servir index.html automatiquement
}));

// ============================================================
// 🗄️ SIMULATION BASE DE DONNÉES (remplacer par Firebase/MongoDB)
// ============================================================
// En production, utiliser Firebase Admin SDK ou MongoDB
const mockDB = {
  collections: {
    users: new Map(),
    courses: new Map(),
    modules: new Map(),
    lessons: new Map(),
    access_logs: new Map()
  },
  
  collection(name) {
    const data = this.collections[name];
    return {
      doc: (id) => ({
        get: async () => ({
          exists: data.has(id),
          data: () => data.get(id),
          id
        }),
        set: async (docData) => data.set(id, { ...docData, id }),
        update: async (updateData) => {
          const existing = data.get(id) || {};
          data.set(id, { ...existing, ...updateData });
        }
      }),
      where: (field, op, value) => ({
        get: async () => ({
          docs: Array.from(data.values())
            .filter(doc => {
              if (op === '==') return doc[field] === value;
              if (op === 'in') return value.includes(doc[field]);
              return true;
            })
            .map(doc => ({ id: doc.id, data: () => doc }))
        }),
        where: (field2, op2, value2) => ({
          get: async () => ({
            docs: Array.from(data.values())
              .filter(doc => {
                let match1 = op === '==' ? doc[field] === value : value.includes(doc[field]);
                let match2 = op2 === '==' ? doc[field2] === value2 : value2.includes(doc[field2]);
                return match1 && match2;
              })
              .map(doc => ({ id: doc.id, data: () => doc }))
          })
        })
      }),
      add: async (docData) => {
        const id = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        data.set(id, { ...docData, id });
        return { id };
      }
    };
  }
};

// Attacher la base de données à l'application
app.set('db', mockDB);

// ============================================================
// 🔐 INITIALISATION DES MIDDLEWARES DE SÉCURITÉ
// ============================================================
const securityMiddleware = createSecurityMiddleware(mockDB);

// Middleware de logging global
app.use(securityMiddleware.logAccess);

// ============================================================
// 🛣️ ROUTES PUBLIQUES
// ============================================================

// Route principale - servir Neoclass3.html avec toutes les fonctionnalités
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Neoclass3.html'));
});

// Route pour la version modulaire (optionnel)
app.get('/v2', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Neoclass Server is running',
    version: '4.0',
    timestamp: new Date().toISOString(),
    features: [
      'Academic Structure',
      'Subscription System',
      'Security Middleware',
      'Course Publication',
      'Class Migration'
    ]
  });
});

// Obtenir les pays supportés (public)
app.get('/api/public/countries', (req, res) => {
  res.json({
    success: true,
    data: Object.entries(COUNTRY_PROGRAMS).map(([code, data]) => ({
      code,
      ...data
    }))
  });
});

// Obtenir les niveaux scolaires (public)
app.get('/api/public/levels', (req, res) => {
  res.json({
    success: true,
    data: Object.values(EDUCATION_LEVELS)
  });
});

// Obtenir les plans d'abonnement (public)
app.get('/api/public/plans', (req, res) => {
  res.json({
    success: true,
    data: Object.values(SUBSCRIPTION_PLANS)
  });
});

// Obtenir les prix par pays (public)
app.get('/api/public/pricing/:countryCode', (req, res) => {
  const { countryCode } = req.params;
  const pricing = PRICING_BY_COUNTRY[countryCode] || PRICING_BY_COUNTRY.GN;
  
  res.json({
    success: true,
    data: pricing
  });
});

// ============================================================
// 🔒 ROUTES PROTÉGÉES - STRUCTURE ACADÉMIQUE
// ============================================================
app.use('/api/academic', securityMiddleware.authenticateUser, academicRouter);

// Obtenir les matières de la classe de l'utilisateur
app.get('/api/my/subjects', 
  securityMiddleware.authenticateUser,
  (req, res) => {
    const user = req.user;
    const subjects = AcademicService.getSubjectsByClass(user.classId);
    
    res.json({
      success: true,
      classId: user.classId,
      data: subjects
    });
  }
);

// ============================================================
// 💎 ROUTES PROTÉGÉES - ABONNEMENT
// ============================================================
app.use('/api/subscription', securityMiddleware.authenticateUser, subscriptionRouter);

// Obtenir le statut d'abonnement de l'utilisateur
app.get('/api/my/subscription',
  securityMiddleware.authenticateUser,
  async (req, res) => {
    const status = await SubscriptionService.checkSubscriptionStatus(req.user, mockDB);
    
    res.json({
      success: true,
      data: {
        ...status,
        plan: SUBSCRIPTION_PLANS[status.plan],
        accessibleLevels: SubscriptionService.getAccessibleLevels(status.plan)
      }
    });
  }
);

// Initialiser un paiement d'abonnement
app.post('/api/subscription/initiate',
  securityMiddleware.authenticateUser,
  async (req, res) => {
    const { plan, duration } = req.body;
    const user = req.user;
    const countryCode = user.countryCode || 'GN';
    
    const pricing = PRICING_BY_COUNTRY[countryCode];
    const planPricing = pricing?.plans[plan];
    
    if (!planPricing) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_PLAN',
        message: 'Plan invalide'
      });
    }

    const price = duration === 'yearly' ? planPricing.yearly : planPricing.monthly;
    
    // En production, intégrer Orange Money, Wave, MTN MoMo, etc.
    const paymentUrl = `/payment?plan=${plan}&duration=${duration}&price=${price}&currency=${pricing.currency}`;
    
    res.json({
      success: true,
      paymentUrl,
      price,
      currency: pricing.currency,
      plan,
      duration
    });
  }
);

// ============================================================
// 📚 ROUTES PROTÉGÉES - COURS
// ============================================================
app.use('/api/courses', securityMiddleware.authenticateUser, courseRouter);

// Obtenir les cours de la classe de l'utilisateur (avec filtrage abonnement)
app.get('/api/my/courses',
  securityMiddleware.authenticateUser,
  securityMiddleware.checkClassAccess,
  securityMiddleware.checkSubscriptionAccess,
  async (req, res) => {
    const user = req.user;
    const { subjectId, q } = req.query;
    
    const filters = {
      classId: user.classId,
      subjectId,
      countryCode: user.countryCode || 'GN',
      searchQuery: q
    };
    
    const result = await CoursePublicationService.getFilteredCourses(filters, user, mockDB);
    res.json(result);
  }
);

// Obtenir un cours spécifique (avec vérifications d'accès)
app.get('/api/course/:courseId',
  securityMiddleware.authenticateUser,
  securityMiddleware.checkFullAccess,
  async (req, res) => {
    const { courseId } = req.params;
    const user = req.user;
    
    try {
      const courseDoc = await mockDB.collection('courses').doc(courseId).get();
      
      if (!courseDoc.exists) {
        return res.status(404).json({
          success: false,
          error: 'COURSE_NOT_FOUND'
        });
      }
      
      const course = courseDoc.data();
      const userSubscription = user.subscription || 'FREE';
      
      // Vérifier l'accès à la classe
      const studentRoles = ['student', 'indep_student'];
      if (studentRoles.includes(user.role) && course.classId !== user.classId) {
        return res.status(403).json({
          success: false,
          error: 'CLASS_ACCESS_DENIED',
          message: 'Ce cours n\'est pas disponible pour votre classe'
        });
      }
      
      // Vérifier l'accès abonnement
      const canAccess = SubscriptionService.canAccessContent(userSubscription, course.access_level);
      
      if (!canAccess) {
        // Retourner version verrouillée (sans contenu sensible)
        return res.json({
          success: true,
          data: {
            id: course.id,
            name: course.name,
            description: course.description,
            summary: course.summary,
            access_level: course.access_level,
            duration: course.duration,
            locked: true,
            lockMessage: SubscriptionService.getLockMessage(course.access_level, userSubscription),
            requiredPlan: SubscriptionService.getRequiredPlanForLevel(course.access_level)
          }
        });
      }
      
      // Retourner le cours complet
      res.json({
        success: true,
        data: course
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'SERVER_ERROR',
        message: error.message
      });
    }
  }
);

// ============================================================
// 📤 ROUTES PROTÉGÉES - PUBLICATION (PROFS/ADMINS)
// ============================================================

// Middleware pour vérifier les droits de publication
const requirePublisherRole = (req, res, next) => {
  const publisherRoles = ['admin', 'teacher', 'indep_teacher'];
  if (!publisherRoles.includes(req.user?.role)) {
    return res.status(403).json({
      success: false,
      error: 'PERMISSION_DENIED',
      message: 'Seuls les professeurs et administrateurs peuvent publier du contenu'
    });
  }
  next();
};

// Publier un nouveau cours
app.post('/api/publish/course',
  securityMiddleware.authenticateUser,
  requirePublisherRole,
  async (req, res) => {
    const result = await CoursePublicationService.publishCourse(req.body, req.user, mockDB);
    const statusCode = result.success ? 201 : 400;
    res.status(statusCode).json(result);
  }
);

// Publier un module
app.post('/api/publish/module',
  securityMiddleware.authenticateUser,
  requirePublisherRole,
  async (req, res) => {
    const result = await CoursePublicationService.publishModule(req.body, req.user, mockDB);
    const statusCode = result.success ? 201 : 400;
    res.status(statusCode).json(result);
  }
);

// Publier une leçon
app.post('/api/publish/lesson',
  securityMiddleware.authenticateUser,
  requirePublisherRole,
  async (req, res) => {
    const result = await CoursePublicationService.publishLesson(req.body, req.user, mockDB);
    const statusCode = result.success ? 201 : 400;
    res.status(statusCode).json(result);
  }
);

// Valider les données avant publication
app.post('/api/validate/course',
  securityMiddleware.authenticateUser,
  requirePublisherRole,
  (req, res) => {
    const validation = ValidationService.validateCourse(req.body);
    res.json({
      success: validation.isValid,
      errors: validation.errors
    });
  }
);

// ============================================================
// 🔄 ROUTES ADMIN - MIGRATION DE CLASSE
// ============================================================

// Middleware admin uniquement
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'ADMIN_REQUIRED',
      message: 'Cette action nécessite des droits administrateur'
    });
  }
  next();
};

// Migrer un élève vers la classe supérieure (admin)
app.post('/api/admin/migrate-student/:studentId',
  securityMiddleware.authenticateUser,
  requireAdmin,
  async (req, res) => {
    const { studentId } = req.params;
    
    try {
      const studentDoc = await mockDB.collection('users').doc(studentId).get();
      if (!studentDoc.exists) {
        return res.status(404).json({
          success: false,
          error: 'STUDENT_NOT_FOUND'
        });
      }
      
      const student = { uid: studentId, ...studentDoc.data() };
      const result = await ClassMigrationService.migrateStudent(student, mockDB);
      
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'MIGRATION_ERROR',
        message: error.message
      });
    }
  }
);

// Migration en masse (admin)
app.post('/api/admin/migrate-all',
  securityMiddleware.authenticateUser,
  requireAdmin,
  async (req, res) => {
    const results = await ClassMigrationService.migrateAllStudents(mockDB);
    res.json({
      success: true,
      data: results
    });
  }
);

// Obtenir l'année académique actuelle
app.get('/api/admin/academic-year',
  securityMiddleware.authenticateUser,
  requireAdmin,
  (req, res) => {
    res.json({
      success: true,
      currentYear: ClassMigrationService.getCurrentAcademicYear(),
      nextYear: ClassMigrationService.getNextAcademicYear()
    });
  }
);

// ============================================================
// 🔍 ROUTES DE RECHERCHE
// ============================================================

// Recherche de cours (avec filtrage d'accès)
app.get('/api/search/courses',
  securityMiddleware.authenticateUser,
  securityMiddleware.checkClassAccess,
  async (req, res) => {
    const { q, subjectId, accessLevel } = req.query;
    const user = req.user;
    
    const filters = {
      classId: user.classId,
      subjectId,
      accessLevel,
      countryCode: user.countryCode || 'GN',
      searchQuery: q
    };
    
    const result = await CoursePublicationService.getFilteredCourses(filters, user, mockDB);
    res.json(result);
  }
);

// ============================================================
// ⚠️ GESTION DES ERREURS
// ============================================================
app.use((err, req, res, next) => {
  console.error('❌ Erreur serveur:', err);
  
  res.status(err.status || 500).json({
    success: false,
    error: err.code || 'SERVER_ERROR',
    message: process.env.NODE_ENV === 'production' 
      ? 'Une erreur est survenue' 
      : err.message
  });
});

// Route 404
// Route 404 pour les API, sinon renvoyer le fichier HTML (SPA)
app.use((req, res) => {
  // Si c'est une requête API, renvoyer une erreur JSON
  if (req.path.startsWith('/api/')) {
    res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} non trouvée`
    });
  } else {
    // Sinon, renvoyer le fichier HTML principal (SPA routing)
    res.sendFile(path.join(__dirname, 'Neoclass3.html'));
  }
});

// ============================================================
// 🚀 DÉMARRAGE DU SERVEUR
// ============================================================
const startServer = () => {
  // Planifier la migration automatique des classes
  ClassMigrationService.scheduleMigration(mockDB);
  
  app.listen(PORT, () => {
    console.log('═══════════════════════════════════════════════════');
    console.log('🚀 NEOCLASS SERVER - Version 4.0');
    console.log('═══════════════════════════════════════════════════');
    console.log(`📡 Serveur démarré sur le port ${PORT}`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log('───────────────────────────────────────────────────');
    console.log('📦 Modules chargés:');
    console.log('   ✓ Structure Académique (level → class → subject → module → lesson)');
    console.log('   ✓ Système d\'Abonnement (FREE, STANDARD, PREMIUM)');
    console.log('   ✓ Middlewares de Sécurité (checkClassAccess, checkSubscriptionAccess)');
    console.log('   ✓ Publication de Cours (validation stricte)');
    console.log('   ✓ Migration Automatique de Classe');
    console.log('   ✓ Multi-pays (Afrique francophone)');
    console.log('───────────────────────────────────────────────────');
    console.log('🔒 Sécurité:');
    console.log('   ✓ Segmentation stricte par classe');
    console.log('   ✓ Filtrage par abonnement');
    console.log('   ✓ Logging des accès');
    console.log('═══════════════════════════════════════════════════');
  });
};

// Démarrage
if (require.main === module) {
  startServer();
}

// ============================================================
// 📤 EXPORTS
// ============================================================
module.exports = {
  app,
  mockDB,
  securityMiddleware,
  AcademicService,
  SubscriptionService,
  CoursePublicationService,
  ClassMigrationService,
  ValidationService
};
