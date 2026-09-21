// ============================================================
// 🛡️ SECURITY MIDDLEWARE - Middlewares de sécurité
// checkClassAccess() | checkSubscriptionAccess()
// ============================================================

const { AcademicService, SUBJECTS_BY_CLASS } = require('./academic-structure');
const { SubscriptionService, SUBSCRIPTION_PLANS, ACCESS_LEVELS } = require('./subscription-system');

// ============================================================
// 🔐 MIDDLEWARE D'AUTHENTIFICATION DE BASE
// ============================================================
const authenticateUser = (db) => async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Token d\'authentification manquant'
      });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Vérifier le token Firebase (dans un vrai environnement)
    // const decodedToken = await admin.auth().verifyIdToken(token);
    // const userId = decodedToken.uid;
    
    // Pour le développement, extraire l'userId du token
    // En production, utiliser Firebase Admin SDK
    const userId = req.headers['x-user-id'] || token;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_TOKEN',
        message: 'Token invalide'
      });
    }

    // Récupérer l'utilisateur depuis la base de données
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'Utilisateur non trouvé'
      });
    }

    // Attacher l'utilisateur à la requête
    req.user = {
      uid: userId,
      ...userDoc.data()
    };

    // Vérifier et mettre à jour le statut d'abonnement
    const subscriptionStatus = await SubscriptionService.checkSubscriptionStatus(req.user, db);
    req.user.subscriptionStatus = subscriptionStatus;
    req.user.subscription = subscriptionStatus.plan;

    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    return res.status(500).json({
      success: false,
      error: 'AUTH_ERROR',
      message: 'Erreur d\'authentification'
    });
  }
};

// ============================================================
// 🏫 MIDDLEWARE DE VÉRIFICATION D'ACCÈS CLASSE
// ============================================================
/**
 * Vérifie que l'utilisateur a accès à la classe demandée
 * Un élève ne peut accéder qu'aux contenus de SA classe
 * Les profs/admins ont accès à toutes les classes
 */
const checkClassAccess = (db) => async (req, res, next) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Utilisateur non authentifié'
      });
    }

    // Récupérer la classe demandée (depuis params, query ou body)
    const requestedClassId = req.params.classId || 
                             req.query.classId || 
                             req.body.classId;

    // Si pas de classe spécifiée, utiliser celle de l'utilisateur
    if (!requestedClassId) {
      req.allowedClassId = user.classId;
      return next();
    }

    // Les rôles privilégiés ont accès à toutes les classes
    const privilegedRoles = ['admin', 'teacher', 'indep_teacher', 'school'];
    if (privilegedRoles.includes(user.role)) {
      req.allowedClassId = requestedClassId;
      return next();
    }

    // Pour les élèves, vérifier l'accès strict à leur classe
    if (user.role === 'student' || user.role === 'indep_student') {
      if (requestedClassId !== user.classId) {
        // Log de tentative d'accès non autorisé
        console.warn(`⚠️ Tentative d'accès inter-classe bloquée: User ${user.uid} (${user.classId}) → ${requestedClassId}`);
        
        return res.status(403).json({
          success: false,
          error: 'CLASS_ACCESS_DENIED',
          message: 'Accès refusé. Vous ne pouvez accéder qu\'aux contenus de votre classe.',
          requestedClass: requestedClassId,
          userClass: user.classId
        });
      }
    }

    // Pour les parents, vérifier les classes de leurs enfants
    if (user.role === 'parent') {
      const childrenClasses = user.childrenClasses || [];
      if (!childrenClasses.includes(requestedClassId)) {
        return res.status(403).json({
          success: false,
          error: 'PARENT_CLASS_ACCESS_DENIED',
          message: 'Accès refusé. Vous ne pouvez voir que les classes de vos enfants.'
        });
      }
    }

    req.allowedClassId = requestedClassId;
    next();
  } catch (error) {
    console.error('Erreur checkClassAccess:', error);
    return res.status(500).json({
      success: false,
      error: 'CLASS_CHECK_ERROR',
      message: 'Erreur lors de la vérification d\'accès classe'
    });
  }
};

