// ============================================================
// 🚀 NEOCLASS SERVER - Serveur principal sécurisé
// Intégration complète de tous les modules
// ============================================================

const express = require('express');
const cors = require('cors');
const path = require('path');

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

// Middleware de base
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname)));

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

// Route principale - servir le fichier HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Neoclass3.html'));
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
// 💰 ROUTES PROTÉGÉES - FINANCE
// ============================================================

// Middleware pour vérifier les droits finance (school/admin)
const requireFinanceRole = (req, res, next) => {
  const financeRoles = ['admin', 'school', 'director', 'accountant', 'treasurer'];
  if (!financeRoles.includes(req.user?.role)) {
    return res.status(403).json({
      success: false,
      error: 'PERMISSION_DENIED',
      message: 'Seuls les admins et directeurs peuvent accéder aux finances'
    });
  }
  next();
};

// GET /api/finance/dashboard - Dashboard financier
app.get('/api/finance/dashboard',
  securityMiddleware.authenticateUser,
  requireFinanceRole,
  async (req, res) => {
    try {
      const schoolId = req.user.uid || req.user.schoolId;
      
      // Récupérer les opérations de cette année
      const operations = Array.from(mockDB.collections.operations?.values() || [])
        .filter(op => op.schoolId === schoolId && op.year === new Date().getFullYear());
      
      // Calculs
      const income = operations
        .filter(op => op.type === 'income')
        .reduce((sum, op) => sum + (op.amount || 0), 0);
      
      const expenses = operations
        .filter(op => op.type === 'expense')
        .reduce((sum, op) => sum + (op.amount || 0), 0);
      
      const balance = income - expenses;
      
      res.json({
        success: true,
        data: {
          year: new Date().getFullYear(),
          income,
          expenses,
          balance,
          operationCount: operations.length,
          lastUpdate: new Date().toISOString(),
          recentOperations: operations.slice(-5)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'DASHBOARD_ERROR',
        message: error.message
      });
    }
  }
);

// GET /api/finance/operations - Lister toutes les opérations
app.get('/api/finance/operations',
  securityMiddleware.authenticateUser,
  requireFinanceRole,
  async (req, res) => {
    try {
      const schoolId = req.user.uid || req.user.schoolId;
      const { type, status, from, to } = req.query;
      
      let operations = Array.from(mockDB.collections.operations?.values() || [])
        .filter(op => op.schoolId === schoolId);
      
      // Filtres optionnels
      if (type) operations = operations.filter(op => op.type === type);
      if (status) operations = operations.filter(op => op.status === status);
      if (from) operations = operations.filter(op => new Date(op.date) >= new Date(from));
      if (to) operations = operations.filter(op => new Date(op.date) <= new Date(to));
      
      res.json({
        success: true,
        data: operations.sort((a, b) => new Date(b.date) - new Date(a.date))
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'OPERATIONS_ERROR',
        message: error.message
      });
    }
  }
);

// POST /api/finance/operations - Enregistrer une opération
app.post('/api/finance/operations',
  securityMiddleware.authenticateUser,
  requireFinanceRole,
  async (req, res) => {
    try {
      const { type, amount, category, description } = req.body;
      const schoolId = req.user.uid || req.user.schoolId;
      
      // Validation
      if (!type || !['income', 'expense', 'transfer'].includes(type)) {
        return res.status(400).json({ success: false, error: 'Invalid operation type' });
      }
      if (!amount || amount <= 0) {
        return res.status(400).json({ success: false, error: 'Invalid amount' });
      }
      
      const operation = {
        id: `op_${Date.now()}`,
        schoolId,
        type,
        amount,
        category: category || 'general',
        description: description || '',
        status: 'pending',
        date: new Date().toISOString(),
        recordedBy: req.user.uid,
        year: new Date().getFullYear()
      };
      
      // Sauvegarder
      if (!mockDB.collections.operations) {
        mockDB.collections.operations = new Map();
      }
      mockDB.collections.operations.set(operation.id, operation);
      
      res.status(201).json({
        success: true,
        data: operation
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'RECORD_ERROR',
        message: error.message
      });
    }
  }
);

// GET /api/finance/operations/:id - Obtenir une opération spécifique
app.get('/api/finance/operations/:id',
  securityMiddleware.authenticateUser,
  requireFinanceRole,
  async (req, res) => {
    try {
      const operation = mockDB.collections.operations?.get(req.params.id);
      
      if (!operation || operation.schoolId !== (req.user.uid || req.user.schoolId)) {
        return res.status(404).json({ success: false, error: 'OPERATION_NOT_FOUND' });
      }
      
      res.json({ success: true, data: operation });
    } catch (error) {
      res.status(500).json({ success: false, error: 'FETCH_ERROR', message: error.message });
    }
  }
);

// POST /api/finance/reports - Générer un rapport
app.post('/api/finance/reports',
  securityMiddleware.authenticateUser,
  requireFinanceRole,
  async (req, res) => {
    try {
      const schoolId = req.user.uid || req.user.schoolId;
      const { type = 'monthly', month, year = new Date().getFullYear() } = req.body;
      
      let operations = Array.from(mockDB.collections.operations?.values() || [])
        .filter(op => op.schoolId === schoolId && op.year === year);
      
      if (type === 'monthly' && month) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        operations = operations.filter(op => {
          const opDate = new Date(op.date);
          return opDate >= startDate && opDate <= endDate;
        });
      }
      
      const summary = {
        type,
        period: type === 'monthly' ? `${month}/${year}` : year,
        income: operations.filter(o => o.type === 'income').reduce((s, o) => s + o.amount, 0),
        expenses: operations.filter(o => o.type === 'expense').reduce((s, o) => s + o.amount, 0),
        operationCount: operations.length,
        generatedAt: new Date().toISOString()
      };
      
      summary.balance = summary.income - summary.expenses;
      
      res.json({ success: true, data: summary });
    } catch (error) {
      res.status(500).json({ success: false, error: 'REPORT_ERROR', message: error.message });
    }
  }
);

