// ============================================================
// NEOCLASS MOBILE - MAIN APP
// ============================================================

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Neoclass Mobile App Loading...');
  
  // Initialize Firebase
  const fbReady = await initializeFirebase();
  
  if (!fbReady) {
    document.getElementById('authPage').innerHTML = `
      <div class="card" style="margin: 40px 15px;">
        <h2 style="color: var(--danger);">❌ Erreur de connexion</h2>
        <p>Impossible de initialiser Firebase. Vérifiez votre configuration.</p>
      </div>
    `;
    return;
  }
  
  // Load theme
  const theme = localStorage.getItem('neo_theme') || 'light';
  document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
  
  // Setup Cordova (if on mobile)
  setupCordova();
  
  // Check auth state
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      State.user = user;
      await loadUserProfile();
      showCinematic();
    } else {
      showAuthPage();
    }
  });
});

// ============================================================
// INITIALIZATION
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Neoclass Mobile App Initialized');
  
  // Vérifier si l'utilisateur est connecté
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      currentUser = user;
      await loadUserProfile();
      showSplash();
      setTimeout(() => showDashboard(), 2000);
    } else {
      hideSplash();
      showAuthPage();
    }
  });

  // Gérer le back button Android
  document.addEventListener('backbutton', handleBackButton);
  
  // Charger le thème sauvegardé
  const savedTheme = localStorage.getItem('neoclass-theme') || 'light';
  if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.body.classList.add('dark-mode');
  }
});

// ============================================================
// SPLASH SCREEN
// ============================================================
function showSplash() {
  document.getElementById('splashScreen').style.display = 'flex';
  document.getElementById('authPage').style.display = 'none';
  document.getElementById('dashboardPage').style.display = 'none';
  currentPage = 'splash';
}

function hideSplash() {
  document.getElementById('splashScreen').style.display = 'none';
}

// ============================================================
// AUTH FUNCTIONS
// ============================================================
function showAuthPage() {
  document.getElementById('splashScreen').style.display = 'none';
  document.getElementById('authPage').style.display = 'flex';
  document.getElementById('dashboardPage').style.display = 'none';
  document.getElementById('bottomNav').style.display = 'none';
  currentPage = 'auth';
}

function switchAuthTab(tab, event) {
  // Mettre à jour les tabs
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  
  if (event && event.target) {
    event.target.classList.add('active');
  }
  document.getElementById(tab + 'Tab').classList.add('active');
}

function formatNumber(value) {
  return value?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') || '0';
}

async function getSchoolMetrics() {
  const defaultMetrics = {
    totalStudents: 264,
    activeTeachers: 18,
    totalClasses: 14,
    paymentsCollected: 12,
    pendingPayments: 7,
    monthlyRevenue: 5_200_000
  };

  if (!userProfile) return defaultMetrics;

  try {
    const doc = await db.collection('schoolMetrics').doc(userProfile.schoolId || 'default').get();
    if (doc.exists) {
      return { ...defaultMetrics, ...doc.data() };
    }
  } catch (error) {
    console.warn('Impossible de charger les métriques école :', error);
  }

  return defaultMetrics;
}

async function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const errorDiv = document.getElementById('loginError');
  const successDiv = document.getElementById('loginSuccess');
  const spinner = document.getElementById('loginSpinner');
  
  // Reset messages
  errorDiv.classList.remove('show');
  successDiv.classList.remove('show');
  
  try {
    spinner.style.display = 'inline-block';
    
    // Login
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    currentUser = userCredential.user;
    
    await loadUserProfile();
    
    spinner.style.display = 'none';
    successDiv.textContent = '✅ Connexion réussie!';
    successDiv.classList.add('show');
    
    setTimeout(() => {
      showSplash();
      setTimeout(() => showDashboard(), 2000);
    }, 500);
    
  } catch (error) {
    spinner.style.display = 'none';
    errorDiv.textContent = '❌ ' + (error.message || 'Erreur de connexion');
    errorDiv.classList.add('show');
  }
}