// ============================================================
// 📖 MIDDLEWARE DE VÉRIFICATION D'ACCÈS MATIÈRE
// ============================================================
/**
 * Vérifie que la matière demandée appartient bien à la classe autorisée
 */
const checkSubjectAccess = (db) => async (req, res, next) => {
  try {
    const user = req.user;
    const allowedClassId = req.allowedClassId || user.classId;

    // Récupérer la matière demandée
    const requestedSubjectId = req.params.subjectId || 
                               req.query.subjectId || 
                               req.body.subjectId;

    if (!requestedSubjectId) {
      return next(); // Pas de matière spécifique demandée
    }

    // Les rôles privilégiés ont accès à toutes les matières
    const privilegedRoles = ['admin', 'teacher', 'indep_teacher', 'school'];
    if (privilegedRoles.includes(user.role)) {
      req.allowedSubjectId = requestedSubjectId;
      return next();
    }

    // Vérifier que la matière appartient à la classe
    if (!AcademicService.isSubjectInClass(requestedSubjectId, allowedClassId)) {
      return res.status(403).json({
        success: false,
        error: 'SUBJECT_ACCESS_DENIED',
        message: `La matière ${requestedSubjectId} n'est pas disponible pour la classe ${allowedClassId}`,
        requestedSubject: requestedSubjectId,
        allowedClass: allowedClassId
      });
    }

    req.allowedSubjectId = requestedSubjectId;
    next();
  } catch (error) {
    console.error('Erreur checkSubjectAccess:', error);
    return res.status(500).json({
      success: false,
      error: 'SUBJECT_CHECK_ERROR',
      message: 'Erreur lors de la vérification d\'accès matière'
    });
  }
};

// ============================================================
// 💎 MIDDLEWARE DE VÉRIFICATION D'ACCÈS ABONNEMENT
// ============================================================
/**
 * Vérifie que l'utilisateur a l'abonnement nécessaire pour accéder au contenu
 * Ne bloque pas, mais marque le contenu comme verrouillé
 */
const checkSubscriptionAccess = (db) => async (req, res, next) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Utilisateur non authentifié'
      });
    }

    // Récupérer le niveau d'accès du contenu demandé
    const contentAccessLevel = req.params.accessLevel || 
                               req.query.accessLevel || 
                               req.body.access_level;

    // Si pas de niveau spécifié, le contenu est considéré comme gratuit
    if (!contentAccessLevel) {
      req.subscriptionCheck = { allowed: true, userPlan: user.subscription };
      return next();
    }

    const userSubscription = user.subscription || 'FREE';
    const canAccess = SubscriptionService.canAccessContent(userSubscription, contentAccessLevel);

    req.subscriptionCheck = {
      allowed: canAccess,
      userPlan: userSubscription,
      contentLevel: contentAccessLevel,
      accessibleLevels: SubscriptionService.getAccessibleLevels(userSubscription)
    };

    if (!canAccess) {
      req.subscriptionCheck.lockMessage = SubscriptionService.getLockMessage(contentAccessLevel, userSubscription);
      req.subscriptionCheck.requiredPlan = SubscriptionService.getRequiredPlanForLevel(contentAccessLevel);
    }

    next();
  } catch (error) {
    console.error('Erreur checkSubscriptionAccess:', error);
    return res.status(500).json({
      success: false,
      error: 'SUBSCRIPTION_CHECK_ERROR',
      message: 'Erreur lors de la vérification d\'abonnement'
    });
  }
};

// ============================================================
// 🚫 MIDDLEWARE DE BLOCAGE STRICT D'ABONNEMENT
// ============================================================
/**
 * Version stricte qui bloque complètement l'accès si l'abonnement est insuffisant
 * Utilisé pour les contenus sensibles (vidéos, téléchargements...)
 */
