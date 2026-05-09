/**
 * ============================================================
 * 🔥 NEOCLASS - Firebase Service
 * Wrapper pour Firebase avec gestion d'erreurs robuste
 * ============================================================
 */

class FirebaseService {
  constructor() {
    this._app = null;
    this._auth = null;
    this._db = null;
    this._storage = null;
    this._initialized = false;
    this._onAuthStateChangedCallbacks = [];
  }
  
  /**
   * Initialiser Firebase
   */
  async init() {
    if (this._initialized) {
      console.log('[Firebase] Already initialized');
      return this;
    }
    
    try {
      const config = CONFIG?.firebase;
      
      if (!config) {
        throw new Error('Firebase configuration not found');
      }
      
      // ─── Vérifier si Firebase est chargé ───
      if (typeof firebase === 'undefined') {
        throw new Error('Firebase SDK not loaded');
      }
      
      // ─── Initialiser l'app ───
      if (!firebase.apps.length) {
        this._app = firebase.initializeApp(config);
      } else {
        this._app = firebase.apps[0];
      }
      
      // ─── Initialiser les services ───
      this._auth = firebase.auth();
      this._db = firebase.firestore();
      this._storage = firebase.storage();
      
      // ─── Activer la persistence offline ───
      try {
        await this._db.enablePersistence({ synchronizeTabs: true });
        console.log('[Firebase] Offline persistence enabled');
      } catch (err) {
        if (err.code === 'failed-precondition') {
          console.warn('[Firebase] Persistence failed: multiple tabs open');
        } else if (err.code === 'unimplemented') {
          console.warn('[Firebase] Persistence not supported by browser');
        }
      }
      
      // ─── Écouter les changements d'authentification ───
      this._auth.onAuthStateChanged((user) => {
        this._handleAuthStateChange(user);
      });
      
      this._initialized = true;
      console.log('%c[Firebase] Initialized successfully', 'color: #fbbf24; font-weight: bold');
      
      return this;
    } catch (error) {
      console.error('[Firebase] Initialization error:', error);
      throw error;
    }
  }
  
  /**
   * Vérifier si Firebase est initialisé
   */
  get isInitialized() {
    return this._initialized;
  }
  
  /**
   * Obtenir l'instance Auth
   */
  get auth() {
    this._checkInit();
    return this._auth;
  }
  
  /**
   * Obtenir l'instance Firestore
   */
  get db() {
    this._checkInit();
    return this._db;
  }
  
  /**
   * Obtenir l'instance Storage
   */
  get storage() {
    this._checkInit();
    return this._storage;
  }
  
  /**
   * Obtenir l'utilisateur actuel
   */
  get currentUser() {
    return this._auth?.currentUser;
  }
  
  // ═══════════════════════════════════════════════════════════
  // AUTHENTIFICATION
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Inscription avec email/password
   * @param {string} email
   * @param {string} password
   * @param {object} profileData - Données de profil supplémentaires
   */
  async signUp(email, password, profileData = {}) {
    this._checkInit();
    
    try {
      const result = await this._auth.createUserWithEmailAndPassword(email, password);
      const user = result.user;
      
      // ─── Créer le profil utilisateur ───
      await this.createUserProfile(user.uid, {
        email: user.email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        ...profileData
      });
      
      return { success: true, user };
    } catch (error) {
      return { success: false, error: this._mapAuthError(error) };
    }
  }
  