async function handleRegister(event) {
  event.preventDefault();
  
  const name = document.getElementById('registerName').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const confirm = document.getElementById('registerConfirm').value;
  const role = document.getElementById('registerRole').value;
  const errorDiv = document.getElementById('registerError');
  const successDiv = document.getElementById('registerSuccess');
  const spinner = document.getElementById('registerSpinner');
  
  // Reset messages
  errorDiv.classList.remove('show');
  successDiv.classList.remove('show');
  
  // Validation
  if (password !== confirm) {
    errorDiv.textContent = '❌ Les mots de passe ne correspondent pas';
    errorDiv.classList.add('show');
    return;
  }
  
  if (password.length < 8) {
    errorDiv.textContent = '❌ Le mot de passe doit contenir au moins 8 caractères';
    errorDiv.classList.add('show');
    return;
  }
  
  try {
    spinner.style.display = 'inline-block';
    
    // Créer le compte
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // Sauvegarder le profil
    await db.collection('users').doc(user.uid).set({
      uid: user.uid,
      email: email,
      fullName: name,
      role: role,
      createdAt: new Date(),
      updatedAt: new Date(),
      nabecoins: 0,
      streak: 0,
      level: 1,
      system: 'guinea' // ou 'france'
    });
    
    currentUser = user;
    userProfile = { uid: user.uid, email, fullName: name, role, nabecoins: 0, streak: 0 };
    
    spinner.style.display = 'none';
    successDiv.textContent = '✅ Inscription réussie!';
    successDiv.classList.add('show');
    
    setTimeout(() => {
      showSplash();
      setTimeout(() => showDashboard(), 2000);
    }, 500);
    
  } catch (error) {
    spinner.style.display = 'none';
    errorDiv.textContent = '❌ ' + (error.message || 'Erreur d\'inscription');
    errorDiv.classList.add('show');
  }
}

async function loadUserProfile() {
  try {
    const doc = await db.collection('users').doc(currentUser.uid).get();
    if (doc.exists) {
      userProfile = doc.data();
    } else {
      // Profil par défaut
      userProfile = {
        uid: currentUser.uid,
        email: currentUser.email,
        fullName: currentUser.displayName || 'Utilisateur',
        role: 'student',
        nabecoins: 0,
        streak: 0,
        level: 1
      };
    }
  } catch (error) {
    console.error('Erreur loading profile:', error);
  }
}

function showForgotPassword() {
  alert('Récupération de mot de passe - À implémenter');
}

function showTerms() {
  alert('Conditions d\'utilisation - À lire entièrement');
}

// ============================================================
// DASHBOARD FUNCTIONS
// ============================================================
function hideAllPages() {
  const pageIds = [
    'dashboardPage',
    'coursesPage',
    'messagesPage',
    'shopPage',
    'profilePage',
    'gestion-elevesPage',
    'gestion-scolaritesPage',
    'tableau-bord-financesPage',
    'gestion-depensesPage',
    'gestion-notificationsPage',
    'teachersPage'
  ];
  pageIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
}

function setActiveNav(page) {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === page);
  });
}

function showDashboard() {
  hideSplash();
  hideAllPages();
  document.getElementById('authPage').style.display = 'none';
  document.getElementById('dashboardPage').style.display = 'flex';
  document.getElementById('bottomNav').style.display = 'grid';
  setActiveNav('home');
  currentPage = 'dashboard';
  loadDashboardData();
}

