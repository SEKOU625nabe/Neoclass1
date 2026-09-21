/**
 * 🎓 SYSTÈME DE GESTION DES COURS PAR CLASSE
 * Gère les programmes, icones, et personnalisation des cours par classe
 */

const CourseManagementSystem = {
  
  // 📚 PROGRAMMES COMPLETS PAR CLASSE
  programmes: {
    'CP': {
      name: 'Cours Préparatoire',
      niveau: 'primary',
      couleur: '#FF6B6B',
      icon: '🅰️',
      courses: [
        { id: 'fr-cp', name: 'Français', icon: '📖', couleur: '#FF6B6B', description: 'Lecture, écriture et grammaire' },
        { id: 'math-cp', name: 'Calcul', icon: '🔢', couleur: '#4ECDC4', description: 'Nombres et opérations' },
        { id: 'lec-cp', name: 'Lecture', icon: '📚', couleur: '#95E1D3', description: 'Apprentissage de la lecture' },
        { id: 'ecr-cp', name: 'Écriture', icon: '✏️', couleur: '#F7DC6F', description: 'Traçage et écriture' },
        { id: 'ecm-cp', name: 'ECM', icon: '🌍', couleur: '#BB8FCE', description: 'Éducation civique et morale' }
      ]
    },
    'CE1': {
      name: 'Cours Élémentaire 1',
      niveau: 'primary',
      couleur: '#FF8C42',
      icon: '1️⃣',
      courses: [
        { id: 'fr-ce1', name: 'Français', icon: '📖', couleur: '#FF8C42', description: 'Français complète' },
        { id: 'math-ce1', name: 'Calcul', icon: '🔢', couleur: '#4ECDC4', description: 'Mathématiques élémentaires' },
        { id: 'lec-ce1', name: 'Lecture', icon: '📕', couleur: '#95E1D3', description: 'Fluence de lecture' },
        { id: 'ecr-ce1', name: 'Écriture', icon: '✒️', couleur: '#F7DC6F', description: 'Perfectionnement écriture' },
        { id: 'ecm-ce1', name: 'ECM', icon: '🏛️', couleur: '#BB8FCE', description: 'Civisme et respect' }
      ]
    },
    'CE2': {
      name: 'Cours Élémentaire 2',
      niveau: 'primary',
      couleur: '#FF6348',
      icon: '2️⃣',
      courses: [
        { id: 'fr-ce2', name: 'Français', icon: '📖', couleur: '#FF6348', description: 'Français avancé' },
        { id: 'math-ce2', name: 'Mathématiques', icon: '🔢', couleur: '#4ECDC4', description: 'Arithmétique' },
        { id: 'sci-ce2', name: 'Sciences', icon: '🔬', couleur: '#45B7D1', description: 'Découverte du monde' },
        { id: 'ecm-ce2', name: 'ECM', icon: '⚖️', couleur: '#BB8FCE', description: 'Valeurs et principes' }
      ]
    },
    'CM1': {
      name: 'Cours Moyen 1',
      niveau: 'primary',
      couleur: '#E17055',
      icon: '3️⃣',
      courses: [
        { id: 'fr-cm1', name: 'Français', icon: '📖', couleur: '#E17055', description: 'Français complet' },
        { id: 'math-cm1', name: 'Mathématiques', icon: '📐', couleur: '#4ECDC4', description: 'Géométrie et calcul' },
        { id: 'sci-cm1', name: 'Sciences', icon: '🧪', couleur: '#45B7D1', description: 'Sciences naturelles' },
        { id: 'hist-cm1', name: 'Histoire', icon: '🏛️', couleur: '#C39BD3', description: 'Histoire générale' },
        { id: 'geo-cm1', name: 'Géographie', icon: '🗺️', couleur: '#85C1E2', description: 'Géographie mondiale' },
        { id: 'ecm-cm1', name: 'ECM', icon: '⚖️', couleur: '#BB8FCE', description: 'Principes citoyens' }
      ]
    },
    'CM2': {
      name: 'Cours Moyen 2',
      niveau: 'primary',
      couleur: '#D63031',
      icon: '4️⃣',
      courses: [
        { id: 'fr-cm2', name: 'Français', icon: '📖', couleur: '#D63031', description: 'Français expert' },
        { id: 'math-cm2', name: 'Mathématiques', icon: '📐', couleur: '#4ECDC4', description: 'Algèbre de base' },
        { id: 'sci-cm2', name: 'Sciences', icon: '🧬', couleur: '#45B7D1', description: 'Sciences appliquées' },
        { id: 'hist-cm2', name: 'Histoire', icon: '📜', couleur: '#C39BD3', description: 'Histoire mondiale' },
        { id: 'geo-cm2', name: 'Géographie', icon: '🌍', couleur: '#85C1E2', description: 'Géographie économique' },
        { id: 'ang-cm2', name: 'Anglais', icon: '🗣️', couleur: '#FAB1A0', description: 'Anglais de base' },
        { id: 'ecm-cm2', name: 'ECM', icon: '⚖️', couleur: '#BB8FCE', description: 'Droits et devoirs' }
      ]
    },

    // COLLÈGE 🏫
    '6eme': {
      name: '6ème',
      niveau: 'middle',
      couleur: '#6C5CE7',
      icon: '6️⃣',
      courses: [
        { id: 'fr-6', name: 'Français', icon: '📖', couleur: '#6C5CE7', description: 'Littérature et grammaire' },
        { id: 'math-6', name: 'Mathématiques', icon: '📐', couleur: '#0984E3', description: 'Algèbre et géométrie' },
        { id: 'svt-6', name: 'SVT', icon: '🌿', couleur: '#00B894', description: 'Sciences de la vie' },
        { id: 'hist-6', name: 'Histoire', icon: '🏛️', couleur: '#744E1C', description: 'Histoire ancienne' },
        { id: 'geo-6', name: 'Géographie', icon: '🌍', couleur: '#00B8A9', description: 'Géographie humaine' },
        { id: 'ang-6', name: 'Anglais', icon: '🗣️', couleur: '#FF7675', description: 'Anglais conversationnel' },
        { id: 'ecm-6', name: 'ECM', icon: '⚖️', couleur: '#A29BFE', description: 'Citoyenneté' }
      ]
    },
    '5eme': {
      name: '5ème',
      niveau: 'middle',
      couleur: '#5F27CD',
      icon: '5️⃣',
      courses: [
        { id: 'fr-5', name: 'Français', icon: '📖', couleur: '#5F27CD', description: 'Analyse de texte' },
        { id: 'math-5', name: 'Mathématiques', icon: '📐', couleur: '#0984E3', description: 'Fractions et décimaux' },
        { id: 'svt-5', name: 'SVT', icon: '🧬', couleur: '#00B894', description: 'Biologie humaine' },
        { id: 'phy-5', name: 'Physique', icon: '⚛️', couleur: '#74B9FF', description: 'Physique mécanique' },
        { id: 'hist-5', name: 'Histoire', icon: '🏰', couleur: '#744E1C', description: 'Moyen Âge' },
        { id: 'geo-5', name: 'Géographie', icon: '🗺️', couleur: '#00B8A9', description: 'Géographie politique' },
        { id: 'ang-5', name: 'Anglais', icon: '🇬🇧', couleur: '#FF7675', description: 'Anglais appliqué' }
      ]
    },
    '4eme': {
      name: '4ème',
      niveau: 'middle',
      couleur: '#4834DF',
      icon: '4️⃣',
      courses: [
        { id: 'fr-4', name: 'Français', icon: '📖', couleur: '#4834DF', description: 'Littérature française' },
        { id: 'math-4', name: 'Mathématiques', icon: '📐', couleur: '#0984E3', description: 'Théorèmes géométriques' },
        { id: 'svt-4', name: 'SVT', icon: '🧪', couleur: '#00B894', description: 'Écologie' },
        { id: 'phy-4', name: 'Physique', icon: '💡', couleur: '#74B9FF', description: 'Électricité' },
        { id: 'chim-4', name: 'Chimie', icon: '⚗️', couleur: '#FDCB6E', description: 'Réactions chimiques' },
        { id: 'hist-4', name: 'Histoire', icon: '📜', couleur: '#744E1C', description: 'Renaissance' },
        { id: 'geo-4', name: 'Géographie', icon: '🌏', couleur: '#00B8A9', description: 'Géographie régionale' },
        { id: 'ang-4', name: 'Anglais', icon: '🗣️', couleur: '#FF7675', description: 'Anglais avancé' }
      ]
    },
    '3eme': {
      name: '3ème',
      niveau: 'middle',
      couleur: '#3C1E7D',
      icon: '3️⃣',
      courses: [
        { id: 'fr-3', name: 'Français', icon: '📖', couleur: '#3C1E7D', description: 'Préparation Brevet' },
        { id: 'math-3', name: 'Mathématiques', icon: '📐', couleur: '#0984E3', description: 'Algèbre avancée' },
        { id: 'svt-3', name: 'SVT', icon: '🌱', couleur: '#00B894', description: 'Évolution' },
        { id: 'phy-3', name: 'Physique', icon: '⚡', couleur: '#74B9FF', description: 'Thermodynamique' },
        { id: 'chim-3', name: 'Chimie', icon: '🧪', couleur: '#FDCB6E', description: 'Chimie organique' },
        { id: 'hist-3', name: 'Histoire', icon: '🕰️', couleur: '#744E1C', description: 'Révolutions' },
        { id: 'geo-3', name: 'Géographie', icon: '🌐', couleur: '#00B8A9', description: 'Mondialisation' },
        { id: 'ang-3', name: 'Anglais', icon: '🇺🇸', couleur: '#FF7675', description: 'Anglais fluide' }
      ]
    },

    // LYCÉE 🏫
    '2ndeSM': {
      name: '2nde Sciences Mathématiques',
      niveau: 'highschool',
      couleur: '#FF006E',
      icon: '🔢',
      courses: [
        { id: 'math-2sm', name: 'Mathématiques', icon: '📐', couleur: '#FF006E', description: 'Algèbre et analyse' },
        { id: 'phy-2sm', name: 'Physique', icon: '⚛️', couleur: '#FB5607', description: 'Mécanique' },
        { id: 'chim-2sm', name: 'Chimie', icon: '⚗️', couleur: '#FFBE0B', description: 'Chimie générale' },
        { id: 'svt-2sm', name: 'SVT', icon: '🧬', couleur: '#8338EC', description: 'Biologie moléculaire' },
        { id: 'fr-2sm', name: 'Français', icon: '📖', couleur: '#3A86FF', description: 'Littérature' },
        { id: 'ang-2sm', name: 'Anglais', icon: '🗣️', couleur: '#FB5607', description: 'Anglais scientifique' },
        { id: 'hist-2sm', name: 'Histoire', icon: '📜', couleur: '#744E1C', description: 'Histoire moderne' }
      ]
    },
    '2ndeSE': {
      name: '2nde Sciences Expérimentales',
      niveau: 'highschool',
      couleur: '#FB5607',
      icon: '🧪',
      courses: [
        { id: 'math-2se', name: 'Mathématiques', icon: '📐', couleur: '#FB5607', description: 'Mathématiques appliquées' },
        { id: 'phy-2se', name: 'Physique', icon: '💡', couleur: '#FF006E', description: 'Thermodynamique' },
        { id: 'chim-2se', name: 'Chimie', icon: '🧪', couleur: '#FFBE0B', description: 'Chimie expérimentale' },
        { id: 'svt-2se', name: 'SVT', icon: '🌿', couleur: '#8338EC', description: 'Écologie' },
        { id: 'fr-2se', name: 'Français', icon: '📖', couleur: '#3A86FF', description: 'Communication' },
        { id: 'ang-2se', name: 'Anglais', icon: '🗣️', couleur: '#FB5607', description: 'Anglais technique' },
        { id: 'hist-2se', name: 'Histoire', icon: '🏛️', couleur: '#744E1C', description: 'Géopolitique' }
      ]
    },
    '2ndeSS': {
      name: '2nde Sciences Sociales',
      niveau: 'highschool',
      couleur: '#FFBE0B',
      icon: '📊',
      courses: [
        { id: 'math-2ss', name: 'Mathématiques', icon: '📊', couleur: '#FFBE0B', description: 'Statistiques' },
        { id: 'fr-2ss', name: 'Français', icon: '📖', couleur: '#3A86FF', description: 'Stylistique' },
        { id: 'ang-2ss', name: 'Anglais', icon: '🗣️', couleur: '#FB5607', description: 'Anglais social' },
        { id: 'hist-2ss', name: 'Histoire', icon: '📜', couleur: '#744E1C', description: 'Histoire sociale' },
        { id: 'geo-2ss', name: 'Géographie', icon: '🌍', couleur: '#06FFA5', description: 'Géographie humaine' },
        { id: 'econ-2ss', name: 'Économie', icon: '💰', couleur: '#8338EC', description: 'Microéconomie' }
      ]
    },

    // PREMIÈRE
    '1ereSM': {
      name: '1ère Sciences Mathématiques',
      niveau: 'highschool',
      couleur: '#FF006E',
      icon: '📈',
      courses: [
        { id: 'math-1sm', name: 'Mathématiques', icon: '📐', couleur: '#FF006E', description: 'Calcul infinitésimal' },
        { id: 'phy-1sm', name: 'Physique', icon: '⚛️', couleur: '#FB5607', description: 'Optique' },
        { id: 'chim-1sm', name: 'Chimie', icon: '⚗️', couleur: '#FFBE0B', description: 'Cinétique chimique' },
        { id: 'fr-1sm', name: 'Français', icon: '📖', couleur: '#3A86FF', description: 'Rhétorique' },
        { id: 'philo-1sm', name: 'Philosophie', icon: '🤔', couleur: '#8338EC', description: 'Pensée critique' },
        { id: 'ang-1sm', name: 'Anglais', icon: '🗣️', couleur: '#FB5607', description: 'Anglais professionnel' }
      ]
    },
    '1ereSE': {
      name: '1ère Sciences Expérimentales',
      niveau: 'highschool',
      couleur: '#FB5607',
      icon: '🧬',
      courses: [
        { id: 'svt-1se', name: 'SVT', icon: '🧬', couleur: '#FB5607', description: 'Génétique' },
        { id: 'phy-1se', name: 'Physique', icon: '💡', couleur: '#FF006E', description: 'Électromagnétisme' },
        { id: 'chim-1se', name: 'Chimie', icon: '🧪', couleur: '#FFBE0B', description: 'Chimie organique' },
        { id: 'math-1se', name: 'Mathématiques', icon: '📐', couleur: '#3A86FF', description: 'Probabilités' },
        { id: 'fr-1se', name: 'Français', icon: '📖', couleur: '#3A86FF', description: 'Composition' },
        { id: 'philo-1se', name: 'Philosophie', icon: '🤔', couleur: '#8338EC', description: 'Métaphysique' }
      ]
    },
    '1ereSS': {
      name: '1ère Sciences Sociales',
      niveau: 'highschool',
      couleur: '#FFBE0B',
      icon: '📈',
      courses: [
        { id: 'econ-1ss', name: 'Économie', icon: '💼', couleur: '#FFBE0B', description: 'Macroéconomie' },
        { id: 'hist-1ss', name: 'Histoire', icon: '📚', couleur: '#744E1C', description: 'Histoire contemporaine' },
        { id: 'geo-1ss', name: 'Géographie', icon: '🌐', couleur: '#06FFA5', description: 'Géopolitique mondiale' },
        { id: 'fr-1ss', name: 'Français', icon: '📖', couleur: '#3A86FF', description: 'Essai' },
        { id: 'philo-1ss', name: 'Philosophie', icon: '🤔', couleur: '#8338EC', description: 'Éthique' },
        { id: 'ang-1ss', name: 'Anglais', icon: '🗣️', couleur: '#FB5607', description: 'Anglais diplomatique' }
      ]
    },

    // TERMINALE
    'TleSM': {
      name: 'Terminale Sciences Mathématiques',
      niveau: 'highschool',
      couleur: '#FF006E',
      icon: '🏆',
      courses: [
        { id: 'math-tlesm', name: 'Mathématiques', icon: '📐', couleur: '#FF006E', description: 'Analyse avancée' },
        { id: 'phy-tlesm', name: 'Physique', icon: '⚛️', couleur: '#FB5607', description: 'Relativité' },
        { id: 'chim-tlesm', name: 'Chimie', icon: '⚗️', couleur: '#FFBE0B', description: 'Chimie quantique' },
        { id: 'philo-tlesm', name: 'Philosophie', icon: '🤔', couleur: '#8338EC', description: 'Logique formelle' },
        { id: 'fr-tlesm', name: 'Français', icon: '📖', couleur: '#3A86FF', description: 'Littérature classique' }
      ]
    },
    'TleSE': {
      name: 'Terminale Sciences Expérimentales',
      niveau: 'highschool',
      couleur: '#FB5607', 
      icon: '🏆',
      courses: [
        { id: 'svt-telse', name: 'SVT', icon: '🧬', couleur: '#FB5607', description: 'Biologie cellulaire' },
        { id: 'phy-telse', name: 'Physique', icon: '⚛️', couleur: '#FF006E', description: 'Physique quantique' },
        { id: 'chim-telse', name: 'Chimie', icon: '🧪', couleur: '#FFBE0B', description: 'Chimie appliquée' },
        { id: 'math-telse', name: 'Mathématiques', icon: '📐', couleur: '#3A86FF', description: 'Calcul numérique' },
        { id: 'philo-telse', name: 'Philosophie', icon: '🤔', couleur: '#8338EC', description: 'Épistémologie' }
      ]
    },
    'TleSS': {
      name: 'Terminale Sciences Sociales',
      niveau: 'highschool',
      couleur: '#FFBE0B',
      icon: '🏆',
      courses: [
        { id: 'econ-tless', name: 'Économie', icon: '💼', couleur: '#FFBE0B', description: 'Économie internationale' },
        { id: 'hist-tless', name: 'Histoire', icon: '📜', couleur: '#744E1C', description: 'Histoire mondiale' },
        { id: 'geo-tless', name: 'Géographie', icon: '🌍', couleur: '#06FFA5', description: 'Géoéconomie' },
        { id: 'philo-tless', name: 'Philosophie', icon: '🤔', couleur: '#8338EC', description: 'Philosophie politique' },
        { id: 'fr-tless', name: 'Français', icon: '📖', couleur: '#3A86FF', description: 'Théâtre' }
      ]
    }
  },

  // 💾 SAUVEGARDER LES PROGRAMMES CUSTOMISÉS
  async saveProgrammeCustomization(className, customCourses) {
    if (!State.user) return false;
    
    try {
      const customizationRef = db.collection('schools').doc(State.profile.schoolId || 'default')
        .collection('programmes').doc(className);
      
      await customizationRef.set({
        className,
        courses: customCourses,
        updatedAt: new Date().toISOString(),
        updatedBy: State.user.uid
      }, { merge: true });
      
      this.programmes[className].courses = customCourses;
      showToast(`✅ Programmes de ${className} mis à jour!`, 'success');
      return true;
    } catch(e) {
      console.error('Erreur sauvegarde:', e);
      showToast('❌ Erreur lors de la sauvegarde', 'error');
      return false;
    }
  },

  // 📥 CHARGER LES PROGRAMMES CUSTOMISÉS
  async loadCustomProgrammes() {
    if (!State.user || !State.profile.schoolId) return;
    
    try {
      const programmesSnapshot = await db.collection('schools').doc(State.profile.schoolId)
        .collection('programmes').get();
      
      programmesSnapshot.forEach(doc => {
        const data = doc.data();
        if (this.programmes[data.className]) {
          this.programmes[data.className].courses = data.courses;
        }
      });
    } catch(e) {
      console.error('Erreur chargement programmes:', e);
    }
  },

  // 🎨 OBTENIR TOUS LES COURS D'UNE CLASSE
  getCoursesForClass(className) {
    return this.programmes[className]?.courses || [];
  },

  // 🎯 OBTENIR LES DÉTAILS D'UN COURS
  getCourseDetails(className, courseId) {
    const courses = this.getCoursesForClass(className);
    return courses.find(c => c.id === courseId);
  },

  // 🔄 METTRE À JOUR UN COURS
  async updateCourse(className, courseId, updates) {
    const courseIdx = this.programmes[className].courses.findIndex(c => c.id === courseId);
    if (courseIdx === -1) return false;

    this.programmes[className].courses[courseIdx] = {
      ...this.programmes[className].courses[courseIdx],
      ...updates
    };

    return await this.saveProgrammeCustomization(className, this.programmes[className].courses);
  },

  // ➕ AJOUTER UN NOUVEAU COURS
  async addCourse(className, newCourse) {
    if (!this.programmes[className]) return false;

    this.programmes[className].courses.push({
      id: `custom-${Date.now()}`,
      ...newCourse
    });

    return await this.saveProgrammeCustomization(className, this.programmes[className].courses);
  },

  /**
   * ➕ Ajouter un chapitre à un cours
   */
  async addChapter(className, courseId, chapter) {
    const prog = this.programmes[className];
    if (!prog) return false;
    const course = prog.courses.find(c => c.id === courseId);
    if (!course) return false;

    course.chapters = course.chapters || [];
    const chapId = chapter.id || `chap-${Date.now()}`;
    course.chapters.push({ id: chapId, title: chapter.title || 'Nouveau chapitre', lessons: chapter.lessons || [] });

    return await this.saveProgrammeCustomization(className, prog.courses);
  },

  /**
   * ➕ Ajouter une leçon à un chapitre
   */
  async addLesson(className, courseId, chapterId, lesson) {
    const prog = this.programmes[className];
    if (!prog) return false;
    const course = prog.courses.find(c => c.id === courseId);
    if (!course) return false;
    course.chapters = course.chapters || [];
    const chapter = course.chapters.find(ch => ch.id === chapterId);
    if (!chapter) return false;

    chapter.lessons = chapter.lessons || [];
    const lessonId = lesson.id || `lesson-${Date.now()}`;
    chapter.lessons.push({ id: lessonId, title: lesson.title || 'Nouvelle leçon', content: lesson.content || '', videoUrl: lesson.videoUrl || '' });

    return await this.saveProgrammeCustomization(className, prog.courses);
  },

  /**
   * ✏️ Mettre à jour une leçon
   */
  async updateLesson(className, courseId, chapterId, lessonId, updates) {
    const prog = this.programmes[className];
    if (!prog) return false;
    const course = prog.courses.find(c => c.id === courseId);
    if (!course) return false;
    const chapter = (course.chapters || []).find(ch => ch.id === chapterId);
    if (!chapter) return false;
    const lesson = (chapter.lessons || []).find(l => l.id === lessonId);
    if (!lesson) return false;

    Object.assign(lesson, updates);
    return await this.saveProgrammeCustomization(className, prog.courses);
  },

  /**
   * ➖ Supprimer une leçon
   */
  async removeLesson(className, courseId, chapterId, lessonId) {
    const prog = this.programmes[className];
    if (!prog) return false;
    const course = prog.courses.find(c => c.id === courseId);
    if (!course) return false;
    const chapter = (course.chapters || []).find(ch => ch.id === chapterId);
    if (!chapter) return false;

    chapter.lessons = (chapter.lessons || []).filter(l => l.id !== lessonId);
    return await this.saveProgrammeCustomization(className, prog.courses);
  },

  // ➖ SUPPRIMER UN COURS
  async removeCourse(className, courseId) {
    if (!this.programmes[className]) return false;

    this.programmes[className].courses = this.programmes[className].courses
      .filter(c => c.id !== courseId);

    return await this.saveProgrammeCustomization(className, this.programmes[className].courses);
  },

  // 🎨 GÉNÉRATEUR D'INTERFACE POUR UNE CLASSE
  generateClassroomUI(className) {
    const prog = this.programmes[className];
    if (!prog) return '';

    const coursesHTML = prog.courses.map(course => `
      <div class="course-card" data-course-id="${course.id}" style="border-left: 4px solid ${course.couleur}">
        <div class="course-header">
          <span class="course-icon" style="font-size: 2rem">${course.icon}</span>
          <div class="course-info">
            <h3 class="course-name">${course.name}</h3>
            <p class="course-description">${course.description}</p>
          </div>
        </div>
        <div class="course-actions">
          <button class="btn btn-sm" onclick="navigateToCourse('${className}', '${course.id}')">Accéder</button>
          <button class="btn btn-sm btn-outline" onclick="editCourse('${className}', '${course.id}')">Modifier</button>
        </div>
      </div>
    `).join('');

    return `
      <div class="classroom-container" data-class="${className}">
        <div class="classroom-header" style="background: linear-gradient(135deg, ${prog.couleur}, rgba(0,0,0,0.1))">
          <span class="classroom-icon" style="font-size: 3rem">${prog.icon}</span>
          <div class="classroom-info">
            <h2>${prog.name}</h2>
            <p>${prog.courses.length} cours disponibles</p>
          </div>
        </div>
        <div class="courses-grid">
          ${coursesHTML}
        </div>
      </div>
    `;
  },

  // 🎨 INTERFACE D'ADMINISTRATION
  generateAdminPanel() {
    const classesHTML = Object.entries(this.programmes).map(([className, prog]) => `
      <div class="admin-class-item">
        <span style="font-size: 1.5rem">${prog.icon}</span>
        <div>
          <h4>${prog.name}</h4>
          <p>${prog.courses.length} cours</p>
        </div>
        <button class="btn btn-sm" onclick="openClassEditor('${className}')">Gérer</button>
      </div>
    `).join('');

    return `
      <div class="admin-courses-panel">
        <h2>🎓 Gestion des Programmes</h2>
        <div class="admin-classes-grid">
          ${classesHTML}
        </div>
      </div>
    `;
  }
};

