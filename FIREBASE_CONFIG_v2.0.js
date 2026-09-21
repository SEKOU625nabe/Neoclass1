// ============================================================
// NEOCLASS v2.0 – CONFIGURATION FIREBASE
// ============================================================
// Ce fichier documente la structure des collections Firestore

// ============================================================
// 1. COLLECTION: users
// ============================================================
// Document ID: userId (Firebase Auth UID)
// Description: Utilisateurs (élèves, parents, écoles, profs)
// Modifié pour v2.0: Ajout photoURL pour tous, infos parents pour élèves

{
  // Identifiants
  uid: "...",
  email: "...",
  role: "student|parent|school|teacher|director",
  createdAt: Timestamp,

  // Profil de base
  fullName: "Nom Complet",
  firstName: "Prénom",
  lastName: "Nom",
  photoURL: "base64_image_data_or_url", // ⭐ NOUVEAU v2.0

  // Pour les élèves
  studentId: "ELEV-XXXXXX",
  className: "6ème A",
  classId: "class_document_id",
  level: "6ème",
  system: "guinea|french",

  // Pour les élèves: Infos parents (⭐ NOUVEAU v2.0)
  parentName: "Nom du parent",
  parentPhone: "+224 XXX XXX XXX",
  parentEmail: "parent@email.com", // Important pour bulletins
  childEmail: "email@neoclass.com",
  isBanned: false,
  banReason: "",
  bannedAt: Timestamp|null,
  banUpdatedBy: "school_uid",

  // Métadonnées
  isOnline: boolean,
  lastSeen: Timestamp,
  videoWatched: boolean,

  // Gamification
  totalXP: 0,
  nabecoins: 50,
  streak: 0,

  // Pour les écoles
  schoolName: "Nom Établissement",
  schoolLogo: "base64_image",
  schoolAddress: "Adresse",
  schoolPhone: "Téléphone",

  // Configuration bulletin (⭐ NOUVEAU v2.0)
  bulletinConfig: {
    themeColor: "#6c63ff",
    directorName: "Nom du directeur",
    directorSignature: "base64_image",
    schoolStamp: "base64_image",
    updatedAt: Timestamp
  },

  // Config notes de l'école
  gradesConfig: {
    subjects: [
      { name: "Mathématiques", coef: 3 },
      { name: "Français", coef: 2 },
      // ...
    ]
  }
}

// ============================================================
// 2. COLLECTION: classes (⭐ NOUVEAU v2.0)
// ============================================================
// Document ID: auto-generated
// Description: Classes de l'établissement

{
  // Identifiants
  id: "auto", // document id
  schoolId: "uid_école",
  
  // Infos classe
  name: "6ème A",
  level: "6ème",
  description: "Classe du matin, 35 élèves",
  mainTeacher: "Nom professeur principal",
  
  // Métadonnées
  studentCount: 35,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  isActive: true
}

// ============================================================
// 3. COLLECTION: teachers (⭐ NOUVEAU v2.0)
// ============================================================
// Document ID: auto-generated
// Description: Professeurs de l'établissement

{
  id: "auto",
  schoolId: "uid_école",
  
  // Infos personnelles
  name: "Nom Professeur",
  email: "prof@email.com",
  phone: "+224 XXX XXX XXX",
  photoURL: "base64_image_or_url", // ⭐ NOUVEAU v2.0
  
  // Professionnel
  subjects: ["Mathématiques", "Physique"], // Matières enseignées
  mainClassId: "class_id", // Classe principale
  
  // Métadonnées
  isActive: true,
  createdAt: Timestamp,
  updatedAt: Timestamp
}

// ============================================================
// 4. COLLECTION: directors (⭐ NOUVEAU v2.0)
// ============================================================
// Document ID: auto-generated
// Description: Cadres/Dirigeants de l'établissement

{
  id: "auto",
  schoolId: "uid_école",
  
  // Infos personnelles
  name: "Nom Complet",
  email: "director@email.com",
  phone: "+224 XXX XXX XXX",
  photoURL: "base64_image_or_url", // ⭐ NOUVEAU v2.0
  
  // Poste
  position: "Directeur|Sous-directeur|Chef de cycle|...",
  
  // Métadonnées
  isActive: true,
  createdAt: Timestamp,
  updatedAt: Timestamp
}

// ============================================================
// 5. COLLECTION: studentResults
// ============================================================
// Document ID: "${studentId}_${period}" (ex: "uid_T1")
// Description: Résultats et bulletins des élèves

{
  id: "uid_T1",
  
  // Identifiants
  studentId: "uid",
  schoolId: "uid_école",
  classId: "class_id",
  
  // Résultats
  period: "T1|T2|T3",
  name: "Nom Élève",
  generalAvg: 15.5,
  rank: 3,
  totalStudents: 35,
  passed: true, // Admis ou ajourné
  
  // Notes par matière
  subjectAvgs: {
    "Mathématiques": 16.5,
    "Français": 14.2,
    "Anglais": 15.8,
    // ...
  },
  
  // Métadonnées
  publishedAt: Timestamp,
  updatedAt: Timestamp
}

// ============================================================
// 6. COLLECTION: grades
// ============================================================
// Document ID: auto-generated
// Description: Notes brutes des élèves (avant moyennes)

{
  id: "auto",
  schoolId: "uid_école",
  classId: "class_id",
  
  // Informations
  period: "T1",
  evalType: "Devoir|Contrôle|Exam|...",
  subject: "Mathématiques",
  coefficient: 2,
  
  // Notes des élèves
  grades: [
    { studentId: "uid1", name: "Élève 1", grade: 16.5 },
    { studentId: "uid2", name: "Élève 2", grade: 14.2 },
    // ...
  ],
  
  // Métadonnées
  createdAt: Timestamp,
  createdBy: "teacher_uid"
}

