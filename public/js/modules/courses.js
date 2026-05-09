/**
 * ============================================================
 * 📚 NEOCLASS - Module Cours
 * Gestion des cours, leçons, quiz et progression
 * ============================================================
 */

class CourseService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }
  
  // ═══════════════════════════════════════════════════════════
  // COURSES
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Obtenir tous les cours
   * @param {object} filters
   */
  async getCourses(filters = {}) {
    const firebase = window.Firebase;
    if (!firebase) return [];
    
    const cacheKey = `courses_${JSON.stringify(filters)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;
    
    try {
      const queryFilters = [];
      
      if (filters.category) {
        queryFilters.push(['category', '==', filters.category]);
      }
      if (filters.level) {
        queryFilters.push(['level', '==', filters.level]);
      }
      if (filters.published !== undefined) {
        queryFilters.push(['isPublished', '==', filters.published]);
      }
      if (filters.country) {
        queryFilters.push(['countries', 'array-contains', filters.country]);
      }
      
      const courses = await firebase.getDocs(
        'courses',
        queryFilters,
        filters.orderBy || 'order'
      );
      
      // Enrichir avec les données de progression si userId fourni
      if (filters.userId) {
        for (const course of courses) {
          course.progress = await this.getCourseProgress(filters.userId, course.id);
        }
      }
      
      this.setInCache(cacheKey, courses);
      return courses;
      
    } catch (error) {
      console.error('Erreur récupération cours:', error);
      return [];
    }
  }
  
  /**
   * Obtenir un cours par ID
   * @param {string} courseId
   * @param {string} userId - Pour inclure la progression
   */
  async getCourse(courseId, userId = null) {
    const firebase = window.Firebase;
    if (!firebase || !courseId) return null;
    
    const cacheKey = `course_${courseId}`;
    const cached = this.getFromCache(cacheKey);
    if (cached && !userId) return cached;
    
    try {
      const course = await firebase.getDoc('courses', courseId);
      
      if (course && userId) {
        course.progress = await this.getCourseProgress(userId, courseId);
        course.lessons = await this.getLessons(courseId, userId);
      }
      
      if (course) {
        this.setInCache(cacheKey, course);
      }
      
      return course;
      
    } catch (error) {
      console.error('Erreur récupération cours:', error);
      return null;
    }
  }
  
  /**
   * Obtenir les catégories de cours
   */
  async getCategories() {
    const cacheKey = 'course_categories';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;
    
    const categories = [
      { id: 'mathematiques', name: 'Mathématiques', icon: '📐', color: '#4A90D9' },
      { id: 'sciences', name: 'Sciences', icon: '🔬', color: '#27AE60' },
      { id: 'physique', name: 'Physique', icon: '⚛️', color: '#8B5CF6' },
      { id: 'chimie', name: 'Chimie', icon: '🧪', color: '#F59E0B' },
      { id: 'biologie', name: 'Biologie', icon: '🧬', color: '#10B981' },
      { id: 'francais', name: 'Français', icon: '📝', color: '#EC4899' },
      { id: 'anglais', name: 'Anglais', icon: '🇬🇧', color: '#3B82F6' },
      { id: 'histoire', name: 'Histoire-Géo', icon: '🌍', color: '#6366F1' },
      { id: 'philosophie', name: 'Philosophie', icon: '💭', color: '#8B5CF6' },
      { id: 'informatique', name: 'Informatique', icon: '💻', color: '#06B6D4' }
    ];
    
    this.setInCache(cacheKey, categories);
    return categories;
  }
  
  // ═══════════════════════════════════════════════════════════
  // LESSONS
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Obtenir les leçons d'un cours
   * @param {string} courseId
   * @param {string} userId
   */
  async getLessons(courseId, userId = null) {
    const firebase = window.Firebase;
    if (!firebase || !courseId) return [];
    
    try {
      const lessons = await firebase.getDocs('lessons', [
        ['courseId', '==', courseId]
      ], 'order');
      
      if (userId) {
        for (const lesson of lessons) {
          lesson.status = await this.getLessonStatus(userId, lesson.id, courseId);
        }
      }
      
      return lessons;
      
    } catch (error) {
      console.error('Erreur récupération leçons:', error);
      return [];
    }
  }
  
  /**
   * Obtenir une leçon par ID
   * @param {string} lessonId
   */
  async getLesson(lessonId) {
    const firebase = window.Firebase;
    if (!firebase || !lessonId) return null;
    
    try {
      return await firebase.getDoc('lessons', lessonId);
    } catch (error) {
      console.error('Erreur récupération leçon:', error);
      return null;
    }
  }
  
  /**
   * Obtenir le statut d'une leçon pour un utilisateur
   * @param {string} userId
   * @param {string} lessonId
   * @param {string} courseId
   */
  async getLessonStatus(userId, lessonId, courseId) {
    const firebase = window.Firebase;
    if (!firebase) return 'locked';
    
    try {
      // Vérifier si complétée
      const progress = await firebase.getDocs('user_progress', [
        ['userId', '==', userId],
        ['lessonId', '==', lessonId]
      ]);
      
      if (progress.length > 0 && progress[0].completed) {
        return 'completed';
      }
      
      // Vérifier si c'est la première leçon ou si la précédente est complétée
      const lessons = await this.getLessons(courseId);
      const lessonIndex = lessons.findIndex(l => l.id === lessonId);
      
      if (lessonIndex === 0) {
        return progress.length > 0 ? 'in-progress' : 'available';
      }
      
      // Vérifier la leçon précédente
      const prevLesson = lessons[lessonIndex - 1];
      const prevProgress = await firebase.getDocs('user_progress', [
        ['userId', '==', userId],
        ['lessonId', '==', prevLesson.id]
      ]);
      
      if (prevProgress.length > 0 && prevProgress[0].completed) {
        return progress.length > 0 ? 'in-progress' : 'available';
      }
      
      return 'locked';
      
    } catch (error) {
      console.error('Erreur statut leçon:', error);
      return 'locked';
    }
  }
  
  /**
   * Démarrer une leçon
   * @param {string} userId
   * @param {string} lessonId
   * @param {string} courseId
   */
  async startLesson(userId, lessonId, courseId) {
    const firebase = window.Firebase;
    if (!firebase || !userId || !lessonId) return null;
    
    try {
      // Vérifier si déjà commencée
      const existing = await firebase.getDocs('user_progress', [
        ['userId', '==', userId],
        ['lessonId', '==', lessonId]
      ]);
      
      if (existing.length > 0) {
        return existing[0];
      }
      
      // Créer le record de progression
      const progress = {
        userId,
        lessonId,
        courseId,
        startedAt: new Date(),
        completed: false,
        score: 0,
        timeSpent: 0
      };
      
      const docRef = await firebase.createDoc('user_progress', progress);
      progress.id = docRef.id;
      
      // Vérifier achievement première leçon
      if (window.Gamification) {
        window.Gamification.checkAchievements(userId, 'session_start');
      }
      
      return progress;
      
    } catch (error) {
      console.error('Erreur démarrage leçon:', error);
      return null;
    }
  }
  
  /**
   * Compléter une leçon
   * @param {string} userId
   * @param {string} lessonId
   * @param {object} data
   */
  async completeLesson(userId, lessonId, data = {}) {
    const firebase = window.Firebase;
    if (!firebase || !userId || !lessonId) return null;
    
    try {
      // Trouver le record de progression
      const existing = await firebase.getDocs('user_progress', [
        ['userId', '==', userId],
        ['lessonId', '==', lessonId]
      ]);
      
      if (existing.length === 0) {
        // Créer si n'existe pas
        await this.startLesson(userId, lessonId, data.courseId);
      }
      
      const progressId = existing[0]?.id;
      
      // Calculer le temps passé
      const startedAt = existing[0]?.startedAt?.toDate?.() || new Date();
      const timeSpent = Math.floor((new Date() - startedAt) / 1000);
      
      // Mettre à jour
      const updates = {
        completed: true,
        completedAt: new Date(),
        score: data.score || 100,
        timeSpent
      };
      
      if (progressId) {
        await firebase.updateDoc('user_progress', progressId, updates);
      }
      
      // Obtenir la leçon pour les XP
      const lesson = await this.getLesson(lessonId);
      const xpGained = lesson?.xpReward || 50;
      
      // Ajouter les XP
      if (window.Gamification) {
        await window.Gamification.addXP(userId, xpGained, 'lesson');
        await window.Gamification.checkAchievements(userId, 'lesson_complete');
      }
      
      // Vérifier si le cours est terminé
      await this.checkCourseCompletion(userId, data.courseId);
      
      return {
        ...updates,
        xpGained,
        lessonId
      };
      
    } catch (error) {
      console.error('Erreur complétion leçon:', error);
      return null;
    }
  }
  
  // ═══════════════════════════════════════════════════════════
  // QUIZ
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Obtenir le quiz d'une leçon
   * @param {string} lessonId
   */
  async getQuiz(lessonId) {
    const firebase = window.Firebase;
    if (!firebase || !lessonId) return null;
    
    try {
      const quizzes = await firebase.getDocs('quizzes', [
        ['lessonId', '==', lessonId]
      ]);
      
      if (quizzes.length === 0) return null;
      
      const quiz = quizzes[0];
      
      // Récupérer les questions
      quiz.questions = await firebase.getDocs('questions', [
        ['quizId', '==', quiz.id]
      ], 'order');
      
      return quiz;
      
    } catch (error) {
      console.error('Erreur récupération quiz:', error);
      return null;
    }
  }
  
  /**
   * Soumettre un quiz
   * @param {string} userId
   * @param {string} quizId
   * @param {array} answers - [{questionId, answer}]
   */
  async submitQuiz(userId, quizId, answers) {
    const firebase = window.Firebase;
    if (!firebase || !userId || !quizId) return null;
    
    try {
      // Récupérer le quiz avec les réponses correctes
      const quiz = await firebase.getDoc('quizzes', quizId);
      const questions = await firebase.getDocs('questions', [
        ['quizId', '==', quizId]
      ]);
      
      // Calculer le score
      let correct = 0;
      const results = [];
      
      for (const question of questions) {
        const userAnswer = answers.find(a => a.questionId === question.id);
        const isCorrect = userAnswer?.answer === question.correctAnswer;
        
        if (isCorrect) correct++;
        
        results.push({
          questionId: question.id,
          userAnswer: userAnswer?.answer,
          correctAnswer: question.correctAnswer,
          isCorrect,
          explanation: question.explanation
        });
      }
      
      const score = Math.round((correct / questions.length) * 100);
      const passed = score >= (quiz.passingScore || 70);
      
      // Enregistrer le résultat
      const quizResult = {
        userId,
        quizId,
        lessonId: quiz.lessonId,
        score,
        passed,
        answers: results,
        completedAt: new Date(),
        duration: 0 // TODO: calculer la durée
      };
      
      await firebase.createDoc('quiz_results', quizResult);
      
      // Calculer les XP
      let xpGained = 0;
      if (passed) {
        xpGained = Math.floor((quiz.xpReward || 25) * (score / 100));
        
        // Bonus pour score parfait
        if (score === 100) {
          xpGained += 25;
        }
        
        // Ajouter les XP
        if (window.Gamification) {
          await window.Gamification.addXP(userId, xpGained, 'quiz');
          await window.Gamification.checkAchievements(userId, 'quiz_complete', {
            score,
            duration: quizResult.duration
          });
        }
      }
      
      return {
        score,
        passed,
        correct,
        total: questions.length,
        results,
        xpGained
      };
      
    } catch (error) {
      console.error('Erreur soumission quiz:', error);
      return null;
    }
  }
  
  // ═══════════════════════════════════════════════════════════
  // PROGRESSION
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Obtenir la progression d'un cours
   * @param {string} userId
   * @param {string} courseId
   */
  async getCourseProgress(userId, courseId) {
    const firebase = window.Firebase;
    if (!firebase || !userId || !courseId) return { percent: 0, completed: 0, total: 0 };
    
    try {
      // Compter les leçons du cours
      const lessons = await firebase.getDocs('lessons', [
        ['courseId', '==', courseId]
      ]);
      
      const total = lessons.length;
      if (total === 0) return { percent: 0, completed: 0, total: 0 };
      
      // Compter les leçons complétées
      let completed = 0;
      for (const lesson of lessons) {
        const progress = await firebase.getDocs('user_progress', [
          ['userId', '==', userId],
          ['lessonId', '==', lesson.id],
          ['completed', '==', true]
        ]);
        if (progress.length > 0) completed++;
      }
      
      const percent = Math.round((completed / total) * 100);
      
      return { percent, completed, total };
      
    } catch (error) {
      console.error('Erreur progression cours:', error);
      return { percent: 0, completed: 0, total: 0 };
    }
  }
  
  /**
   * Obtenir la progression globale d'un utilisateur
   * @param {string} userId
   */
  async getUserProgress(userId) {
    const firebase = window.Firebase;
    if (!firebase || !userId) return null;
    
    try {
      // Leçons complétées
      const completedLessons = await firebase.getDocs('user_progress', [
        ['userId', '==', userId],
        ['completed', '==', true]
      ]);
      
      // Quiz réussis
      const passedQuizzes = await firebase.getDocs('quiz_results', [
        ['userId', '==', userId],
        ['passed', '==', true]
      ]);
      
      // Cours commencés (unique courseIds)
      const courseIds = [...new Set(completedLessons.map(l => l.courseId))];
      
      // Temps total
      const totalTime = completedLessons.reduce((acc, l) => acc + (l.timeSpent || 0), 0);
      
      return {
        lessonsCompleted: completedLessons.length,
        quizzesPassed: passedQuizzes.length,
        coursesStarted: courseIds.length,
        totalTimeMinutes: Math.floor(totalTime / 60)
      };
      
    } catch (error) {
      console.error('Erreur progression utilisateur:', error);
      return null;
    }
  }
  
  /**
   * Vérifier si un cours est terminé
   * @param {string} userId
   * @param {string} courseId
   */
  async checkCourseCompletion(userId, courseId) {
    if (!userId || !courseId) return false;
    
    const progress = await this.getCourseProgress(userId, courseId);
    
    if (progress.percent === 100) {
      // Marquer le cours comme terminé
      const firebase = window.Firebase;
      
      await firebase.createDoc('course_completions', {
        userId,
        courseId,
        completedAt: new Date()
      });
      
      // Achievement et XP bonus
      if (window.Gamification) {
        const course = await this.getCourse(courseId);
        await window.Gamification.addXP(userId, course?.completionXP || 100, 'course');
        await window.Gamification.checkAchievements(userId, 'course_complete');
      }
      
      return true;
    }
    
    return false;
  }
  
  /**
   * Obtenir les recommandations de cours
   * @param {string} userId
   */
  async getRecommendations(userId) {
    const firebase = window.Firebase;
    if (!firebase || !userId) return [];
    
    try {
      // Récupérer le profil pour les préférences
      const profile = await firebase.getUserProfile(userId);
      const country = profile?.country || 'GN';
      const level = profile?.educationLevel;
      
      // Cours en cours (pas terminés)
      const completions = await firebase.getDocs('course_completions', [
        ['userId', '==', userId]
      ]);
      const completedIds = completions.map(c => c.courseId);
      
      // Cours disponibles
      const courses = await this.getCourses({
        country,
        published: true
      });
      
      // Filtrer les cours non terminés et trier par pertinence
      const recommendations = courses
        .filter(c => !completedIds.includes(c.id))
        .slice(0, 5);
      
      return recommendations;
      
    } catch (error) {
      console.error('Erreur recommandations:', error);
      return [];
    }
  }
  
  // ═══════════════════════════════════════════════════════════
  // CACHE UTILITIES
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Obtenir du cache
   * @param {string} key
   */
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > this.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }
  
  /**
   * Mettre en cache
   * @param {string} key
   * @param {*} data
   */
  setInCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
  
  /**
   * Vider le cache
   * @param {string} prefix - Optionnel, vider seulement les clés commençant par
   */
  clearCache(prefix = null) {
    if (prefix) {
      for (const key of this.cache.keys()) {
        if (key.startsWith(prefix)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }
}

// ─── Instance globale ───
window.Courses = new CourseService();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CourseService;
}