// ============================================================
// 🔧 FONCTIONS D'ÉDITION
// ============================================================

function openClassEditor(className) {
  const prog = CourseManagementSystem.programmes[className];
  const coursesHTML = prog.courses.map((course, idx) => `
    <div class="edit-course-row">
      <input type="text" value="${course.icon}" placeholder="Icone" class="course-icon-input" onchange="updateCourseField('${className}', ${idx}, 'icon', this.value)">
      <input type="text" value="${course.name}" placeholder="Nom du cours" class="course-name-input" onchange="updateCourseField('${className}', ${idx}, 'name', this.value)">
      <input type="text" value="${course.description}" placeholder="Description" class="course-desc-input" onchange="updateCourseField('${className}', ${idx}, 'description', this.value)">
      <input type="color" value="${course.couleur}" placeholder="Couleur" class="course-color-input" onchange="updateCourseField('${className}', ${idx}, 'couleur', this.value)">
      <button class="btn btn-sm btn-danger" onclick="CourseManagementSystem.removeCourse('${className}', '${course.id}')">Supprimer</button>
    </div>
  `).join('');

  const modal = `
    <div class="modal-header">
      <h3>Gérer les cours - ${prog.name}</h3>
    </div>
    <div class="modal-body" style="max-height: 500px; overflow-y: auto;">
      <div class="edit-courses-list">
        ${coursesHTML}
      </div>
      <button class="btn btn-primary" style="margin-top: 20px; width: 100%;" onclick="addNewCourse('${className}')">➕ Ajouter un cours</button>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Fermer</button>
    </div>
  `;

  showModal(modal);
}

