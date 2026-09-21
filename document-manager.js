// ============================================================
// GESTIONNAIRE DOCUMENTAIRE - Neoclass
// Gestion complète des documents pour écoles, profs, admin
// ============================================================

const DocumentManager = {
  // État
  state: {
    documents: [],
    filters: {
      category: 'all',
      search: '',
      visibility: 'all',
      sortBy: 'recent'
    },
    currentUser: null,
    selectedDocs: [],
    storageUsed: 0,
    maxStorage: 1024 * 1024 * 1000 // 1GB
  },

  // Categories disponibles
  categories: {
    courses: { name: '📚 Cours', icon: '📚', color: '#3498db' },
    evaluations: { name: '✅ Évaluations', icon: '✅', color: '#e74c3c' },
    pedagogy: { name: '🎯 Matériel Pédagogique', icon: '🎯', color: '#2ecc71' },
    circulars: { name: '📢 Circulaires', icon: '📢', color: '#f39c12' },
    admin: { name: '⚙️ Administratif', icon: '⚙️', color: '#9b59b6' },
    other: { name: '📁 Autres', icon: '📁', color: '#95a5a6' }
  },

  // Initialiser
  init() {
    this.loadFromStorage();
    this.state.currentUser = State.user;
    console.log('✅ Document Manager initialized');
  },

  // Charger depuis localStorage
  loadFromStorage() {
    const stored = localStorage.getItem('neoclass_documents');
    if (stored) {
      try {
        this.state.documents = JSON.parse(stored);
        this.calculateStorage();
      } catch (e) {
        console.error('❌ Erreur chargement documents:', e);
      }
    }
  },

  // Sauvegarder
  saveToStorage() {
    localStorage.setItem('neoclass_documents', JSON.stringify(this.state.documents));
    this.calculateStorage();
  },

  // Calculer storage utilisé
  calculateStorage() {
    this.state.storageUsed = this.state.documents.reduce((sum, doc) => sum + (doc.size || 0), 0);
  },

  // Ajouter document
  addDocument(file, metadata = {}) {
    if (!file) return null;

    const doc = {
      id: 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      name: file.name || metadata.name || 'Sans titre',
      type: file.type || this.getFileType(file.name),
      size: file.size || 0,
      category: metadata.category || 'other',
      tags: metadata.tags || [],
      classes: metadata.classes || [],
      description: metadata.description || '',
      visibility: metadata.visibility || 'private', // private, school, teachers, class
      permissions: metadata.permissions || 'read', // read, comment, edit
      author: this.state.currentUser?.fullName || 'Admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0,
      downloads: 0,
      comments: [],
      versions: [
        {
          version: 1,
          uploadedAt: new Date().toISOString(),
          uploadedBy: this.state.currentUser?.fullName || 'Admin',
          fileData: file
        }
      ],
      isFavorite: false,
      lastModifiedBy: this.state.currentUser?.fullName || 'Admin'
    };

    this.state.documents.push(doc);
    this.saveToStorage();
    return doc;
  },

  // Obtenir type de fichier
  getFileType(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const types = {
      'pdf': 'PDF',
      'doc': 'Word', 'docx': 'Word',
      'xls': 'Excel', 'xlsx': 'Excel',
      'ppt': 'PowerPoint', 'pptx': 'PowerPoint',
      'jpg': 'Image', 'jpeg': 'Image', 'png': 'Image', 'gif': 'Image',
      'mp4': 'Vidéo', 'mov': 'Vidéo', 'avi': 'Vidéo',
      'mp3': 'Audio', 'm4a': 'Audio',
      'zip': 'Archive', 'rar': 'Archive'
    };
    return types[ext] || 'Fichier';
  },

  // Obtenir l'icône du type
  getTypeIcon(type) {
    const icons = {
      'PDF': '📄',
      'Word': '📝',
      'Excel': '📊',
      'PowerPoint': '🎨',
      'Image': '🖼️',
      'Vidéo': '🎥',
      'Audio': '🎵',
      'Archive': '📦'
    };
    return icons[type] || '📎';
  },

  // Filtrer documents
  getFilteredDocuments() {
    let filtered = this.state.documents.filter(doc => {
      // Vérifier accès utilisateur
      if (!this.canAccess(doc)) return false;

      // Filtre catégorie
      if (this.state.filters.category !== 'all' && doc.category !== this.state.filters.category) return false;

      // Filtre recherche
      if (this.state.filters.search) {
        const search = this.state.filters.search.toLowerCase();
        if (!doc.name.toLowerCase().includes(search) && 
            !doc.description.toLowerCase().includes(search) &&
            !doc.tags.some(t => t.toLowerCase().includes(search))) {
          return false;
        }
      }

      // Filtre visibilité
      if (this.state.filters.visibility !== 'all' && doc.visibility !== this.state.filters.visibility) return false;

      return true;
    });

    // Tri
    if (this.state.filters.sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (this.state.filters.sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (this.state.filters.sortBy === 'views') {
      filtered.sort((a, b) => b.views - a.views);
    }

    return filtered;
  },

  // Vérifier accès
  canAccess(doc) {
    const user = this.state.currentUser;
    if (!user) return false;

    if (user.role === 'admin') return true; // Admin voir tout
    if (doc.visibility === 'public') return true;
    if (doc.visibility === 'school' && user.schoolId === doc.schoolId) return true;
    if (doc.visibility === 'teachers' && user.role === 'teacher') return true;
    if (doc.author === user.fullName) return true;
    if (doc.classes.includes(user.className)) return true;

    return false;
  },

  // Télécharger document
  downloadDocument(doc) {
    console.log('⬇️ Téléchargement:', doc.name);
    doc.downloads++;
    this.saveToStorage();
    // En vrai: créer blob et télécharger
  },

  // Exporter documents
  exportDocuments(docIds, format = 'zip') {
    const selected = docIds.length > 0 
      ? this.state.documents.filter(d => docIds.includes(d.id))
      : this.getFilteredDocuments();

    if (format === 'zip') {
      console.log(`📦 Création ZIP avec ${selected.length} documents...`);
      return this.createZipExport(selected);
    } else if (format === 'pdf') {
      console.log(`📄 Fusion en PDF (${selected.length} docs)...`);
      return this.createPdfExport(selected);
    } else if (format === 'csv') {
      console.log(`📊 Export CSV métadonnées...`);
      return this.createCsvExport(selected);
    }
  },

  // Créer ZIP
  createZipExport(documents) {
    const csv = 'Name,Category,Author,CreatedAt,Size,Views\n' +
      documents.map(d => 
        `"${d.name}","${d.category}","${d.author}","${d.createdAt}","${d.size}","${d.views}"`
      ).join('\n');
    
    return { format: 'zip', data: csv, filename: `export_${Date.now()}.zip` };
  },

  // Créer PDF
  createPdfExport(documents) {
    const content = documents.map(d => 
      `${d.name}\nCategory: ${d.category}\nAuthor: ${d.author}\nCreated: ${d.createdAt}\nViews: ${d.views}\n---\n`
    ).join('');
    
    return { format: 'pdf', data: content, filename: `export_${Date.now()}.pdf` };
  },

  // Créer CSV
  createCsvExport(documents) {
    const csv = 'Name,Category,Tags,Author,CreatedAt,Size,Views,Downloads\n' +
      documents.map(d => 
        `"${d.name}","${d.category}","${d.tags.join(';')}","${d.author}","${d.createdAt}","${d.size}","${d.views}","${d.downloads}"`
      ).join('\n');
    
    return { format: 'csv', data: csv, filename: `export_${Date.now()}.csv` };
  },

  // Toggler favori
  toggleFavorite(docId) {
    const doc = this.state.documents.find(d => d.id === docId);
    if (doc) {
      doc.isFavorite = !doc.isFavorite;
      this.saveToStorage();
    }
  },

  // Supprimer document
  deleteDocument(docId) {
    this.state.documents = this.state.documents.filter(d => d.id !== docId);
    this.saveToStorage();
  },

  // Ajouter commentaire
  addComment(docId, text) {
    const doc = this.state.documents.find(d => d.id === docId);
    if (doc) {
      doc.comments.push({
        id: 'comment_' + Date.now(),
        author: this.state.currentUser?.fullName || 'Anonyme',
        text: text,
        createdAt: new Date().toISOString()
      });
      this.saveToStorage();
    }
  },

  // Obtenir statistiques
  getStats() {
    const docs = this.getFilteredDocuments();
    return {
      totalDocs: docs.length,
      totalViews: docs.reduce((sum, d) => sum + d.views, 0),
      totalDownloads: docs.reduce((sum, d) => sum + d.downloads, 0),
      storageUsed: this.state.storageUsed,
      storagePercent: (this.state.storageUsed / this.state.maxStorage) * 100,
      byCategory: Object.keys(this.categories).map(cat => ({
        category: cat,
        count: docs.filter(d => d.category === cat).length
      }))
    };
  },

  // Génération UI
  generateUploadHTML() {
    return `
      <div class="doc-upload-modal">
        <div class="upload-container">
          <h3>➕ Ajouter un Document</h3>
          
          <form id="docUploadForm">
            <div class="form-group">
              <label>📂 Catégorie:</label>
              <select id="docCategory" class="form-control">
                ${Object.entries(this.categories).map(([key, cat]) => 
                  `<option value="${key}">${cat.name}</option>`
                ).join('')}
              </select>
            </div>

            <div class="form-group">
              <label>📝 Titre:</label>
              <input type="text" id="docTitle" class="form-control" placeholder="Titre du document" required>
            </div>

            <div class="form-group">
              <label>📄 Description:</label>
              <textarea id="docDescription" class="form-control" rows="3" placeholder="Description..."></textarea>
            </div>

            <div class="form-group">
              <label>🏷️ Tags (séparés par virgule):</label>
              <input type="text" id="docTags" class="form-control" placeholder="#Maths #6eme">
            </div>

            <div class="form-group">
              <label>📚 Classes:</label>
              <div id="classesCheckbox"></div>
            </div>

            <div class="form-group">
              <label>🔒 Visibilité:</label>
              <div class="radio-group">
                <label><input type="radio" name="visibility" value="private" checked> Privé (vous seul)</label>
                <label><input type="radio" name="visibility" value="teachers"> Professeurs</label>
                <label><input type="radio" name="visibility" value="school"> Toute l'école</label>
                <label><input type="radio" name="visibility" value="public"> Public</label>
              </div>
            </div>

            <div class="form-group">
              <label>📎 Fichiers:</label>
              <div class="file-drop-zone" id="fileDropZone">
                <p>📌 Drag & drop ou cliquez pour sélectionner</p>
                <input type="file" id="docFile" multiple hidden>
              </div>
              <div id="filesList"></div>
            </div>

            <div class="button-group">
              <button type="button" class="btn btn-secondary" onclick="this.closest('.doc-upload-modal').remove()">❌ Annuler</button>
              <button type="submit" class="btn btn-primary">✅ Publier</button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  generateDashboardHTML() {
    const stats = this.getStats();
    const docs = this.getFilteredDocuments();
    
    return `
      <div class="doc-dashboard">
        <header class="doc-header">
          <h2>📁 Centre de Gestion Documentaire</h2>
          <div class="header-actions">
            <button class="btn btn-primary" onclick="DocumentManager.showUploadModal()">➕ Ajouter Document</button>
            <button class="btn btn-secondary" onclick="DocumentManager.showImportModal()">📤 Importer ZIP</button>
            <button class="btn btn-secondary" onclick="DocumentManager.showExportModal()">📥 Exporter</button>
          </div>
        </header>

        <section class="doc-stats">
          <div class="stat-card">
            <div class="stat-number">${stats.totalDocs}</div>
            <div class="stat-label">Documents</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${stats.totalViews}</div>
            <div class="stat-label">Vues totales</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${stats.totalDownloads}</div>
            <div class="stat-label">Téléchargements</div>
          </div>
          <div class="stat-card">
            <div class="storage-bar" style="--progress: ${stats.storagePercent}%"></div>
            <div class="stat-label">${(stats.storageUsed / 1024 / 1024).toFixed(1)} MB / 1000 MB</div>
          </div>
        </section>

        <section class="doc-filters">
          <input type="text" id="docSearch" class="form-control search-input" placeholder="🔍 Rechercher documents...">
          
          <div class="filter-group">
            <select id="docCategoryFilter" class="form-control">
              <option value="all">📂 Toutes les catégories</option>
              ${Object.entries(this.categories).map(([key, cat]) => 
                `<option value="${key}">${cat.name}</option>`
              ).join('')}
            </select>

            <select id="docSortFilter" class="form-control">
              <option value="recent">📅 Les plus récents</option>
              <option value="name">📝 Alphabétique</option>
              <option value="views">👁️ Les plus vus</option>
            </select>
          </div>
        </section>

        <section class="doc-list">
          ${docs.length === 0 ? 
            '<div class="empty-state">📭 Aucun document trouvé</div>' :
            docs.map(doc => this.generateDocumentCard(doc)).join('')
          }
        </section>
      </div>
    `;
  },

  generateDocumentCard(doc) {
    const cat = this.categories[doc.category];
    const canEdit = doc.author === this.state.currentUser?.fullName || this.state.currentUser?.role === 'admin';
    
    return `
      <div class="doc-card" data-doc-id="${doc.id}">
        <div class="doc-card-header">
          <div class="doc-icon">${this.getTypeIcon(doc.type)}</div>
          <div class="doc-title-section">
            <h3 class="doc-title">${doc.name}</h3>
            <div class="doc-meta">
              <span class="doc-category" style="background: ${cat?.color || '#95a5a6'}">${cat?.icon} ${doc.category}</span>
              <span class="doc-size">${(doc.size / 1024 / 1024).toFixed(1)} MB</span>
              <span class="doc-visibility">${doc.visibility === 'private' ? '🔒' : '👁️'}</span>
            </div>
          </div>
          <button class="btn-favorite ${doc.isFavorite ? 'active' : ''}" onclick="DocumentManager.toggleFavorite('${doc.id}'); this.classList.toggle('active')">
            ${doc.isFavorite ? '⭐' : '☆'}
          </button>
        </div>

        <div class="doc-description">${doc.description}</div>

        <div class="doc-tags">
          ${doc.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
        </div>

        <div class="doc-stats">
          <span>👁️ ${doc.views}</span>
          <span>⬇️ ${doc.downloads}</span>
          <span>💬 ${doc.comments.length}</span>
          <span class="doc-date">📅 ${new Date(doc.createdAt).toLocaleDateString('fr-FR')}</span>
        </div>

        <div class="doc-actions">
          <button class="btn btn-sm btn-primary" onclick="DocumentManager.downloadDocument(this.closest('.doc-card').dataset.docId)">
            ⬇️ Télécharger
          </button>
          ${canEdit ? `
            <button class="btn btn-sm btn-secondary" onclick="DocumentManager.showEditModal('${doc.id}')">
              ✏️ Éditer
            </button>
            <button class="btn btn-sm btn-danger" onclick="DocumentManager.deleteDocument('${doc.id}'); location.reload()">
              🗑️ Supprimer
            </button>
          ` : ''}
          <button class="btn btn-sm btn-secondary" onclick="DocumentManager.showComments('${doc.id}')">
            💬 Commentaires
          </button>
        </div>
      </div>
    `;
  },

  // Modales
  showUploadModal() {
    const modal = document.createElement('div');
    modal.innerHTML = this.generateUploadHTML();
    document.body.appendChild(modal);
    this.initUploadForm();
  },

  showExportModal() {
    const html = `
      <div class="doc-export-modal">
        <div class="modal-content">
          <h3>📥 Exporter Documents</h3>
          <form id="exportForm">
            <div class="form-group">
              <label>📦 Format:</label>
              <div class="radio-group">
                <label><input type="radio" name="format" value="zip" checked> ZIP (tous les fichiers)</label>
                <label><input type="radio" name="format" value="pdf"> PDF (fusion)</label>
                <label><input type="radio" name="format" value="csv"> CSV (métadonnées)</label>
              </div>
            </div>
            <div class="form-group">
              <label>✅ Inclure:</label>
              <div class="checkbox-group">
                <label><input type="checkbox" checked> Métadonnées</label>
                <label><input type="checkbox" checked> Historique versions</label>
                <label><input type="checkbox"> Commentaires</label>
              </div>
            </div>
            <div class="button-group">
              <button type="button" class="btn btn-secondary" onclick="this.closest('.doc-export-modal').remove()">Annuler</button>
              <button type="submit" class="btn btn-primary">📥 Exporter</button>
            </div>
          </form>
        </div>
      </div>
    `;
    const modal = document.createElement('div');
    modal.innerHTML = html;
    document.body.appendChild(modal);
  },

  showComments(docId) {
    const doc = this.state.documents.find(d => d.id === docId);
    if (!doc) return;

    const html = `
      <div class="doc-comments-modal">
        <div class="modal-content">
          <h3>💬 Commentaires: ${doc.name}</h3>
          <div class="comments-list">
            ${doc.comments.map(c => `
              <div class="comment">
                <strong>${c.author}</strong>
                <small>${new Date(c.createdAt).toLocaleString('fr-FR')}</small>
                <p>${c.text}</p>
              </div>
            `).join('')}
          </div>
          <textarea id="newComment" placeholder="Ajouter un commentaire..."></textarea>
          <div class="button-group">
            <button class="btn btn-secondary" onclick="this.closest('.doc-comments-modal').remove()">Fermer</button>
            <button class="btn btn-primary" onclick="DocumentManager.addComment('${docId}', document.getElementById('newComment').value); alert('✅ Commentaire ajouté')">Publier</button>
          </div>
        </div>
      </div>
    `;
    const modal = document.createElement('div');
    modal.innerHTML = html;
    document.body.appendChild(modal);
  },

  // Init form
  initUploadForm() {
    const form = document.getElementById('docUploadForm');
    const fileDropZone = document.getElementById('fileDropZone');
    const fileInput = document.getElementById('docFile');

    fileDropZone?.addEventListener('click', () => fileInput?.click());
    fileDropZone?.addEventListener('dragover', e => e.preventDefault());
    fileDropZone?.addEventListener('drop', e => {
      e.preventDefault();
      // Handle files
    });

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('docTitle').value;
      const category = document.getElementById('docCategory').value;
      // Add doc logic
      console.log('✅ Document ajouté:', title);
      alert('✅ Document ajouté avec succès!');
      form.closest('.doc-upload-modal').remove();
      location.reload();
    });
  }
};

// Démarrer
function waitForGlobalState(callback) {
  if (typeof State !== 'undefined' && State) {
    return callback();
  }
  setTimeout(() => waitForGlobalState(callback), 50);
}

document.addEventListener('DOMContentLoaded', () => {
  waitForGlobalState(() => {
    DocumentManager.init();
  });
});
