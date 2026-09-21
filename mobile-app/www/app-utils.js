// ============================================================
// CORDOVA SETUP
// ============================================================

function setupCordova() {
  if (typeof cordova !== 'undefined') {
    document.addEventListener('deviceready', onDeviceReady, false);
    document.addEventListener('backbutton', handleBackButton, false);
    document.addEventListener('pause', onPause, false);
    document.addEventListener('resume', onResume, false);
  }
}

function onDeviceReady() {
  console.log('✅ Cordova ready');
  enableOfflineMode();
  
  if (typeof StatusBar !== 'undefined') {
    StatusBar.styleDefault();
  }
  
  if (typeof SplashScreen !== 'undefined') {
    SplashScreen.hide();
  }
}

function handleBackButton() {
  const cinematicOpening = document.getElementById('cinematicOpening');
  const authPage = document.getElementById('authPage');
  
  if (!cinematicOpening.classList.contains('hidden')) {
    cinematicOpening.classList.add('hidden');
    showDashboard();
  } else if (authPage.classList.contains('active')) {
    if (signupStep > 0) {
      signupStep--;
      if (signupStep > 0) showSystemSelection();
      else showAuthPage();
    }
  }
}

function onPause() {
  console.log('📱 App paused');
}

function onResume() {
  console.log('📱 App resumed');
}

// ============================================================
// EXPORT ALL FUNCTIONS GLOBALLY
// ============================================================

// Dashboard
window.renderCoursesPage = renderCoursesPage;
window.renderQuizzesPage = renderQuizzesPage;
window.renderGamesPage = renderGamesPage;
window.renderFinancePage = renderFinancePage;
window.renderSocialPage = renderSocialPage;
window.renderAdminPanel = renderAdminPanel;
window.renderSettingsPage = renderSettingsPage;
window.showDashboard = showDashboard;
window.goBack = goBack;
window.navigate = navigate;
window.showPage = showPage;
window.openSettings = openSettings;

// Courses
window.showCourseDetail = showCourseDetail;
window.handleEnrollCourse = handleEnrollCourse;
window.loadCoursesContent = loadCoursesContent;

// Finance
window.handleWithdrawal = handleWithdrawal;
window.selectSubscription = selectSubscription;
window.startQuiz = startQuiz;
window.startGame = startGame;

// Social
window.switchSocialTab = switchSocialTab;
window.openChat = openChat;
window.sendChatMessage = sendChatMessage;

// Admin
window.showAdminSection = showAdminSection;
window.confirmBanUser = confirmBanUser;
window.approveWithdrawal = approveWithdrawal;
window.rejectWithdrawal = rejectWithdrawal;
window.setTheme = setTheme;
window.setLanguage = setLanguage;
window.showChangePassword = showChangePassword;

// Auth
window.selectRole = selectRole;
window.selectSystem = selectSystem;
window.showSignupForm = showSignupForm;
window.handleSignup = handleSignup;
window.showLoginForm = showLoginForm;
window.handleLogin = handleLogin;

// Utilities
window.showToast = showToast;
window.t = t;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;

console.log('✅ App initialized successfully');
