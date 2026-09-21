// ============================================================
// AUTH MODULE
// ============================================================

let signupStep = 0;
let signupData = {};

function showAuthPage() {
  const authPage = document.getElementById('authPage');
  const authContent = document.getElementById('authContent');
  
  authPage.classList.add('active');
  
  // Show role selection if first time
  if (!signupStep) {
    authContent.innerHTML = `
      <div class="auth-container">
        <h2 style="font-size: 1.5rem; margin-bottom: 20px;">Qui es-tu?</h2>
        <div class="profile-options">
          ${['student', 'teacher', 'school', 'parent'].map(role => `
            <button class="profile-btn" onclick="selectRole('${role}')">
              <span style="font-size: 2rem; margin-bottom: 10px;">
                ${role === 'student' ? '👨‍🎓' : 
                  role === 'teacher' ? '👨‍🏫' : 
                  role === 'school' ? '🏫' : '👨‍👩‍👧'}
              </span>
              <span>${t(role)}</span>
            </button>
          `).join('')}
        </div>
        <p style="margin-top: 20px; color: var(--text-secondary);">
          Déjà un compte? <a href="#" onclick="showLoginForm()" style="color: var(--primary);">Se connecter</a>
        </p>
      </div>
    `;
    
    // Add CSS for profile buttons
    if (!document.getElementById('auth-styles')) {
      const style = document.createElement('style');
      style.id = 'auth-styles';
      style.textContent = `
        .auth-container { padding: 20px 0; }
        .profile-options {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 20px;
        }
        .profile-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: var(--bg-card);
          border: 2px solid var(--border);
          border-radius: 15px;
          cursor: pointer;
          transition: all var(--transition);
          font-weight: 600;
          color: var(--text);
        }
        .profile-btn:active {
          border-color: var(--primary);
          background: var(--bg-hover);
          transform: scale(0.98);
        }
      `;
      document.head.appendChild(style);
    }
  }
}

function selectRole(role) {
  signupData.role = role;
  signupStep = 1;
  showSystemSelection();
}

function showSystemSelection() {
  const authContent = document.getElementById('authContent');
  
  authContent.innerHTML = `
    <div class="auth-container">
      <p style="text-align: center; color: var(--text-secondary); margin-bottom: 20px;">
        Étape 1/4
      </p>
      <h2 style="font-size: 1.3rem; margin-bottom: 20px;">${t('chooseSystem')}</h2>
      <div style="display: grid; gap: 15px;">
        ${['guinea', 'france'].map(system => `
          <button class="system-btn" onclick="selectSystem('${system}')">
            <div style="text-align: left;">
              <strong>${system === 'guinea' ? '🇬🇳 Guinée' : '🇫🇷 France'}</strong>
              <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 5px;">
                ${system === 'guinea' ? 'Système éducatif guinéen' : 'Système éducatif français'}
              </p>
            </div>
          </button>
        `).join('')}
      </div>
      <button class="btn btn-secondary" onclick="signupStep--; showAuthPage();" style="width: 100%; margin-top: 20px;">
        ← ${t('back')}
      </button>
    </div>
  `;
  
  // Add CSS
  if (!document.getElementById('system-styles')) {
    const style = document.createElement('style');
    style.id = 'system-styles';
    style.textContent = `
      .system-btn {
        padding: 20px;
        background: var(--bg-card);
        border: 2px solid var(--border);
        border-radius: 15px;
        cursor: pointer;
        transition: all var(--transition);
        text-align: left;
        color: var(--text);
        font-size: 1rem;
        font-weight: 600;
      }
      .system-btn:active {
        border-color: var(--primary);
        background: var(--bg-hover);
      }
    `;
    document.head.appendChild(style);
  }
}

function selectSystem(system) {
  signupData.system = system;
  signupStep = 2;
  showSignupForm();
}

function showSignupForm() {
  const authContent = document.getElementById('authContent');
  
  authContent.innerHTML = `
    <div class="auth-container">
      <p style="text-align: center; color: var(--text-secondary); margin-bottom: 20px;">
        Étape 2/4
      </p>
      <form onsubmit="handleSignup(event)">
        <div class="form-group">
          <label class="form-label">${t('fullName')}</label>
          <input type="text" class="form-input" id="fullName" placeholder="Jean Dupont" required />
        </div>
        <div class="form-group">
          <label class="form-label">${t('email')}</label>
          <input type="email" class="form-input" id="signupEmail" placeholder="email@example.com" required />
        </div>
        <div class="form-group">
          <label class="form-label">${t('password')}</label>
          <input type="password" class="form-input" id="signupPassword" placeholder="••••••" required />
        </div>
        <div class="form-group">
          <label class="form-label">${t('confirmPassword')}</label>
          <input type="password" class="form-input" id="confirmPassword" placeholder="••••••" required />
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%; margin-bottom: 10px;">
          ${t('signup')}
        </button>
        <button type="button" class="btn btn-secondary" style="width: 100%;" onclick="showLoginForm()">
          ${t('login')}
        </button>
      </form>
    </div>
  `;
}

async function handleSignup(e) {
  e.preventDefault();
  
  const fullName = document.getElementById('fullName').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  
  if (password !== confirmPassword) {
    showToast('Les mots de passe ne correspondent pas', 'error');
    return;
  }
  
  try {
    const authContent = document.getElementById('authContent');
    authContent.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 40px 20px;">
        <div class="spinner"></div>
        <p>${t('loading')}</p>
      </div>
    `;
    
    await signUp(email, password, fullName, signupData.role, signupData.system);
    
    // Reset signup
    signupStep = 0;
    signupData = {};
  } catch (error) {
    console.error('Signup error:', error);
  }
}

function showLoginForm() {
  const authContent = document.getElementById('authContent');
  
  authContent.innerHTML = `
    <div class="auth-container">
      <h2 style="font-size: 1.3rem; margin-bottom: 20px;">${t('login')}</h2>
      <form onsubmit="handleLogin(event)">
        <div class="form-group">
          <label class="form-label">${t('email')}</label>
          <input type="email" class="form-input" id="loginEmail" placeholder="email@example.com" required />
        </div>
        <div class="form-group">
          <label class="form-label">${t('password')}</label>
          <input type="password" class="form-input" id="loginPassword" placeholder="••••••" required />
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%; margin-bottom: 10px;">
          ${t('login')}
        </button>
        <button type="button" class="btn btn-secondary" style="width: 100%;" onclick="signupStep=0; showAuthPage()">
          ${t('signup')}
        </button>
      </form>
    </div>
  `;
}

async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  try {
    const authContent = document.getElementById('authContent');
    authContent.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 40px 20px;">
        <div class="spinner"></div>
        <p>${t('loading')}</p>
      </div>
    `;
    
    await login(email, password);
  } catch (error) {
    console.error('Login error:', error);
    showLoginForm();
  }
}
