// ============================================================
// ADMIN MODULE
// ============================================================

async function renderAdminPanel() {
  if (State.profile.role !== 'admin' && State.profile.role !== 'school') {
    showToast('Accès refusé', 'error');
    return '';
  }
  
  return `
    <div class="dashboard-container">
      <div class="navbar">
        <button class="btn btn-secondary" style="padding: 8px 16px; font-size: 0.9rem;" onclick="goBack()">
          ← ${t('back')}
        </button>
        <h1 style="font-size: 1.2rem;">🔧 Admin Panel</h1>
      </div>

      <div class="container" style="padding: 15px; overflow-y: auto;">
        <div style="display: grid; gap: 12px;">
          <div class="card" style="cursor: pointer;" onclick="showAdminSection('users')">
            <div style="display: flex; align-items: center; gap: 15px;">
              <div style="font-size: 2rem;">👥</div>
              <div style="flex: 1;">
                <h4>Gestion des utilisateurs</h4>
                <p style="font-size: 0.85rem; color: var(--text-secondary);">Voir, modifier, bannir les utilisateurs</p>
              </div>
              <span>→</span>
            </div>
          </div>

          <div class="card" style="cursor: pointer;" onclick="showAdminSection('finances')">
            <div style="display: flex; align-items: center; gap: 15px;">
              <div style="font-size: 2rem;">💰</div>
              <div style="flex: 1;">
                <h4>Finances & Retraits</h4>
                <p style="font-size: 0.85rem; color: var(--text-secondary);">Gérer les demandes de retrait</p>
              </div>
              <span>→</span>
            </div>
          </div>

          <div class="card" style="cursor: pointer;" onclick="showAdminSection('analytics')">
            <div style="display: flex; align-items: center; gap: 15px;">
              <div style="font-size: 2rem;">📊</div>
              <div style="flex: 1;">
                <h4>Analytique</h4>
                <p style="font-size: 0.85rem; color: var(--text-secondary);">Statistiques et rapports</p>
              </div>
              <span>→</span>
            </div>
          </div>

          <div class="card" style="cursor: pointer;" onclick="showAdminSection('content')">
            <div style="display: flex; align-items: center; gap: 15px;">
              <div style="font-size: 2rem;">📚</div>
              <div style="flex: 1;">
                <h4>Contenu</h4>
                <p style="font-size: 0.85rem; color: var(--text-secondary);">Gérer les cours et ressources</p>
              </div>
              <span>→</span>
            </div>
          </div>
        </div>

        <div style="height: 30px;"></div>
      </div>
    </div>
  `;
}

