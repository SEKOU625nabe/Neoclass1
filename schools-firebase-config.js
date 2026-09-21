// ============================================================
// NEOCLASS v2.0 – CONFIGURATION FIREBASE POUR ÉCOLES ENRICHIE
// ============================================================
// Extension de la collection 'users' pour les profils d'écoles

/**
 * STRUCTURE ENRICHIE POUR UTILISATEURS AVEC ROLE 'school'
 * 
 * Collection: users
 * Document ID: schoolUID (Firebase Auth UID)
 */

const SchoolProfileStructure = {
  // ===== IDENTITÉ DE BASE =====
  uid: "school_unique_id",
  email: "ecole@email.com",
  role: "school",
  createdAt: "timestamp",
  
  // ===== INFORMATIONS ÉCOLE =====
  schoolName: "Nom de l'École",
  foundedYear: 2020,
  schoolType: "Primaire|Secondaire|Lycée|Préscolaire", // enum
  description: "Description complète de l'école...",
  
  // ===== MEDIA =====
  logoURL: "url_ou_base64",
  coverPhotoURL: "url_ou_base64",
  galleryPhotos: [
    "url_photo_1",
    "url_photo_2",
    "url_photo_3"
  ],
  
  // ===== CONTACT DIRECT =====
  contactPhone: "+224 XXX XXX XXX",
  whatsappPhone: "+224 XXX XXX XXX",
  website: "https://www.ecole.com",
  
  // ===== LOCALISATION =====
  address: "Rue, Quartier",
  city: "Conakry",
  country: "Guinée",
  coordinates: {
    lat: 9.5412,
    lng: -13.7150
  },
  
  // ===== INFORMATIONS ACADÉMIQUES =====
  curriculum: ["Guinéenne", "Française"], // enum array
  levels: ["Préscolaire", "Primaire", "Collège", "Lycée"],
  languages: ["Français", "Anglais", "Malinké"],
  
  // ===== STATISTIQUES =====
  studentCount: 450,
  classCount: 18,
  teacherCount: 25,
  averageClassSize: 25,
  
  // ===== ÉQUIPE ADMINISTRATION =====
  headmaster: {
    fullName: "Nom du Directeur",
    email: "directeur@ecole.com",
    phone: "+224 XXX XXX XXX"
  },
  adminContact: {
    fullName: "Nom du contact admin",
    email: "admin@ecole.com",
    phone: "+224 XXX XXX XXX"
  },
  
  // ===== RÉSEAUX SOCIAUX =====
  socialLinks: {
    facebook: "https://facebook.com/ecole",
    instagram: "https://instagram.com/ecole",
    youtube: "https://youtube.com/@ecole",
    twitter: "https://twitter.com/ecole"
  },
  
  // ===== TARIFICATION & SERVICES =====
  feesRange: {
    min: 100000,  // en GNF
    max: 500000
  },
  services: [
    "Transport scolaire",
    "Cantine",
    "Garderie",
    "Activités extra-scolaires",
    "Bibliothèque",
    "Laboratoire",
    "Salle informatique"
  ],
  specialPrograms: [
    "Programme STEM",
    "Bilinguisme",
    "Échange international",
    "Sports excellence"
  ],
  
  // ===== AVIS & NOTATION =====
  averageRating: 4.5,
  totalReviews: 42,
  recentReviews: [
    {
      reviewId: "rev_001",
      userId: "user_id",
      userName: "Parent A",
      rating: 5,
      title: "Excellente école",
      comment: "Très satisfait de l'école...",
      createdAt: "timestamp",
      helpful: 12
    }
  ],
  
  // ===== STATUTS =====
  isPublished: true,
  isVerified: true,  // Modéré par admin
  isPromoted: false,
  isFeatured: false,
  
  // ===== MÉTADONNÉES =====
  profileCompleteness: 85,  // %
  viewCount: 1234,
  messageCount: 45,
  favoriteCount: 123,
  lastUpdated: "timestamp",
  updatedBy: "school_uid"
};

// ============================================================
// STRUCTURE DE MESSAGES CONTACT
// ============================================================
const ContactMessageStructure = {
  messageId: "msg_unique_id",
  schoolId: "school_uid",
  senderId: "user_uid_or_guest",
  senderEmail: "sender@email.com",
  senderName: "Nom Complet",
  senderPhone: "+224 XXX XXX XXX",
  
  subject: "Demande d'inscription",
  messageType: "inquiry|registration|feedback|complaint", // enum
  message: "Contenu du message...",
  
  attachments: ["url_fichier_1"],
  
  // Réponse école
  response: {
    responderId: "school_admin_uid",
    responseText: "Réponse de l'école...",
    respondedAt: "timestamp"
  },
  
  status: "pending|responded|resolved|closed", // enum
  priority: "low|medium|high|urgent",
  
  createdAt: "timestamp",
  expiresAt: "timestamp"  // TTL 30 jours
};