  /**
   * Connexion avec email/password
   * @param {string} email
   * @param {string} password
   */
  async signIn(email, password) {
    this._checkInit();
    
    try {
      const result = await this._auth.signInWithEmailAndPassword(email, password);
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: this._mapAuthError(error) };
    }
  }
  
  /**
   * Connexion avec Google
   */
  async signInWithGoogle() {
    this._checkInit();
    
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      const result = await this._auth.signInWithPopup(provider);
      
      // ─── Créer le profil si nouveau ───
      if (result.additionalUserInfo?.isNewUser) {
        await this.createUserProfile(result.user.uid, {
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
      
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: this._mapAuthError(error) };
    }
  }
  
  /**
   * Déconnexion
   */
  async signOut() {
    this._checkInit();
    
    try {
      await this._auth.signOut();
      State.set({
        user: null,
        profile: null,
        isAuthenticated: false
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Réinitialiser le mot de passe
   * @param {string} email
   */
  async resetPassword(email) {
    this._checkInit();
    
    try {
      await this._auth.sendPasswordResetEmail(email);
      return { success: true };
    } catch (error) {
      return { success: false, error: this._mapAuthError(error) };
    }
  }
  
  /**
   * S'abonner aux changements d'auth
   * @param {function} callback
   */
  onAuthStateChanged(callback) {
    this._onAuthStateChangedCallbacks.push(callback);
    
    // ─── Appeler avec l'état actuel si déjà init ───
    if (this._initialized) {
      callback(this._auth.currentUser);
    }
    
    // ─── Retourner fonction de désabonnement ───
    return () => {
      const index = this._onAuthStateChangedCallbacks.indexOf(callback);
      if (index > -1) {
        this._onAuthStateChangedCallbacks.splice(index, 1);
      }
    };
  }
  
  // ═══════════════════════════════════════════════════════════
  // FIRESTORE - CRUD GÉNÉRIQUE
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Obtenir un document
   * @param {string} collection
   * @param {string} docId
   */
  async getDoc(collection, docId) {
    this._checkInit();
    
    try {
      const doc = await this._db.collection(collection).doc(docId).get();
      
      if (!doc.exists) {
        return { success: false, error: 'Document not found' };
      }
      
      return {
        success: true,
        data: { id: doc.id, ...doc.data() }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Obtenir plusieurs documents avec filtres
   * @param {string} collection
   * @param {object} options - { where, orderBy, limit, startAfter }
   */
  async getDocs(collection, options = {}) {
    this._checkInit();
    
    try {
      let query = this._db.collection(collection);
      
      // ─── Where clauses ───
      if (options.where) {
        for (const [field, operator, value] of options.where) {
          query = query.where(field, operator, value);
        }
      }
      
      // ─── Order by ───
      if (options.orderBy) {
        const [field, direction = 'asc'] = options.orderBy;
        query = query.orderBy(field, direction);
      }
      
      // ─── Limit ───
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      // ─── Pagination ───
      if (options.startAfter) {
        query = query.startAfter(options.startAfter);
      }
      
      const snapshot = await query.get();
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return {
        success: true,
        data: docs,
        lastDoc: snapshot.docs[snapshot.docs.length - 1]
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Créer un document
   * @param {string} collection
   * @param {object} data
   * @param {string} docId - ID optionnel
   */
  async createDoc(collection, data, docId = null) {
    this._checkInit();
    
    try {
      const timestamp = firebase.firestore.FieldValue.serverTimestamp();
      const docData = {
        ...data,
        createdAt: timestamp,
        updatedAt: timestamp
      };
      
      let docRef;
      
      if (docId) {
        docRef = this._db.collection(collection).doc(docId);
        await docRef.set(docData);
      } else {
        docRef = await this._db.collection(collection).add(docData);
      }
      
      return { success: true, id: docRef.id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Mettre à jour un document
   * @param {string} collection
   * @param {string} docId
   * @param {object} data
   */
  async updateDoc(collection, docId, data) {
    this._checkInit();
    
    try {
      await this._db.collection(collection).doc(docId).update({
        ...data,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Supprimer un document
   * @param {string} collection
   * @param {string} docId
   */
  async deleteDoc(collection, docId) {
    this._checkInit();
    
    try {
      await this._db.collection(collection).doc(docId).delete();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Écouter un document en temps réel
   * @param {string} collection
   * @param {string} docId
   * @param {function} callback
   */
  subscribeDoc(collection, docId, callback) {
    this._checkInit();
    
    return this._db.collection(collection).doc(docId)
      .onSnapshot(
        (doc) => {
          if (doc.exists) {
            callback({ id: doc.id, ...doc.data() });
          } else {
            callback(null);
          }
        },
        (error) => {
          console.error('[Firebase] Subscribe error:', error);
          callback(null, error);
        }
      );
  }
  
  /**
   * Écouter une collection en temps réel
   * @param {string} collection
   * @param {object} options
   * @param {function} callback
   */
  subscribeDocs(collection, options, callback) {
    this._checkInit();
    
    let query = this._db.collection(collection);
    
    if (options.where) {
      for (const [field, operator, value] of options.where) {
        query = query.where(field, operator, value);
      }
    }
    
    if (options.orderBy) {
      const [field, direction = 'asc'] = options.orderBy;
      query = query.orderBy(field, direction);
    }
    
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    return query.onSnapshot(
      (snapshot) => {
        const docs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(docs);
      },
      (error) => {
        console.error('[Firebase] Subscribe error:', error);
        callback([], error);
      }
    );
  }
  
  // ═══════════════════════════════════════════════════════════
  // STORAGE
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Upload un fichier
   * @param {File} file
   * @param {string} path
   * @param {function} onProgress - Callback de progression
   */
  async uploadFile(file, path, onProgress = null) {
    this._checkInit();
    
    try {
      const storageRef = this._storage.ref(path);
      const uploadTask = storageRef.put(file);
      
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (onProgress) onProgress(progress);
          },
          (error) => {
            reject({ success: false, error: error.message });
          },
          async () => {
            const url = await uploadTask.snapshot.ref.getDownloadURL();
            resolve({ success: true, url, path });
          }
        );
      });
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Supprimer un fichier
   * @param {string} path
   */
  async deleteFile(path) {
    this._checkInit();
    
    try {
      await this._storage.ref(path).delete();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Obtenir l'URL de téléchargement
   * @param {string} path
   */
  async getFileUrl(path) {
    this._checkInit();
    
    try {
      const url = await this._storage.ref(path).getDownloadURL();
      return { success: true, url };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  // ═══════════════════════════════════════════════════════════
  // USER PROFILE
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Créer un profil utilisateur
   * @param {string} uid
   * @param {object} data
   */
  async createUserProfile(uid, data) {
    const defaultProfile = {
      role: 'student',
      subscription: 'FREE',
      xp: 0,
      level: 1,
      streak: 0,
      lives: 5,
      coins: 0,
      countryCode: 'GN',
      classId: null,
      badges: [],
      settings: {
        notifications: true,
        theme: 'light',
        language: 'fr'
      }
    };
    
    return this.createDoc('users', { ...defaultProfile, ...data }, uid);
  }
  
  /**
   * Obtenir le profil utilisateur
   * @param {string} uid
   */
  async getUserProfile(uid) {
    return this.getDoc('users', uid);
  }
  
  /**
   * Mettre à jour le profil utilisateur
   * @param {string} uid
   * @param {object} data
   */
  async updateUserProfile(uid, data) {
    return this.updateDoc('users', uid, data);
  }
  
  // ═══════════════════════════════════════════════════════════
  // HELPERS PRIVÉS
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Vérifier l'initialisation
   * @private
   */
  _checkInit() {
    if (!this._initialized) {
      throw new Error('Firebase not initialized. Call init() first.');
    }
  }
  
  /**
   * Gérer le changement d'état d'auth
   * @private
   */
  async _handleAuthStateChange(user) {
    if (user) {
      // ─── Utilisateur connecté ───
      const profileResult = await this.getUserProfile(user.uid);
      const profile = profileResult.success ? profileResult.data : null;
      
      State.set({
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        },
        profile,
        isAuthenticated: true,
        xp: profile?.xp || 0,
        level: profile?.level || 1,
        streak: profile?.streak || 0,
        lives: profile?.lives || 5,
        coins: profile?.coins || 0
      });
    } else {
      // ─── Utilisateur déconnecté ───
      State.set({
        user: null,
        profile: null,
        isAuthenticated: false
      });
    }
    
    // ─── Notifier les callbacks ───
    for (const callback of this._onAuthStateChangedCallbacks) {
      callback(user);
    }
  }
  
  /**
   * Mapper les erreurs Firebase Auth
   * @private
   */
  _mapAuthError(error) {
    const errorMessages = {
      'auth/email-already-in-use': 'Cet email est déjà utilisé.',
      'auth/invalid-email': 'Email invalide.',
      'auth/operation-not-allowed': 'Opération non autorisée.',
      'auth/weak-password': 'Mot de passe trop faible (min. 6 caractères).',
      'auth/user-disabled': 'Ce compte a été désactivé.',
      'auth/user-not-found': 'Aucun compte trouvé avec cet email.',
      'auth/wrong-password': 'Mot de passe incorrect.',
      'auth/too-many-requests': 'Trop de tentatives. Réessayez plus tard.',
      'auth/popup-closed-by-user': 'Connexion annulée.',
      'auth/network-request-failed': 'Erreur réseau. Vérifiez votre connexion.'
    };
    
    return errorMessages[error.code] || error.message;
  }
}

// ─── Créer l'instance singleton ───
const Firebase = new FirebaseService();

// ─── Export ───
window.Firebase = Firebase;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FirebaseService, Firebase };
}