async function showAdminSection(section) {
  const dashboardContent = document.getElementById('dashboardContent');
  
  switch(section) {
    case 'users':
      const users = await getAllUsers();
      dashboardContent.innerHTML = `
        <div class="dashboard-container">
          <div class="navbar">
            <button class="btn btn-secondary" style="padding: 8px 16px; font-size: 0.9rem;" onclick="navigate('admin')">
              ← Admin
            </button>
            <h1 style="font-size: 1.2rem;">👥 Utilisateurs</h1>
          </div>

          <div class="container" style="padding: 15px; overflow-y: auto;">
            <div style="display: grid; gap: 10px;">
              ${users.slice(0, 10).map(user => `
                <div class="card" style="display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <h4 style="margin-bottom: 4px; font-weight: 700;">${user.fullName || user.email}</h4>
                    <p style="font-size: 0.85rem; color: var(--text-secondary);">
                      ${user.role} ${user.isBanned ? '(Banni)' : ''}
                    </p>
                  </div>
                  <button class="btn btn-secondary" style="padding: 8px 12px; font-size: 0.85rem;" 
                    onclick="confirmBanUser('${user.uid}', '${user.email}')">
                    ${user.isBanned ? 'Débannir' : 'Bannir'}
                  </button>
                </div>
              `).join('')}
            </div>
            <div style="height: 30px;"></div>
          </div>
        </div>
      `;
      break;
      
    case 'finances':
      dashboardContent.innerHTML = `
        <div class="dashboard-container">
          <div class="navbar">
            <button class="btn btn-secondary" style="padding: 8px 16px; font-size: 0.9rem;" onclick="navigate('admin')">
              ← Admin
            </button>
            <h1 style="font-size: 1.2rem;">💰 Finances</h1>
          </div>

          <div class="container" style="padding: 15px; overflow-y: auto;">
            <div style="display: grid; gap: 12px;">
              <div class="card" style="background: linear-gradient(135deg, #6c63ff, #8b83ff); color: white; padding: 20px;">
                <p style="font-size: 0.9rem; opacity: 0.9;">Retraits en attente</p>
                <h3 style="font-size: 1.8rem; font-weight: 900; margin: 0;">12</h3>
              </div>

              ${[
                { user: 'Jean D.', amount: 50000, method: 'Orange Money', status: 'pending' },
                { user: 'Marie B.', amount: 100000, method: 'MTN Money', status: 'pending' },
                { user: 'Sophie L.', amount: 25000, method: 'Bank', status: 'approved' },
              ].map(withdrawal => `
                <div class="card">
                  <div style="display: flex; justify-content: space-between; align-items: start; gap: 10px;">
                    <div>
                      <h4 style="margin-bottom: 4px; font-weight: 700;">${withdrawal.user}</h4>
                      <p style="font-size: 0.85rem; color: var(--text-secondary);">
                        ${formatCurrency(withdrawal.amount, 'GNF')} via ${withdrawal.method}
                      </p>
                    </div>
                    <span style="
                      padding: 4px 12px;
                      border-radius: 20px;
                      font-size: 0.8rem;
                      font-weight: 600;
                      background: ${withdrawal.status === 'pending' ? '#fbbf24' : '#10b981'};
                      color: ${withdrawal.status === 'pending' ? '#000' : '#fff'};
                    ">
                      ${withdrawal.status === 'pending' ? 'En attente' : 'Approuvé'}
                    </span>
                  </div>
                  ${withdrawal.status === 'pending' ? `
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 12px;">
                      <button class="btn btn-primary" style="padding: 8px; font-size: 0.85rem;" onclick="approveWithdrawal('${withdrawal.user}')">
                        ✓ Approuver
                      </button>
                      <button class="btn btn-secondary" style="padding: 8px; font-size: 0.85rem;" onclick="rejectWithdrawal('${withdrawal.user}')">
                        ✗ Rejeter
                      </button>
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
            <div style="height: 30px;"></div>
          </div>
        </div>
      `;
      break;

    default:
      navigate('admin');
  }
}

function confirmBanUser(uid, email) {
  if (confirm(`Êtes-vous sûr de vouloir bannir ${email}?`)) {
    banUser(uid, 'Administrateur');
    showToast('Utilisateur banni', 'success');
  }
}

function approveWithdrawal(user) {
  showToast(`Retrait de ${user} approuvé`, 'success');
}

function rejectWithdrawal(user) {
  showToast(`Retrait de ${user} rejeté`, 'error');
}

// ============================================================
// SETTINGS PAGE
// ============================================================

function renderSettingsPage() {
  return `
    <div class="dashboard-container">
      <div class="navbar">
        <button class="btn btn-secondary" style="padding: 8px 16px; font-size: 0.9rem;" onclick="goBack()">
          ← ${t('back')}
        </button>
        <h1 style="font-size: 1.2rem;">⚙️ ${t('settings')}</h1>
      </div>

      <div class="container" style="padding: 15px; overflow-y: auto;">
        <!-- THEME -->
        <div style="margin-bottom: 20px;">
          <h3 style="margin-bottom: 15px; font-weight: 700;">🎨 Thème</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <button class="theme-btn" onclick="setTheme('light')" style="
              padding: 15px;
              border-radius: 12px;
              background: ${State.theme === 'light' ? 'var(--primary)' : 'var(--bg-hover)'};
              color: ${State.theme === 'light' ? 'white' : 'var(--text)'};
              border: none;
              cursor: pointer;
              font-weight: 600;
            ">
              ☀️ Clair
            </button>
            <button class="theme-btn" onclick="setTheme('dark')" style="
              padding: 15px;
              border-radius: 12px;
              background: ${State.theme === 'dark' ? 'var(--primary)' : 'var(--bg-hover)'};
              color: ${State.theme === 'dark' ? 'white' : 'var(--text)'};
              border: none;
              cursor: pointer;
              font-weight: 600;
            ">
              🌙 Sombre
            </button>
          </div>
        </div>

        <!-- LANGUAGE -->
        <div style="margin-bottom: 20px;">
          <h3 style="margin-bottom: 15px; font-weight: 700;">🌐 Langue</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <button onclick="setLanguage('fr')" style="
              padding: 15px;
              border-radius: 12px;
              background: ${State.lang === 'fr' ? 'var(--primary)' : 'var(--bg-hover)'};
              color: ${State.lang === 'fr' ? 'white' : 'var(--text)'};
              border: none;
              cursor: pointer;
              font-weight: 600;
            ">
              🇫🇷 Français
            </button>
            <button onclick="setLanguage('en')" style="
              padding: 15px;
              border-radius: 12px;
              background: ${State.lang === 'en' ? 'var(--primary)' : 'var(--bg-hover)'};
              color: ${State.lang === 'en' ? 'white' : 'var(--text)'};
              border: none;
              cursor: pointer;
              font-weight: 600;
            ">
              🇬🇧 English
            </button>
          </div>
        </div>

        <!-- ACCOUNT -->
        <div style="margin-bottom: 20px;">
          <h3 style="margin-bottom: 15px; font-weight: 700;">🔐 Compte</h3>
          <button class="btn btn-secondary" style="width: 100%; margin-bottom: 10px;" onclick="showChangePassword()">
            Changer le mot de passe
          </button>
          <button class="btn btn-danger" style="width: 100%; background: #ef4444; color: white;" onclick="handleLogout()">
            ${t('logout')}
          </button>
        </div>

        <div style="height: 30px;"></div>
      </div>
    </div>
  `;
}

function setTheme(theme) {
  State.theme = theme;
  localStorage.setItem('neo_theme', theme);
  document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
  renderSettingsPage();
}

function setLanguage(lang) {
  State.lang = lang;
  localStorage.setItem('neo_lang', lang);
  renderSettingsPage();
}

async function handleLogout() {
  if (confirm('Êtes-vous sûr de vouloir vous déconnecter?')) {
    await logout();
    location.reload();
  }
}

function showChangePassword() {
  showToast('Fonctionnalité à venir', 'info');
}
