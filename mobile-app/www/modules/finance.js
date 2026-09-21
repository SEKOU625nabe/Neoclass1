// ============================================================
// FINANCE MODULE
// ============================================================

async function renderFinancePage() {
  return `
    <div class="dashboard-container">
      <div class="navbar">
        <button class="btn btn-secondary" style="padding: 8px 16px; font-size: 0.9rem;" onclick="goBack()">
          ← ${t('back')}
        </button>
        <h1 style="font-size: 1.2rem;">💸 ${t('withdrawal')}</h1>
      </div>

      <div class="container" style="padding: 15px; overflow-y: auto;">
        <!-- BALANCE -->
        <div class="card" style="background: linear-gradient(135deg, #fbbf24, #f59e0b); color: white; text-align: center; padding: 30px; margin-bottom: 20px;">
          <p style="font-size: 0.9rem; opacity: 0.9; margin-bottom: 10px;">${t('nabecoins')} disponibles</p>
          <h2 style="font-size: 2.5rem; font-weight: 900; margin: 0;">
            ${State.profile.nabecoins || 0}
          </h2>
          <p style="margin-top: 10px; font-size: 0.85rem; opacity: 0.85;">
            = ${formatCurrency((State.profile.nabecoins || 0) * 0.00001, 'GNF')}
          </p>
        </div>

        <!-- WITHDRAWAL FORM -->
        <div class="card" style="margin-bottom: 20px;">
          <h3 style="margin-bottom: 20px; font-weight: 700;">Demander un retrait</h3>
          <form onsubmit="handleWithdrawal(event)">
            <div class="form-group">
              <label class="form-label">Montant (NabeCoins)</label>
              <input type="number" class="form-input" id="withdrawAmount" 
                placeholder="Minimum: 1000" min="1000" step="100" required />
            </div>

            <div class="form-group">
              <label class="form-label">Méthode de paiement</label>
              <select class="form-input" id="withdrawMethod" required>
                <option value="">-- Sélectionner --</option>
                <option value="orange-money">Orange Money 🟠</option>
                <option value="mtn-money">MTN Money 🟡</option>
                <option value="bank">Virement bancaire 🏦</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Numéro de téléphone</label>
              <input type="tel" class="form-input" id="withdrawPhone" 
                placeholder="+224 6XX XXX XXX" required />
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%; margin-bottom: 10px;">
              Demander un retrait
            </button>
            <button type="button" class="btn btn-secondary" style="width: 100%;" onclick="goBack()">
              ${t('back')}
            </button>
          </form>
        </div>

        <!-- SUBSCRIPTION -->
        <div style="margin-bottom: 20px;">
          <h3 style="margin-bottom: 15px; font-weight: 700;">💎 ${t('subscription')}</h3>
          <div style="display: grid; gap: 12px;">
            ${SUBSCRIPTION_PLANS.map(plan => `
              <div class="card" style="border: 2px solid ${plan.color}; cursor: pointer;" 
                onclick="selectSubscription('${plan.id}')">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                  <div>
                    <h4 style="color: ${plan.color}; margin-bottom: 8px; font-weight: 700;">${plan.name}</h4>
                    <p style="font-size: 0.85rem; color: var(--text-secondary);">
                      ${plan.price > 0 ? formatCurrency(plan.price, 'GNF') : 'Gratuit'}
                    </p>
                  </div>
                  <span style="font-size: 1.5rem;">→</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div style="height: 30px;"></div>
      </div>
    </div>
  `;
}

async function handleWithdrawal(e) {
  e.preventDefault();
  
  const amount = parseInt(document.getElementById('withdrawAmount').value);
  const method = document.getElementById('withdrawMethod').value;
  const phoneNumber = document.getElementById('withdrawPhone').value;
  
  if (amount < 1000) {
    showToast('Montant minimum: 1000 NabeCoins', 'error');
    return;
  }
  
  if (State.profile.nabecoins < amount) {
    showToast('NabeCoins insuffisants', 'error');
    return;
  }
  
  const success = await requestWithdrawal(amount, method, phoneNumber);
  if (success) {
    setTimeout(() => {
      renderFinancePage();
    }, 1000);
  }
}

function selectSubscription(planId) {
  const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
  if (!plan) return;
  
  showToast(`${plan.name} - ${plan.price > 0 ? 'À venir' : 'Accès illimité'}`, 'info');
}

// ============================================================
// QUIZZES & GAMES
// ============================================================

async function renderQuizzesPage() {
  return `
    <div class="dashboard-container">
      <div class="navbar">
        <button class="btn btn-secondary" style="padding: 8px 16px; font-size: 0.9rem;" onclick="goBack()">
          ← ${t('back')}
        </button>
        <h1 style="font-size: 1.2rem;">✅ Quiz</h1>
      </div>

      <div class="container" style="padding: 15px; overflow-y: auto;">
        <div style="display: grid; gap: 12px;">
          ${[
            { id: 'q1', title: 'Quiz Maths - Niveau 1', icon: '🧮', reward: 50 },
            { id: 'q2', title: 'Quiz Français - Grammaire', icon: '📝', reward: 40 },
            { id: 'q3', title: 'Quiz Sciences', icon: '🔬', reward: 60 },
          ].map(quiz => `
            <div class="card" style="cursor: pointer;" onclick="startQuiz('${quiz.id}', '${quiz.title}')">
              <div style="display: flex; align-items: center; gap: 15px;">
                <div style="font-size: 2rem;">${quiz.icon}</div>
                <div style="flex: 1;">
                  <h4 style="margin-bottom: 5px;">${quiz.title}</h4>
                  <p style="font-size: 0.85rem; color: var(--text-secondary);">+${quiz.reward} NabeCoins</p>
                </div>
                <span style="font-size: 1.5rem;">→</span>
              </div>
            </div>
          `).join('')}
        </div>
        <div style="height: 30px;"></div>
      </div>
    </div>
  `;
}

function renderGamesPage() {
  return `
    <div class="dashboard-container">
      <div class="navbar">
        <button class="btn btn-secondary" style="padding: 8px 16px; font-size: 0.9rem;" onclick="goBack()">
          ← ${t('back')}
        </button>
        <h1 style="font-size: 1.2rem;">🎮 Jeux</h1>
      </div>

      <div class="container" style="padding: 15px; overflow-y: auto;">
        <div style="display: grid; gap: 12px;">
          ${MINI_GAMES.map(game => `
            <div class="card" style="cursor: pointer;" onclick="startGame('${game.id}')">
              <div style="display: flex; align-items: center; gap: 15px;">
                <div style="font-size: 2rem;">${game.icon}</div>
                <div style="flex: 1;">
                  <h4 style="margin-bottom: 5px;">${game.name}</h4>
                  <p style="font-size: 0.85rem; color: var(--text-secondary);">
                    ${game.desc} • +${game.reward} NC
                  </p>
                </div>
                <span style="font-size: 1.5rem;">→</span>
              </div>
            </div>
          `).join('')}
        </div>
        <div style="height: 30px;"></div>
      </div>
    </div>
  `;
}

function startQuiz(quizId, title) {
  showToast(`Quiz: ${title}`, 'info');
  // Quiz implementation would go here
}

function startGame(gameId) {
  const game = MINI_GAMES.find(g => g.id === gameId);
  showToast(`Lancer: ${game.name}`, 'info');
  // Game implementation would go here
}