async function loadDashboardData() {
  if (!userProfile) return;
  
  // Welcome message
  const firstName = userProfile.fullName?.split(' ')[0] || 'Utilisateur';
  document.getElementById('welcomeName').textContent = firstName + ' 👋';
  
  // Stats
  document.getElementById('statsCoins').textContent = userProfile.nabecoins || 0;
  document.getElementById('statsStreak').textContent = userProfile.streak || 0;
  
  // Quick actions basé sur le rôle
  const quickActions = document.getElementById('quickActions');
  const summary = document.getElementById('dashboardSummary');
  let actions = [];
  let summaryHtml = '';

  if (userProfile.role === 'student' || userProfile.role === 'indepStudent') {
    const label = userProfile.role === 'indepStudent' ? 'Élève Indépendant' : 'Élève';
    actions = [
      { icon: '📚', label: 'Mes cours', page: 'courses' },
      { icon: '✅', label: 'Quiz', page: 'quizzes' },
      { icon: '🎮', label: 'Jeux', page: 'games' },
      { icon: '🤖', label: 'DARX IA', page: 'darx' },
      { icon: '🏆', label: 'Classement', page: 'leaderboard' },
      { icon: '💰', label: 'NabeCoins', page: 'shop' }
    ];

    summaryHtml = `
      <div class="page-card">
        <div class="section-title">${label}</div>
        <div class="page-list-item">
          <strong>Progression</strong>
          <p>${userProfile.streak || 0} jours de suite</p>
        </div>
        <div class="page-list-item">
          <strong>NabeCoins</strong>
          <p>${formatNumber(userProfile.nabecoins || 0)} coins disponibles</p>
        </div>
      </div>
    `;
  } else if (userProfile.role === 'teacher' || userProfile.role === 'indepTeacher') {
    actions = [
      { icon: '📚', label: 'Mes cours', page: 'my-courses' },
      { icon: '✅', label: 'Quiz', page: 'create-quiz' },
      { icon: '📊', label: 'Notes', page: 'grades' },
      { icon: '📈', label: 'Suivi', page: 'progress' },
      { icon: '💰', label: 'Revenus', page: 'earnings' },
      { icon: '👥', label: 'Élèves', page: 'students' }
    ];

    summaryHtml = `
      <div class="page-card">
        <div class="section-title">${userProfile.role === 'indepTeacher' ? 'Prof Indépendant' : 'Professeur'}</div>
        <div class="page-list-item">
          <strong>Élèves actifs</strong>
          <p>${formatNumber(userProfile.studentsCount || 38)} suivis</p>
        </div>
        <div class="page-list-item">
          <strong>Revenue estimée</strong>
          <p>${formatNumber(userProfile.earnings || 320000)} GNF</p>
        </div>
      </div>
    `;
  } else if (userProfile.role === 'parent') {
    actions = [
      { icon: '👨‍👧', label: 'Suivi enfant', page: 'courses' },
      { icon: '📬', label: 'Messages', page: 'messages' },
      { icon: '🗓️', label: 'Emploi du temps', page: 'timetable' },
      { icon: '💳', label: 'Paiements', page: 'shop' },
      { icon: '📊', label: 'Progression', page: 'progress' },
      { icon: '🔔', label: 'Notifications', page: 'messages' }
    ];

    summaryHtml = `
      <div class="page-card">
        <div class="section-title">Parent</div>
        <div class="page-list-item">
          <strong>Enfant suivi</strong>
          <p>${userProfile.childName || 'John Doe'} - ${userProfile.childGrade || '4e'}</p>
        </div>
        <div class="page-list-item">
          <strong>Note moyenne</strong>
          <p>${userProfile.childAverage || '15.8 / 20'}</p>
        </div>
      </div>
    `;
  } else if (userProfile.role === 'school') {
    const metrics = await getSchoolMetrics();
    actions = [
      { icon: '👨‍🎓', label: 'Élèves', page: 'gestion-eleves' },
      { icon: '💳', label: 'Scolarités', page: 'gestion-scolarites' },
      { icon: '📈', label: 'Tableau', page: 'tableau-bord-finances' },
      { icon: '🏷️', label: 'Dépenses', page: 'gestion-depenses' },
      { icon: '🔔', label: 'Notifications', page: 'gestion-notifications' },
      { icon: '👨‍🏫', label: 'Professeurs', page: 'teachers' }
    ];

    summaryHtml = `
      <div class="page-card">
        <div class="section-title">École</div>
        <div class="page-list-item">
          <strong>Élèves</strong>
          <p>${formatNumber(metrics.totalStudents)} inscrits</p>
        </div>
        <div class="page-list-item">
          <strong>Professeurs</strong>
          <p>${formatNumber(metrics.activeTeachers)} actifs</p>
        </div>
        <div class="page-list-item">
          <strong>Classes</strong>
          <p>${formatNumber(metrics.totalClasses)}</p>
        </div>
        <div class="page-list-item">
          <strong>Paiements</strong>
          <p>${formatNumber(metrics.paymentsCollected)} collectés</p>
        </div>
      </div>
    `;
  }
  
  quickActions.innerHTML = actions.map(action => `
    <div class="action-card" onclick="navigateTo('${action.page}')">
      <span class="action-icon">${action.icon}</span>
      <div class="action-title">${action.label}</div>
    </div>
  `).join('');
  
  summary.innerHTML = summaryHtml || `
    <div class="page-card">
      <div class="section-title">Bienvenue</div>
      <div class="page-list-item">Choisissez une action pour commencer.</div>
    </div>
  `;

  // Courses placeholder
  const coursesList = document.getElementById('coursesList');
  coursesList.innerHTML = `
    <div style="background:var(--bg-card);padding:15px;border-radius:10px;border:2px solid var(--border);">
      <div style="font-size:1.5rem;margin-bottom:10px;">📚</div>
      <div style="font-weight:600;margin-bottom:5px;">Aucun cours pour l'instant</div>
      <div style="font-size:0.85rem;color:var(--text-secondary);">Les cours s'afficheront ici</div>
    </div>
  `;
  
  // Stats placeholder
  const statsList = document.getElementById('statsList');
  statsList.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
      <div style="background:var(--bg-card);padding:15px;border-radius:10px;border:2px solid var(--border);">
        <div style="font-size:1.2rem;font-weight:800;color:var(--primary);">—</div>
        <div style="font-size:0.85rem;color:var(--text-secondary);margin-top:8px;">Moyenne</div>
      </div>
      <div style="background:var(--bg-card);padding:15px;border-radius:10px;border:2px solid var(--border);">
        <div style="font-size:1.2rem;font-weight:800;color:var(--success);">—</div>
        <div style="font-size:0.85rem;color:var(--text-secondary);margin-top:8px;">Progression</div>
      </div>
    </div>
  `;
}

function renderCoursesPage() {
  const container = document.getElementById('coursesContent');
  if (!container || !userProfile) return;

  if (userProfile.role === 'student') {
    container.innerHTML = `
      <div class="page-card">
        <div class="section-title">Mes cours du jour</div>
        <div class="page-list">
          <div class="page-list-item">
            <strong>Mathématiques</strong>
            <p>Algèbre, fonctions et exercices interactifs.</p>
            <div class="page-actions">
              <button class="btn btn-primary" onclick="alert('Ouvrir Mathématiques')">Ouvrir</button>
            </div>
          </div>
          <div class="page-list-item">
            <strong>Français</strong>
            <p>Lecture, grammaire et compréhension de texte.</p>
            <div class="page-actions">
              <button class="btn btn-primary" onclick="alert('Ouvrir Français')">Ouvrir</button>
            </div>
          </div>
          <div class="page-list-item">
            <strong>Anglais</strong>
            <p>Vocabulaire, phrases et conversation.</p>
            <div class="page-actions">
              <button class="btn btn-primary" onclick="alert('Ouvrir Anglais')">Ouvrir</button>
            </div>
          </div>
        </div>
      </div>
      <div class="page-card">
        <div class="section-title">Progression</div>
        <div class="page-list-item">
          <strong>Série actuelle</strong>
          <p>${userProfile.streak || 0} jours consécutifs</p>
        </div>
        <div class="page-list-item">
          <strong>NabeCoins</strong>
          <p>${userProfile.nabecoins || 0} coins disponibles</p>
        </div>
      </div>
    `;
  } else if (userProfile.role === 'teacher') {
    container.innerHTML = `
      <div class="page-card">
        <div class="section-title">Cours gérés</div>
        <div class="page-list">
          <div class="page-list-item">
            <strong>Physique - 10e</strong>
            <p>Ajouter une leçon, un quiz ou un devoir.</p>
          </div>
          <div class="page-list-item">
            <strong>Histoire - 9e</strong>
            <p>Suivre les performances des élèves.</p>
          </div>
        </div>
      </div>
      <div class="page-card">
        <button class="btn btn-primary" onclick="alert('Créer un cours')">Publier un nouveau cours</button>
      </div>
    `;
  } else if (userProfile.role === 'indepStudent') {
    container.innerHTML = `
      <div class="page-card">
        <div class="section-title">Mes cours indépendants</div>
        <div class="page-list-item">
          <strong>Programme personnalisé</strong>
          <p>Accède à tes ressources, cours et quiz à ton rythme.</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary" onclick="alert('Ouvrir Mon programme')">Voir mon programme</button>
        </div>
      </div>
      <div class="page-card">
        <div class="section-title">Performance</div>
        <div class="page-list-item">
          <strong>Streak</strong>
          <p>${userProfile.streak || 0} jours consécutifs</p>
        </div>
        <div class="page-list-item">
          <strong>NabeCoins</strong>
          <p>${userProfile.nabecoins || 0} coins</p>
        </div>
      </div>
    `;
  } else if (userProfile.role === 'indepTeacher') {
    container.innerHTML = `
      <div class="page-card">
        <div class="section-title">Espace Prof Indépendant</div>
        <div class="page-list-item">
          <strong>Vos élèves</strong>
          <p>Gestion des classes, des devoirs et des revenus.</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary" onclick="alert('Voir mes élèves')">Voir les élèves</button>
          <button class="btn btn-secondary" onclick="alert('Gérer mes revenus')">Gérer mes revenus</button>
        </div>
      </div>
      <div class="page-card">
        <div class="section-title">Statistiques</div>
        <div class="page-list-item">
          <strong>Élèves actifs</strong>
          <p>${userProfile.studentsCount || 18} élèves</p>
        </div>
        <div class="page-list-item">
          <strong>Revenus</strong>
          <p>${formatNumber(userProfile.earnings || 420000)} GNF</p>
        </div>
      </div>
    `;
  } else if (userProfile.role === 'parent') {
    container.innerHTML = `
      <div class="page-card">
        <div class="section-title">Suivi de votre enfant</div>
        <div class="page-list-item">
          <strong>Élève suivi</strong>
          <p>Nom : ${userProfile.childName || 'John Doe'}</p>
          <p>Niveau : ${userProfile.childGrade || '4e'}</p>
        </div>
      </div>
      <div class="page-card">
        <div class="section-title">Performance récente</div>
        <div class="page-list-item">
          <strong>Note moyenne</strong>
          <p>${userProfile.childAverage || '15,8 / 20'}</p>
        </div>
        <div class="page-list-item">
          <strong>Progrès</strong>
          <p>+${userProfile.childProgress || 12}% ce mois-ci</p>
        </div>
      </div>
    `;
  } else if (userProfile.role === 'school') {
    const metrics = await getSchoolMetrics();
    container.innerHTML = `
      <div class="page-card">
        <div class="section-title">Gestion scolaire</div>
        <div class="page-list-item">
          <strong>Élèves inscrits</strong>
          <p>${formatNumber(metrics.totalStudents)} élèves</p>
        </div>
        <div class="page-list-item">
          <strong>Professeurs actifs</strong>
          <p>${formatNumber(metrics.activeTeachers)} profs</p>
        </div>
        <div class="page-list-item">
          <strong>Paiements collectés</strong>
          <p>${formatNumber(metrics.paymentsCollected)} reçus</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary" onclick="navigateTo('gestion-eleves')">Voir les élèves</button>
          <button class="btn btn-secondary" onclick="navigateTo('gestion-scolarites')">Voir les scolarités</button>
        </div>
      </div>
      <div class="page-card">
        <div class="section-title">Synthèse</div>
        <div class="page-list-item">
          <strong>Classes</strong>
          <p>${formatNumber(metrics.totalClasses)}</p>
        </div>
        <div class="page-list-item">
          <strong>Paiements en attente</strong>
          <p>${formatNumber(metrics.pendingPayments)}</p>
        </div>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div class="empty-state">Aucun contenu de cours disponible pour ce rôle.</div>
    `;
  }
}

function renderMessagesPage() {
  const container = document.getElementById('messagesContent');
  if (!container) return;
  container.innerHTML = `
    <div class="page-card">
      <div class="section-title">Boîte de réception</div>
      <div class="page-list">
        <div class="page-list-item">
          <strong>Admin Neoclass</strong>
          <p>Bienvenue sur Neoclass ! Commencez par consulter votre dashboard.</p>
        </div>
        <div class="page-list-item">
          <strong>Professeur</strong>
          <p>Votre dernier devoir a été évalué.</p>
        </div>
        <div class="page-list-item">
          <strong>Système</strong>
          <p>Nouvelle fonctionnalité disponible dans l'application.</p>
        </div>
      </div>
    </div>
  `;
}

function renderShopPage() {
  const container = document.getElementById('shopContent');
  if (!container || !userProfile) return;
  container.innerHTML = `
    <div class="page-card">
      <div class="section-title">Solde</div>
      <div class="page-list-item">
        <strong>${userProfile.nabecoins || 0} NabeCoins</strong>
        <p>Utilise tes coins pour débloquer des récompenses.</p>
      </div>
    </div>
    <div class="page-card">
      <div class="section-title">Articles disponibles</div>
      <div class="page-list">
        <div class="page-list-item">
          <strong>Pack Révision</strong>
          <p>+10 ressources pédagogiques</p>
          <div class="page-actions">
            <button class="btn btn-primary" onclick="alert('Achat Pack Révision')">Acheter 120 NC</button>
          </div>
        </div>
        <div class="page-list-item">
          <strong>Crédits Révision</strong>
          <p>+1 cours de soutien</p>
          <div class="page-actions">
            <button class="btn btn-primary" onclick="alert('Achat crédits')">Acheter 90 NC</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderProfilePage() {
  const container = document.getElementById('profileContent');
  if (!container || !userProfile) return;

  container.innerHTML = `
    <div class="page-card">
      <div class="section-title">Informations personnelles</div>
      <div class="page-list-item">
        <strong>Nom</strong>
        <p>${userProfile.fullName || 'Utilisateur'}</p>
      </div>
      <div class="page-list-item">
        <strong>Email</strong>
        <p>${userProfile.email || 'Non renseigné'}</p>
      </div>
      <div class="page-list-item">
        <strong>Rôle</strong>
        <p>${userProfile.role}</p>
      </div>
      <div class="page-list-item">
        <strong>Niveau</strong>
        <p>${userProfile.level || 'N/A'}</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary" onclick="toggleTheme()">Changer de thème</button>
        <button class="btn btn-secondary" onclick="handleLogout()">Déconnexion</button>
      </div>
    </div>
  `;
}

function renderPlaceholderPage(title, subtitle) {
  const titleEl = document.getElementById('placeholderTitle');
  const subtitleEl = document.getElementById('placeholderSubtitle');
  const contentEl = document.getElementById('placeholderContent');

  if (!titleEl || !subtitleEl || !contentEl) return;

  titleEl.textContent = title;
  subtitleEl.textContent = subtitle || 'Bientôt disponible.';
  contentEl.innerHTML = `
    <div class="page-card">
      <div class="section-title">${title}</div>
      <p>${subtitle || 'Page en construction. Revenez bientôt pour plus de fonctionnalités.'}</p>
      <div class="page-actions">
        <button class="btn btn-secondary" onclick="showDashboard()">Retour à l'accueil</button>
      </div>
    </div>
  `;
}

function renderGestionEleves() {
  const container = document.getElementById('gestionElevesContent');
  if (!container) return;
  container.innerHTML = `
    <div class="page-card">
      <div class="section-title">Liste des élèves</div>
      <table class="table-small">
        <thead>
          <tr><th>Nom</th><th>Classe</th><th>Statut</th></tr>
        </thead>
        <tbody>
          <tr><td>Fatou Camara</td><td>3e</td><td><span class="badge">Actif</span></td></tr>
          <tr><td>Ali Keita</td><td>4e</td><td><span class="badge">Actif</span></td></tr>
          <tr><td>Mariam Diallo</td><td>5e</td><td><span class="badge">Actif</span></td></tr>
        </tbody>
      </table>
      <div class="page-actions">
        <button class="btn btn-primary" onclick="alert('Inscrire un élève')">Inscrire un élève</button>
      </div>
    </div>
  `;
}

function renderGestionScolarites() {
  const container = document.getElementById('gestionScolaritesContent');
  if (!container) return;
  container.innerHTML = `
    <div class="page-card">
      <div class="section-title">Paiements scolaires</div>
      <div class="page-list-item">
        <strong>Frais annuels</strong>
        <p>50 000 GNF</p>
      </div>
      <div class="page-list-item">
        <strong>Élèves payants</strong>
        <p>78% ont réglé la première tranche</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary" onclick="alert('Voir détails des paiements')">Voir les détails</button>
      </div>
    </div>
  `;
}

function renderTableauBordFinances() {
  const container = document.getElementById('tableauFinancesContent');
  if (!container) return;
  container.innerHTML = `
    <div class="page-card">
      <div class="section-title">Vue financière</div>
      <div class="page-list-item">
        <strong>Revenus</strong>
        <p>12 400 000 GNF</p>
      </div>
      <div class="page-list-item">
        <strong>Dépenses</strong>
        <p>4 800 000 GNF</p>
      </div>
      <div class="page-list-item">
        <strong>Bénéfice net</strong>
        <p>7 600 000 GNF</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary" onclick="alert('Exporter rapport financier')">Exporter rapport</button>
      </div>
    </div>
  `;
}

function renderGestionDepenses() {
  const container = document.getElementById('gestionDepensesContent');
  if (!container) return;
  container.innerHTML = `
    <div class="page-card">
      <div class="section-title">Dépenses récentes</div>
      <table class="table-small">
        <thead>
          <tr><th>Catégorie</th><th>Montant</th></tr>
        </thead>
        <tbody>
          <tr><td>Fournitures</td><td>1 200 000 GNF</td></tr>
          <tr><td>Salaires</td><td>2 500 000 GNF</td></tr>
          <tr><td>Maintenance</td><td>450 000 GNF</td></tr>
        </tbody>
      </table>
    </div>
  `;
}

function renderGestionNotifications() {
  const container = document.getElementById('gestionNotificationsContent');
  if (!container) return;
  container.innerHTML = `
    <div class="page-card">
      <div class="section-title">Annonces</div>
      <div class="page-list-item">
        <strong>Réunion parents-professeurs</strong>
        <p>Le 12 juin à 17h dans la salle polyvalente.</p>
      </div>
      <div class="page-list-item">
        <strong>Paiement des frais</strong>
        <p>Rappel : fin de la 2ème tranche le 30 juin.</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary" onclick="alert('Publier une annonce')">Publier une annonce</button>
      </div>
    </div>
  `;
}

function renderTeachersPage() {
  const container = document.getElementById('teachersContent');
  if (!container) return;
  container.innerHTML = `
    <div class="page-card">
      <div class="section-title">Professeurs</div>
      <table class="table-small">
        <thead>
          <tr><th>Nom</th><th>Matière</th></tr>
        </thead>
        <tbody>
          <tr><td>Fatoumata Bah</td><td>Mathématiques</td></tr>
          <tr><td>Abdoulaye Souaré</td><td>Physique</td></tr>
          <tr><td>Adama Camara</td><td>Français</td></tr>
        </tbody>
      </table>
      <div class="page-actions">
        <button class="btn btn-primary" onclick="alert('Ajouter un professeur')">Ajouter un professeur</button>
      </div>
    </div>
  `;
}

// ============================================================
// NAVIGATION
// ============================================================
function navigateTo(page) {
  console.log('Navigating to:', page);

  if (page === 'home') {
    showDashboard();
    return;
  }

  const schoolPages = ['gestion-eleves', 'gestion-scolarites', 'tableau-bord-finances', 'gestion-depenses', 'gestion-notifications', 'teachers'];
  if (schoolPages.includes(page) && userProfile?.role !== 'school') {
    alert('Accès réservé aux directeurs d’école.');
    return;
  }

  hideSplash();
  hideAllPages();
  document.getElementById('authPage').style.display = 'none';
  document.getElementById('bottomNav').style.display = 'grid';
  setActiveNav(page);

  const pageEl = document.getElementById(page + 'Page');
  if (pageEl) {
    pageEl.style.display = 'flex';
  } else if (['quizzes', 'games', 'darx', 'leaderboard', 'my-courses', 'create-quiz', 'grades', 'progress', 'earnings', 'students', 'timetable'].includes(page)) {
    document.getElementById('placeholderPage').style.display = 'flex';
  }

  currentPage = page;

  switch (page) {
    case 'courses':
      renderCoursesPage();
      break;
    case 'messages':
      renderMessagesPage();
      break;
    case 'shop':
      renderShopPage();
      break;
    case 'profile':
      renderProfilePage();
      break;
    case 'quizzes':
      renderPlaceholderPage('Quiz', 'Prépare-toi avec des exercices interactifs.');
      break;
    case 'games':
      renderPlaceholderPage('Jeux', 'Apprends avec des jeux éducatifs amusants.');
      break;
    case 'darx':
      renderPlaceholderPage('DARX IA', 'Ton assistant IA personnel pour révisions.');
      break;
    case 'leaderboard':
      renderPlaceholderPage('Classement', 'Voir les meilleurs élèves de ta classe.');
      break;
    case 'my-courses':
      renderPlaceholderPage('Mes cours', 'Accède à tous tes cours et ressources.');
      break;
    case 'create-quiz':
      renderPlaceholderPage('Créer un quiz', 'Crée des évaluations rapides pour tes élèves.');
      break;
    case 'grades':
      renderPlaceholderPage('Notes', 'Consulte et partage les résultats de tes élèves.');
      break;
    case 'progress':
      renderPlaceholderPage('Suivi', 'Visualise les progrès de la classe ou de ton enfant.');
      break;
    case 'earnings':
      renderPlaceholderPage('Revenus', 'Suivi des gains et paiements.');
      break;
    case 'students':
      renderPlaceholderPage('Élèves', 'Gère les élèves et leurs parcours.');
      break;
    case 'timetable':
      renderPlaceholderPage('Emploi du temps', 'Visualise le planning et les séances.');
      break;
    case 'gestion-eleves':
      renderGestionEleves();
      break;
    case 'gestion-scolarites':
      renderGestionScolarites();
      break;
    case 'tableau-bord-finances':
      renderTableauBordFinances();
      break;
    case 'gestion-depenses':
      renderGestionDepenses();
      break;
    case 'gestion-notifications':
      renderGestionNotifications();
      break;
    case 'teachers':
      renderTeachersPage();
      break;
    default:
      showDashboard();
      break;
  }
}

function handleBackButton() {
  if (currentPage === 'dashboard') {
    // Confirmer avant de quitter
    if (confirm('Quitter l\'application ?')) {
      navigator.app.exitApp();
    }
  } else if (currentPage === 'auth') {
    navigator.app.exitApp();
  }
}

// ============================================================
// LOGOUT
// ============================================================
async function handleLogout() {
  try {
    await auth.signOut();
    currentUser = null;
    userProfile = null;
    showAuthPage();
  } catch (error) {
    console.error('Erreur logout:', error);
  }
}

// ============================================================
// THEME TOGGLE
// ============================================================
function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const newTheme = isDark ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  if (newTheme === 'dark') {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
  
  localStorage.setItem('neoclass-theme', newTheme);
}

// ============================================================
// UTILS
// ============================================================
function showMessage(type, message) {
  const div = type === 'error' ? 
    document.getElementById('loginError') : 
    document.getElementById('loginSuccess');
  
  if (div) {
    div.textContent = message;
    div.classList.add('show');
    setTimeout(() => div.classList.remove('show'), 5000);
  }
}
