// ============================================================
// SOCIAL MODULE
// ============================================================

async function renderSocialPage() {
  return `
    <div class="dashboard-container">
      <div class="navbar">
        <button class="btn btn-secondary" style="padding: 8px 16px; font-size: 0.9rem;" onclick="goBack()">
          ← ${t('back')}
        </button>
        <h1 style="font-size: 1.2rem;">🌐 Réseau social</h1>
      </div>

      <div class="container" style="padding: 15px; overflow-y: auto;">
        <!-- TABS -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px;">
          <button class="tab-btn" style="padding: 12px; border-radius: 10px; background: var(--primary); color: white; border: none; cursor: pointer; font-weight: 600;" 
            onclick="switchSocialTab('chat')">
            💬 Discussions
          </button>
          <button class="tab-btn" style="padding: 12px; border-radius: 10px; background: var(--bg-hover); color: var(--text); border: none; cursor: pointer; font-weight: 600;" 
            onclick="switchSocialTab('leaderboard')">
            🏆 Classement
          </button>
        </div>

        <!-- CHAT TAB -->
        <div id="chatTab">
          <div style="display: grid; gap: 12px;">
            ${[
              { id: 'user1', name: 'Marie D.', message: 'Comment tu as réussi le quiz?', time: '5m' },
              { id: 'user2', name: 'Jean B.', message: 'J\'ai finalement compris le chapitre!', time: '1h' },
              { id: 'user3', name: 'Sophie L.', message: 'Des conseils pour le maths?', time: '2h' },
            ].map(user => `
              <div class="card" style="cursor: pointer;" onclick="openChat('${user.id}', '${user.name}')">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <div style="
                    width: 48px;
                    height: 48px;
                    background: linear-gradient(135deg, #6c63ff, #8b83ff);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 700;
                  ">
                    ${user.name.charAt(0)}
                  </div>
                  <div style="flex: 1; min-width: 0;">
                    <h4 style="margin-bottom: 4px; font-weight: 700;">${user.name}</h4>
                    <p style="font-size: 0.85rem; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                      ${user.message}
                    </p>
                  </div>
                  <p style="font-size: 0.8rem; color: var(--text-secondary);">${user.time}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- LEADERBOARD TAB -->
        <div id="leaderboardTab" style="display: none;">
          <div style="display: grid; gap: 12px;">
            ${[
              { rank: 1, name: 'Alex Champion', score: 9850, medal: '🥇' },
              { rank: 2, name: 'Marie Expert', score: 9720, medal: '🥈' },
              { rank: 3, name: 'Jean Master', score: 9650, medal: '🥉' },
              { rank: 4, name: 'Sophie Plus', score: 9400, medal: '' },
              { rank: 5, name: 'Lucas Best', score: 9200, medal: '' },
            ].map(user => `
              <div class="card">
                <div style="display: flex; align-items: center; gap: 12px; justify-content: space-between;">
                  <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                    <div style="
                      width: 40px;
                      font-size: 1.5rem;
                      text-align: center;
                      font-weight: 900;
                    ">
                      ${user.medal || '#' + user.rank}
                    </div>
                    <div>
                      <h4 style="margin-bottom: 3px; font-weight: 700;">${user.name}</h4>
                      <p style="font-size: 0.8rem; color: var(--text-secondary);">${user.score.toLocaleString()} pts</p>
                    </div>
                  </div>
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

function switchSocialTab(tab) {
  const chatTab = document.getElementById('chatTab');
  const leaderboardTab = document.getElementById('leaderboardTab');
  
  if (tab === 'chat') {
    chatTab.style.display = 'grid';
    leaderboardTab.style.display = 'none';
  } else {
    chatTab.style.display = 'none';
    leaderboardTab.style.display = 'grid';
  }
}

function openChat(userId, userName) {
  const dashboardContent = document.getElementById('dashboardContent');
  
  dashboardContent.innerHTML = `
    <div class="dashboard-container">
      <div class="navbar">
        <button class="btn btn-secondary" style="padding: 8px 16px; font-size: 0.9rem;" onclick="renderSocialPage(); switchSocialTab('chat');">
          ← ${t('back')}
        </button>
        <h1 style="font-size: 1.2rem;">${userName}</h1>
      </div>

      <div class="container" style="padding: 15px; overflow-y: auto; display: flex; flex-direction: column; gap: 15px;">
        <!-- MESSAGES -->
        <div style="flex: 1; display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; justify-content: flex-start;">
            <div style="background: var(--bg-hover); padding: 12px; border-radius: 12px; max-width: 80%; word-wrap: break-word;">
              Salut! Comment ça va?
            </div>
          </div>
          <div style="display: flex; justify-content: flex-end;">
            <div style="background: var(--primary); color: white; padding: 12px; border-radius: 12px; max-width: 80%; word-wrap: break-word;">
              Ça va bien! Et toi?
            </div>
          </div>
        </div>

        <!-- INPUT -->
        <div style="display: flex; gap: 10px; padding-top: 15px; border-top: 1px solid var(--border);">
          <input type="text" class="form-input" placeholder="Écrire un message..." id="chatInput" style="flex: 1; margin-bottom: 0;" />
          <button class="btn btn-primary" style="padding: 12px 20px;" onclick="sendChatMessage('${userId}')">
            ✓
          </button>
        </div>
      </div>
    </div>
  `;
}

function sendChatMessage(userId) {
  const chatInput = document.getElementById('chatInput');
  const message = chatInput.value.trim();
  
  if (!message) return;
  
  sendMessage(userId, message);
  chatInput.value = '';
  showToast('Message envoyé', 'success');
}
