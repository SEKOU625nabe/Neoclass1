// ============================================================
// FIREBASE SERVICE
// ============================================================

let db, auth;

async function initializeFirebase() {
  try {
    firebase.initializeApp(FIREBASE_CONFIG);
    auth = firebase.auth();
    db = firebase.firestore();
    
    // Setup auth state listener
    auth.onAuthStateChanged(handleAuthStateChange);
    
    console.log('✅ Firebase initialized');
    return true;
  } catch (error) {
    console.error('❌ Firebase init failed:', error);
    showToast('Erreur Firebase: ' + error.message, 'error');
    return false;
  }
}

async function handleAuthStateChange(user) {
  if (user) {
    State.user = user;
    await loadUserProfile();
    showCinematic();
  } else {
    State.user = null;
    State.profile = { role: 'guest' };
    showAuthPage();
  }
}

// ============================================================
// AUTH FUNCTIONS
// ============================================================
async function signUp(email, password, fullName, role, system) {
  try {
    const result = await auth.createUserWithEmailAndPassword(email, password);
    await result.user.updateProfile({ displayName: fullName });
    
    // Store profile in Firestore
    await db.collection('users').doc(result.user.uid).set({
      uid: result.user.uid,
      email,
      fullName,
      role,
      system,
      createdAt: new Date(),
      nabecoins: 0,
      level: 'beginner',
      streak: 0,
      totalScore: 0,
      badges: [],
      subscription: 'free',
    });
    
    showToast('Compte créé avec succès!', 'success');
    return result.user;
  } catch (error) {
    console.error('Signup error:', error);
    showToast('Erreur: ' + error.message, 'error');
    throw error;
  }
}

async function login(email, password) {
  try {
    const result = await auth.signInWithEmailAndPassword(email, password);
    showToast('Connexion réussie!', 'success');
    return result.user;
  } catch (error) {
    console.error('Login error:', error);
    showToast('Email ou mot de passe incorrect', 'error');
    throw error;
  }
}

async function logout() {
  try {
    await auth.signOut();
    State.user = null;
    State.profile = { role: 'guest' };
    showToast('Déconnexion réussie', 'success');
  } catch (error) {
    console.error('Logout error:', error);
    showToast('Erreur lors de la déconnexion', 'error');
  }
}

async function loadUserProfile() {
  if (!State.user) return;
  
  try {
    const doc = await db.collection('users').doc(State.user.uid).get();
    if (doc.exists) {
      State.profile = doc.data();
    }
  } catch (error) {
    console.error('Error loading profile:', error);
  }
}

// ============================================================
// COURSES FUNCTIONS
// ============================================================
async function getCourses(filter = {}) {
  try {
    let query = db.collection('courses');
    
    if (filter.system) {
      query = query.where('system', '==', filter.system);
    }
    if (filter.level) {
      query = query.where('level', '==', filter.level);
    }
    
    const snapshot = await query.get();
    const courses = [];
    snapshot.forEach(doc => {
      courses.push({ id: doc.id, ...doc.data() });
    });
    
    return courses;
  } catch (error) {
    console.error('Error getting courses:', error);
    return [];
  }
}