// ============================================================
// 7. COLLECTION: messages (existante, modifiée)
// ============================================================
// Document ID: auto-generated
// Description: Messages/notifications (⭐ Amélioré v2.0)

{
  id: "auto",
  
  // Destinataire et expéditeur
  recipientId: "uid",
  senderId: "uid_école|uid_teacher",
  senderName: "Nom École",
  schoolId: "uid_école",
  
  // Contenu
  type: "school|bulletin|grades", // Type de message
  title: "📄 Bulletin de notes – 1er Trimestre",
  body: "Vos résultats du 1er trimestre...",
  
  // Pour bulletins/notes (⭐ NOUVEAU v2.0)
  period: "T1",
  bulletinAvailable: true,
  generalAvg: 15.5,
  passed: true,
  
  // Métadonnées
  createdAt: Timestamp,
  read: false,
  readAt: Timestamp|null
}

// ============================================================
// 8. COLLECTION: schools
// ============================================================
// Document ID: uid de l'école (Firebase Auth)
// Description: Données d'école (sous-collections)

schools/{schoolId}/
  ├── students/ {documents}
  ├── classes/ {documents}
  ├── grades/ {documents}
  └── ...

// Exemple: schools/uid_école/students/
{
  id: "auto",
  uid: "uid_élève",
  studentId: "ELEV-XXXXXX",
  studentPwd: "password",
  firstName: "Prénom",
  lastName: "Nom",
  className: "6ème A",
  classId: "class_id",
  parentName: "Nom parent",
  parentPhone: "+224 XXX XXX XXX",
  parentEmail: "parent@email.com",
  photoURL: "base64_image", // ⭐ NOUVEAU v2.0
  email: "elev-xxxxxx@neoclass.com",
  schoolId: "uid_école",
  schoolName: "Nom École",
  createdAt: Timestamp
}

// ============================================================
// RÈGLES DE SÉCURITÉ FIRESTORE
// ============================================================

// firestore.rules (à adapter)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Utilisateurs: chacun peut lire/écrire son propre document
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId;
      
      // Directeur peut lire/modifier infos école
      allow read, write: if 
        request.auth.uid == resource.data.schoolId && 
        request.auth.token.claims.role == 'school';
    }

    // Classes: accès école + professeurs assignés
    match /classes/{classId} {
      allow read: if request.auth.uid == resource.data.schoolId;
      allow write: if request.auth.uid == resource.data.schoolId;
    }

    // Professeurs: gestion école
    match /teachers/{teacherId} {
      allow read: if request.auth.uid == resource.data.schoolId;
      allow write: if request.auth.uid == resource.data.schoolId;
    }

    // Dirigeants: gestion école
    match /directors/{directorId} {
      allow read: if request.auth.uid == resource.data.schoolId;
      allow write: if request.auth.uid == resource.data.schoolId;
    }

    // Résultats: élève lit ses résultats, école gère
    match /studentResults/{resultId} {
      allow read: if 
        request.auth.uid == resource.data.studentId ||
        request.auth.uid == resource.data.schoolId;
      allow write: if request.auth.uid == resource.data.schoolId;
    }

    // Grades: école gère
    match /grades/{gradeId} {
      allow read: if request.auth.uid == resource.data.schoolId;
      allow write: if request.auth.uid == resource.data.schoolId;
    }

    // Messages: destinataire peut lire, école/système peut écrire
    match /messages/{messageId} {
      allow read: if request.auth.uid == resource.data.recipientId;
      allow write: if request.auth.uid == resource.data.senderId;
    }

    // Collections sous-écoles
    match /schools/{schoolId}/{document=**} {
      allow read, write: if request.auth.uid == schoolId;
    }
  }
}

// ============================================================
// INITIALISATION FIREBASE (dans le code)
// ============================================================

// Configuration
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Utilisation
// Créer classe
db.collection('classes').add({
  schoolId: State.user.uid,
  name: "6ème A",
  level: "6ème",
  createdAt: firebase.firestore.FieldValue.serverTimestamp()
})

// Ajouter professeur
db.collection('teachers').add({
  schoolId: State.user.uid,
  name: "Nom",
  subjects: ["Maths"],
  photoURL: base64,
  createdAt: firebase.firestore.FieldValue.serverTimestamp()
})

// Publier résultats
db.collection('studentResults').doc(`${studentId}_T1`).set({
  studentId,
  schoolId: State.user.uid,
  period: "T1",
  generalAvg: 15.5,
  passed: true,
  publishedAt: firebase.firestore.FieldValue.serverTimestamp()
})

// ============================================================
// INDEX FIRESTORE RECOMMANDÉS
// ============================================================

// Créer index pour les requêtes fréquentes:

// 1. Teachers
db.collection('teachers')
  .where('schoolId', '==', schoolId)
  .orderBy('createdAt', 'desc')

// 2. Directors
db.collection('directors')
  .where('schoolId', '==', schoolId)
  .orderBy('createdAt', 'desc')

// 3. Classes avec élèves
db.collection('classes')
  .where('schoolId', '==', schoolId)
  .orderBy('name')

db.collection('users')
  .where('classId', '==', classId)
  .where('role', '==', 'student')

// 4. Student Results
db.collection('studentResults')
  .where('schoolId', '==', schoolId)
  .where('period', '==', 'T1')

// ============================================================
// FIN CONFIGURATION FIREBASE v2.0
// ============================================================
