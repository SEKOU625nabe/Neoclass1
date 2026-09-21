// ============================================================
// NEOCLASS FIREBASE CONFIGURATION - GLOBAL
// ============================================================
// Utilisé par: Web (Neoclass3.html), Mobile (Android/iOS)
// Base de données commune pour tous les rôles et contenus
// ============================================================

export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDkLJFpQw_neoclass_YOUR_API_KEY_HERE",
  authDomain: "neoclass-73b86.firebaseapp.com",
  projectId: "neoclass-73b86",
  storageBucket: "neoclass-73b86.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456ghi789jkl",
  measurementId: "G-ABCDEFGHIJ"
};

// ============================================================
// FIREBASE SERVICES INITIALIZATION
// ============================================================

import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getMessaging, getToken } from 'firebase/messaging';

// Initialize Firebase
export const firebaseApp = initializeApp(FIREBASE_CONFIG);

// Get instances
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);
export const messaging = getMessaging(firebaseApp);

// ============================================================
// FIRESTORE COLLECTIONS STRUCTURE
// ============================================================

export const FIRESTORE_COLLECTIONS = {
  // Users & Auth
  USERS: 'users',
  PROFILES: 'profiles',
  ROLES: 'roles',
  
  // Academic
  CLASSES: 'classes',
  COURSES: 'courses',
  GRADES: 'grades',
  RESULTS: 'studentResults',
  ASSIGNMENTS: 'assignments',
  
  // Teaching
  TEACHERS: 'teachers',
  LESSONS: 'lessons',
  QUIZZES: 'quizzes',
  
  // School
  SCHOOLS: 'schools',
  DIRECTORS: 'directors',
  DEPARTMENTS: 'departments',
  
  // Financial
  SUBSCRIPTIONS: 'subscriptions',
  PAYMENTS: 'payments',
  INVOICES: 'invoices',
  FINANCES: 'finances',
  
  // Gamification
  NABECOINS: 'nabeCoins',
  BADGES: 'badges',
  LEADERBOARDS: 'leaderboards',
  STREAKS: 'streaks',
  ACHIEVEMENTS: 'achievements',
  
  // Content
  LIBRARY: 'library',
  RESOURCES: 'resources',
  MESSAGES: 'messages',
  NOTIFICATIONS: 'notifications',
  
  // Islamic Content (optional)
  QURAN: 'quran',
  DOAS: 'doas',
  ISLAMIC_CONTENT: 'islamicContent',
  
  // Admin
  ANALYTICS: 'analytics',
  LOGS: 'logs',
  SETTINGS: 'settings'
};

// ============================================================
// USER ROLES & PERMISSIONS
// ============================================================

export const USER_ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  SCHOOL_ADMIN: 'school_admin',
  PARENT: 'parent',
  SUPER_ADMIN: 'admin'
};

export const PERMISSIONS = {
  student: ['view_courses', 'view_grades', 'submit_quiz', 'use_ai', 'purchase_coins'],
  teacher: ['create_courses', 'grade_students', 'publish_quizzes', 'create_content', 'view_analytics'],
  school_admin: ['manage_students', 'manage_teachers', 'manage_finances', 'manage_content', 'view_reports'],
  parent: ['view_child_progress', 'view_reports', 'contact_teacher', 'manage_parental_controls'],
  admin: ['full_access', 'manage_users', 'manage_settings', 'view_all_analytics']
};

// ============================================================
// MESSAGING SERVICE (FCM)
// ============================================================

export async function requestNotificationPermission() {
  try {
    const token = await getToken(messaging, {
      vapidKey: "YOUR_VAPID_KEY_HERE"
    });
    console.log("FCM Token:", token);
    return token;
  } catch (error) {
    console.error("Error getting FCM token:", error);
    return null;
  }
}

// ============================================================
// STORAGE BUCKETS
// ============================================================

export const STORAGE_PATHS = {
  PROFILES: 'profiles/',
  COURSES: 'courses/',
  RESOURCES: 'resources/',
  DOCUMENTS: 'documents/',
  MEDIA: 'media/',
  CERTIFICATES: 'certificates/'
};

// ============================================================
// SYNC & OFFLINE SUPPORT
// ============================================================

export function enableOfflineSupport() {
  // Enable offline persistence for Firestore
  try {
    // db.enablePersistence() // Auto-sync when back online
  } catch (err) {
    if (err.code === 'failed-precondition') {
      console.warn('Offline persistence failed: multiple tabs open');
    } else if (err.code === 'unimplemented') {
      console.warn('Offline persistence not supported');
    }
  }
}

// ============================================================
// REAL-TIME LISTENERS
// ============================================================

export function setupRealtimeListeners(userId, onUpdate) {
  // User data changes
  const userRef = db.collection(FIRESTORE_COLLECTIONS.USERS).doc(userId);
  userRef.onSnapshot(doc => {
    onUpdate?.('user', doc.data());
  });
  
  // Notifications
  const notificationsRef = db.collection(FIRESTORE_COLLECTIONS.NOTIFICATIONS)
    .where('userId', '==', userId)
    .where('read', '==', false);
  
  notificationsRef.onSnapshot(snapshot => {
    onUpdate?.('notifications', snapshot.docs.map(doc => doc.data()));
  });
}

// ============================================================
// FIRESTORE RULES (Deploy separately)
// ============================================================
// See: firestore.rules file

export const FIRESTORE_RULES = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users - Own data readable
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId && request.resource.data.role == resource.data.role;
    }
    
    // Public courses
    match /courses/{courseId} {
      allow read: if true;
      allow write: if request.auth.uid == resource.data.createdBy;
    }
    
    // Messages
    match /messages/{messageId} {
      allow read: if request.auth.uid in resource.data.recipients;
      allow write: if request.auth.uid == request.resource.data.senderId;
    }
    
    // Grades - Teachers and students can read their own
    match /grades/{gradeId} {
      allow read: if request.auth.uid == resource.data.studentId || 
                     request.auth.uid == resource.data.teacherId;
      allow write: if request.auth.uid == resource.data.teacherId;
    }
  }
}
`;

// ============================================================
// BACKEND API ENDPOINTS (if using Cloud Functions)
// ============================================================

export const API_ENDPOINTS = {
  BASE_URL: 'https://us-central1-neoclass-73b86.cloudfunctions.net',
  ENDPOINTS: {
    createPayment: '/api/payments/create',
    verifyPayment: '/api/payments/verify',
    generateCertificate: '/api/certificates/generate',
    sendNotification: '/api/notifications/send',
    processGrades: '/api/grades/process'
  }
};

// ============================================================
// EXPORT ALL
// ============================================================

export default {
  firebaseApp,
  auth,
  db,
  storage,
  messaging,
  FIREBASE_CONFIG,
  USER_ROLES,
  PERMISSIONS,
  FIRESTORE_COLLECTIONS,
  requestNotificationPermission,
  enableOfflineSupport,
  setupRealtimeListeners
};