async function getCourseDetails(courseId) {
  try {
    const doc = await db.collection('courses').doc(courseId).get();
    if (doc.exists) {
      return { id: doc.id, ...doc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting course:', error);
    return null;
  }
}

async function enrollCourse(courseId) {
  if (!State.user) return false;
  
  try {
    const enrollmentRef = db.collection('users')
      .doc(State.user.uid)
      .collection('enrollments')
      .doc(courseId);
    
    await enrollmentRef.set({
      courseId,
      enrolledAt: new Date(),
      progress: 0,
      completed: false
    });
    
    showToast('Inscription réussie!', 'success');
    return true;
  } catch (error) {
    console.error('Enrollment error:', error);
    showToast('Erreur lors de l\'inscription', 'error');
    return false;
  }
}

async function getUserCourses() {
  if (!State.user) return [];
  
  try {
    const snapshot = await db.collection('users')
      .doc(State.user.uid)
      .collection('enrollments')
      .get();
    
    const courses = [];
    for (const doc of snapshot.docs) {
      const courseData = await getCourseDetails(doc.data().courseId);
      if (courseData) {
        courses.push({
          ...courseData,
          progress: doc.data().progress || 0,
          completed: doc.data().completed || false
        });
      }
    }
    
    return courses;
  } catch (error) {
    console.error('Error getting user courses:', error);
    return [];
  }
}

// ============================================================
// QUIZ FUNCTIONS
// ============================================================
async function submitQuizAnswer(quizId, answers) {
  if (!State.user) return false;
  
  try {
    const score = calculateScore(answers);
    const reward = Math.floor(score / 10) * 10;
    
    // Update NabeCoins
    await db.collection('users').doc(State.user.uid).update({
      nabecoins: firebase.firestore.FieldValue.increment(reward)
    });
    
    // Record quiz result
    await db.collection('users')
      .doc(State.user.uid)
      .collection('quiz_results')
      .add({
        quizId,
        score,
        reward,
        timestamp: new Date(),
        answers
      });
    
    State.profile.nabecoins += reward;
    showToast(`Quiz réussi! +${reward} NabeCoins`, 'success');
    return { score, reward };
  } catch (error) {
    console.error('Quiz submission error:', error);
    return false;
  }
}

function calculateScore(answers) {
  let score = 0;
  answers.forEach(answer => {
    if (answer.correct) score += 10;
  });
  return Math.min(100, score);
}

// ============================================================
// NABECOINS & WITHDRAWAL
// ============================================================
async function requestWithdrawal(amount, method, phoneNumber) {
  if (!State.user) return false;
  if (State.profile.nabecoins < amount) {
    showToast('NabeCoins insuffisants', 'error');
    return false;
  }
  
  try {
    await db.collection('users').doc(State.user.uid).update({
      nabecoins: firebase.firestore.FieldValue.increment(-amount)
    });
    
    await db.collection('withdrawals').add({
      userId: State.user.uid,
      amount,
      method,
      phoneNumber,
      status: 'pending',
      requestedAt: new Date(),
      processedAt: null
    });
    
    State.profile.nabecoins -= amount;
    showToast('Demande de retrait en cours...', 'success');
    return true;
  } catch (error) {
    console.error('Withdrawal error:', error);
    showToast('Erreur lors du retrait', 'error');
    return false;
  }
}

// ============================================================
// SOCIAL & MESSAGING
// ============================================================
async function sendMessage(recipientId, message) {
  if (!State.user) return false;
  
  try {
    await db.collection('messages').add({
      senderId: State.user.uid,
      recipientId,
      message,
      timestamp: new Date(),
      read: false
    });
    
    return true;
  } catch (error) {
    console.error('Message error:', error);
    return false;
  }
}

async function getMessages(recipientId) {
  if (!State.user) return [];
  
  try {
    const snapshot = await db.collection('messages')
      .where('senderId', '==', State.user.uid)
      .where('recipientId', '==', recipientId)
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();
    
    const messages = [];
    snapshot.forEach(doc => {
      messages.push({ id: doc.id, ...doc.data() });
    });
    
    return messages.reverse();
  } catch (error) {
    console.error('Error getting messages:', error);
    return [];
  }
}

// ============================================================
// ADMIN FUNCTIONS
// ============================================================
async function getAllUsers(limit = 50) {
  if (State.profile.role !== 'admin') return [];
  
  try {
    const snapshot = await db.collection('users').limit(limit).get();
    const users = [];
    snapshot.forEach(doc => {
      users.push({ id: doc.id, ...doc.data() });
    });
    return users;
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
}

async function banUser(userId, reason) {
  if (State.profile.role !== 'admin') return false;
  
  try {
    await db.collection('users').doc(userId).update({
      isBanned: true,
      banReason: reason,
      bannedAt: new Date()
    });
    
    showToast('Utilisateur banni', 'success');
    return true;
  } catch (error) {
    console.error('Ban error:', error);
    return false;
  }
}

// ============================================================
// OFFLINE SUPPORT
// ============================================================
async function enableOfflineMode() {
  try {
    // Enable offline persistence
    await db.enablePersistence();
    console.log('✅ Offline mode enabled');
  } catch (error) {
    console.error('Offline mode error:', error);
  }
}
