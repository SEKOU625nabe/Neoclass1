// ============================================================
// NEOCLASS FINANCE – PATCH INTÉGRATION INTERFACE ÉCOLE
// ============================================================
// À ajouter dans neoclass-school-v2.js pour intégrer le menu financier
// ============================================================

// Fonction d'intégration financière au sidebar école
function integrateFinanceMenuToSchoolSidebar() {
  console.log('📊 Intégration du menu financier au sidebar école...');

  // Vérifier que nous sommes bien une école
  if (!isSchool()) {
    console.warn('⚠️ Non une interface école');
    return;
  }

  // Trouver le menu sidebar existant
  setTimeout(() => {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) {
      console.warn('⚠️ Sidebar non trouvé');
      return;
    }

    // Vérifier que le menu financier n'existe pas déjà
    if (document.getElementById('finance-menu-section')) {
      console.log('✅ Menu financier déjà présent');
      return;
    }

    // Créer une nouvelle section de navigation pour Finance
    const financeSection = document.createElement('div');
    financeSection.id = 'finance-menu-section';
    financeSection.className = 'nav-section';
    financeSection.innerHTML = `
      <div class="nav-section-label" style="
        margin-top: 20px;
        padding: 15px 0 5px 0;
        border-top: 1px solid var(--border);
        color: var(--text-secondary);
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
      ">💰 FINANCES</div>
      
      <div class="nav-item" onclick="navigateToFinance('dashboard')" style="
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s;
        color: var(--text-secondary);
      " onmouseover="this.style.backgroundColor='var(--grey-100)'" onmouseout="this.style.backgroundColor='transparent'">
        <span style="font-size: 16px;">📊</span>
        <span>Tableau Financier</span>
      </div>

      <div class="nav-item" onclick="navigateToFinance('operations')" style="
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s;
        color: var(--text-secondary);
      " onmouseover="this.style.backgroundColor='var(--grey-100)'" onmouseout="this.style.backgroundColor='transparent'">
        <span style="font-size: 16px;">💰</span>
        <span>Opérations</span>
      </div>

      <div class="nav-item" onclick="navigateToFinance('budgets')" style="
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s;
        color: var(--text-secondary);
      " onmouseover="this.style.backgroundColor='var(--grey-100)'" onmouseout="this.style.backgroundColor='transparent'">
        <span style="font-size: 16px;">📈</span>
        <span>Budgets</span>
      </div>

      <div class="nav-item" onclick="navigateToFinance('team')" style="
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s;
        color: var(--text-secondary);
      " onmouseover="this.style.backgroundColor='var(--grey-100)'" onmouseout="this.style.backgroundColor='transparent'">
        <span style="font-size: 16px;">👥</span>
        <span>Équipe Finance</span>
      </div>

      <div class="nav-item" onclick="navigateToFinance('reports')" style="
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s;
        color: var(--text-secondary);
      " onmouseover="this.style.backgroundColor='var(--grey-100)'" onmouseout="this.style.backgroundColor='transparent'">
        <span style="font-size: 16px;">📋</span>
        <span>Rapports</span>
      </div>
    `;

    // Ajouter la section au sidebar (avant les paramètres)
    const settingsSection = sidebar.querySelector('[class*="settings"]');
    if (settingsSection) {
      sidebar.insertBefore(financeSection, settingsSection);
    } else {
      sidebar.appendChild(financeSection);
    }

    console.log('✅ Menu financier intégré au sidebar');
  }, 1000);
}

// Fonction de navigation vers le tableau financier
function navigateToFinance(section = 'dashboard') {
  console.log('🚀 Navigation vers Finance -', section);

  // Sauvegarder les infos école
  if (State && State.user) {
    localStorage.setItem('neoclass_schoolId', State.user.uid);
    localStorage.setItem('neoclass_schoolName', State.profile?.schoolName || 'Mon École');
    localStorage.setItem('neoclass_userName', State.profile?.fullName || 'Directeur');
  }

  // Ouvrir la page de finance intégrée
  window.location.href = './school-finance-integration.html#' + section;
}