// ============================================================
// STRUCTURE DE CHAT DIRECT
// ============================================================
const DirectMessageStructure = {
  chatId: "chat_unique_id",
  participants: ["user_id_1", "school_id"],
  lastMessage: "Dernier message...",
  lastMessageAt: "timestamp",
  
  messages: [
    {
      messageId: "msg_id",
      senderId: "user_id",
      text: "Contenu du message",
      attachments: [],
      readBy: ["school_id"],
      createdAt: "timestamp"
    }
  ],
  
  unreadCount: {
    "school_id": 0,
    "user_id": 2
  }
};

// ============================================================
// STRUCTURE D'AVIS/NOTATION
// ============================================================
const SchoolReviewStructure = {
  reviewId: "rev_unique_id",
  schoolId: "school_uid",
  userId: "user_uid",
  
  userProfile: {
    name: "Nom du parent",
    studentName: "Nom de l'élève",
    photoURL: "url"
  },
  
  rating: 4.5,  // 0-5
  ratingBreakdown: {
    academics: 5,
    facilities: 4,
    management: 4,
    discipline: 5,
    communication: 4
  },
  
  title: "Titre de l'avis",
  content: "Contenu détaillé de l'avis...",
  
  categories: {
    academics: true,
    facilities: true,
    management: true,
    discipline: true,
    communication: true
  },
  
  verified: true,  // L'utilisateur a un enfant dans l'école
  helpful: 45,
  notHelpful: 2,
  
  schoolResponse: {
    responderId: "school_admin_uid",
    response: "Merci pour votre avis...",
    respondedAt: "timestamp"
  },
  
  createdAt: "timestamp",
  updatedAt: "timestamp"
};

// ============================================================
// STRUCTURE DE SIGNALEMENT D'École (Favoris)
// ============================================================
const FavoriteSchoolStructure = {
  favoriteId: "fav_unique_id",
  userId: "user_uid",
  schoolId: "school_uid",
  schoolData: {
    schoolName: "Nom...",
    logoURL: "url",
    city: "Conakry",
    averageRating: 4.5
  },
  addedAt: "timestamp",
  notes: "Mes notes personnelles..."
};

// ============================================================
// COLLECTION SÉPARÉE: school_visits (Analytics)
// ============================================================
const SchoolVisitStructure = {
  visitId: "visit_unique_id",
  schoolId: "school_uid",
  visitorId: "user_uid_or_anonymous",
  
  visitedPages: ["listing", "profile", "contact"],
  timeSpent: 180,  // secondes
  
  deviceInfo: {
    userAgent: "...",
    platform: "mobile|desktop|tablet"
  },
  
  conversions: {
    viewed: true,
    messageSent: true,
    reviewLeft: false,
    favoriteAdded: true
  },
  
  timestamp: "timestamp"
};

// ============================================================
// FIREBASE RULES POUR SCHOOLS
// ============================================================
const FirestoreRules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ===== COLLECTION: users =====
    match /users/{userId} {
      // Écoles peuvent lire leur propre profil et voir les profils publics
      allow read: if request.auth != null && 
                     (request.auth.uid == userId || 
                      resource.data.role != 'school');
      
      allow write: if request.auth.uid == userId;
      
      // Collection sub: school_reviews
      match /school_reviews/{reviewId} {
        allow read: if true;  // Avis publics
        allow create: if request.auth != null;
        allow update, delete: if request.auth.uid == resource.data.userId;
      }
      
      // Collection sub: school_messages
      match /school_messages/{messageId} {
        allow read: if request.auth.uid == resource.data.schoolId || 
                       request.auth.uid == resource.data.senderId;
        allow create: if request.auth != null;
      }
    }
    
    // ===== COLLECTION: school_chats =====
    match /school_chats/{chatId} {
      allow read, write: if request.auth.uid in resource.data.participants;
      allow create: if request.auth != null;
    }
    
    // ===== COLLECTION: school_visits (Analytics) =====
    match /school_visits/{visitId} {
      allow write: if true;  // Permet tracking anonyme
      allow read: if request.auth != null;
    }
  }
}
`;

console.log('✅ Configuration Firebase Écoles Enrichie Chargée');
