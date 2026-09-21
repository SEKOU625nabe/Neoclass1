/**
 * DocumentManager.js
 * Gère la gestion et le partage de documents pour les écoles
 * Catégories personnalisables, classement, synchronisation Firestore
 */

class DocumentManager {
  constructor(schoolId, schoolName, firebaseApp) {
    this.schoolId = schoolId;
    this.schoolName = schoolName;
    this.db = firebaseApp.firestore();
    this.storage = firebaseApp.storage();
    this.documentsRef = this.db.collection('schools').doc(schoolId).collection('documents');
    this.categoriesRef = this.db.collection('schools').doc(schoolId).collection('document_categories');
  }

  /**
   * Obtient toutes les catégories de documents de l'école
   */
  async getCategories() {
    try {
      const snapshot = await this.categoriesRef.orderBy('order', 'asc').get();
      const categories = [];
      snapshot.forEach(doc => {
        categories.push({ id: doc.id, ...doc.data() });
      });
      return categories;
    } catch (error) {
      console.error('Erreur récupération catégories:', error);
      return [];
    }
  }

  /**
   * Crée une nouvelle catégorie
   */
  async createCategory(categoryName, description = '') {
    try {
      const categories = await this.getCategories();
      const order = categories.length + 1;

      const newCategory = {
        name: categoryName,
        description: description,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        order: order,
        color: this.generateColor(),
        school_id: this.schoolId
      };

      const docRef = await this.categoriesRef.add(newCategory);
      
      // Sauvegarder en localStorage aussi
      this.saveCategoryToLocal(docRef.id, newCategory);

      return { id: docRef.id, ...newCategory };
    } catch (error) {
      console.error('Erreur création catégorie:', error);
      throw error;
    }
  }

  /**
   * Modifie une catégorie
   */
  async updateCategory(categoryId, updates) {
    try {
      updates.updated_at = new Date().toISOString();
      await this.categoriesRef.doc(categoryId).update(updates);
      
      // Synchroniser localStorage
      this.saveCategoryToLocal(categoryId, updates);

      return { id: categoryId, ...updates };
    } catch (error) {
      console.error('Erreur mise à jour catégorie:', error);
      throw error;
    }
  }

  /**
   * Supprime une catégorie
   */
  async deleteCategory(categoryId) {
    try {
      // Vérifier s'il y a des documents dans cette catégorie
      const docsInCategory = await this.documentsRef.where('category_id', '==', categoryId).get();
      if (docsInCategory.size > 0) {
        throw new Error('Impossible de supprimer une catégorie contenant des documents');
      }

      await this.categoriesRef.doc(categoryId).delete();
      localStorage.removeItem(`category_${this.schoolId}_${categoryId}`);

      return true;
    } catch (error) {
      console.error('Erreur suppression catégorie:', error);
      throw error;
    }
  }

  /**
   * Ajoute un document
   */
  async addDocument(documentData) {
    try {
      const document = {
        name: documentData.name,
        category_id: documentData.categoryId,
        description: documentData.description || '',
        file_url: documentData.fileUrl || null,
        file_type: documentData.fileType || '',
        file_size: documentData.fileSize || 0,
        uploaded_by: documentData.uploadedBy || 'Unknown',
        uploaded_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        school_id: this.schoolId,
        school_name: this.schoolName,
        visibility: documentData.visibility || 'school', // 'school', 'parents', 'public'
        tags: documentData.tags || [],
        download_count: 0,
        views: 0,
        active: true
      };

      const docRef = await this.documentsRef.add(document);
      
      // Synchroniser localStorage
      this.saveDocumentToLocal(docRef.id, document);

      return { id: docRef.id, ...document };
    } catch (error) {
      console.error('Erreur ajout document:', error);
      throw error;
    }
  }

  /**
   * Récupère tous les documents
   */
  async getDocuments(categoryId = null, visibility = 'school') {
    try {
      let query = this.documentsRef.where('active', '==', true).where('visibility', '==', visibility);
      
      if (categoryId) {
        query = query.where('category_id', '==', categoryId);
      }

      const snapshot = await query.orderBy('uploaded_at', 'desc').get();
      const documents = [];
      
      snapshot.forEach(doc => {
        documents.push({ id: doc.id, ...doc.data() });
      });

      return documents;
    } catch (error) {
      console.error('Erreur récupération documents:', error);
      return [];
    }
  }