// Ajouter le widget d'accès rapide au finance dans le dashboard
function addFinanceQuickAccessWidget() {
  console.log('🎯 Ajout du widget accès rapide finance...');

  // Créer un widget finance pour le dashboard école
  const widget = document.createElement('div');
  widget.id = 'finance-quick-widget';
  widget.style.cssText = `
    background: linear-gradient(135deg, #1A3A6B 0%, #2563EB 100%);
    color: white;
    padding: 20px;
    border-radius: 12px;
    margin-bottom: 20px;
    cursor: pointer;
    transition: all 0.3s;
    user-select: none;
  `;

  widget.onmouseover = function() {
    this.style.transform = 'translateY(-2px)';
    this.style.boxShadow = '0 8px 16px rgba(26, 58, 107, 0.3)';
  };

  widget.onmouseout = function() {
    this.style.transform = 'translateY(0)';
    this.style.boxShadow = 'none';
  };

  widget.onclick = () => navigateToFinance('dashboard');

  widget.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
      <div>
        <div style="font-size: 18px; font-weight: 700; margin-bottom: 5px;">📊 Gestion Financière</div>
        <div style="font-size: 12px; opacity: 0.8;">Accès au tableau financier complet</div>
      </div>
      <div style="font-size: 32px;">💰</div>
    </div>

    <div style="
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      gap: 10px;
    ">
      <div style="
        background: rgba(255, 255, 255, 0.15);
        padding: 10px;
        border-radius: 6px;
        text-align: center;
      ">
        <div style="font-size: 12px; font-weight: 600;">Entrées</div>
        <div style="font-size: 16px; margin-top: 5px;" id="widget-income">-</div>
      </div>
      
      <div style="
        background: rgba(255, 255, 255, 0.15);
        padding: 10px;
        border-radius: 6px;
        text-align: center;
      ">
        <div style="font-size: 12px; font-weight: 600;">Sorties</div>
        <div style="font-size: 16px; margin-top: 5px;" id="widget-expenses">-</div>
      </div>

      <div style="
        background: rgba(255, 255, 255, 0.15);
        padding: 10px;
        border-radius: 6px;
        text-align: center;
      ">
        <div style="font-size: 12px; font-weight: 600;">Solde</div>
        <div style="font-size: 16px; margin-top: 5px;" id="widget-balance">-</div>
      </div>
    </div>

    <div style="
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
      display: flex;
      justify-content: space-between;
      align-items: center;
    ">
      <div style="font-size: 12px;">👉 Cliquez pour ouvrir le tableau complet</div>
      <div style="font-size: 18px;">→</div>
    </div>
  `;

  // Trouver où ajouter le widget (dans le dashboard principal)
  setTimeout(() => {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.insertBefore(widget, mainContent.firstChild);
      console.log('✅ Widget finance ajouté au dashboard');

      // Charger et afficher les données du widget
      updateFinanceWidget();
    }
  }, 500);
}

// Mettre à jour les données du widget finance
async function updateFinanceWidget() {
  try {
    // Créer une instance temporaire pour charger les stats
    if (typeof NeoclassFinanceSystem !== 'undefined') {
      const schoolId = State && State.user ? State.user.uid : 'school_demo_001';
      const financeSystem = new NeoclassFinanceSystem(schoolId, State?.profile?.schoolName || 'Ma École');

      const stats = await financeSystem.getFinancialStats('month');

      // Mettre à jour le widget
      document.getElementById('widget-income').textContent = formatMoneyShort(stats.income);
      document.getElementById('widget-expenses').textContent = formatMoneyShort(stats.expenses);
      document.getElementById('widget-balance').textContent = formatMoneyShort(stats.balance);
    }
  } catch (error) {
    console.warn('⚠️ Impossible de charger les stats widget:', error);
  }
}

// Utilitaire pour formater l'argent en court
function formatMoneyShort(amount) {
  if (amount >= 1000000) {
    return (amount / 1000000).toFixed(1) + 'M';
  }
  if (amount >= 1000) {
    return (amount / 1000).toFixed(1) + 'K';
  }
  return Math.round(amount);
}

function waitForStateReady(callback) {
  if (typeof State !== 'undefined') {
    return callback();
  }
  setTimeout(() => waitForStateReady(callback), 100);
}

// Point d'entrée automatique
document.addEventListener('DOMContentLoaded', () => {
  waitForStateReady(() => {
    if (typeof isSchool === 'function' && isSchool()) {
      integrateFinanceMenuToSchoolSidebar();
      addFinanceQuickAccessWidget();
    }
  });
});

// ============================================================
// EXPORT
// ============================================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    integrateFinanceMenuToSchoolSidebar,
    navigateToFinance,
    addFinanceQuickAccessWidget,
    updateFinanceWidget
  };
}
