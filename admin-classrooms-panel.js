/**
 * ⚡ ADMIN PANEL - GESTION DES SALLES DE CLASSE
 * Module intégré dans Neoclass3.html Admin Panel
 * 
 * Permet aux admins de:
 * - Voir toutes les 24 classes
 * - Ajouter/modifier/supprimer des cours
 * - Personnaliser les icones et couleurs
 * - Gérer les programmes par niveau
 * - Exporter/Importer les données
 */

const AdminClassroomsPanel = {
  // 🎯 État du module
  currentLevel: 'all', // all, primary, middle, highschool
  currentClass: null,
  editingCourse: null,
  filterText: '',

  /**
   * 📱 Initialiser le panel admin
   */
  init() {
    console.log('✅ Admin Classrooms Panel chargé');
    this.renderAdminInterface();
    this.attachEventListeners();
  },

  /**
   * 🎨 Rendre l'interface admin complète
   */
  renderAdminInterface() {
    const container = document.getElementById('admin-classrooms-container') || 
                     document.querySelector('[data-admin-page="classrooms"]');
    
    if (!container) {
      console.warn('⚠️ Conteneur admin classrooms introuvable');
      return;
    }

    container.innerHTML = `
      <div class="admin-classrooms-wrapper">
        <!-- En-tête -->
        <div class="admin-header-classrooms">
          <div class="header-content">
            <h1>🏫 Gestion des Salles de Classe</h1>
            <p>Gérez les cours de vos 24 classes</p>
          </div>
          <div class="header-actions">
            <button class="btn btn-primary" id="btn-export-programs">
              📥 Exporter
            </button>
            <button class="btn btn-outline" id="btn-import-programs">
              📤 Importer
            </button>
            <button class="btn btn-success" id="btn-reset-programs">
              🔄 Réinitialiser
            </button>
            <button class="btn btn-accent" id="btn-add-class">
              ➕ Ajouter une classe
            </button>
          </div>
        </div>

        <!-- Filtres -->
        <div class="admin-filters-classrooms">
          <div class="filter-group">
            <input 
              type="text" 
              id="filter-courses" 
              placeholder="🔍 Rechercher un cours..."
              class="filter-input"
            />
          </div>
          <div class="filter-buttons">
            <button class="filter-btn active" data-level="all">
              📚 Tous (24)
            </button>
            <button class="filter-btn" data-level="primary">
              🅰️ Primaire (5)
            </button>
            <button class="filter-btn" data-level="middle">
              🏫 Collège (4)
            </button>
            <button class="filter-btn" data-level="highschool">
              🏆 Lycée (9)
            </button>
          </div>
        </div>

        <!-- Contenu principal: Grille des classes -->
        <div class="admin-classrooms-grid">
          <div id="admin-classes-list" class="admin-classes-list"></div>

          <!-- Panel détail -->
          <div class="admin-detail-panel">
            <div id="admin-class-detail" class="admin-class-detail">
              <div class="placeholder-message">
                <p>👈 Sélectionnez une classe pour modifier ses cours</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal pour ajouter/modifier un cours -->
      <div id="modal-course" class="modal-classrooms">
        <div class="modal-content-classrooms">
          <div class="modal-header">
            <h2 id="modal-title">Ajouter un cours</h2>
            <button class="btn-close" id="btn-close-modal">✕</button>
          </div>
          <form id="form-course">
            <div class="form-group">
              <label>Nom du cours</label>
              <input type="text" id="course-name" placeholder="Ex: Mathématiques" required>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>Icone</label>
                <div class="icon-picker" id="icon-picker">
                  <input type="text" id="course-icon" placeholder="📖" maxlength="2">
                </div>
              </div>
              
              <div class="form-group">
                <label>Couleur</label>
                <input type="color" id="course-color" value="#6c63ff">
              </div>
            </div>

            <div class="form-group">
              <label>Description</label>
              <textarea id="course-description" placeholder="Décrivez le cours..." rows="3"></textarea>
            </div>

            <div class="form-group">
              <label>ID unique (optionnel)</label>
              <input type="text" id="course-id" placeholder="Auto-généré si vide">
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-outline" id="btn-cancel-course">Annuler</button>
              <button type="submit" class="btn btn-primary">Enregistrer</button>
            </div>
          </form>
        </div>
      </div>
      <!-- Modal pour ajouter / éditer une CLASSE -->
      <div id="modal-class" class="modal-classrooms">
        <div class="modal-content-classrooms">
          <div class="modal-header">
            <h2 id="modal-class-title">Ajouter une classe</h2>
            <button class="btn-close" id="btn-close-class-modal">✕</button>
          </div>
          <form id="form-class">
            <div class="form-group">
              <label>Code / ID (ex: CM1A)</label>
              <input type="text" id="class-id" placeholder="CM1A">
            </div>
            <div class="form-group">
              <label>Nom affiché (ex: CM1 A)</label>
              <input type="text" id="class-label" placeholder="CM1 A">
            </div>
            <div class="form-group">
              <label>Niveau</label>
              <select id="class-level" class="form-input">
                <option value="primary">Primaire</option>
                <option value="middle">Collège</option>
                <option value="highschool">Lycée</option>
                <option value="other">Autre</option>
              </select>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Icone</label>
                <input type="text" id="class-icon" placeholder="🏫">
              </div>
              <div class="form-group">
                <label>Couleur</label>
                <input type="color" id="class-color" value="#6c63ff">
              </div>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-outline" id="btn-cancel-class">Annuler</button>
              <button type="submit" class="btn btn-primary">Enregistrer</button>
            </div>
          </form>
        </div>
      </div>
    `;

    this.renderClassesList();
    // Mettre à jour les compteurs dynamiquement
    try {
      const counts = { all: 0, primary: 0, middle: 0, highschool: 0 };
      Object.values(CourseManagementSystem.programmes || {}).forEach(p => {
        counts.all += 1;
        const lvl = p.niveau || p.level || 'other';
        if (lvl === 'primary') counts.primary += 1;
        else if (lvl === 'middle') counts.middle += 1;
        else if (lvl === 'highschool') counts.highschool += 1;
      });
      const btnAll = document.querySelector('.filter-btn[data-level="all"]');
      const btnP = document.querySelector('.filter-btn[data-level="primary"]');
      const btnM = document.querySelector('.filter-btn[data-level="middle"]');
      const btnH = document.querySelector('.filter-btn[data-level="highschool"]');
      if (btnAll) btnAll.textContent = `📚 Tous (${counts.all})`;
      if (btnP) btnP.textContent = `🅰️ Primaire (${counts.primary})`;
      if (btnM) btnM.textContent = `🏫 Collège (${counts.middle})`;
      if (btnH) btnH.textContent = `🏆 Lycée (${counts.highschool})`;
    } catch (e) { console.warn('Erreur update counts', e); }
  },

  /**
   * 📋 Afficher la liste des classes
   */
  renderClassesList() {
    const list = document.getElementById('admin-classes-list');
    if (!list) return;

    const filteredClasses = this.getFilteredClasses();
    
    let html = '<div class="admin-classes-cards">';
    
    filteredClasses.forEach(([className, prog], idx) => {
      const courseCount = (prog && Array.isArray(prog.courses)) ? prog.courses.length : 0;
      const displayLabel = (prog && prog.label) ? prog.label : className;
      const niveau = (prog && prog.niveau) ? prog.niveau : (prog && prog.level) ? prog.level : 'unknown';
      const icon = (prog && prog.icon) ? prog.icon : '🏫';
      html += `
        <div class="admin-class-card" data-class="${className}">
          <div class="card-icon">${icon}</div>
          <div class="card-content">
            <h3>${displayLabel}</h3>
            <p class="card-meta">${niveau}</p>
            <p class="card-courses">📚 ${courseCount} cours</p>
          </div>
          <div class="card-actions">
            <button class="btn-icon" title="Sélectionner" onclick="AdminClassroomsPanel.selectClass('${className}')">✏️</button>
            <button class="btn-icon" title="Aperçu" onclick="AdminClassroomsPanel.previewClass('${className}')">👁️</button>
            <button class="btn-icon" title="Éditer la classe" onclick="AdminClassroomsPanel.openEditClassModal('${className}')">🛠️</button>
            <button class="btn-icon btn-danger" title="Supprimer la classe" onclick="AdminClassroomsPanel.deleteClass('${className}')">🗑️</button>
          </div>
        </div>
      `;
    });

    html += '</div>';
    list.innerHTML = html;
  },

  /**
   * 🎯 Obtenir les classes filtrées
   */
  getFilteredClasses() {
    let classes = Object.entries(CourseManagementSystem.programmes);
    
    // Filtrer par niveau
    if (this.currentLevel !== 'all') {
      classes = classes.filter(([_, prog]) => prog.niveau === this.currentLevel);
    }
    
    // Filtrer par texte
    if (this.filterText) {
      classes = classes.filter(([name, prog]) => 
        name.toLowerCase().includes(this.filterText.toLowerCase()) ||
        ((prog && prog.label) || '').toLowerCase().includes(this.filterText.toLowerCase())
      );
    }
    
    return classes;
  },

  /**
   * 🔍 Sélectionner une classe pour l'éditer
   */
  selectClass(className) {
    this.currentClass = className;
    this.renderClassDetail(className);
  },

  /**
   * Ouvrir le modal pour ajouter une classe
   */
  openAddClassModal() {
    this.editingClass = null;
    document.getElementById('modal-class-title').textContent = `Ajouter une classe`;
    const f = document.getElementById('form-class'); if(f) f.reset();
    document.getElementById('class-icon').value = '🏫';
    document.getElementById('class-color').value = '#6c63ff';
    document.getElementById('modal-class').classList.add('open');
  },

  /**
   * Ouvrir le modal pour éditer une classe
   */
  openEditClassModal(className) {
    const prog = CourseManagementSystem.programmes[className] || {};
    this.editingClass = className;
    document.getElementById('modal-class-title').textContent = `Éditer la classe: ${className}`;
    document.getElementById('class-id').value = className;
    document.getElementById('class-label').value = prog.label || className;
    document.getElementById('class-level').value = prog.niveau || prog.level || 'primary';
    document.getElementById('class-icon').value = prog.icon || '🏫';
    document.getElementById('class-color').value = prog.couleur || '#6c63ff';
    document.getElementById('modal-class').classList.add('open');
  },

  /**
   * Supprimer une classe
   */
  deleteClass(className) {
    if (!confirm(`Supprimer la classe ${className} (tous ses cours) ?`)) return;
    delete CourseManagementSystem.programmes[className];
    this.renderClassesList();
    this.saveToDB();
    this.showToast(`🗑️ Classe ${className} supprimée`, 'success');
  },

  /**
   * 📝 Afficher les détails d'une classe
   */
  renderClassDetail(className) {
    const detail = document.getElementById('admin-class-detail');
    if (!detail) return;

    const prog = CourseManagementSystem.programmes[className];
    if (!prog) {
      detail.innerHTML = '<p>Classe introuvable</p>';
      return;
    }

    const displayLabel = prog.label || className;
    const displayIcon = prog.icon || '🏫';
    const displayDesc = prog.description || '';
    const courseCount = Array.isArray(prog.courses) ? prog.courses.length : 0;
    const displayNiveau = prog.niveau || prog.level || 'unknown';

    let html = `
      <div class="class-detail-header">
        <div class="detail-title">
          <span class="detail-icon">${displayIcon}</span>
          <div>
            <h2>${displayLabel}</h2>
            <p>${displayDesc}</p>
          </div>
        </div>
        <div class="detail-stats">
          <div class="stat">
            <span class="stat-value">${courseCount}</span>
            <span class="stat-label">Cours</span>
          </div>
          <div class="stat">
            <span class="stat-value">${displayNiveau}</span>
            <span class="stat-label">Niveau</span>
          </div>
        </div>
      </div>

      <div class="class-detail-actions">
        <button class="btn btn-primary" onclick="AdminClassroomsPanel.openAddCourseModal('${className}')">
          ➕ Ajouter un cours
        </button>
        <button class="btn btn-outline" onclick="AdminClassroomsPanel.exportClass('${className}')">
          📥 Exporter cette classe
        </button>
      </div>

      <div class="courses-table">
        <div class="table-header">
          <div class="col-icon">Icone</div>
          <div class="col-name">Nom</div>
          <div class="col-description">Description</div>
          <div class="col-actions">Actions</div>
        </div>
        <div class="table-body" id="courses-table-body">
          <!-- Rempli ci-dessous -->
        </div>
      </div>
    `;

    detail.innerHTML = html;

    // Remplir le tableau des cours
    const tableBody = detail.querySelector('#courses-table-body');
    const coursesArray = Array.isArray(prog.courses) ? prog.courses : [];
    coursesArray.forEach((course, index) => {
      const courseRow = `
        <div class="table-row">
          <div class="col-icon">
            <span style="font-size: 24px;">${course.icon}</span>
          </div>
          <div class="col-name">
            <strong>${course.name}</strong>
            <small>${course.id || '-'}</small>
          </div>
          <div class="col-description">
            ${course.description || 'Pas de description'}
          </div>
          <div class="col-actions">
            <button class="btn-icon-small" title="Éditer" 
              onclick="AdminClassroomsPanel.openEditCourseModal('${className}', ${index})">
              ✏️
            </button>
            <button class="btn-icon-small btn-danger" title="Supprimer" 
              onclick="AdminClassroomsPanel.deleteCourse('${className}', ${index})">
              🗑️
            </button>
          </div>
        </div>
      `;
      tableBody.innerHTML += courseRow;
    });
  },

  /**
   * ➕ Ouvrir le modal pour ajouter un cours
   */
  openAddCourseModal(className) {
    if (!this.currentClass) {
      this.currentClass = className;
    }
    
    this.editingCourse = null;
    document.getElementById('modal-title').textContent = `Ajouter un cours à ${this.currentClass}`;
    document.getElementById('form-course').reset();
    document.getElementById('course-icon').value = '📖';
    document.getElementById('course-color').value = '#6c63ff';
    
    document.getElementById('modal-course').classList.add('open');
  },

  /**
   * ✏️ Ouvrir le modal pour éditer un cours
   */
  openEditCourseModal(className, courseIndex) {
    const prog = CourseManagementSystem.programmes[className];
    const course = prog.courses[courseIndex];
    
    this.currentClass = className;
    this.editingCourse = courseIndex;
    
    document.getElementById('modal-title').textContent = `Éditer: ${course.name}`;
    document.getElementById('course-name').value = course.name;
    document.getElementById('course-icon').value = course.icon;
    document.getElementById('course-color').value = course.couleur || '#6c63ff';
    document.getElementById('course-description').value = course.description || '';
    document.getElementById('course-id').value = course.id || '';
    
    document.getElementById('modal-course').classList.add('open');
  },

  /**
   * 💾 Sauvegarder un cours
   */
  saveCourse(event) {
    event.preventDefault();
    
    if (!this.currentClass) return;
    
    const courseData = {
      name: document.getElementById('course-name').value,
      icon: document.getElementById('course-icon').value || '📖',
      couleur: document.getElementById('course-color').value,
      description: document.getElementById('course-description').value,
      id: document.getElementById('course-id').value
    };

    const prog = CourseManagementSystem.programmes[this.currentClass];
    
    if (this.editingCourse !== null) {
      // Modifier
      prog.courses[this.editingCourse] = courseData;
    } else {
      // Ajouter
      prog.courses.push(courseData);
    }

    this.closeModal();
    this.renderClassDetail(this.currentClass);
    this.saveToDB();
    this.showToast('✅ Cours enregistré avec succès', 'success');
  },

  /**
   * Sauvegarder une classe (ajout ou modification)
   */
  saveClass(event) {
    event.preventDefault();
    const idInput = (document.getElementById('class-id').value || '').trim();
    const label = (document.getElementById('class-label').value || '').trim();
    const level = document.getElementById('class-level').value || 'primary';
    const icon = document.getElementById('class-icon').value || '🏫';
    const color = document.getElementById('class-color').value || '#6c63ff';

    if (!label && !idInput) { this.showToast('Le nom ou l\'ID est requis', 'error'); return; }
    const classId = idInput || label.replace(/\s+/g,'-').toLowerCase();

    // Si édition et changement d'ID
    if (this.editingClass && this.editingClass !== classId) {
      const prog = CourseManagementSystem.programmes[this.editingClass];
      if (prog) {
        CourseManagementSystem.programmes[classId] = Object.assign({}, prog, { label, niveau: level, icon, couleur: color });
        delete CourseManagementSystem.programmes[this.editingClass];
      }
    } else {
      CourseManagementSystem.programmes[classId] = CourseManagementSystem.programmes[classId] || { courses: [] };
      CourseManagementSystem.programmes[classId].label = label || classId;
      CourseManagementSystem.programmes[classId].niveau = level;
      CourseManagementSystem.programmes[classId].icon = icon;
      CourseManagementSystem.programmes[classId].couleur = color;
    }

    this.closeClassModal();
    this.renderClassesList();
    this.saveToDB();
    this.showToast('✅ Classe enregistrée', 'success');
  },

  closeClassModal() {
    document.getElementById('modal-class')?.classList.remove('open');
  },

  /**
   * 🗑️ Supprimer un cours
   */
  deleteCourse(className, courseIndex) {
    if (!confirm('❌ Êtes-vous sûr de vouloir supprimer ce cours?')) return;
    
    const prog = CourseManagementSystem.programmes[className];
    const course = prog.courses[courseIndex];
    
    prog.courses.splice(courseIndex, 1);
    this.renderClassDetail(className);
    this.saveToDB();
    this.showToast(`🗑️ Cours "${course.name}" supprimé`, 'success');
  },

  /**
   * 👁️ Aperçu d'une classe
   */
  previewClass(className) {
    const html = CourseManagementSystem.generateClassroomUI(className);
    
    // Ouvrir dans une nouvelle fenêtre de prévisualisation
    const modal = document.createElement('div');
    modal.className = 'preview-modal';
    modal.innerHTML = `
      <div class="preview-content">
        <button class="btn-close" onclick="this.closest('.preview-modal').remove()">✕</button>
        ${html}
      </div>
    `;
    document.body.appendChild(modal);
  },

  /**
   * 📥 Exporter une classe
   */
  exportClass(className) {
    const prog = CourseManagementSystem.programmes[className];
    const data = JSON.stringify(prog, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${className}-programs.json`;
    a.click();
    this.showToast('📥 Classe exportée', 'success');
  },

  /**
   * 📤 Exporter tous les programmes
   */
  exportAllPrograms() {
    const data = JSON.stringify(CourseManagementSystem.programmes, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'all-programs.json';
    a.click();
    this.showToast('📥 Tous les programmes exportés', 'success');
  },

  /**
   * 📤 Importer des programmes
   */
  importPrograms() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          Object.assign(CourseManagementSystem.programmes, data);
          this.renderClassesList();
          this.saveToDB();
          this.showToast('✅ Programmes importés avec succès', 'success');
        } catch (err) {
          this.showToast('❌ Erreur lors de l\'import', 'error');
          console.error(err);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  },

  /**
   * 🔄 Réinitialiser les programmes
   */
  resetPrograms() {
    if (!confirm('⚠️ Réinitialiser TOUS les programmes? Cette action est irréversible!')) return;
    
    // Reload from default
    location.reload();
  },

  /**
   * 💾 Sauvegarder dans la DB
   */
  async saveToDB() {
    try {
      if (typeof CourseManagementSystem !== 'undefined' && CourseManagementSystem.saveProgrammeCustomization) {
        for (const [className, prog] of Object.entries(CourseManagementSystem.programmes)) {
          await CourseManagementSystem.saveProgrammeCustomization(className, prog.courses);
        }
      }
    } catch (err) {
      console.warn('⚠️ Impossible de sauvegarder en DB:', err);
    }
  },

  /**
   * ❌ Fermer le modal
   */
  closeModal() {
    document.getElementById('modal-course')?.classList.remove('open');
  },

  /**
   * 📢 Afficher une notification
   */
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  /**
   * 🔗 Attacher les event listeners
   */
  attachEventListeners() {
    // Filtres de niveau
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.currentLevel = e.target.dataset.level;
        this.renderClassesList();
      });
    });

    // Recherche
    document.getElementById('filter-courses')?.addEventListener('input', (e) => {
      this.filterText = e.target.value;
      this.renderClassesList();
    });

    // Boutons d'action
    document.getElementById('btn-export-programs')?.addEventListener('click', () => this.exportAllPrograms());
    document.getElementById('btn-import-programs')?.addEventListener('click', () => this.importPrograms());
    document.getElementById('btn-reset-programs')?.addEventListener('click', () => this.resetPrograms());
    document.getElementById('btn-add-class')?.addEventListener('click', () => this.openAddClassModal());

    // Modal
    document.getElementById('form-course')?.addEventListener('submit', (e) => this.saveCourse(e));
    document.getElementById('btn-close-modal')?.addEventListener('click', () => this.closeModal());
    document.getElementById('btn-cancel-course')?.addEventListener('click', () => this.closeModal());

    // Class modal listeners
    document.getElementById('form-class')?.addEventListener('submit', (e) => this.saveClass(e));
    document.getElementById('btn-close-class-modal')?.addEventListener('click', () => this.closeClassModal());
    document.getElementById('btn-cancel-class')?.addEventListener('click', () => this.closeClassModal());

    // Fermer modal-class au clic en dehors
    document.getElementById('modal-class')?.addEventListener('click', (e) => {
      if (e.target.id === 'modal-class') this.closeClassModal();
    });

    // Fermer modal au clic en dehors
    document.getElementById('modal-course')?.addEventListener('click', (e) => {
      if (e.target.id === 'modal-course') this.closeModal();
    });
  }
};

// 🚀 Initialiser quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('admin-classrooms-container') || document.querySelector('[data-admin-page="classrooms"]')) {
    AdminClassroomsPanel.init();
  }
});