const requireSubscriptionLevel = (requiredLevel) => (db) => async (req, res, next) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Utilisateur non authentifié'
      });
    }

    const userSubscription = user.subscription || 'FREE';
    const canAccess = SubscriptionService.canAccessContent(userSubscription, requiredLevel);

    if (!canAccess) {
      const requiredPlan = SubscriptionService.getRequiredPlanForLevel(requiredLevel);
      const lockMessage = SubscriptionService.getLockMessage(requiredLevel, userSubscription);

      return res.status(403).json({
        success: false,
        error: 'SUBSCRIPTION_REQUIRED',
        message: lockMessage,
        requiredPlan: requiredPlan,
        currentPlan: userSubscription,
        upgradeUrl: '/subscription/upgrade'
      });
    }

    next();
  } catch (error) {
    console.error('Erreur requireSubscriptionLevel:', error);
    return res.status(500).json({
      success: false,
      error: 'SUBSCRIPTION_CHECK_ERROR',
      message: 'Erreur lors de la vérification d\'abonnement'
    });
  }
};

// ============================================================
// 🌍 MIDDLEWARE DE VÉRIFICATION PAYS
// ============================================================
/**
 * Vérifie que le contenu est accessible pour le pays de l'utilisateur
 */
const checkCountryAccess = (db) => async (req, res, next) => {
  try {
    const user = req.user;
    const userCountry = user.countryCode || 'GN';

    const contentCountry = req.params.countryCode || 
                           req.query.countryCode || 
                           req.body.countryCode;

    // Si pas de pays spécifié ou contenu universel, autoriser
    if (!contentCountry || contentCountry === 'ALL') {
      req.allowedCountry = userCountry;
      return next();
    }

    // Les admins ont accès à tous les pays
    if (user.role === 'admin') {
      req.allowedCountry = contentCountry;
      return next();
    }

    // Vérifier que le pays correspond
    if (contentCountry !== userCountry) {
      return res.status(403).json({
        success: false,
        error: 'COUNTRY_ACCESS_DENIED',
        message: 'Ce contenu n\'est pas disponible dans votre pays',
        requestedCountry: contentCountry,
        userCountry: userCountry
      });
    }

    req.allowedCountry = contentCountry;
    next();
  } catch (error) {
    console.error('Erreur checkCountryAccess:', error);
    return res.status(500).json({
      success: false,
      error: 'COUNTRY_CHECK_ERROR',
      message: 'Erreur lors de la vérification du pays'
    });
  }
};

// ============================================================
// 🔒 MIDDLEWARE COMBINÉ D'ACCÈS COMPLET
// ============================================================
/**
 * Combine toutes les vérifications d'accès en un seul middleware
 */