// POST /api/finance/budgets - Créer un budget
app.post('/api/finance/budgets',
  securityMiddleware.authenticateUser,
  requireFinanceRole,
  async (req, res) => {
    try {
      const { year, department, totalAllocated } = req.body;
      const schoolId = req.user.uid || req.user.schoolId;
      
      if (!year || !totalAllocated) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
      }
      
      const budget = {
        id: `budget_${Date.now()}`,
        schoolId,
        year,
        department: department || 'general',
        allocated: totalAllocated,
        spent: 0,
        utilization: 0,
        createdAt: new Date().toISOString()
      };
      
      if (!mockDB.collections.budgets) {
        mockDB.collections.budgets = new Map();
      }
      mockDB.collections.budgets.set(budget.id, budget);
      
      res.status(201).json({ success: true, data: budget });
    } catch (error) {
      res.status(500).json({ success: false, error: 'BUDGET_ERROR', message: error.message });
    }
  }
);

// GET /api/finance/budgets - Lister les budgets
app.get('/api/finance/budgets',
  securityMiddleware.authenticateUser,
  requireFinanceRole,
  async (req, res) => {
    try {
      const schoolId = req.user.uid || req.user.schoolId;
      const { year = new Date().getFullYear() } = req.query;
      
      const budgets = Array.from(mockDB.collections.budgets?.values() || [])
        .filter(b => b.schoolId === schoolId && b.year === parseInt(year));
      
      res.json({ success: true, data: budgets });
    } catch (error) {
      res.status(500).json({ success: false, error: 'BUDGETS_ERROR', message: error.message });
    }
  }
);

// POST /api/payment/initiate - Initier un paiement (Orange/MTN)
app.post('/api/payment/initiate',
  securityMiddleware.authenticateUser,
  async (req, res) => {
    try {
      const { operator, amount, phone, name, email, planName } = req.body;
      
      // Validation
      if (!operator || !['orange', 'mtn', 'card'].includes(operator)) {
        return res.status(400).json({ success: false, error: 'Invalid operator' });
      }
      if (!amount || amount <= 0 || amount > 10000000) {
        return res.status(400).json({ success: false, error: 'Invalid amount' });
      }
      if (!/^\d{8,9}$/.test(phone)) {
        return res.status(400).json({ success: false, error: 'Invalid phone number' });
      }
      
      const orderId = `NEO-${Date.now()}`;
      
      // En mode démo (sans credentials réels)
      const tokens = {
        orange: process.env.ORANGE_ACCESS_TOKEN || 'DEMO_ORANGE_' + Date.now(),
        mtn: process.env.MTN_ACCESS_TOKEN || 'DEMO_MTN_' + Date.now(),
        card: process.env.STRIPE_KEY || 'DEMO_CARD_' + Date.now()
      };
      
      // Sauvegarder la transaction en attente
      if (!mockDB.collections.transactions) {
        mockDB.collections.transactions = new Map();
      }
      
      const transaction = {
        id: orderId,
        userId: req.user.uid,
        operator,
        amount,
        phone,
        name,
        email,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      mockDB.collections.transactions.set(orderId, transaction);
      
      res.json({
        success: true,
        data: {
          orderId,
          operator,
          amount,
          phone: phone.slice(-4),
          status: 'pending',
          message: 'Paiement initié - Vérifiez votre téléphone'
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: 'PAYMENT_ERROR', message: error.message });
    }
  }
);

// POST /api/payment/webhook - Webhook pour les paiements
app.post('/api/payment/webhook',
  async (req, res) => {
    try {
      const { orderId, status, transactionId } = req.body;
      
      const transaction = mockDB.collections.transactions?.get(orderId);
      if (!transaction) {
        return res.status(404).json({ success: false, error: 'Transaction not found' });
      }
      
      transaction.status = status || 'completed';
      transaction.transactionId = transactionId;
      transaction.completedAt = new Date().toISOString();
      
      mockDB.collections.transactions.set(orderId, transaction);
      
      res.json({
        success: true,
        message: 'Transaction mise à jour',
        data: transaction
      });
    } catch (error) {
      res.status(500).json({ success: false, error: 'WEBHOOK_ERROR', message: error.message });
    }
  }
);

// GET /api/finance/sync - Synchroniser avec Firebase (optionnel)
app.get('/api/finance/sync',
  securityMiddleware.authenticateUser,
  requireFinanceRole,
  (req, res) => {
    res.json({
      success: true,
      message: 'Sync avec Firebase disponible',
      note: 'Les données sont sauvegardées localement. Pour Firebase, activez les imports'
    });
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
// ------------------------------------------------------------
// L'export principal est l'app Express elle-même (une fonction).
// Les plateformes serverless (Vercel, etc.) exigent que le module
// exporte une fonction ou un serveur : exporter un objet provoquait
// « Invalid export found in module server.js » et un 500 sur toutes
// les routes. Les services restent accessibles en propriétés.
// ============================================================
module.exports = app;
module.exports.app = app;
module.exports.default = app;
module.exports.mockDB = mockDB;
module.exports.securityMiddleware = securityMiddleware;
module.exports.AcademicService = AcademicService;
module.exports.SubscriptionService = SubscriptionService;
module.exports.CoursePublicationService = CoursePublicationService;
module.exports.ClassMigrationService = ClassMigrationService;
module.exports.ValidationService = ValidationService;