function updateCourseField(className, courseIdx, field, value) {
  CourseManagementSystem.programmes[className].courses[courseIdx][field] = value;
}

async function addNewCourse(className) {
  const newCourse = {
    name: 'Nouveau cours',
    icon: '📚',
    description: 'Description du cours',
    couleur: '#6C63FF'
  };

  await CourseManagementSystem.addCourse(className, newCourse);
  closeModal();
  openClassEditor(className);
}

async function navigateToCourse(className, courseId) {
  const course = CourseManagementSystem.getCourseDetails(className, courseId);
  if (course) {
    showToast(`📚 Ouverture de ${course.name}...`, 'info');
    // Navigate to course details
    if (typeof navigate === 'function') {
      navigate('course-view', { className, courseId });
    }
  }
}

function editCourse(className, courseId) {
  openClassEditor(className);
}

// ============================================================
// 📊 AFFICHAGE DES SALLES DE CLASSE
// ============================================================

function displayClassrooms() {
  const container = document.getElementById('classrooms-container');
  if (!container) return;

  let html = '';
  for (const [className, prog] of Object.entries(CourseManagementSystem.programmes)) {
    html += CourseManagementSystem.generateClassroomUI(className);
  }

  container.innerHTML = html;
}

// Exporter pour utilisation
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CourseManagementSystem;
}

