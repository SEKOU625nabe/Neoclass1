// ============================================================
// DASHBOARD MODULE
// ============================================================

async function showDashboard() {
  const authPage = document.getElementById('authPage');
  const dashboardPage = document.getElementById('dashboardPage');
  const dashboardContent = document.getElementById('dashboardContent');
  
  authPage.classList.remove('active');
  dashboardPage.classList.add('active');
  
  // Load dashboard data
  dashboardContent.innerHTML = `
    <div class="loader">
      <div class="spinner"></div>
      <p>${t('loading')}</p>
    </div>
  `;
  
  try {
    const dashboard = await renderDashboard();
    dashboardContent.innerHTML = dashboard;
    setupDashboardEventListeners();
  } catch (error) {
    console.error('Dashboard error:', error);
    dashboardContent.innerHTML = `
      <div class="card" style="margin: 20px;">
        <h3>${t('error')}</h3>
        <p>${error.message}</p>
      </div>
    `;
  }
}

async function renderDashboard() {
  const greeting = getGreeting();
  const courses = await getUserCourses();
  
  return `
    <div class="dashboard-container">
      <!-- NAVBAR -->
      <div class="navbar">
        <div>
          <h1 style="font-size: 1.2rem;">${greeting} 👋</h1>
          <p style="font-size: 0.85rem; color: var(--text-secondary);">${State.profile.fullName || 'Utilisateur'}</p>
        </div>
        <button class="btn btn-secondary" style="padding: 8px 16px; font-size: 0.9rem;" onclick="openSettings()">
          ⚙️ ${t('settings')}
        </button>
      </div>

      <!-- MAIN CONTENT -->
      <div class="container" style="padding: 15px; overflow-y: auto;">
        
        <!-- STATS CARDS -->
        <div class="stats-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px;">
          <div class="stat-card" style="padding: 20px; background: linear-gradient(135deg, #6c63ff, #8b83ff); border-radius: 15px; color: white;">
            <div style="font-size: 2rem; margin-bottom: 10px;">💰</div>
            <p style="font-size: 0.9rem; opacity: 0.9;">${t('nabecoins')}</p>
            <h3 style="font-size: 1.8rem; font-weight: 800; margin: 5px 0;">
              ${State.profile.nabecoins || 0}
            </h3>
          </div>

          <div class="stat-card" style="padding: 20px; background: linear-gradient(135deg, #f59e0b, #fbbf24); border-radius: 15px; color: white;">
            <div style="font-size: 2rem; margin-bottom: 10px;">🔥</div>
            <p style="font-size: 0.9rem; opacity: 0.9;">Série</p>
            <h3 style="font-size: 1.8rem; font-weight: 800; margin: 5px 0;">
              ${State.profile.streak || 0}
            </h3>
          </div>
        </div>

        <!-- QUICK ACTIONS -->
        <div style="margin-bottom: 25px;">
          <h3 style="margin-bottom: 15px; font-weight: 700;">Actions rapides</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <button class="action-btn" onclick="showPage('courses')" style="padding: 15px; border-radius: 12px; background: var(--bg-card); border: 1px solid var(--border);">
              <span style="font-size: 1.5rem; display: block; margin-bottom: 8px;">📚</span>
              <span>${t('myCourses')}</span>
            </button>
            <button class="action-btn" onclick="showPage('quizzes')" style="padding: 15px; border-radius: 12px; background: var(--bg-card); border: 1px solid var(--border);">
              <span style="font-size: 1.5rem; display: block; margin-bottom: 8px;">✅</span>
              <span>${t('quizzes')}</span>
            </button>
            <button class="action-btn" onclick="showPage('games')" style="padding: 15px; border-radius: 12px; background: var(--bg-card); border: 1px solid var(--border);">
              <span style="font-size: 1.5rem; display: block; margin-bottom: 8px;">🎮</span>
              <span>${t('games')}</span>
            </button>
            <button class="action-btn" onclick="showPage('finance')" style="padding: 15px; border-radius: 12px; background: var(--bg-card); border: 1px solid var(--border);">
              <span style="font-size: 1.5rem; display: block; margin-bottom: 8px;">💸</span>
              <span>${t('withdrawal')}</span>
            </button>
            <button class="action-btn" onclick="showPage('aichat')" style="padding: 15px; border-radius: 12px; background: linear-gradient(135deg, #8b5cf6, #7c3aed); border: none; color: white; font-weight: 600;">
              <span style="font-size: 1.5rem; display: block; margin-bottom: 8px;">💬</span>
              <span>Assistant IA</span>
            </button>
            <button class="action-btn" onclick="showPage('tutor')" style="padding: 15px; border-radius: 12px; background: linear-gradient(135deg, #ec4899, #db2777); border: none; color: white; font-weight: 600;">
              <span style="font-size: 1.5rem; display: block; margin-bottom: 8px;">🎓</span>
              <span>Tuteur IA</span>
            </button>
          </div>
        </div>

        <!-- MY COURSES -->
        ${courses.length > 0 ? `
          <div style="margin-bottom: 25px;">
            <h3 style="margin-bottom: 15px; font-weight: 700;">📚 ${t('myCourses')}</h3>
            <div style="display: grid; gap: 12px;">
              ${courses.slice(0, 3).map(course => `
                <div class="card" style="cursor: pointer;" onclick="showCourseDetail('${course.id}')">
                  <div style="display: flex; justify-content: space-between; align-items: start; gap: 10px;">
                    <div style="flex: 1;">
                      <h4 style="margin-bottom: 5px;">${course.title || 'Cours'}</h4>
                      <p style="font-size: 0.85rem; color: var(--text-secondary);">${course.progress || 0}% complété</p>
                    </div>
                    <span style="font-size: 1.5rem;">${course.icon || '📖'}</span>
                  </div>
                  <div style="margin-top: 10px; background: var(--bg-hover); height: 6px; border-radius: 3px; overflow: hidden;">
                    <div style="background: var(--primary); height: 100%; width: ${course.progress || 0}%;"></div>
                  </div>
                </div>
              `).join('')}
            </div>
            <button class="btn btn-secondary" style="width: 100%; margin-top: 15px;" onclick="showPage('courses')">
              Voir tous les cours →
            </button>
          </div>
        ` : `
          <div class="card" style="text-align: center; padding: 30px; background: var(--bg-hover);">
            <p style="color: var(--text-secondary);">Pas encore de cours. Commence à apprendre!</p>
            <button class="btn btn-primary" style="margin-top: 15px;" onclick="showPage('courses')">
              Découvrir les cours
            </button>
          </div>
        `}

        <!-- BADGES -->
        <div style="margin-bottom: 25px;">
          <h3 style="margin-bottom: 15px; font-weight: 700;">🏆 Badges</h3>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
            ${BADGES.slice(0, 4).map(badge => `
              <div style="
                text-align: center;
                padding: 15px;
                background: var(--bg-card);
                border-radius: 12px;
                border: 1px solid var(--border);
                cursor: help;
              " title="${badge.desc}">
                <div style="font-size: 1.8rem; margin-bottom: 8px;">${badge.icon}</div>
                <p style="font-size: 0.75rem; color: var(--text-secondary);">${badge.name}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- BOTTOM SPACING -->
        <div style="height: 30px;"></div>
      </div>
    </div>
  `;
}

function setupDashboardEventListeners() {
  // Setup any event listeners needed
}

function openSettings() {
  showPage('settings');
}

async function showPage(page) {
  const dashboardContent = document.getElementById('dashboardContent');
  
  switch(page) {
    case 'courses':
      dashboardContent.innerHTML = await renderCoursesPage();
      break;
    case 'quizzes':
      dashboardContent.innerHTML = await renderQuizzesPage();
      break;
    case 'games':
      dashboardContent.innerHTML = renderGamesPage();
      break;
    case 'finance':
      dashboardContent.innerHTML = await renderFinancePage();
      break;
    case 'settings':
      dashboardContent.innerHTML = renderSettingsPage();
      break;
    case 'social':
      dashboardContent.innerHTML = await renderSocialPage();
      break;
    case 'aichat':
      await renderAIChatPage();
      break;
    case 'tutor':
      await renderTutorPage();
      break;
    default:
      showDashboard();
  }
}

function goBack() {
  showDashboard();
}

// ============================================================
// NAVIGATION
// ============================================================
function navigate(page) {
  showPage(page);
}
