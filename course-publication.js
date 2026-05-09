// ============================================================
// 📚 COURSE PUBLICATION - Logique de publication des cours
// Validation stricte des champs obligatoires
// ============================================================

const express = require('express');
const router = express.Router();
const { AcademicService, COUNTRY_PROGRAMS, SUBJECTS_BY_CLASS } = require('./academic-structure');
const { SubscriptionService, ACCESS_LEVELS } = require('./subscription-system');
const { createSecurityMiddleware } = require('./security-middleware');

// ============================================================
// 📋 SCHÉMAS DE VALIDATION
// ============================================================

/**
 * Champs obligatoires pour la publication d'un cours
 */
const REQUIRED_COURSE_FIELDS = [
  'classId',      // Classe obligatoire
  'subjectId',    // Matière obligatoire
  'access_level', // Niveau d'accès obligatoire
  'countryCode',  // Pays obligatoire
  'name',         // Nom du cours
  'content'       // Contenu
];

/**
 * Champs obligatoires pour un module
 */
const REQUIRED_MODULE_FIELDS = [
  'classId',
  'subjectId',
  'access_level',
  'countryCode',
  'name',
  'description'
];

/**
 * Champs obligatoires pour une leçon
 */
const REQUIRED_LESSON_FIELDS = [
  'moduleId',
  'classId',
  'subjectId',
  'access_level',
  'countryCode',
  'name',
  'content'
];

