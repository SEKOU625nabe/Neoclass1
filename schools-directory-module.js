// ============================================================
// NEOCLASS – MODULE ANNUAIRE ÉCOLES v1.0
// Gestion du catalogue, recherche, filtres et système de contact
// ============================================================

const SchoolDirectory = {
  // État
  state: {
    allSchools: [],
    filteredSchools: [],
    currentPage: 1,
    itemsPerPage: 12,
    currentSchool: null,
    searchQuery: '',
    filters: {
      curriculum: '',
      level: '',
      city: '',
      rating: 0
    },
    sortBy: 'popular'
  },

  // ===== INITIALISATION =====
  async init() {
    console.log('🏫 Initialisation du module Annuaire Écoles...');
    
    try {
      await this.loadSchools();
      this.render();
      this.setupEventListeners();
      console.log('✅ Module Annuaire Écoles initialisé');
    } catch (error) {
      console.error('❌ Erreur initialisation:', error);
    }
  },

  // ===== CHARGER LES ÉCOLES =====
  async loadSchools() {
    if (typeof db === 'undefined') {
      console.error('❌ Firestore non initialisé');
      return;
    }

    try {
      // Charger les écoles publiées et vérifiées
      const snapshot = await db.collection('users')
        .where('role', '==', 'school')
        .where('isPublished', '==', true)
        .orderBy('createdAt', 'desc')
        .get();

      this.state.allSchools = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log(`📚 ${this.state.allSchools.length} écoles chargées`);
      this.applyFilters();
    } catch (error) {
      console.error('❌ Erreur chargement écoles:', error);
      // Mode démo si Firestore pas disponible
      this.loadDemoSchools();
    }
  },

  // ===== DONNÉES DÉMO =====
  loadDemoSchools() {
    console.log('📌 Chargement des données de démonstration...');
    
    this.state.allSchools = [
      {
        id: 'school_001',
        schoolName: 'École Primaire Réussir',
        city: 'Conakry',
        address: 'Quartier Kaloum, Conakry',
        coverPhotoURL: 'https://via.placeholder.com/400x200?text=Ecole+Reussir',
        logoURL: 'https://via.placeholder.com/100x100?text=Logo',
        description: 'École primaire de qualité avec un programme éducatif innovant.',
        studentCount: 450,
        classCount: 18,
        teacherCount: 25,
        averageRating: 4.8,
        totalReviews: 42,
        curriculum: ['Guinéen', 'Français'],
        levels: ['Primaire'],
        contactPhone: '+224 621 23 45 67',
        whatsappPhone: '+224 621 23 45 67',
        website: 'https://ecole-reussir.gn',
        isVerified: true,
        isPublished: true,
        socialLinks: {
          facebook: 'https://facebook.com/ecolereussir',
          instagram: 'https://instagram.com/ecolereussir'
        }
      },
      {
        id: 'school_002',
        schoolName: 'Lycée Camayenne Excellence',
        city: 'Conakry',
        address: 'Camayenne, Conakry',
        coverPhotoURL: 'https://via.placeholder.com/400x200?text=Lycee+Camayenne',
        logoURL: 'https://via.placeholder.com/100x100?text=Logo2',
        description: 'Lycée d\'excellence préparant les étudiants aux meilleures universités.',
        studentCount: 600,
        classCount: 20,
        teacherCount: 35,
        averageRating: 4.7,
        totalReviews: 56,
        curriculum: ['Français', 'Bilingue'],
        levels: ['Collège', 'Lycée'],
        contactPhone: '+224 621 11 22 33',
        whatsappPhone: '+224 621 11 22 33',
        website: 'https://lycee-camayenne.gn',
        isVerified: true,
        isPublished: true,
        socialLinks: {
          facebook: 'https://facebook.com/lyceecamayenne'
        }
      },
      {
        id: 'school_003',
        schoolName: 'Collège Saint-Michel',
        city: 'Kindia',
        address: 'Centre-ville, Kindia',
        coverPhotoURL: 'https://via.placeholder.com/400x200?text=College+Saint-Michel',
        logoURL: 'https://via.placeholder.com/100x100?text=Logo3',
        description: 'Établissement catholique avec formation morale et académique.',
        studentCount: 350,
        classCount: 14,
        teacherCount: 20,
        averageRating: 4.5,
        totalReviews: 28,
        curriculum: ['Guinéen'],
        levels: ['Collège'],
        contactPhone: '+224 621 44 55 66',
        whatsappPhone: '+224 621 44 55 66',
        website: 'https://college-saintmichel.gn',
        isVerified: true,
        isPublished: true,
        socialLinks: {}
      },
      {
        id: 'school_004',
        schoolName: 'École Préscolaire Les Petits Génies',
        city: 'Conakry',
        address: 'Quartier Delta, Conakry',
        coverPhotoURL: 'https://via.placeholder.com/400x200?text=Prescolaire',
        logoURL: 'https://via.placeholder.com/100x100?text=Logo4',
        description: 'Préscolaire avec approche Montessori et environnement ludique.',
        studentCount: 120,
        classCount: 6,
        teacherCount: 8,
        averageRating: 4.9,
        totalReviews: 35,
        curriculum: ['Guinéen'],
        levels: ['Préscolaire'],
        contactPhone: '+224 621 77 88 99',
        whatsappPhone: '+224 621 77 88 99',
        website: 'https://petits-genies.gn',
        isVerified: true,
        isPublished: true,
        socialLinks: {
          facebook: 'https://facebook.com/petitsgenies',
          instagram: 'https://instagram.com/petitsgenies'
        }
      }
    ];

    this.applyFilters();
  },

  // ===== APPLIQUER LES FILTRES =====
  applyFilters() {
    let filtered = [...this.state.allSchools];

    // Filtre curriculum
    if (this.state.filters.curriculum) {
      filtered = filtered.filter(school =>
        school.curriculum && school.curriculum.includes(this.state.filters.curriculum)
      );
    }

    // Filtre niveau
    if (this.state.filters.level) {
      filtered = filtered.filter(school =>
        school.levels && school.levels.includes(this.state.filters.level)
      );
    }

    // Filtre ville
    if (this.state.filters.city) {
      filtered = filtered.filter(school =>
        school.city === this.state.filters.city
      );
    }

    // Filtre note minimale
    if (this.state.filters.rating > 0) {
      filtered = filtered.filter(school =>
        school.averageRating >= this.state.filters.rating
      );
    }

    // Recherche
    if (this.state.searchQuery) {
      const query = this.state.searchQuery.toLowerCase();
      filtered = filtered.filter(school =>
        school.schoolName.toLowerCase().includes(query) ||
        school.city.toLowerCase().includes(query) ||
        (school.description && school.description.toLowerCase().includes(query))
      );
    }

    // Tri
    filtered = this.sortSchools(filtered);

    this.state.filteredSchools = filtered;
    this.state.currentPage = 1;
    this.render();
  },

  // ===== TRI =====
  sortSchools(schools) {
    const sorted = [...schools];

    switch (this.state.sortBy) {
      case 'rating':
        return sorted.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
      
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      case 'alphabetic':
        return sorted.sort((a, b) => a.schoolName.localeCompare(b.schoolName));
      
      case 'popular':
      default:
        return sorted.sort((a, b) => (b.totalReviews || 0) - (a.totalReviews || 0));
    }
  },

  // ===== RENDU =====
  render() {
    const container = document.getElementById('schoolsContainer');
    const noResults = document.getElementById('noResults');

    if (this.state.filteredSchools.length === 0) {
      container.innerHTML = '';
      noResults.style.display = 'block';
      document.getElementById('pagination').innerHTML = '';
      return;
    }

    noResults.style.display = 'none';

    // Paginer
    const start = (this.state.currentPage - 1) * this.state.itemsPerPage;
    const end = start + this.state.itemsPerPage;
    const paginatedSchools = this.state.filteredSchools.slice(start, end);

    // Rendre les cartes
    container.innerHTML = paginatedSchools.map(school => this.renderSchoolCard(school)).join('');

    // Pagination
    this.renderPagination();
  },

  // ===== RENDRE UNE CARTE D'ÉCOLE =====
  renderSchoolCard(school) {
    const stars = this.getStars(school.averageRating || 4);
    const badge = school.isVerified ? '<span class="school-badge verified">✓ Vérifiée</span>' : '';

    return `
      <div class="school-card">
        <div class="school-card-image">
          <img src="${school.coverPhotoURL || 'https://via.placeholder.com/400x200'}" alt="${school.schoolName}">
          ${badge}
        </div>
        
        <div class="school-card-content">
          <h3 class="school-name">${school.schoolName}</h3>
          
          <div class="school-location">
            📍 ${school.city}, ${school.address || 'Guinée'}
          </div>

          <div class="school-stats">
            <div class="stat">
              <div class="stat-value">${school.studentCount || 0}</div>
              <div class="stat-label">Élèves</div>
            </div>
            <div class="stat">
              <div class="stat-value">${school.teacherCount || 0}</div>
              <div class="stat-label">Professeurs</div>
            </div>
            <div class="stat">
              <div class="stat-value">${school.classCount || 0}</div>
              <div class="stat-label">Classes</div>
            </div>
          </div>

          <div class="school-description">
            ${school.description || 'École de qualité'}
          </div>

          <div class="school-rating">
            <span class="stars">${stars}</span>
            <span class="rating-text">${school.averageRating || 4}/5</span>
            <span class="rating-reviews">(${school.totalReviews || 0} avis)</span>
          </div>

          <div class="school-actions">
            <button class="btn-small view" onclick="SchoolDirectory.viewSchool('${school.id}')">
              Voir le profil
            </button>
            <button class="btn-small contact" onclick="SchoolDirectory.openContact('${school.id}')">
              💬 Contacter
            </button>
          </div>
        </div>
      </div>
    `;
  },

  // ===== AFFICHAGE DES ÉTOILES =====
  getStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    let stars = '⭐'.repeat(fullStars);
    if (hasHalf) stars += '✨';
    return stars;
  },

  // ===== PAGINATION =====
  renderPagination() {
    const totalPages = Math.ceil(this.state.filteredSchools.length / this.state.itemsPerPage);
    const container = document.getElementById('pagination');

    if (totalPages <= 1) {
      container.innerHTML = '';
      return;
    }

    let html = '';
    
    // Bouton précédent
    if (this.state.currentPage > 1) {
      html += `<button onclick="SchoolDirectory.goToPage(${this.state.currentPage - 1})">← Précédent</button>`;
    }

    // Numéros de page
    for (let i = 1; i <= totalPages; i++) {
      const active = i === this.state.currentPage ? 'active' : '';
      html += `<button class="${active}" onclick="SchoolDirectory.goToPage(${i})">${i}</button>`;
    }

    // Bouton suivant
    if (this.state.currentPage < totalPages) {
      html += `<button onclick="SchoolDirectory.goToPage(${this.state.currentPage + 1})">Suivant →</button>`;
    }

    container.innerHTML = html;
  },

  // ===== ÉVÉNEMENTS =====
  setupEventListeners() {
    // Aucun événement spécial requis - on utilise les attributs HTML
  },

  // ===== GESTION RECHERCHE =====
  handleSearch() {
    this.state.searchQuery = document.getElementById('searchInput').value;
    this.applyFilters();
  },

  // ===== GESTION TRI =====
  handleSort() {
    this.state.sortBy = document.getElementById('sortSelect').value;
    this.applyFilters();
  },

  // ===== GESTION FILTRES =====
  applyFiltersUI() {
    this.state.filters.curriculum = document.getElementById('curriculumFilter').value;
    this.state.filters.level = document.getElementById('levelFilter').value;
    this.state.filters.city = document.getElementById('cityFilter').value;
    this.state.filters.rating = parseFloat(document.getElementById('ratingFilter').value) || 0;
    
    this.applyFilters();
  },

  // ===== PAGINATION =====
  goToPage(page) {
    this.state.currentPage = page;
    this.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // ===== VOIR LE PROFIL ÉCOLE =====
  viewSchool(schoolId) {
    const school = this.state.allSchools.find(s => s.id === schoolId);
    if (school) {
      navigate('school-profile', school);
    }
  },

  // ===== CONTACT RAPIDE =====
  openContact(schoolId) {
    const school = this.state.allSchools.find(s => s.id === schoolId);
    if (!school) return;

    this.state.currentSchool = school;
    const modal = document.getElementById('contactModal');
    const options = document.getElementById('contactOptions');

    const contactButtons = `
      <button class="btn-small view" onclick="SchoolDirectory.openMessageForm()" style="margin-bottom: 10px;">
        ✉️ Envoyer un Message
      </button>
      
      <a href="tel:${school.contactPhone || '#'}" class="btn-small" style="display: block; text-align: center; background: var(--success); color: white; margin-bottom: 10px;">
        📞 Appeler (${school.contactPhone || 'N/A'})
      </a>
      
      <a href="https://wa.me/${school.whatsappPhone?.replace(/\D/g, '') || '#'}" target="_blank" class="btn-small" style="display: block; text-align: center; background: #25D366; color: white; margin-bottom: 10px;">
        💬 WhatsApp
      </a>
      
      <a href="mailto:${school.email || '#'}" class="btn-small" style="display: block; text-align: center; background: var(--warning); color: white;">
        📧 Email
      </a>
    `;

    options.innerHTML = contactButtons;
    modal.classList.add('active');
  },

  // ===== FORMULAIRE MESSAGE =====
  openMessageForm() {
    document.getElementById('contactModal').classList.remove('active');
    document.getElementById('messageModal').classList.add('active');
  },

  // ===== ENVOYER MESSAGE =====
  async sendMessage(event) {
    event.preventDefault();

    const message = {
      schoolId: this.state.currentSchool.id,
      senderName: document.getElementById('senderName').value,
      senderEmail: document.getElementById('senderEmail').value,
      senderPhone: document.getElementById('senderPhone').value,
      subject: document.getElementById('messageSubject').value,
      message: document.getElementById('messageText').value,
      messageType: 'inquiry',
      status: 'pending',
      createdAt: new Date(),
      priority: 'normal'
    };

    try {
      if (typeof db !== 'undefined') {
        await db.collection('users').doc(this.state.currentSchool.id)
          .collection('school_messages').add(message);

        console.log('✅ Message envoyé!');
        alert('Message envoyé avec succès! L\'école vous contactera sous peu.');
      } else {
        console.log('📌 Mode démo:', message);
        alert('Message (mode démo): ' + JSON.stringify(message));
      }

      // Réinitialiser formulaire
      document.getElementById('messageForm').reset();
      closeModal('messageModal');

    } catch (error) {
      console.error('❌ Erreur envoi:', error);
      alert('Erreur lors de l\'envoi du message');
    }
  }
};

// ===== FONCTIONS GLOBALES =====

function handleSearch() {
  SchoolDirectory.handleSearch();
}

function handleSort() {
  SchoolDirectory.handleSort();
}

function applyFilters() {
  SchoolDirectory.applyFiltersUI();
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

function openLoginModal() {
  // Rediriger vers page de connexion école
  navigate('school-login');
}

function navigate(page, data) {
  console.log(`Navigation vers: ${page}`, data);
  // À intégrer avec le routeur existant de Neoclass
}

function sendMessage(event) {
  SchoolDirectory.sendMessage(event);
}

// ===== INITIALISATION AU CHARGEMENT =====
document.addEventListener('DOMContentLoaded', function() {
  // Attendre que Firebase soit initialisé
  const checkFirebase = setInterval(() => {
    if (typeof db !== 'undefined') {
      clearInterval(checkFirebase);
      SchoolDirectory.init();
    }
  }, 100);

  // Timeout si Firebase ne charge pas
  setTimeout(() => {
    clearInterval(checkFirebase);
    if (SchoolDirectory.state.allSchools.length === 0) {
      SchoolDirectory.init();
    }
  }, 5000);
});

console.log('✅ Module Annuaire Écoles chargé');