  /**
   * Télécharge un document (incrémenter compteur)
   */
  async downloadDocument(documentId) {
    try {
      const docRef = this.documentsRef.doc(documentId);
      await docRef.update({
        download_count: firebase.firestore.FieldValue.increment(1),
        last_downloaded: new Date().toISOString()
      });

      return true;
    } catch (error) {
      console.error('Erreur téléchargement document:', error);
      throw error;
    }
  }

  /**
   * Met à jour un document
   */
  async updateDocument(documentId, updates) {
    try {
      updates.updated_at = new Date().toISOString();
      await this.documentsRef.doc(documentId).update(updates);
      
      this.saveDocumentToLocal(documentId, updates);

      return { id: documentId, ...updates };
    } catch (error) {
      console.error('Erreur mise à jour document:', error);
      throw error;
    }
  }

  /**
   * Supprime un document
   */
  async deleteDocument(documentId) {
    try {
      await this.documentsRef.doc(documentId).update({ active: false });
      localStorage.removeItem(`document_${this.schoolId}_${documentId}`);

      return true;
    } catch (error) {
      console.error('Erreur suppression document:', error);
      throw error;
    }
  }

  /**
   * Recherche de documents
   */
  async searchDocuments(searchTerm) {
    try {
      const documents = await this.getDocuments();
      
      return documents.filter(doc => 
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.tags && doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    } catch (error) {
      console.error('Erreur recherche:', error);
      return [];
    }
  }

  /**
   * Génère une couleur aléatoire pour la catégorie
   */
  generateColor() {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
      '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#A9DFBF'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Sauvegarde une catégorie en localStorage pour synchronisation offline
   */
  saveCategoryToLocal(categoryId, categoryData) {
    const key = `category_${this.schoolId}_${categoryId}`;
    localStorage.setItem(key, JSON.stringify(categoryData));
  }

  /**
   * Sauvegarde un document en localStorage
   */
  saveDocumentToLocal(documentId, documentData) {
    const key = `document_${this.schoolId}_${documentId}`;
    localStorage.setItem(key, JSON.stringify(documentData));
  }

  /**
   * Récupère les statistiques des documents
   */
  async getDocumentStats() {
    try {
      const allDocs = await this.getDocuments(null, 'school');
      const categories = await this.getCategories();

      const stats = {
        total_documents: allDocs.length,
        total_categories: categories.length,
        total_downloads: allDocs.reduce((sum, doc) => sum + (doc.download_count || 0), 0),
        by_category: {},
        by_visibility: {
          school: allDocs.filter(d => d.visibility === 'school').length,
          parents: allDocs.filter(d => d.visibility === 'parents').length,
          public: allDocs.filter(d => d.visibility === 'public').length
        }
      };

      categories.forEach(cat => {
        stats.by_category[cat.name] = allDocs.filter(d => d.category_id === cat.id).length;
      });

      return stats;
    } catch (error) {
      console.error('Erreur calcul statistiques:', error);
      return {};
    }
  }

  /**
   * Exporte les documents sous forme CSV
   */
  async exportToCSV() {
    try {
      const documents = await this.getDocuments(null, 'school');
      let csv = 'Nom,Catégorie,Description,Type,Taille,Uploadé par,Date,Téléchargements,Visibilité\n';

      documents.forEach(doc => {
        const row = [
          doc.name,
          doc.category_id,
          doc.description || '',
          doc.file_type || '',
          this.formatFileSize(doc.file_size),
          doc.uploaded_by,
          new Date(doc.uploaded_at).toLocaleDateString(),
          doc.download_count || 0,
          doc.visibility
        ];
        csv += row.map(cell => `"${cell}"`).join(',') + '\n';
      });

      return csv;
    } catch (error) {
      console.error('Erreur export CSV:', error);
      throw error;
    }
  }

  /**
   * Formate la taille du fichier
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}

// Export pour utilisation en module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DocumentManager;
}