// ============================================================
// 🔍 SERVICE DE VALIDATION
// ============================================================
const ValidationService = {
  /**
   * Valider les champs obligatoires
   */
  validateRequiredFields(data, requiredFields) {
    const errors = [];
    const missingFields = [];

    requiredFields.forEach(field => {
      if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
        missingFields.push(field);
        errors.push(`Le champ "${field}" est obligatoire`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      missingFields
    };
  },

  /**
   * Valider la structure académique complète
   */
  validateAcademicData(data) {
    const errors = [];

    // Valider le pays
    if (!data.countryCode || !COUNTRY_PROGRAMS[data.countryCode]) {
      errors.push(`Code pays invalide: ${data.countryCode}. Pays supportés: ${Object.keys(COUNTRY_PROGRAMS).join(', ')}`);
    }

    // Valider la classe
    if (!data.classId) {
      errors.push('La classe est obligatoire');
    } else if (!SUBJECTS_BY_CLASS[data.classId]) {
      errors.push(`Classe invalide: ${data.classId}`);
    }

    // Valider la matière
    if (!data.subjectId) {
      errors.push('La matière est obligatoire');
    } else if (data.classId && !AcademicService.isSubjectInClass(data.subjectId, data.classId)) {
      errors.push(`La matière "${data.subjectId}" n'est pas disponible pour la classe "${data.classId}"`);
    }

    // Valider le niveau d'accès
    if (!data.access_level || !ACCESS_LEVELS[data.access_level]) {
      errors.push(`Niveau d'accès invalide: ${data.access_level}. Valeurs autorisées: free, standard, premium`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Valider un cours complet
   */
  validateCourse(courseData) {
    const errors = [];

    // 1. Vérifier les champs obligatoires
    const requiredValidation = this.validateRequiredFields(courseData, REQUIRED_COURSE_FIELDS);
    errors.push(...requiredValidation.errors);

    // 2. Vérifier la structure académique
    const academicValidation = this.validateAcademicData(courseData);
    errors.push(...academicValidation.errors);

    // 3. Valider le contenu
    if (courseData.content && courseData.content.length < 50) {
      errors.push('Le contenu du cours doit faire au moins 50 caractères');
    }

    // 4. Valider le nom
    if (courseData.name && (courseData.name.length < 3 || courseData.name.length > 200)) {
      errors.push('Le nom du cours doit faire entre 3 et 200 caractères');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Valider un module
   */
  validateModule(moduleData) {
    const errors = [];

    const requiredValidation = this.validateRequiredFields(moduleData, REQUIRED_MODULE_FIELDS);
    errors.push(...requiredValidation.errors);

    const academicValidation = this.validateAcademicData(moduleData);
    errors.push(...academicValidation.errors);

    if (moduleData.name && (moduleData.name.length < 3 || moduleData.name.length > 200)) {
      errors.push('Le nom du module doit faire entre 3 et 200 caractères');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Valider une leçon
   */
  validateLesson(lessonData) {
    const errors = [];

    const requiredValidation = this.validateRequiredFields(lessonData, REQUIRED_LESSON_FIELDS);
    errors.push(...requiredValidation.errors);

    const academicValidation = this.validateAcademicData(lessonData);
    errors.push(...academicValidation.errors);

    // Valider le moduleId (existence à vérifier côté DB)
    if (!lessonData.moduleId) {
      errors.push('L\'ID du module est obligatoire');
    }

    if (lessonData.content && lessonData.content.length < 20) {
      errors.push('Le contenu de la leçon doit faire au moins 20 caractères');
    }

    if (lessonData.duration && (lessonData.duration < 1 || lessonData.duration > 180)) {
      errors.push('La durée doit être entre 1 et 180 minutes');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

// ============================================================
// 📖 SERVICE DE PUBLICATION
// ============================================================
const CoursePublicationService = {
  /**
   * Publier un nouveau cours
   */
  async publishCourse(courseData, creatorUser, db) {
    // 1. Validation stricte
    const validation = ValidationService.validateCourse(courseData);
    
    if (!validation.isValid) {
      return {
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Publication refusée: champs obligatoires manquants ou invalides',
        errors: validation.errors
      };
    }

    // 2. Vérifier les permissions du créateur
    const allowedRoles = ['admin', 'teacher', 'indep_teacher'];
    if (!allowedRoles.includes(creatorUser.role)) {
      return {
        success: false,
        error: 'PERMISSION_DENIED',
        message: 'Seuls les professeurs et administrateurs peuvent publier des cours'
      };
    }

    // 3. Préparer les données du cours
    const now = new Date().toISOString();
    const courseDoc = {
      ...courseData,
      id: this.generateId('course'),
      status: 'published',
      createdAt: now,
      updatedAt: now,
      createdBy: creatorUser.uid,
      creatorName: creatorUser.nom || creatorUser.email,
      creatorRole: creatorUser.role,
      // Métadonnées de recherche
      searchTerms: this.generateSearchTerms(courseData),
      // Stats
      views: 0,
      likes: 0,
      completions: 0,
      averageRating: 0,
      ratingsCount: 0
    };

    try {
      // 4. Sauvegarder en base
      await db.collection('courses').doc(courseDoc.id).set(courseDoc);

      // 5. Mettre à jour les stats du créateur
      await db.collection('users').doc(creatorUser.uid).update({
        coursesPublished: (creatorUser.coursesPublished || 0) + 1,
        lastPublishedAt: now
      });

      return {
        success: true,
        message: 'Cours publié avec succès',
        course: courseDoc
      };
    } catch (error) {
      return {
        success: false,
        error: 'DATABASE_ERROR',
        message: 'Erreur lors de la sauvegarde du cours',
        details: error.message
      };
    }
  },

  /**
   * Publier un module
   */
  async publishModule(moduleData, creatorUser, db) {
    const validation = ValidationService.validateModule(moduleData);
    
    if (!validation.isValid) {
      return {
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Publication refusée: champs obligatoires manquants ou invalides',
        errors: validation.errors
      };
    }

    const allowedRoles = ['admin', 'teacher', 'indep_teacher'];
    if (!allowedRoles.includes(creatorUser.role)) {
      return {
        success: false,
        error: 'PERMISSION_DENIED',
        message: 'Seuls les professeurs et administrateurs peuvent publier des modules'
      };
    }

    const now = new Date().toISOString();
    const moduleDoc = {
      ...moduleData,
      id: this.generateId('module'),
      status: 'published',
      lessons: [],
      lessonsCount: 0,
      createdAt: now,
      updatedAt: now,
      createdBy: creatorUser.uid,
      creatorName: creatorUser.nom || creatorUser.email,
      order: moduleData.order || 1
    };

    try {
      await db.collection('modules').doc(moduleDoc.id).set(moduleDoc);

      return {
        success: true,
        message: 'Module publié avec succès',
        module: moduleDoc
      };
    } catch (error) {
      return {
        success: false,
        error: 'DATABASE_ERROR',
        message: 'Erreur lors de la sauvegarde du module',
        details: error.message
      };
    }
  },

  /**
   * Publier une leçon
   */
  async publishLesson(lessonData, creatorUser, db) {
    const validation = ValidationService.validateLesson(lessonData);
    
    if (!validation.isValid) {
      return {
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Publication refusée: champs obligatoires manquants ou invalides',
        errors: validation.errors
      };
    }

    const allowedRoles = ['admin', 'teacher', 'indep_teacher'];
    if (!allowedRoles.includes(creatorUser.role)) {
      return {
        success: false,
        error: 'PERMISSION_DENIED',
        message: 'Seuls les professeurs et administrateurs peuvent publier des leçons'
      };
    }

    // Vérifier que le module existe
    try {
      const moduleDoc = await db.collection('modules').doc(lessonData.moduleId).get();
      if (!moduleDoc.exists) {
        return {
          success: false,
          error: 'MODULE_NOT_FOUND',
          message: `Le module ${lessonData.moduleId} n'existe pas`
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'DATABASE_ERROR',
        message: 'Erreur lors de la vérification du module'
      };
    }

    const now = new Date().toISOString();
    const lessonDoc = {
      ...lessonData,
      id: this.generateId('lesson'),
      status: 'published',
      exercises: [],
      exercisesCount: 0,
      createdAt: now,
      updatedAt: now,
      createdBy: creatorUser.uid,
      creatorName: creatorUser.nom || creatorUser.email,
      order: lessonData.order || 1,
      duration: lessonData.duration || 15,
      // Stats
      views: 0,
      completions: 0
    };

    try {
      // Sauvegarder la leçon
      await db.collection('lessons').doc(lessonDoc.id).set(lessonDoc);

      // Mettre à jour le module avec le lien vers la leçon
      await db.collection('modules').doc(lessonData.moduleId).update({
        lessons: admin.firestore.FieldValue.arrayUnion(lessonDoc.id),
        lessonsCount: admin.firestore.FieldValue.increment(1),
        updatedAt: now
      });

      return {
        success: true,
        message: 'Leçon publiée avec succès',
        lesson: lessonDoc
      };
    } catch (error) {
      return {
        success: false,
        error: 'DATABASE_ERROR',
        message: 'Erreur lors de la sauvegarde de la leçon',
        details: error.message
      };
    }
  },

  /**
   * Mettre à jour un cours existant
   */
  async updateCourse(courseId, updateData, editorUser, db) {
    // Valider les nouvelles données si elles concernent la structure académique
    if (updateData.classId || updateData.subjectId || updateData.access_level || updateData.countryCode) {
      const validation = ValidationService.validateAcademicData({
        ...updateData,
        classId: updateData.classId,
        subjectId: updateData.subjectId,
        access_level: updateData.access_level,
        countryCode: updateData.countryCode
      });

      if (!validation.isValid) {
        return {
          success: false,
          error: 'VALIDATION_ERROR',
          errors: validation.errors
        };
      }
    }

    try {
      // Vérifier que le cours existe
      const courseDoc = await db.collection('courses').doc(courseId).get();
      if (!courseDoc.exists) {
        return {
          success: false,
          error: 'COURSE_NOT_FOUND',
          message: `Le cours ${courseId} n'existe pas`
        };
      }

      const existingCourse = courseDoc.data();

      // Vérifier les permissions
      const canEdit = editorUser.role === 'admin' || existingCourse.createdBy === editorUser.uid;
      if (!canEdit) {
        return {
          success: false,
          error: 'PERMISSION_DENIED',
          message: 'Vous ne pouvez modifier que vos propres cours'
        };
      }

      const now = new Date().toISOString();
      const updateDoc = {
        ...updateData,
        updatedAt: now,
        lastEditedBy: editorUser.uid,
        editHistory: admin.firestore.FieldValue.arrayUnion({
          editedAt: now,
          editedBy: editorUser.uid,
          fields: Object.keys(updateData)
        })
      };

      await db.collection('courses').doc(courseId).update(updateDoc);

      return {
        success: true,
        message: 'Cours mis à jour avec succès',
        courseId
      };
    } catch (error) {
      return {
        success: false,
        error: 'DATABASE_ERROR',
        message: 'Erreur lors de la mise à jour',
        details: error.message
      };
    }
  },

  /**
   * Archiver un cours (soft delete)
   */
  async archiveCourse(courseId, archiverUser, db) {
    try {
      const courseDoc = await db.collection('courses').doc(courseId).get();
      if (!courseDoc.exists) {
        return {
          success: false,
          error: 'COURSE_NOT_FOUND',
          message: `Le cours ${courseId} n'existe pas`
        };
      }

      const existingCourse = courseDoc.data();
      const canArchive = archiverUser.role === 'admin' || existingCourse.createdBy === archiverUser.uid;
      
      if (!canArchive) {
        return {
          success: false,
          error: 'PERMISSION_DENIED',
          message: 'Vous ne pouvez archiver que vos propres cours'
        };
      }

      await db.collection('courses').doc(courseId).update({
        status: 'archived',
        archivedAt: new Date().toISOString(),
        archivedBy: archiverUser.uid
      });

      return {
        success: true,
        message: 'Cours archivé avec succès'
      };
    } catch (error) {
      return {
        success: false,
        error: 'DATABASE_ERROR',
        message: 'Erreur lors de l\'archivage'
      };
    }
  },

  /**
   * Obtenir les cours filtrés par classe et abonnement
   */
  async getFilteredCourses(filters, user, db) {
    const { classId, subjectId, accessLevel, countryCode, searchQuery } = filters;
    
    let query = db.collection('courses').where('status', '==', 'published');

    // Filtrer par pays
    const userCountry = countryCode || user.countryCode || 'GN';
    query = query.where('countryCode', '==', userCountry);

    // Filtrer par classe
    const userClass = classId || user.classId;
    if (userClass) {
      query = query.where('classId', '==', userClass);
    }

    // Filtrer par matière
    if (subjectId) {
      query = query.where('subjectId', '==', subjectId);
    }

    try {
      const snapshot = await query.get();
      let courses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Appliquer le filtrage d'abonnement
      const userSubscription = user.subscription || 'FREE';
      courses = SubscriptionService.filterContentsBySubscription(courses, userSubscription);

      // Recherche textuelle si fournie
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        courses = courses.filter(course => 
          course.name?.toLowerCase().includes(searchLower) ||
          course.description?.toLowerCase().includes(searchLower) ||
          course.searchTerms?.some(term => term.includes(searchLower))
        );
      }

      return {
        success: true,
        data: courses,
        total: courses.length,
        filters: { classId: userClass, subjectId, countryCode: userCountry }
      };
    } catch (error) {
      return {
        success: false,
        error: 'DATABASE_ERROR',
        message: 'Erreur lors de la récupération des cours'
      };
    }
  },

  /**
   * Générer un ID unique
   */
  generateId(prefix) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `${prefix}_${timestamp}_${random}`;
  },

  /**
   * Générer les termes de recherche pour indexation
   */
  generateSearchTerms(courseData) {
    const terms = [];
    
    if (courseData.name) {
      terms.push(...courseData.name.toLowerCase().split(/\s+/));
    }
    if (courseData.description) {
      terms.push(...courseData.description.toLowerCase().split(/\s+/).slice(0, 20));
    }
    if (courseData.classId) {
      terms.push(courseData.classId.toLowerCase());
    }
    if (courseData.subjectId) {
      terms.push(courseData.subjectId.toLowerCase());
    }

    // Dédupliquer et filtrer les mots courts
    return [...new Set(terms)].filter(t => t.length > 2);
  }
};

// ============================================================
// 🛣️ ROUTES API
// ============================================================

// Les routes nécessitent le middleware d'authentification
// Ces routes doivent être montées avec securityMiddleware.authenticateUser

// Valider un cours (avant publication)
router.post('/validate/course', (req, res) => {
  const validation = ValidationService.validateCourse(req.body);
  res.json({
    success: validation.isValid,
    errors: validation.errors
  });
});

// Valider un module
router.post('/validate/module', (req, res) => {
  const validation = ValidationService.validateModule(req.body);
  res.json({
    success: validation.isValid,
    errors: validation.errors
  });
});

// Valider une leçon
router.post('/validate/lesson', (req, res) => {
  const validation = ValidationService.validateLesson(req.body);
  res.json({
    success: validation.isValid,
    errors: validation.errors
  });
});

// Publier un cours (authentifié, prof/admin)
router.post('/publish/course', async (req, res) => {
  // L'utilisateur doit être attaché par le middleware d'authentification
  const user = req.user;
  const db = req.app.get('db');

  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED'
    });
  }

  const result = await CoursePublicationService.publishCourse(req.body, user, db);
  
  const statusCode = result.success ? 201 : (result.error === 'VALIDATION_ERROR' ? 400 : 500);
  res.status(statusCode).json(result);
});

// Publier un module
router.post('/publish/module', async (req, res) => {
  const user = req.user;
  const db = req.app.get('db');

  if (!user) {
    return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  }

  const result = await CoursePublicationService.publishModule(req.body, user, db);
  const statusCode = result.success ? 201 : (result.error === 'VALIDATION_ERROR' ? 400 : 500);
  res.status(statusCode).json(result);
});

// Publier une leçon
router.post('/publish/lesson', async (req, res) => {
  const user = req.user;
  const db = req.app.get('db');

  if (!user) {
    return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  }

  const result = await CoursePublicationService.publishLesson(req.body, user, db);
  const statusCode = result.success ? 201 : (result.error === 'VALIDATION_ERROR' ? 400 : 500);
  res.status(statusCode).json(result);
});

// Mettre à jour un cours
router.put('/course/:courseId', async (req, res) => {
  const user = req.user;
  const db = req.app.get('db');
  const { courseId } = req.params;

  if (!user) {
    return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  }

  const result = await CoursePublicationService.updateCourse(courseId, req.body, user, db);
  const statusCode = result.success ? 200 : 400;
  res.status(statusCode).json(result);
});

// Archiver un cours
router.delete('/course/:courseId', async (req, res) => {
  const user = req.user;
  const db = req.app.get('db');
  const { courseId } = req.params;

  if (!user) {
    return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  }

  const result = await CoursePublicationService.archiveCourse(courseId, user, db);
  const statusCode = result.success ? 200 : 400;
  res.status(statusCode).json(result);
});

// Obtenir les cours filtrés
router.get('/courses', async (req, res) => {
  const user = req.user;
  const db = req.app.get('db');

  if (!user) {
    return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  }

  const filters = {
    classId: req.query.classId,
    subjectId: req.query.subjectId,
    accessLevel: req.query.accessLevel,
    countryCode: req.query.countryCode,
    searchQuery: req.query.q
  };

  const result = await CoursePublicationService.getFilteredCourses(filters, user, db);
  res.json(result);
});

// ============================================================
// 📤 EXPORTS
// ============================================================
module.exports = {
  router,
  ValidationService,
  CoursePublicationService,
  REQUIRED_COURSE_FIELDS,
  REQUIRED_MODULE_FIELDS,
  REQUIRED_LESSON_FIELDS
};