/**
 * Initialise la synchronisation temps-réel Firestore pour programmes et tarifs.
 * Tente de se connecter jusqu'à 10 fois si `State.profile` ou `db` ne sont pas encore prêts.
 */
CourseManagementSystem.initRealtimeSync = function(retries = 0) {
  try {
    if (typeof db === 'undefined' || typeof State === 'undefined' || !State.profile) {
      if (retries < 10) {
        setTimeout(() => CourseManagementSystem.initRealtimeSync(retries + 1), 1000);
      }
      return;
    }

    const schoolId = State.profile.schoolId || State.profile.schoolCode || 'default';

    // Programmes par école
    try {
      const progRef = db.collection('schools').doc(schoolId).collection('programmes');
      progRef.onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
          const doc = change.doc.data();
          const className = doc.className || change.doc.id;
          CourseManagementSystem.programmes[className] = CourseManagementSystem.programmes[className] || {};
          CourseManagementSystem.programmes[className].courses = doc.courses || [];
          if (doc.label) CourseManagementSystem.programmes[className].label = doc.label;
          if (doc.niveau) CourseManagementSystem.programmes[className].niveau = doc.niveau;
          if (doc.icon) CourseManagementSystem.programmes[className].icon = doc.icon;
          if (doc.couleur) CourseManagementSystem.programmes[className].couleur = doc.couleur;
        });

        // Rafraîchir vues si présentes
        if (typeof displayClassrooms === 'function') displayClassrooms();
        if (typeof AdminClassroomsPanel !== 'undefined' && AdminClassroomsPanel.renderClassesList) AdminClassroomsPanel.renderClassesList();
        if (typeof renderCourseView === 'function' && State.currentPage === 'course-view') {
          // re-render course view to show chapters/lessons updates
          try { renderCourseView(document.getElementById('app') || document.getElementById('page-content') || document.body); } catch(e) { /* ignore */ }
        }
      });
    } catch (e) {
      console.warn('Realtime programmes listener failed', e);
    }

    // Tarifs globaux (settings/pricing)
    try {
      const pricingRef = db.collection('settings').doc('pricing');
      pricingRef.onSnapshot(doc => {
        const data = doc.data() || {};
        window.PricingSettings = data;
        // Propager vers PricingSystem si présent
        if (typeof PricingSystem !== 'undefined' && PricingSystem.applySettings) {
          try { PricingSystem.applySettings(data); } catch(e) { console.warn('PricingSystem.applySettings failed', e); }
        }
        if (typeof updatePricingDisplay === 'function') updatePricingDisplay(data);
      });
    } catch (e) {
      console.warn('Realtime pricing listener failed', e);
    }

  } catch (err) {
    if (retries < 10) setTimeout(() => CourseManagementSystem.initRealtimeSync(retries + 1), 1000);
  }
};

// Démarrer automatiquement la sync si la lib est chargée dans la page
try { CourseManagementSystem.initRealtimeSync(); } catch (e) { /* ignore */ }