const checkFullAccess = (db) => async (req, res, next) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Utilisateur non authentifié'
      });
    }

    const errors = [];

    // 1. Vérification de classe
    const requestedClassId = req.params.classId || req.query.classId || req.body.classId;
    if (requestedClassId) {
      const studentRoles = ['student', 'indep_student'];
      if (studentRoles.includes(user.role) && requestedClassId !== user.classId) {
        errors.push({
          type: 'CLASS_ACCESS',
          message: 'Accès à cette classe non autorisé'
        });
      }
    }

    // 2. Vérification de matière
    const requestedSubjectId = req.params.subjectId || req.query.subjectId || req.body.subjectId;
    const classId = requestedClassId || user.classId;
    if (requestedSubjectId && classId) {
      if (!AcademicService.isSubjectInClass(requestedSubjectId, classId)) {
        errors.push({
          type: 'SUBJECT_ACCESS',
          message: `Matière ${requestedSubjectId} non disponible pour la classe ${classId}`
        });
      }
    }

    // 3. Vérification d'abonnement
    const contentAccessLevel = req.params.accessLevel || req.query.accessLevel || req.body.access_level;
    const userSubscription = user.subscription || 'FREE';
    let subscriptionAllowed = true;
    
    if (contentAccessLevel) {
      subscriptionAllowed = SubscriptionService.canAccessContent(userSubscription, contentAccessLevel);
    }

    // 4. Vérification de pays
    const contentCountry = req.params.countryCode || req.query.countryCode || req.body.countryCode;
    const userCountry = user.countryCode || 'GN';
    if (contentCountry && contentCountry !== 'ALL' && contentCountry !== userCountry) {
      if (user.role !== 'admin') {
        errors.push({
          type: 'COUNTRY_ACCESS',
          message: 'Contenu non disponible dans votre pays'
        });
      }
    }

    // Si erreurs de classe/matière/pays, bloquer complètement
    if (errors.length > 0) {
      return res.status(403).json({
        success: false,
        error: 'ACCESS_DENIED',
        errors
      });
    }

    // Attacher les résultats de vérification
    req.accessCheck = {
      classAllowed: !errors.find(e => e.type === 'CLASS_ACCESS'),
      subjectAllowed: !errors.find(e => e.type === 'SUBJECT_ACCESS'),
      subscriptionAllowed,
      countryAllowed: !errors.find(e => e.type === 'COUNTRY_ACCESS'),
      userSubscription,
      subscriptionCheck: {
        allowed: subscriptionAllowed,
        lockMessage: subscriptionAllowed ? null : SubscriptionService.getLockMessage(contentAccessLevel, userSubscription)
      }
    };

    next();
  } catch (error) {
    console.error('Erreur checkFullAccess:', error);
    return res.status(500).json({
      success: false,
      error: 'ACCESS_CHECK_ERROR',
      message: 'Erreur lors de la vérification d\'accès'
    });
  }
};

// ============================================================
// 📊 MIDDLEWARE DE LOGGING DES ACCÈS
// ============================================================
/**
 * Log des accès pour audit et analytics
 */
const logAccess = (db) => async (req, res, next) => {
  const startTime = Date.now();
  
  // Intercepter la fin de la réponse
  res.on('finish', async () => {
    try {
      const user = req.user;
      if (!user) return;

      const accessLog = {
        userId: user.uid,
        userRole: user.role,
        userClass: user.classId,
        userSubscription: user.subscription,
        userCountry: user.countryCode,
        path: req.path,
        method: req.method,
        statusCode: res.statusCode,
        responseTime: Date.now() - startTime,
        requestedClass: req.params.classId || req.query.classId,
        requestedSubject: req.params.subjectId || req.query.subjectId,
        accessGranted: res.statusCode < 400,
        timestamp: new Date().toISOString(),
        userAgent: req.headers['user-agent'],
        ip: req.ip || req.connection?.remoteAddress
      };

      // En production, sauvegarder dans la base
      // await db.collection('access_logs').add(accessLog);
      
      // Pour le développement, log console
      if (res.statusCode >= 400) {
        console.warn(`🚫 Accès refusé:`, accessLog);
      }
    } catch (error) {
      console.error('Erreur logAccess:', error);
    }
  });

  next();
};

// ============================================================
// 🔧 UTILITAIRE: Créer les middlewares avec DB
// ============================================================
const createSecurityMiddleware = (db) => ({
  authenticateUser: authenticateUser(db),
  checkClassAccess: checkClassAccess(db),
  checkSubjectAccess: checkSubjectAccess(db),
  checkSubscriptionAccess: checkSubscriptionAccess(db),
  checkCountryAccess: checkCountryAccess(db),
  checkFullAccess: checkFullAccess(db),
  logAccess: logAccess(db),
  requireSubscriptionLevel: (level) => requireSubscriptionLevel(level)(db)
});

// ============================================================
// 📤 EXPORTS
// ============================================================
module.exports = {
  authenticateUser,
  checkClassAccess,
  checkSubjectAccess,
  checkSubscriptionAccess,
  requireSubscriptionLevel,
  checkCountryAccess,
  checkFullAccess,
  logAccess,
  createSecurityMiddleware
};
