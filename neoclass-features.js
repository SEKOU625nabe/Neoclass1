// ============================================================
// 🚀 NEOCLASS FEATURES - Tous les systèmes avancés
// ============================================================

// ============================================================
// ❤️ SYSTÈME DE VIES/CŒURS
// ============================================================
const LivesSystem = {
  maxLives: 5,
  regenTime: 30 * 60 * 1000, // 30 minutes pour régénérer 1 vie
  
  async init() {
    if (!State.user) return;
    
    const profile = State.profile;
    if (!profile.lives) {
      profile.lives = this.maxLives;
      profile.lastLifeLoss = null;
    }
    
    // Régénérer les vies
    await this.regenerateLives();
    this.startRegenTimer();
    this.updateDisplay();
  },
  
  async regenerateLives() {
    if (!State.profile || !State.profile.lastLifeLoss) return;
    
    const now = Date.now();
    const lastLoss = new Date(State.profile.lastLifeLoss).getTime();
    const elapsed = now - lastLoss;
    const livesToRegen = Math.floor(elapsed / this.regenTime);
    
    if (livesToRegen > 0 && State.profile.lives < this.maxLives) {
      State.profile.lives = Math.min(this.maxLives, State.profile.lives + livesToRegen);
      await this.save();
    }
  },
  
  startRegenTimer() {
    setInterval(() => {
      if (State.profile && State.profile.lives < this.maxLives) {
        this.regenerateLives();
        this.updateDisplay();
      }
    }, 60000); // Check chaque minute
  },
  
  async loseLife() {
    if (!State.profile) return false;
    
    if (State.profile.lives <= 0) {
      this.showNoLivesModal();
      return false;
    }
    
    State.profile.lives--;
    State.profile.lastLifeLoss = new Date().toISOString();
    await this.save();
    this.updateDisplay();
    
    // Animation de perte de vie
    this.animateLifeLoss();
    
    if (State.profile.lives === 0) {
      this.showNoLivesModal();
    }
    
    return true;
  },
  
  async gainLife(amount = 1) {
    if (!State.profile) return;
    State.profile.lives = Math.min(this.maxLives, State.profile.lives + amount);
    await this.save();
    this.updateDisplay();
    playSound('success');
  },
  
  async save() {
    if (!State.user) return;
    try {
      await db.collection('users').doc(State.user.uid).update({
        lives: State.profile.lives,
        lastLifeLoss: State.profile.lastLifeLoss
      });
    } catch(e) {
      console.error('Erreur sauvegarde vies:', e);
    }
  },
  
  updateDisplay() {
    const container = document.getElementById('livesContainer');
    if (!container || !State.profile) return;
    
    let hearts = '';
    for (let i = 0; i < this.maxLives; i++) {
      if (i < State.profile.lives) {
        hearts += '<span class="life-heart full">❤️</span>';
      } else {
        hearts += '<span class="life-heart empty">🖤</span>';
      }
    }
    
    container.innerHTML = hearts;
    
    // Timer de régénération
    if (State.profile.lives < this.maxLives) {
      const timeLeft = this.getTimeToNextLife();
      container.innerHTML += `<span class="life-timer">+1 dans ${timeLeft}</span>`;
    }
  },
  
  getTimeToNextLife() {
    if (!State.profile.lastLifeLoss) return '0:00';
    const elapsed = Date.now() - new Date(State.profile.lastLifeLoss).getTime();
    const remaining = this.regenTime - (elapsed % this.regenTime);
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  },
  
  animateLifeLoss() {
    const container = document.getElementById('livesContainer');
    if (container) {
      container.classList.add('shake');
      setTimeout(() => container.classList.remove('shake'), 500);
    }
  },
  
  showNoLivesModal() {
    openModal(`
      <div class="no-lives-modal text-center">
        <div style="font-size:5rem;margin-bottom:20px;">💔</div>
        <h2 style="color:var(--danger);">Plus de vies !</h2>
        <p style="margin:15px 0;color:var(--text-secondary);">
          Tu as utilisé toutes tes vies. Attends 30 minutes pour en récupérer une, ou...
        </p>
        <div class="flex flex-col gap-2">
          <button class="btn btn-primary" onclick="LivesSystem.watchAdForLife()">
            📺 Regarder une pub (+1 vie)
          </button>
          <button class="btn btn-accent" onclick="LivesSystem.buyLives()">
            💎 Acheter des vies (500 NC)
          </button>
          <button class="btn btn-outline" onclick="closeModal()">
            ⏰ Attendre (${this.getTimeToNextLife()})
          </button>
        </div>
      </div>
    `);
  },
  
  async watchAdForLife() {
    // Simuler visionnage pub
    openModal(`
      <div class="text-center">
        <div class="spinner" style="margin:30px auto;"></div>
        <p>Chargement de la publicité...</p>
      </div>
    `);
    
    setTimeout(async () => {
      await this.gainLife();
      closeModal();
      showToast('❤️ +1 vie gagnée !', 'success');
    }, 3000);
  },
  
  async buyLives() {
    if (!State.profile || (State.profile.nabecoins || 0) < 500) {
      showToast('Pas assez de NabeCoins !', 'error');
      return;
    }
    
    State.profile.nabecoins -= 500;
    await this.gainLife(this.maxLives); // Remplir toutes les vies
    showToast('❤️ Vies restaurées !', 'success');
    closeModal();
  }
};

// ============================================================
// 🎁 RÉCOMPENSES QUOTIDIENNES
// ============================================================
const DailyRewards = {
  rewards: [
    { day: 1, xp: 10, nc: 5, icon: '🎁' },
    { day: 2, xp: 15, nc: 10, icon: '🎁' },
    { day: 3, xp: 25, nc: 15, badge: 'streak_3', icon: '🔥' },
    { day: 4, xp: 30, nc: 20, icon: '🎁' },
    { day: 5, xp: 40, nc: 30, icon: '🎁' },
    { day: 6, xp: 50, nc: 40, icon: '🎁' },
    { day: 7, xp: 100, nc: 100, badge: 'streak_7', icon: '🏆', special: true }
  ],
  
  async checkDailyReward() {
    if (!State.user || !State.profile) return;
    
    const today = new Date().toDateString();
    const lastClaim = State.profile.lastDailyReward;
    
    if (lastClaim === today) return; // Déjà réclamé aujourd'hui
    
    // Calculer le jour de la série
    const streak = State.profile.streakCurrent || 1;
    const dayIndex = ((streak - 1) % 7);
    const reward = this.rewards[dayIndex];
    
    this.showDailyRewardModal(reward, dayIndex + 1);
  },
  
  showDailyRewardModal(reward, day) {
    const isSpecial = reward.special;
    
    openModal(`
      <div class="daily-reward-modal text-center">
        <div class="daily-reward-chest ${isSpecial ? 'special' : ''}" onclick="DailyRewards.claimReward()">
          <span style="font-size:${isSpecial ? '6rem' : '5rem'}">${reward.icon}</span>
        </div>
        <h2 style="margin:20px 0;${isSpecial ? 'background:linear-gradient(135deg,#fbbf24,#f59e0b);-webkit-background-clip:text;-webkit-text-fill-color:transparent;' : ''}">
          ${isSpecial ? '🌟 RÉCOMPENSE SPÉCIALE 🌟' : `Jour ${day} - Récompense quotidienne`}
        </h2>
        <div class="daily-reward-preview">
          <div class="reward-item"><span class="reward-value">+${reward.xp}</span><span class="reward-label">XP</span></div>
          <div class="reward-item"><span class="reward-value">+${reward.nc}</span><span class="reward-label">NC</span></div>
          ${reward.badge ? `<div class="reward-item"><span class="reward-value">🏅</span><span class="reward-label">Badge</span></div>` : ''}
        </div>
        <button class="btn btn-primary btn-lg" onclick="DailyRewards.claimReward()" style="margin-top:20px;">
          🎁 Récupérer ma récompense !
        </button>
        
        <div class="daily-reward-calendar">
          ${this.rewards.map((r, i) => `
            <div class="reward-day ${i < (State.profile.streakCurrent - 1) % 7 ? 'claimed' : ''} ${i === (State.profile.streakCurrent - 1) % 7 ? 'current' : ''} ${r.special ? 'special' : ''}">
              <span class="day-num">J${i + 1}</span>
              <span class="day-icon">${r.icon}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `);
  },
  
  async claimReward() {
    if (!State.user || !State.profile) return;
    
    const streak = State.profile.streakCurrent || 1;
    const dayIndex = ((streak - 1) % 7);
    const reward = this.rewards[dayIndex];
    
    // Animation d'ouverture du coffre
    const chest = document.querySelector('.daily-reward-chest');
    if (chest) {
      chest.classList.add('opening');
      playSound('levelUp');
    }
    
    setTimeout(async () => {
      // Donner les récompenses
      State.profile.totalXP = (State.profile.totalXP || 0) + reward.xp;
      State.profile.nabecoins = (State.profile.nabecoins || 0) + reward.nc;
      State.profile.lastDailyReward = new Date().toDateString();
      
      try {
        await db.collection('users').doc(State.user.uid).update({
          totalXP: State.profile.totalXP,
          nabecoins: State.profile.nabecoins,
          lastDailyReward: State.profile.lastDailyReward
        });
        
        closeModal();
        
        // Confetti !
        launchConfetti();
        
        showToast(`🎉 +${reward.xp} XP et +${reward.nc} NC !`, 'success');
        
        if (reward.badge) {
          setTimeout(() => {
            GamificationEngine.unlockBadge(reward.badge);
          }, 1000);
        }
      } catch(e) {
        console.error('Erreur récompense:', e);
        showToast('Erreur lors de la réclamation', 'error');
      }
    }, 1500);
  }
};

// ============================================================
// 🗺️ MODE HISTOIRE/AVENTURE - ROYAUMES DU SAVOIR
// ============================================================
const AdventureMode = {
  kingdoms: {
    maths: {
      name: 'Royaume des Nombres',
      icon: '🏰',
      color: '#6c63ff',
      description: 'Maîtrise les mathématiques',
      regions: [
        { id: 'arithmetique', name: 'Vallée Arithmétique', chapters: 5, unlocked: true },
        { id: 'algebre', name: 'Forêt Algébrique', chapters: 6, unlocked: false },
        { id: 'geometrie', name: 'Montagnes Géométriques', chapters: 5, unlocked: false },
        { id: 'analyse', name: 'Cité de l\'Analyse', chapters: 7, unlocked: false }
      ]
    },
    sciences: {
      name: 'Empire des Sciences',
      icon: '🔬',
      color: '#10b981',
      description: 'Découvre les mystères scientifiques',
      regions: [
        { id: 'physique', name: 'Laboratoire de Physique', chapters: 6, unlocked: true },
        { id: 'chimie', name: 'Atelier de Chimie', chapters: 5, unlocked: false },
        { id: 'biologie', name: 'Jardin Biologique', chapters: 6, unlocked: false }
      ]
    },
    francais: {
      name: 'Royaume des Lettres',
      icon: '📜',
      color: '#f59e0b',
      description: 'Maîtrise la langue française',
      regions: [
        { id: 'grammaire', name: 'Château Grammatical', chapters: 7, unlocked: true },
        { id: 'conjugaison', name: 'Palais des Verbes', chapters: 5, unlocked: false },
        { id: 'litterature', name: 'Bibliothèque Royale', chapters: 8, unlocked: false }
      ]
    },
    histoire: {
      name: 'Terres du Temps',
      icon: '⏳',
      color: '#8b5cf6',
      description: 'Voyage à travers l\'histoire',
      regions: [
        { id: 'antiquite', name: 'Ruines Antiques', chapters: 4, unlocked: true },
        { id: 'moyenage', name: 'Forteresse Médiévale', chapters: 5, unlocked: false },
        { id: 'moderne', name: 'Cité Moderne', chapters: 6, unlocked: false }
      ]
    }
  },
  
  playerProgress: {},
  
  async init() {
    if (!State.user) return;
    
    // Charger la progression du joueur
    const doc = await db.collection('adventure_progress').doc(State.user.uid).get();
    this.playerProgress = doc.exists ? doc.data() : this.getDefaultProgress();
  },
  
  getDefaultProgress() {
    const progress = {};
    Object.keys(this.kingdoms).forEach(kingdom => {
      progress[kingdom] = {
        unlocked: true,
        regions: {}
      };
      this.kingdoms[kingdom].regions.forEach((region, idx) => {
        progress[kingdom].regions[region.id] = {
          unlocked: idx === 0,
          chaptersCompleted: 0,
          stars: 0
        };
      });
    });
    return progress;
  },
  
  render(app) {
    const sl = getSidebarLinks(State.profile.role);
    
    app.innerHTML = `
      <div class="layout-dashboard">
        <aside class="sidebar"><div class="sidebar-section">Menu</div>${sl}</aside>
        <main class="main-content animate-fade">
          <div class="adventure-header">
            <h1>🗺️ Aventure - Royaumes du Savoir</h1>
            <div class="adventure-stats">
              <span class="adventure-stat">⭐ ${this.getTotalStars()} étoiles</span>
              <span class="adventure-stat">🏰 ${this.getUnlockedRegions()} régions</span>
              <span class="adventure-stat">📚 ${this.getCompletedChapters()} chapitres</span>
            </div>
          </div>
          
          <div class="adventure-map">
            ${Object.entries(this.kingdoms).map(([key, kingdom]) => `
              <div class="kingdom-card" style="--kingdom-color:${kingdom.color}" onclick="AdventureMode.enterKingdom('${key}')">
                <div class="kingdom-icon">${kingdom.icon}</div>
                <h3 class="kingdom-name">${kingdom.name}</h3>
                <p class="kingdom-desc">${kingdom.description}</p>
                <div class="kingdom-progress">
                  <div class="kingdom-progress-bar">
                    <div class="kingdom-progress-fill" style="width:${this.getKingdomProgress(key)}%"></div>
                  </div>
                  <span>${this.getKingdomProgress(key)}%</span>
                </div>
                <div class="kingdom-regions">
                  ${kingdom.regions.slice(0, 3).map(r => `
                    <span class="region-marker ${this.isRegionUnlocked(key, r.id) ? 'unlocked' : 'locked'}">
                      ${this.isRegionUnlocked(key, r.id) ? '✓' : '🔒'}
                    </span>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
          
          <div class="adventure-hero-section">
            <div class="hero-avatar-container">
              <div class="hero-avatar">${this.getHeroAvatar()}</div>
              <div class="hero-level">Nv. ${GamificationEngine.calculateLevel(State.profile.totalXP || 0)}</div>
            </div>
            <div class="hero-info">
              <h3>Ton héros : ${State.profile.displayName || 'Aventurier'}</h3>
              <p>Titre : ${GamificationEngine.getMascotTitle(GamificationEngine.calculateLevel(State.profile.totalXP || 0))}</p>
              <div class="hero-equipment">
                <span title="Épée de Savoir">⚔️</span>
                <span title="Bouclier de Persévérance">🛡️</span>
                <span title="Livre Magique">📖</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    `;
  },
  
  enterKingdom(kingdomId) {
    const kingdom = this.kingdoms[kingdomId];
    if (!kingdom) return;
    
    openModal(`
      <div class="kingdom-detail">
        <div class="kingdom-detail-header" style="background:${kingdom.color}">
          <span style="font-size:4rem;">${kingdom.icon}</span>
          <h2 style="color:#fff;">${kingdom.name}</h2>
        </div>
        
        <div class="regions-list">
          ${kingdom.regions.map((region, idx) => {
            const progress = this.playerProgress[kingdomId]?.regions[region.id] || {};
            const unlocked = progress.unlocked || idx === 0;
            
            return `
              <div class="region-card ${unlocked ? '' : 'locked'}" onclick="${unlocked ? `AdventureMode.enterRegion('${kingdomId}', '${region.id}')` : ''}">
                <div class="region-status">${unlocked ? '✓' : '🔒'}</div>
                <div class="region-info">
                  <h4>${region.name}</h4>
                  <div class="region-progress">
                    ${progress.chaptersCompleted || 0}/${region.chapters} chapitres
                  </div>
                  <div class="region-stars">
                    ${'⭐'.repeat(progress.stars || 0)}${'☆'.repeat(3 - (progress.stars || 0))}
                  </div>
                </div>
                ${!unlocked ? `<div class="unlock-req">Termine la région précédente</div>` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `);
  },
  
  enterRegion(kingdomId, regionId) {
    closeModal();
    // Naviguer vers les leçons de cette région
    navigate('courses', { kingdom: kingdomId, region: regionId });
    showToast(`Bienvenue dans ${this.kingdoms[kingdomId].regions.find(r => r.id === regionId)?.name} !`, 'info');
  },
  
  getTotalStars() {
    let stars = 0;
    Object.values(this.playerProgress).forEach(kingdom => {
      Object.values(kingdom.regions || {}).forEach(region => {
        stars += region.stars || 0;
      });
    });
    return stars;
  },
  
  getUnlockedRegions() {
    let count = 0;
    Object.values(this.playerProgress).forEach(kingdom => {
      Object.values(kingdom.regions || {}).forEach(region => {
        if (region.unlocked) count++;
      });
    });
    return count;
  },
  
  getCompletedChapters() {
    let count = 0;
    Object.values(this.playerProgress).forEach(kingdom => {
      Object.values(kingdom.regions || {}).forEach(region => {
        count += region.chaptersCompleted || 0;
      });
    });
    return count;
  },
  
  getKingdomProgress(kingdomId) {
    const kingdom = this.kingdoms[kingdomId];
    if (!kingdom) return 0;
    
    const totalChapters = kingdom.regions.reduce((sum, r) => sum + r.chapters, 0);
    let completed = 0;
    
    Object.values(this.playerProgress[kingdomId]?.regions || {}).forEach(region => {
      completed += region.chaptersCompleted || 0;
    });
    
    return Math.round((completed / totalChapters) * 100);
  },
  
  isRegionUnlocked(kingdomId, regionId) {
    return this.playerProgress[kingdomId]?.regions[regionId]?.unlocked || false;
  },
  
  getHeroAvatar() {
    const level = GamificationEngine.calculateLevel(State.profile.totalXP || 0);
    if (level >= 20) return '🦸🏾';
    if (level >= 15) return '🧙🏾';
    if (level >= 10) return '⚔️';
    if (level >= 5) return '🧑🏾‍🎓';
    return '🧒🏾';
  },
  
  async completeChapter(kingdomId, regionId, stars = 1) {
    const kingdom = this.kingdoms[kingdomId];
    const region = kingdom?.regions.find(r => r.id === regionId);
    if (!region) return;
    
    const progress = this.playerProgress[kingdomId].regions[regionId];
    progress.chaptersCompleted = (progress.chaptersCompleted || 0) + 1;
    progress.stars = Math.max(progress.stars || 0, stars);
    
    // Débloquer la région suivante si terminée
    if (progress.chaptersCompleted >= region.chapters) {
      const nextIndex = kingdom.regions.findIndex(r => r.id === regionId) + 1;
      if (nextIndex < kingdom.regions.length) {
        const nextRegion = kingdom.regions[nextIndex];
        this.playerProgress[kingdomId].regions[nextRegion.id].unlocked = true;
        showToast(`🗝️ Nouvelle région débloquée : ${nextRegion.name} !`, 'success');
        launchConfetti();
      }
    }
    
    // Sauvegarder
    await db.collection('adventure_progress').doc(State.user.uid).set(this.playerProgress);
  }
};

// ============================================================
// 🏆 CLASSEMENT RÉGIONAL GUINÉE
// ============================================================
const RegionalLeaderboard = {
  regions: [
    { id: 'conakry', name: 'Conakry', icon: '🏙️' },
    { id: 'kindia', name: 'Kindia', icon: '🌄' },
    { id: 'boke', name: 'Boké', icon: '⛏️' },
    { id: 'mamou', name: 'Mamou', icon: '🏔️' },
    { id: 'faranah', name: 'Faranah', icon: '🌾' },
    { id: 'kankan', name: 'Kankan', icon: '📚' },
    { id: 'labe', name: 'Labé', icon: '🌿' },
    { id: 'nzerekore', name: 'N\'Zérékoré', icon: '🌳' }
  ],
  
  async getLeaderboard(filter = 'national') {
    let query = db.collection('users')
      .orderBy('totalXP', 'desc')
      .limit(100);
    
    if (filter !== 'national') {
      query = query.where('region', '==', filter);
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map((doc, index) => ({
      rank: index + 1,
      ...doc.data(),
      uid: doc.id
    }));
  },
  
  async getRegionStats() {
    const stats = {};
    
    for (const region of this.regions) {
      const snapshot = await db.collection('users')
        .where('region', '==', region.id)
        .get();
      
      let totalXP = 0;
      let studentCount = 0;
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.role === 'student' || data.role === 'indep_student') {
          totalXP += data.totalXP || 0;
          studentCount++;
        }
      });
      
      stats[region.id] = {
        ...region,
        totalXP,
        studentCount,
        avgXP: studentCount > 0 ? Math.round(totalXP / studentCount) : 0
      };
    }
    
    return stats;
  },
  
  render(app) {
    const sl = getSidebarLinks(State.profile.role);
    
    app.innerHTML = `
      <div class="layout-dashboard">
        <aside class="sidebar"><div class="sidebar-section">Menu</div>${sl}</aside>
        <main class="main-content animate-fade">
          <h1>🏆 Classement Régional Guinée</h1>
          <p style="color:var(--text-secondary);margin-bottom:20px;">Représente ta région et montre qui sont les meilleurs !</p>
          
          <div class="leaderboard-tabs">
            <button class="tab-btn active" onclick="RegionalLeaderboard.showTab('national')">🇬🇳 National</button>
            <button class="tab-btn" onclick="RegionalLeaderboard.showTab('regions')">🗺️ Par Région</button>
            <button class="tab-btn" onclick="RegionalLeaderboard.showTab('schools')">🏫 Écoles</button>
          </div>
          
          <div id="leaderboardContent" class="mt-3">
            <div class="text-center p-3"><div class="spinner"></div><p>Chargement...</p></div>
          </div>
          
          <div class="regional-challenge card mt-3" style="background:linear-gradient(135deg,#fbbf24,#f59e0b);color:#000;">
            <h3 style="color:#000;">🏅 Défi Inter-Régions</h3>
            <p>Le défi du mois : Cette semaine, Conakry affronte Kindia !</p>
            <div class="challenge-score">
              <div class="team">
                <span style="font-size:2rem;">🏙️</span>
                <strong>Conakry</strong>
                <span class="score">45,230 XP</span>
              </div>
              <span style="font-size:2rem;">⚔️</span>
              <div class="team">
                <span style="font-size:2rem;">🌄</span>
                <strong>Kindia</strong>
                <span class="score">42,890 XP</span>
              </div>
            </div>
            <button class="btn mt-2" style="background:#000;color:#fbbf24;">Participer au défi</button>
          </div>
        </main>
      </div>
    `;
    
    this.showTab('national');
  },
  
  async showTab(tab) {
    const content = document.getElementById('leaderboardContent');
    if (!content) return;
    
    content.innerHTML = '<div class="text-center p-3"><div class="spinner"></div></div>';
    
    // Mettre à jour les onglets actifs
    document.querySelectorAll('.leaderboard-tabs .tab-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.textContent.toLowerCase().includes(tab.substring(0, 4))) {
        btn.classList.add('active');
      }
    });
    
    if (tab === 'national') {
      const leaderboard = await this.getLeaderboard('national');
      content.innerHTML = this.renderLeaderboardTable(leaderboard);
    } else if (tab === 'regions') {
      const stats = await this.getRegionStats();
      content.innerHTML = this.renderRegionCards(stats);
    } else if (tab === 'schools') {
      content.innerHTML = this.renderSchoolsLeaderboard();
    }
  },
  
  renderLeaderboardTable(data) {
    return `
      <div class="leaderboard-list">
        ${data.slice(0, 10).map((user, idx) => `
          <div class="leaderboard-item ${idx < 3 ? 'top-3' : ''} ${user.uid === State.user?.uid ? 'current-user' : ''}">
            <div class="rank">
              ${idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
            </div>
            <div class="user-avatar">${user.displayName?.charAt(0) || '?'}</div>
            <div class="user-info">
              <strong>${user.displayName || 'Anonyme'}</strong>
              <span class="user-region">${this.regions.find(r => r.id === user.region)?.icon || '🇬🇳'} ${this.regions.find(r => r.id === user.region)?.name || 'Guinée'}</span>
            </div>
            <div class="user-xp">
              <strong>${(user.totalXP || 0).toLocaleString()} XP</strong>
              <span class="user-level">Nv. ${GamificationEngine.calculateLevel(user.totalXP || 0)}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },
  
  renderRegionCards(stats) {
    const sortedRegions = Object.values(stats).sort((a, b) => b.avgXP - a.avgXP);
    
    return `
      <div class="region-cards-grid">
        ${sortedRegions.map((region, idx) => `
          <div class="region-rank-card" onclick="RegionalLeaderboard.showRegionDetail('${region.id}')">
            <div class="region-rank">${idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}</div>
            <div class="region-icon">${region.icon}</div>
            <h4>${region.name}</h4>
            <div class="region-stats">
              <div><strong>${region.studentCount}</strong><span>Élèves</span></div>
              <div><strong>${region.avgXP.toLocaleString()}</strong><span>XP moy.</span></div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },
  
  renderSchoolsLeaderboard() {
    return `
      <div class="schools-leaderboard">
        <div class="school-item top-3">
          <span class="rank">🥇</span>
          <div class="school-info">
            <strong>Lycée Donka</strong>
            <span>Conakry</span>
          </div>
          <div class="school-xp">125,400 XP</div>
        </div>
        <div class="school-item top-3">
          <span class="rank">🥈</span>
          <div class="school-info">
            <strong>Collège Kipé</strong>
            <span>Conakry</span>
          </div>
          <div class="school-xp">98,200 XP</div>
        </div>
        <div class="school-item top-3">
          <span class="rank">🥉</span>
          <div class="school-info">
            <strong>Lycée de Kindia</strong>
            <span>Kindia</span>
          </div>
          <div class="school-xp">87,600 XP</div>
        </div>
      </div>
    `;
  },
  
  async showRegionDetail(regionId) {
    const leaderboard = await this.getLeaderboard(regionId);
    const region = this.regions.find(r => r.id === regionId);
    
    openModal(`
      <div class="region-detail">
        <div class="text-center mb-3">
          <span style="font-size:4rem;">${region.icon}</span>
          <h2>${region.name}</h2>
        </div>
        <h4>Top 10 de la région</h4>
        ${this.renderLeaderboardTable(leaderboard)}
      </div>
    `);
  }
};

// ============================================================
// 📋 SIMULATEUR D'EXAMEN BAC
// ============================================================
if (typeof ExamSimulator === 'undefined') {
var ExamSimulator = {
  examTypes: {
    bac_maths: {
      name: 'BAC Maths',
      duration: 180, // 3 heures en minutes
      sections: [
        { name: 'Exercice 1', points: 4, type: 'problem' },
        { name: 'Exercice 2', points: 4, type: 'problem' },
        { name: 'Exercice 3', points: 4, type: 'problem' },
        { name: 'Exercice 4', points: 5, type: 'problem' },
        { name: 'Problème', points: 8, type: 'problem' }
      ]
    },
    bac_physique: {
      name: 'BAC Physique-Chimie',
      duration: 180,
      sections: [
        { name: 'Chimie', points: 8, type: 'mixed' },
        { name: 'Physique', points: 12, type: 'mixed' }
      ]
    },
    bac_francais: {
      name: 'BAC Français',
      duration: 240,
      sections: [
        { name: 'Commentaire composé', points: 20, type: 'essay' },
        { name: 'Dissertation', points: 20, type: 'essay' }
      ]
    },
    bepc: {
      name: 'BEPC',
      duration: 120,
      sections: [
        { name: 'Partie 1', points: 10, type: 'qcm' },
        { name: 'Partie 2', points: 10, type: 'problem' }
      ]
    }
  },
  
  currentExam: null,
  startTime: null,
  answers: {},
  
  render(app) {
    const sl = getSidebarLinks(State.profile.role);
    
    app.innerHTML = `
      <div class="layout-dashboard">
        <aside class="sidebar"><div class="sidebar-section">Menu</div>${sl}</aside>
        <main class="main-content animate-fade">
          <h1>📋 Simulateur d'Examen BAC</h1>
          <p style="color:var(--text-secondary);margin-bottom:30px;">
            Entraîne-toi dans les conditions réelles du BAC guinéen
          </p>
          
          <div class="exam-types-grid">
            ${Object.entries(this.examTypes).map(([key, exam]) => `
              <div class="exam-type-card card" onclick="ExamSimulator.startExam('${key}')">
                <div class="exam-icon">${key.includes('maths') ? '📐' : key.includes('physique') ? '⚗️' : key.includes('francais') ? '📝' : '📚'}</div>
                <h3>${exam.name}</h3>
                <div class="exam-info">
                  <span>⏱️ ${exam.duration} min</span>
                  <span>📊 /20 points</span>
                </div>
                <button class="btn btn-primary btn-block mt-2">Commencer</button>
              </div>
            `).join('')}
          </div>
          
          <div class="exam-history card mt-3">
            <h3>📈 Tes résultats précédents</h3>
            <div id="examHistory">
              <p style="color:var(--text-secondary);">Aucun examen passé pour le moment</p>
            </div>
          </div>
          
          <div class="exam-tips card mt-3" style="background:linear-gradient(135deg,rgba(108,99,255,0.1),rgba(245,158,11,0.1));">
            <h3>💡 Conseils pour le BAC</h3>
            <ul style="margin-left:20px;">
              <li>Lis bien l'énoncé 2 fois avant de commencer</li>
              <li>Gère ton temps : ne reste pas bloqué sur un exercice</li>
              <li>Commence par les exercices que tu maîtrises</li>
              <li>Relis tes réponses si tu as le temps</li>
              <li>Soigne ta présentation et ton écriture</li>
            </ul>
          </div>
        </main>
      </div>
    `;
    
    this.loadHistory();
  },
  
  startExam(examType) {
    const exam = this.examTypes[examType];
    if (!exam) return;
    
    // Vérifier les vies
    if (State.profile.lives !== undefined && State.profile.lives <= 0) {
      LivesSystem.showNoLivesModal();
      return;
    }
    
    openModal(`
      <div class="exam-start-modal text-center">
        <div style="font-size:4rem;margin-bottom:20px;">📋</div>
        <h2>${exam.name}</h2>
        <div class="exam-rules">
          <p><strong>Durée :</strong> ${exam.duration} minutes</p>
          <p><strong>Barème :</strong> 20 points</p>
          <p style="color:var(--danger);margin-top:15px;">
            ⚠️ Une fois commencé, le chronomètre ne peut pas être mis en pause !
          </p>
        </div>
        <div class="exam-conditions mt-3">
          <label class="flex items-center gap-2">
            <input type="checkbox" id="examConditions" />
            <span>Je m'engage à passer cet examen sans tricher</span>
          </label>
        </div>
        <div class="flex gap-2 justify-center mt-3">
          <button class="btn btn-outline" onclick="closeModal()">Annuler</button>
          <button class="btn btn-primary" onclick="ExamSimulator.beginExam('${examType}')">
            🚀 Commencer l'examen
          </button>
        </div>
      </div>
    `);
  },
  
  beginExam(examType) {
    const conditionsChecked = document.getElementById('examConditions')?.checked;
    if (!conditionsChecked) {
      showToast('Accepte les conditions pour continuer', 'error');
      return;
    }
    
    closeModal();
    
    this.currentExam = examType;
    this.startTime = Date.now();
    this.answers = {};
    
    // Afficher l'interface d'examen
    this.renderExamInterface();
  },
  
  renderExamInterface() {
    const exam = this.examTypes[this.currentExam];
    const app = document.getElementById('app');
    
    app.innerHTML = `
      <div class="exam-interface">
        <div class="exam-header">
          <h2>${exam.name}</h2>
          <div class="exam-timer" id="examTimer">⏱️ ${exam.duration}:00</div>
          <button class="btn btn-danger btn-sm" onclick="ExamSimulator.submitExam()">
            Terminer l'examen
          </button>
        </div>
        
        <div class="exam-content">
          <div class="exam-sections">
            ${exam.sections.map((section, idx) => `
              <div class="exam-section card" id="section-${idx}">
                <h3>${section.name} (${section.points} pts)</h3>
                <div class="section-content">
                  ${this.generateSectionContent(section, idx)}
                </div>
              </div>
            `).join('')}
          </div>
          
          <div class="exam-sidebar">
            <div class="section-navigator">
              <h4>Navigation</h4>
              ${exam.sections.map((section, idx) => `
                <button class="nav-section-btn" onclick="document.getElementById('section-${idx}').scrollIntoView({behavior:'smooth'})">
                  ${section.name}
                </button>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Démarrer le timer
    this.startTimer(exam.duration);
  },
  
  generateSectionContent(section, idx) {
    // Générer du contenu de test (à remplacer par de vrais sujets)
    if (section.type === 'qcm') {
      return `
        <div class="qcm-questions">
          <div class="qcm-question">
            <p><strong>1.</strong> Quelle est la capitale de la Guinée ?</p>
            <label><input type="radio" name="q${idx}_1" value="a"> A. Kindia</label>
            <label><input type="radio" name="q${idx}_1" value="b"> B. Conakry</label>
            <label><input type="radio" name="q${idx}_1" value="c"> C. Labé</label>
          </div>
        </div>
      `;
    } else if (section.type === 'essay') {
      return `
        <div class="essay-prompt">
          <p><em>Sujet :</em> Analysez ce texte et répondez aux questions.</p>
          <textarea class="form-input" rows="15" placeholder="Écrivez votre réponse ici..." 
            onchange="ExamSimulator.saveAnswer(${idx}, this.value)"></textarea>
        </div>
      `;
    } else {
      return `
        <div class="problem-content">
          <p><em>Énoncé du problème</em></p>
          <div class="problem-text card-flat" style="background:var(--bg);padding:15px;border-radius:10px;">
            Soit f(x) = x² - 4x + 3.<br>
            1) Étudier les variations de f.<br>
            2) Résoudre f(x) = 0.<br>
            3) Tracer la courbe représentative de f.
          </div>
          <textarea class="form-input mt-2" rows="10" placeholder="Écrivez votre solution..." 
            onchange="ExamSimulator.saveAnswer(${idx}, this.value)"></textarea>
        </div>
      `;
    }
  },
  
  saveAnswer(sectionIdx, value) {
    this.answers[sectionIdx] = value;
  },
  
  startTimer(durationMinutes) {
    const endTime = this.startTime + (durationMinutes * 60 * 1000);
    
    const updateTimer = () => {
      const now = Date.now();
      const remaining = endTime - now;
      
      if (remaining <= 0) {
        this.submitExam();
        return;
      }
      
      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      
      const timerEl = document.getElementById('examTimer');
      if (timerEl) {
        timerEl.textContent = `⏱️ ${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Alertes de temps
        if (remaining <= 5 * 60 * 1000) {
          timerEl.style.color = 'var(--danger)';
          timerEl.style.animation = 'pulse 1s infinite';
        } else if (remaining <= 15 * 60 * 1000) {
          timerEl.style.color = 'var(--accent)';
        }
      }
      
      requestAnimationFrame(updateTimer);
    };
    
    updateTimer();
  },
  
  async submitExam() {
    const endTime = Date.now();
    const duration = Math.round((endTime - this.startTime) / 60000);
    
    // Calculer un score simulé
    const score = Math.floor(Math.random() * 8) + 10; // Score entre 10-18 pour la démo
    
    const result = {
      examType: this.currentExam,
      date: new Date().toISOString(),
      duration,
      score,
      answers: this.answers
    };
    
    // Sauvegarder le résultat
    if (State.user) {
      await db.collection('exam_results').add({
        userId: State.user.uid,
        ...result
      });
    }
    
    // Donner de l'XP
    const xpEarned = score * 5;
    await GamificationEngine.addXP(xpEarned, 'Examen terminé');
    
    // Afficher les résultats
    openModal(`
      <div class="exam-results text-center">
        <div style="font-size:5rem;margin-bottom:20px;">
          ${score >= 16 ? '🏆' : score >= 12 ? '🎉' : score >= 10 ? '✅' : '📚'}
        </div>
        <h2>Examen terminé !</h2>
        <div class="result-score" style="font-size:3rem;font-weight:900;color:${score >= 10 ? 'var(--success)' : 'var(--danger)'};">
          ${score}/20
        </div>
        <p style="margin:15px 0;">Durée : ${duration} minutes</p>
        <p>+${xpEarned} XP gagnés</p>
        
        <div class="result-message mt-3">
          ${score >= 16 ? 'Excellent ! Tu es prêt pour le BAC !' : 
            score >= 12 ? 'Bien ! Continue tes efforts !' : 
            score >= 10 ? 'Passable. Révise encore un peu.' : 
            'Il faut retravailler ce sujet.'}
        </div>
        
        <div class="flex gap-2 justify-center mt-3">
          <button class="btn btn-outline" onclick="closeModal();navigate('exam-simulator');">
            Voir les corrections
          </button>
          <button class="btn btn-primary" onclick="closeModal();navigate('exam-simulator');">
            Retour
          </button>
        </div>
      </div>
    `);
    
    // Réinitialiser
    this.currentExam = null;
    this.startTime = null;
    this.answers = {};
  },
  
  async loadHistory() {
    if (!State.user) return;
    
    const snapshot = await db.collection('exam_results')
      .where('userId', '==', State.user.uid)
      .orderBy('date', 'desc')
      .limit(5)
      .get();
    
    const history = document.getElementById('examHistory');
    if (!history) return;
    
    if (snapshot.empty) {
      history.innerHTML = '<p style="color:var(--text-secondary);">Aucun examen passé pour le moment</p>';
      return;
    }
    
    history.innerHTML = snapshot.docs.map(doc => {
      const data = doc.data();
      const exam = this.examTypes[data.examType];
      return `
        <div class="exam-history-item flex items-center justify-between p-2" style="border-bottom:1px solid var(--border);">
          <div>
            <strong>${exam?.name || data.examType}</strong>
            <span style="color:var(--text-secondary);font-size:.85rem;margin-left:10px;">
              ${new Date(data.date).toLocaleDateString('fr-FR')}
            </span>
          </div>
          <span class="badge ${data.score >= 10 ? 'badge-success' : 'badge-danger'}">${data.score}/20</span>
        </div>
      `;
    }).join('');
  }
};
}

// ============================================================
// 📊 PRÉDICTEUR DE NOTE BAC
// ============================================================
const GradePredictor = {
  async predict() {
    if (!State.user || !State.profile) return null;
    
    // Collecter les données de performance
    const quizScores = await this.getQuizScores();
    const exerciseAccuracy = await this.getExerciseAccuracy();
    const studyTime = State.profile.totalStudyTime || 0;
    const streak = State.profile.streakBest || 0;
    
    // Algorithme de prédiction simple
    let baseScore = 10; // Note de base
    
    // Ajustements basés sur les performances
    if (quizScores.average >= 80) baseScore += 3;
    else if (quizScores.average >= 60) baseScore += 1.5;
    else if (quizScores.average < 40) baseScore -= 2;
    
    if (exerciseAccuracy >= 75) baseScore += 2;
    else if (exerciseAccuracy >= 50) baseScore += 1;
    
    if (streak >= 30) baseScore += 1;
    if (studyTime >= 50 * 60) baseScore += 1; // 50 heures
    
    // Limiter entre 0 et 20
    const predictedGrade = Math.max(0, Math.min(20, Math.round(baseScore * 10) / 10));
    
    return {
      grade: predictedGrade,
      confidence: this.calculateConfidence(quizScores.count),
      factors: {
        quizAverage: quizScores.average,
        exerciseAccuracy,
        studyTime,
        streak
      }
    };
  },
  
  async getQuizScores() {
    if (!State.user) return { average: 50, count: 0 };
    
    // Simulé - à remplacer par de vraies données
    return { average: 72, count: 15 };
  },
  
  async getExerciseAccuracy() {
    if (!State.user) return 60;
    return 68; // Simulé
  },
  
  calculateConfidence(dataPoints) {
    if (dataPoints >= 50) return 'Haute';
    if (dataPoints >= 20) return 'Moyenne';
    return 'Faible (plus de données nécessaires)';
  },
  
  render(app) {
    const sl = getSidebarLinks(State.profile.role);
    
    app.innerHTML = `
      <div class="layout-dashboard">
        <aside class="sidebar"><div class="sidebar-section">Menu</div>${sl}</aside>
        <main class="main-content animate-fade">
          <h1>📊 Prédicteur de Note BAC</h1>
          <p style="color:var(--text-secondary);margin-bottom:30px;">
            Basé sur tes performances, voici ta note probable au BAC
          </p>
          
          <div class="predictor-card card text-center" id="predictorCard">
            <div class="spinner" style="margin:30px auto;"></div>
            <p>Analyse en cours...</p>
          </div>
          
          <div class="predictor-tips card mt-3">
            <h3>🎯 Comment améliorer ta note prédite ?</h3>
            <ul style="margin-left:20px;margin-top:10px;">
              <li>📚 Fais plus de quiz et exercices</li>
              <li>🔥 Maintiens ton streak quotidien</li>
              <li>⏰ Augmente ton temps d'étude</li>
              <li>📋 Passe des examens blancs</li>
            </ul>
          </div>
        </main>
      </div>
    `;
    
    this.showPrediction();
  },
  
  async showPrediction() {
    const card = document.getElementById('predictorCard');
    if (!card) return;
    
    const prediction = await this.predict();
    
    if (!prediction) {
      card.innerHTML = '<p style="color:var(--danger);">Erreur lors de la prédiction</p>';
      return;
    }
    
    const gradeColor = prediction.grade >= 14 ? 'var(--success)' : 
                       prediction.grade >= 10 ? 'var(--accent)' : 'var(--danger)';
    
    card.innerHTML = `
      <div class="prediction-result">
        <div class="predicted-grade" style="font-size:5rem;font-weight:900;color:${gradeColor};">
          ${prediction.grade}/20
        </div>
        <p style="margin:15px 0;">
          Note prédite au BAC
          <span class="badge badge-info ml-1">Confiance: ${prediction.confidence}</span>
        </p>
        
        <div class="prediction-gauge" style="margin:20px 0;">
          <div class="gauge-bar">
            <div class="gauge-fill" style="width:${prediction.grade * 5}%;background:${gradeColor};"></div>
            <div class="gauge-marker" style="left:50%;">Moyenne</div>
          </div>
        </div>
        
        <div class="prediction-factors">
          <h4>Facteurs analysés :</h4>
          <div class="factors-grid">
            <div class="factor-item">
              <span class="factor-value">${prediction.factors.quizAverage}%</span>
              <span class="factor-label">Moyenne Quiz</span>
            </div>
            <div class="factor-item">
              <span class="factor-value">${prediction.factors.exerciseAccuracy}%</span>
              <span class="factor-label">Précision Exercices</span>
            </div>
            <div class="factor-item">
              <span class="factor-value">${prediction.factors.streak}</span>
              <span class="factor-label">Meilleur Streak</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }
};

// ============================================================
// 📱 VIDÉOS COURTES STYLE TIKTOK
// ============================================================
const ShortVideos = {
  videos: [
    { id: 1, title: 'Théorème de Pythagore en 60s', subject: 'Maths', duration: 60, thumbnail: '📐', likes: 234, author: 'Prof. Diallo' },
    { id: 2, title: 'Les 3 états de la matière', subject: 'Physique', duration: 45, thumbnail: '⚗️', likes: 189, author: 'Prof. Camara' },
    { id: 3, title: 'Accord du participe passé', subject: 'Français', duration: 55, thumbnail: '📝', likes: 156, author: 'Prof. Bah' },
    { id: 4, title: 'La Révolution Française', subject: 'Histoire', duration: 90, thumbnail: '🏰', likes: 201, author: 'Prof. Keita' },
    { id: 5, title: 'Photosynthèse simplifiée', subject: 'SVT', duration: 50, thumbnail: '🌱', likes: 178, author: 'Prof. Touré' },
    { id: 6, title: 'Équations du 2nd degré', subject: 'Maths', duration: 75, thumbnail: '📊', likes: 267, author: 'Prof. Diallo' },
    { id: 7, title: 'Les figures de style', subject: 'Français', duration: 65, thumbnail: '📚', likes: 143, author: 'Prof. Bah' },
    { id: 8, title: 'Loi d\'Ohm expliquée', subject: 'Physique', duration: 55, thumbnail: '⚡', likes: 198, author: 'Prof. Camara' }
  ],
  
  currentIndex: 0,
  
  render(app) {
    const sl = getSidebarLinks(State.profile.role);
    
    app.innerHTML = `
      <div class="layout-dashboard">
        <aside class="sidebar"><div class="sidebar-section">Menu</div>${sl}</aside>
        <main class="main-content animate-fade" style="padding:0;">
          <div class="shorts-container">
            <div class="shorts-header">
              <h2>📱 Leçons Express</h2>
              <p>Swipe pour apprendre rapidement</p>
            </div>
            
            <div class="shorts-player" id="shortsPlayer">
              ${this.renderVideo(this.videos[0])}
            </div>
            
            <div class="shorts-navigation">
              <button class="shorts-nav-btn" onclick="ShortVideos.prevVideo()">⬆️</button>
              <span>${this.currentIndex + 1}/${this.videos.length}</span>
              <button class="shorts-nav-btn" onclick="ShortVideos.nextVideo()">⬇️</button>
            </div>
          </div>
        </main>
      </div>
    `;
    
    // Ajouter le support swipe
    this.setupSwipe();
  },
  
  renderVideo(video) {
    return `
      <div class="short-video">
        <div class="video-content" style="background:linear-gradient(135deg,var(--primary),var(--accent));">
          <div class="video-thumbnail">${video.thumbnail}</div>
          <div class="video-play-btn" onclick="ShortVideos.playVideo(${video.id})">▶️</div>
        </div>
        
        <div class="video-info">
          <h3>${video.title}</h3>
          <p class="video-author">@${video.author}</p>
          <span class="badge badge-primary">${video.subject}</span>
          <span class="video-duration">⏱️ ${video.duration}s</span>
        </div>
        
        <div class="video-actions">
          <button class="action-btn" onclick="ShortVideos.likeVideo(${video.id})">
            <span>❤️</span>
            <span>${video.likes}</span>
          </button>
          <button class="action-btn" onclick="ShortVideos.shareVideo(${video.id})">
            <span>📤</span>
            <span>Partager</span>
          </button>
          <button class="action-btn" onclick="ShortVideos.saveVideo(${video.id})">
            <span>📌</span>
            <span>Sauver</span>
          </button>
        </div>
      </div>
    `;
  },
  
  nextVideo() {
    this.currentIndex = (this.currentIndex + 1) % this.videos.length;
    this.updatePlayer();
  },
  
  prevVideo() {
    this.currentIndex = (this.currentIndex - 1 + this.videos.length) % this.videos.length;
    this.updatePlayer();
  },
  
  updatePlayer() {
    const player = document.getElementById('shortsPlayer');
    if (player) {
      player.innerHTML = this.renderVideo(this.videos[this.currentIndex]);
    }
    
    const nav = document.querySelector('.shorts-navigation span');
    if (nav) {
      nav.textContent = `${this.currentIndex + 1}/${this.videos.length}`;
    }
  },
  
  playVideo(id) {
    const video = this.videos.find(v => v.id === id);
    if (!video) return;
    
    openModal(`
      <div class="video-player-modal">
        <div class="video-player" style="background:#000;border-radius:15px;aspect-ratio:9/16;max-width:300px;margin:0 auto;display:flex;flex-direction:column;align-items:center;justify-content:center;">
          <div style="font-size:5rem;">${video.thumbnail}</div>
          <p style="color:#fff;margin-top:20px;text-align:center;padding:0 20px;">${video.title}</p>
          <div class="video-progress mt-3" style="width:80%;">
            <div class="progress-bar" style="height:4px;">
              <div class="progress-fill" style="width:30%;animation:progress 60s linear;"></div>
            </div>
          </div>
        </div>
        <p class="text-center mt-2" style="color:var(--text-secondary);">
          Simulation - Les vraies vidéos arrivent bientôt !
        </p>
      </div>
    `);
    
    // Donner de l'XP pour avoir regardé
    GamificationEngine.addXP(5, 'Vidéo regardée');
  },
  
  likeVideo(id) {
    const video = this.videos.find(v => v.id === id);
    if (video) {
      video.likes++;
      this.updatePlayer();
      playSound('success');
    }
  },
  
  shareVideo(id) {
    const video = this.videos.find(v => v.id === id);
    if (video && navigator.share) {
      navigator.share({
        title: video.title,
        text: `Regarde cette leçon sur Neoclass : ${video.title}`,
        url: window.location.href
      });
    } else {
      showToast('Lien copié !', 'success');
    }
  },
  
  saveVideo(id) {
    showToast('Vidéo sauvegardée !', 'success');
  },
  
  setupSwipe() {
    const player = document.getElementById('shortsPlayer');
    if (!player) return;
    
    let startY = 0;
    
    player.addEventListener('touchstart', (e) => {
      startY = e.touches[0].clientY;
    });
    
    player.addEventListener('touchend', (e) => {
      const endY = e.changedTouches[0].clientY;
      const diff = startY - endY;
      
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          this.nextVideo();
        } else {
          this.prevVideo();
        }
      }
    });
  }
};

// ============================================================
// 🎧 RÉSUMÉS AUDIO
// ============================================================
const AudioSummaries = {
  summaries: [
    { id: 1, title: 'Chapitre 1: Les fonctions', subject: 'Maths', duration: '8:30', icon: '📐' },
    { id: 2, title: 'La Seconde Guerre Mondiale', subject: 'Histoire', duration: '12:45', icon: '📜' },
    { id: 3, title: 'La cellule végétale', subject: 'SVT', duration: '6:20', icon: '🌱' },
    { id: 4, title: 'Les connecteurs logiques', subject: 'Français', duration: '7:15', icon: '📝' },
    { id: 5, title: 'Les lois de Newton', subject: 'Physique', duration: '10:00', icon: '🍎' }
  ],
  
  currentPlaying: null,
  
  render(app) {
    const sl = getSidebarLinks(State.profile.role);
    
    app.innerHTML = `
      <div class="layout-dashboard">
        <aside class="sidebar"><div class="sidebar-section">Menu</div>${sl}</aside>
        <main class="main-content animate-fade">
          <h1>🎧 Résumés Audio</h1>
          <p style="color:var(--text-secondary);margin-bottom:20px;">
            Écoute tes leçons partout - dans le taxi, en marchant...
          </p>
          
          <div class="audio-filters mb-3">
            <button class="tab-btn active">Tous</button>
            <button class="tab-btn">Maths</button>
            <button class="tab-btn">Sciences</button>
            <button class="tab-btn">Français</button>
            <button class="tab-btn">Histoire</button>
          </div>
          
          <div class="audio-list">
            ${this.summaries.map(s => `
              <div class="audio-item card mb-2">
                <div class="audio-icon" style="background:linear-gradient(135deg,var(--primary),var(--accent));">
                  ${s.icon}
                </div>
                <div class="audio-info">
                  <h4>${s.title}</h4>
                  <div>
                    <span class="badge badge-primary">${s.subject}</span>
                    <span style="color:var(--text-secondary);margin-left:10px;">⏱️ ${s.duration}</span>
                  </div>
                </div>
                <div class="audio-actions">
                  <button class="btn btn-primary" onclick="AudioSummaries.play(${s.id})" style="width:50px;height:50px;border-radius:50%;">
                    ▶️
                  </button>
                  <button class="btn btn-outline" onclick="AudioSummaries.download(${s.id})" style="width:50px;height:50px;border-radius:50%;">
                    📥
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
          
          <div class="audio-download-all card mt-3 text-center" style="background:var(--bg);">
            <p>📱 Télécharge tous les résumés pour écouter hors-ligne</p>
            <button class="btn btn-accent mt-2">📥 Tout télécharger (Premium)</button>
          </div>
        </main>
      </div>
    `;
  },
  
  play(id) {
    const summary = this.summaries.find(s => s.id === id);
    if (!summary) return;
    
    openModal(`
      <div class="audio-player-modal text-center">
        <div style="font-size:5rem;margin-bottom:20px;">${summary.icon}</div>
        <h2>${summary.title}</h2>
        <span class="badge badge-primary">${summary.subject}</span>
        
        <div class="audio-progress mt-3" style="width:100%;">
          <div class="progress-bar" style="height:8px;cursor:pointer;">
            <div class="progress-fill" style="width:30%;"></div>
          </div>
          <div class="flex justify-between mt-1">
            <span style="font-size:.8rem;color:var(--text-secondary);">2:34</span>
            <span style="font-size:.8rem;color:var(--text-secondary);">${summary.duration}</span>
          </div>
        </div>
        
        <div class="audio-controls mt-3">
          <button class="btn btn-outline" style="width:50px;height:50px;border-radius:50%;">⏮️</button>
          <button class="btn btn-primary" style="width:70px;height:70px;border-radius:50%;font-size:1.5rem;">⏸️</button>
          <button class="btn btn-outline" style="width:50px;height:50px;border-radius:50%;">⏭️</button>
        </div>
        
        <div class="audio-speed mt-3">
          <button class="btn btn-ghost btn-sm">0.5x</button>
          <button class="btn btn-outline btn-sm">1x</button>
          <button class="btn btn-ghost btn-sm">1.5x</button>
          <button class="btn btn-ghost btn-sm">2x</button>
        </div>
      </div>
    `);
    
    // XP pour avoir écouté
    GamificationEngine.addXP(10, 'Audio écouté');
  },
  
  download(id) {
    showToast('Téléchargement en cours...', 'info');
    setTimeout(() => {
      showToast('Téléchargé ! Disponible hors-ligne', 'success');
    }, 2000);
  }
};

// ============================================================
// 📝 FICHES DE RÉVISION AUTO-GÉNÉRÉES
// ============================================================
const RevisionCards = {
  async generateForLesson(lessonId, lessonContent) {
    // Utiliser Darx (IA) pour générer les fiches
    const prompt = `Génère une fiche de révision concise pour cette leçon. Inclus: 
    - 5 points clés à retenir
    - 3 formules/définitions importantes 
    - 2 exemples pratiques
    Leçon: ${lessonContent}`;
    
    // Simulé - utiliser l'API Mistral en vrai
    return {
      keyPoints: [
        'Point clé 1',
        'Point clé 2', 
        'Point clé 3',
        'Point clé 4',
        'Point clé 5'
      ],
      formulas: [
        'Formule 1',
        'Formule 2',
        'Formule 3'
      ],
      examples: [
        'Exemple 1',
        'Exemple 2'
      ]
    };
  },
  
  render(app) {
    const sl = getSidebarLinks(State.profile.role);
    
    app.innerHTML = `
      <div class="layout-dashboard">
        <aside class="sidebar"><div class="sidebar-section">Menu</div>${sl}</aside>
        <main class="main-content animate-fade">
          <h1>📝 Fiches de Révision</h1>
          <p style="color:var(--text-secondary);margin-bottom:20px;">
            Fiches auto-générées par Darx pour réviser efficacement
          </p>
          
          <div class="revision-subjects">
            <div class="subject-card card" onclick="RevisionCards.showSubject('maths')">
              <span style="font-size:2.5rem;">📐</span>
              <h4>Mathématiques</h4>
              <span class="badge badge-primary">12 fiches</span>
            </div>
            <div class="subject-card card" onclick="RevisionCards.showSubject('physique')">
              <span style="font-size:2.5rem;">⚗️</span>
              <h4>Physique-Chimie</h4>
              <span class="badge badge-primary">8 fiches</span>
            </div>
            <div class="subject-card card" onclick="RevisionCards.showSubject('francais')">
              <span style="font-size:2.5rem;">📚</span>
              <h4>Français</h4>
              <span class="badge badge-primary">10 fiches</span>
            </div>
            <div class="subject-card card" onclick="RevisionCards.showSubject('histoire')">
              <span style="font-size:2.5rem;">📜</span>
              <h4>Histoire-Géo</h4>
              <span class="badge badge-primary">9 fiches</span>
            </div>
          </div>
          
          <div class="card mt-3" style="background:linear-gradient(135deg,var(--primary),var(--accent));color:#fff;">
            <h3 style="color:#fff;">🤖 Générer une nouvelle fiche</h3>
            <p>Colle le contenu de ta leçon et Darx créera une fiche de révision</p>
            <textarea class="form-input mt-2" id="lessonContent" rows="4" placeholder="Colle ta leçon ici..." style="background:rgba(255,255,255,0.9);color:#000;"></textarea>
            <button class="btn mt-2" style="background:#fff;color:var(--primary);" onclick="RevisionCards.generate()">
              ✨ Générer la fiche
            </button>
          </div>
        </main>
      </div>
    `;
  },
  
  showSubject(subject) {
    openModal(`
      <div class="revision-cards-list">
        <h2>${subject === 'maths' ? '📐 Mathématiques' : subject === 'physique' ? '⚗️ Physique-Chimie' : subject === 'francais' ? '📚 Français' : '📜 Histoire-Géo'}</h2>
        
        <div class="cards-grid mt-3">
          <div class="revision-card-preview" onclick="RevisionCards.viewCard(1)">
            <h4>📌 Fonctions affines</h4>
            <p>5 points clés • 3 formules</p>
          </div>
          <div class="revision-card-preview" onclick="RevisionCards.viewCard(2)">
            <h4>📌 Équations du 2nd degré</h4>
            <p>5 points clés • 4 formules</p>
          </div>
          <div class="revision-card-preview" onclick="RevisionCards.viewCard(3)">
            <h4>📌 Trigonométrie</h4>
            <p>6 points clés • 5 formules</p>
          </div>
        </div>
      </div>
    `);
  },
  
  viewCard(id) {
    openModal(`
      <div class="revision-card-detail">
        <h2>📌 Fonctions affines</h2>
        
        <div class="card-section">
          <h4>🔑 Points clés</h4>
          <ul>
            <li>Une fonction affine est de la forme f(x) = ax + b</li>
            <li>a est le coefficient directeur (pente)</li>
            <li>b est l'ordonnée à l'origine</li>
            <li>Si a > 0, la fonction est croissante</li>
            <li>Si a < 0, la fonction est décroissante</li>
          </ul>
        </div>
        
        <div class="card-section">
          <h4>📐 Formules</h4>
          <div class="formula">a = (y₂ - y₁) / (x₂ - x₁)</div>
          <div class="formula">f(x) = ax + b</div>
          <div class="formula">y = mx + p (autre notation)</div>
        </div>
        
        <div class="card-section">
          <h4>💡 Exemples</h4>
          <p>f(x) = 2x + 3 : pente = 2, ordonnée à l'origine = 3</p>
          <p>g(x) = -x + 1 : fonction décroissante</p>
        </div>
        
        <div class="flex gap-2 mt-3">
          <button class="btn btn-primary" onclick="RevisionCards.startRevision(1)">📚 Réviser</button>
          <button class="btn btn-outline" onclick="RevisionCards.downloadPDF(1)">📥 PDF</button>
        </div>
      </div>
    `);
  },
  
  async generate() {
    const content = document.getElementById('lessonContent')?.value;
    if (!content || content.length < 50) {
      showToast('Ajoute plus de contenu (min 50 caractères)', 'error');
      return;
    }
    
    showToast('Darx génère ta fiche...', 'info');
    
    // Simuler la génération
    setTimeout(() => {
      showToast('Fiche générée avec succès !', 'success');
      this.viewCard(999);
    }, 2000);
  },
  
  startRevision(id) {
    closeModal();
    navigate('flashcards', { cardId: id });
  },
  
  downloadPDF(id) {
    showToast('Téléchargement du PDF...', 'info');
  }
};

// ============================================================
// 👥 GROUPES D'ÉTUDE VIRTUELS
// ============================================================
if (typeof StudyGroups === 'undefined') {
var StudyGroups = {
  groups: [
    { id: 1, name: 'BAC 2026 Maths SM', members: 45, active: true, icon: '📐' },
    { id: 2, name: 'Prépa BEPC Conakry', members: 78, active: true, icon: '📚' },
    { id: 3, name: 'Physique-Chimie T12', members: 32, active: false, icon: '⚗️' }
  ],
  
  render(app) {
    const sl = getSidebarLinks(State.profile.role);
    
    app.innerHTML = `
      <div class="layout-dashboard">
        <aside class="sidebar"><div class="sidebar-section">Menu</div>${sl}</aside>
        <main class="main-content animate-fade">
          <div class="flex justify-between items-center mb-3">
            <h1>👥 Groupes d'Étude</h1>
            <button class="btn btn-primary" onclick="StudyGroups.createGroup()">+ Créer un groupe</button>
          </div>
          
          <div class="groups-list">
            ${this.groups.map(g => `
              <div class="group-card card mb-2" onclick="StudyGroups.enterGroup(${g.id})">
                <div class="group-icon">${g.icon}</div>
                <div class="group-info">
                  <h3>${g.name}</h3>
                  <div class="group-meta">
                    <span>👥 ${g.members} membres</span>
                    ${g.active ? '<span class="badge badge-success">En ligne</span>' : '<span class="badge">Hors ligne</span>'}
                  </div>
                </div>
                <button class="btn btn-outline">Rejoindre</button>
              </div>
            `).join('')}
          </div>
          
          <div class="card mt-3">
            <h3>🔍 Trouver un groupe</h3>
            <div class="flex gap-2 mt-2">
              <input type="text" class="form-input" placeholder="Rechercher...">
              <button class="btn btn-primary">Rechercher</button>
            </div>
          </div>
        </main>
      </div>
    `;
  },
  
  enterGroup(id) {
    navigate('group-chat', { groupId: id });
  },
  
  createGroup() {
    openModal(`
      <div class="create-group-modal">
        <h2>Créer un groupe d'étude</h2>
        <div class="form-group mt-3">
          <label>Nom du groupe</label>
          <input type="text" class="form-input" placeholder="Ex: BAC 2026 Sciences">
        </div>
        <div class="form-group">
          <label>Matière principale</label>
          <select class="form-input">
            <option>Mathématiques</option>
            <option>Physique-Chimie</option>
            <option>SVT</option>
            <option>Français</option>
            <option>Histoire-Géo</option>
          </select>
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea class="form-input" rows="3" placeholder="Décris ton groupe..."></textarea>
        </div>
        <div class="flex gap-2 mt-3">
          <button class="btn btn-outline" onclick="closeModal()">Annuler</button>
          <button class="btn btn-primary">Créer le groupe</button>
        </div>
      </div>
    `);
  }
};
}

// ============================================================
// 💬 FORUM Q&A
// ============================================================
const ForumQA = {
  questions: [
    { id: 1, title: 'Comment résoudre une équation du 2nd degré ?', author: 'Mamadou', votes: 23, answers: 5, subject: 'Maths', solved: true },
    { id: 2, title: 'Différence entre mitose et méiose ?', author: 'Fatoumata', votes: 18, answers: 3, subject: 'SVT', solved: true },
    { id: 3, title: 'Qu\'est-ce que la photosynthèse ?', author: 'Ibrahima', votes: 12, answers: 2, subject: 'SVT', solved: false }
  ],
  
  render(app) {
    const sl = getSidebarLinks(State.profile.role);
    
    app.innerHTML = `
      <div class="layout-dashboard">
        <aside class="sidebar"><div class="sidebar-section">Menu</div>${sl}</aside>
        <main class="main-content animate-fade">
          <div class="flex justify-between items-center mb-3">
            <h1>💬 Forum Q&A</h1>
            <button class="btn btn-primary" onclick="ForumQA.askQuestion()">❓ Poser une question</button>
          </div>
          
          <div class="forum-filters mb-3">
            <button class="tab-btn active">Récentes</button>
            <button class="tab-btn">Populaires</button>
            <button class="tab-btn">Non résolues</button>
          </div>
          
          <div class="questions-list">
            ${this.questions.map(q => `
              <div class="question-card card mb-2" onclick="ForumQA.viewQuestion(${q.id})">
                <div class="question-votes">
                  <button class="vote-btn">▲</button>
                  <span class="vote-count">${q.votes}</span>
                  <button class="vote-btn">▼</button>
                </div>
                <div class="question-content">
                  <h4>${q.solved ? '✅' : '❓'} ${q.title}</h4>
                  <div class="question-meta">
                    <span class="badge badge-primary">${q.subject}</span>
                    <span>par ${q.author}</span>
                    <span>💬 ${q.answers} réponses</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </main>
      </div>
    `;
  },
  
  askQuestion() {
    openModal(`
      <div class="ask-question-modal">
        <h2>❓ Poser une question</h2>
        <div class="form-group mt-3">
          <label>Titre de ta question</label>
          <input type="text" class="form-input" placeholder="Sois précis et concis">
        </div>
        <div class="form-group">
          <label>Matière</label>
          <select class="form-input">
            <option>Mathématiques</option>
            <option>Physique-Chimie</option>
            <option>SVT</option>
            <option>Français</option>
          </select>
        </div>
        <div class="form-group">
          <label>Détails</label>
          <textarea class="form-input" rows="5" placeholder="Explique ton problème en détail..."></textarea>
        </div>
        <div class="flex gap-2 mt-3">
          <button class="btn btn-outline" onclick="closeModal()">Annuler</button>
          <button class="btn btn-primary">Publier</button>
        </div>
      </div>
    `);
  },
  
  viewQuestion(id) {
    openModal(`
      <div class="question-detail">
        <h2>Comment résoudre une équation du 2nd degré ?</h2>
        <span class="badge badge-primary">Maths</span>
        <span class="badge badge-success">Résolu ✅</span>
        
        <div class="question-body mt-3">
          <p>J'ai du mal à comprendre comment utiliser le discriminant. Pouvez-vous m'expliquer ?</p>
        </div>
        
        <h4 class="mt-3">💬 Réponses (5)</h4>
        
        <div class="answer-card mt-2" style="background:var(--bg);padding:15px;border-radius:10px;border-left:3px solid var(--success);">
          <div class="answer-header flex justify-between">
            <strong>Prof. Diallo</strong>
            <span class="badge badge-success">Meilleure réponse</span>
          </div>
          <p class="mt-2">Pour résoudre ax² + bx + c = 0 :</p>
          <ol style="margin-left:20px;">
            <li>Calcule Δ = b² - 4ac</li>
            <li>Si Δ > 0 : deux solutions x = (-b ± √Δ) / 2a</li>
            <li>Si Δ = 0 : une solution x = -b / 2a</li>
            <li>Si Δ < 0 : pas de solution réelle</li>
          </ol>
          <div class="answer-actions mt-2">
            <button class="btn btn-ghost btn-sm">👍 23</button>
            <button class="btn btn-ghost btn-sm">💬 Répondre</button>
          </div>
        </div>
      </div>
    `);
  }
};

// ============================================================
// 🔔 NOTIFICATIONS INTELLIGENTES
// ============================================================
const SmartNotifications = {
  schedule: {
    studyReminder: true,
    streakAlert: true,
    examTips: true,
    motivational: true
  },
  
  async checkAndNotify() {
    if (!State.user || !State.profile) return;
    
    const now = new Date();
    const hour = now.getHours();
    
    // Rappel d'étude le soir
    if (hour === 19 && this.schedule.studyReminder) {
      if (!State.profile.lastActivityDate || 
          new Date(State.profile.lastActivityDate).toDateString() !== now.toDateString()) {
        this.showNotification({
          title: '📚 Temps d\'étudier !',
          body: 'Tu n\'as pas encore étudié aujourd\'hui. 15 minutes suffisent !',
          action: () => navigate('courses')
        });
      }
    }
    
    // Alerte streak en danger
    if (this.schedule.streakAlert && State.profile.streakCurrent > 0) {
      const lastActivity = new Date(State.profile.lastActivityDate);
      const hoursAgo = (now - lastActivity) / (1000 * 60 * 60);
      
      if (hoursAgo > 20 && hoursAgo < 24) {
        this.showNotification({
          title: '🔥 Streak en danger !',
          body: `Tu vas perdre ta série de ${State.profile.streakCurrent} jours ! Connecte-toi vite !`,
          urgent: true,
          action: () => navigate('dashboard')
        });
      }
    }
    
    // Citation motivationnelle le matin
    if (hour === 7 && this.schedule.motivational) {
      const quotes = [
        'Le succès est la somme de petits efforts répétés jour après jour. 💪',
        'Chaque expert était autrefois un débutant. Continue ! 🌟',
        'Le BAC n\'est qu\'une étape, tu vas y arriver ! 🎓'
      ];
      this.showNotification({
        title: '☀️ Bonjour !',
        body: quotes[Math.floor(Math.random() * quotes.length)]
      });
    }
  },
  
  showNotification(notif) {
    // In-app notification
    const container = document.createElement('div');
    container.className = `smart-notification ${notif.urgent ? 'urgent' : ''}`;
    container.innerHTML = `
      <div class="notif-icon">${notif.urgent ? '⚠️' : '🔔'}</div>
      <div class="notif-content">
        <strong>${notif.title}</strong>
        <p>${notif.body}</p>
      </div>
      <button class="notif-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    if (notif.action) {
      container.style.cursor = 'pointer';
      container.onclick = () => {
        notif.action();
        container.remove();
      };
    }
    
    document.body.appendChild(container);
    
    // Supprimer après 10 secondes
    setTimeout(() => container.remove(), 10000);
    
    // Browser notification si permission
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notif.title, { body: notif.body });
    }
  },
  
  async requestPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }
};

// ============================================================
// 🎯 OBJECTIFS HEBDOMADAIRES
// ============================================================
const WeeklyGoals = {
  defaultGoals: [
    { id: 'lessons', name: 'Leçons complétées', target: 5, icon: '📖' },
    { id: 'exercises', name: 'Exercices réussis', target: 20, icon: '✏️' },
    { id: 'quizzes', name: 'Quiz passés', target: 3, icon: '📋' },
    { id: 'studyTime', name: 'Heures d\'étude', target: 5, icon: '⏰' }
  ],
  
  async getCurrentProgress() {
    if (!State.user) return {};
    
    // Simulé - à remplacer par de vraies données
    return {
      lessons: 3,
      exercises: 12,
      quizzes: 1,
      studyTime: 2.5
    };
  },
  
  async render(app) {
    const sl = getSidebarLinks(State.profile.role);
    const progress = await this.getCurrentProgress();
    
    app.innerHTML = `
      <div class="layout-dashboard">
        <aside class="sidebar"><div class="sidebar-section">Menu</div>${sl}</aside>
        <main class="main-content animate-fade">
          <h1>🎯 Objectifs de la semaine</h1>
          <p style="color:var(--text-secondary);margin-bottom:20px;">
            Atteins tes objectifs pour gagner des bonus XP !
          </p>
          
          <div class="weekly-progress-card card" style="background:linear-gradient(135deg,var(--primary),var(--accent));color:#fff;margin-bottom:30px;">
            <div class="flex justify-between items-center">
              <div>
                <h3 style="color:#fff;">Progression globale</h3>
                <p>Semaine du ${this.getWeekRange()}</p>
              </div>
              <div class="overall-progress">
                <div class="progress-circle" style="--progress:${this.calculateOverallProgress(progress)}%;">
                  <span>${this.calculateOverallProgress(progress)}%</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="goals-grid">
            ${this.defaultGoals.map(goal => {
              const current = progress[goal.id] || 0;
              const percent = Math.min(100, Math.round((current / goal.target) * 100));
              const completed = current >= goal.target;
              
              return `
                <div class="goal-card card ${completed ? 'completed' : ''}">
                  <div class="goal-icon">${goal.icon}</div>
                  <h4>${goal.name}</h4>
                  <div class="goal-progress">
                    <div class="progress-bar">
                      <div class="progress-fill" style="width:${percent}%;${completed ? 'background:var(--success);' : ''}"></div>
                    </div>
                    <span class="goal-count">${current}/${goal.target}</span>
                  </div>
                  ${completed ? '<div class="goal-badge">✅ Complété!</div>' : ''}
                </div>
              `;
            }).join('')}
          </div>
          
          <div class="weekly-reward card mt-3 text-center">
            <h3>🏆 Récompense de la semaine</h3>
            <p>Complète tous tes objectifs pour gagner :</p>
            <div class="reward-preview">
              <span class="reward-xp">+500 XP</span>
              <span class="reward-nc">+100 NC</span>
              <span class="reward-badge">🏅 Badge "Semaine parfaite"</span>
            </div>
          </div>
        </main>
      </div>
    `;
  },
  
  getWeekRange() {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + 1);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    return `${monday.getDate()}/${monday.getMonth() + 1} - ${sunday.getDate()}/${sunday.getMonth() + 1}`;
  },
  
  calculateOverallProgress(progress) {
    let total = 0;
    this.defaultGoals.forEach(goal => {
      const current = progress[goal.id] || 0;
      total += Math.min(100, (current / goal.target) * 100);
    });
    return Math.round(total / this.defaultGoals.length);
  }
};

// ============================================================
// 🏅 CERTIFICATS PARTAGEABLES
// ============================================================
const Certificates = {
  types: {
    course: { icon: '📚', name: 'Certificat de cours' },
    level: { icon: '🎓', name: 'Certificat de niveau' },
    badge: { icon: '🏅', name: 'Certificat de badge' },
    exam: { icon: '📋', name: 'Certificat d\'examen' }
  },
  
  async generate(type, data) {
    const template = this.types[type];
    if (!template) return null;
    
    const certificate = {
      id: `CERT-${Date.now()}`,
      type,
      recipientName: State.profile.displayName,
      date: new Date().toISOString(),
      ...data
    };
    
    // Sauvegarder
    if (State.user) {
      await db.collection('certificates').add({
        userId: State.user.uid,
        ...certificate
      });
    }
    
    return certificate;
  },
  
  render(app) {
    const sl = getSidebarLinks(State.profile.role);
    
    app.innerHTML = `
      <div class="layout-dashboard">
        <aside class="sidebar"><div class="sidebar-section">Menu</div>${sl}</aside>
        <main class="main-content animate-fade">
          <h1>🏅 Mes Certificats</h1>
          <p style="color:var(--text-secondary);margin-bottom:20px;">
            Tes réussites officielles - partage-les sur les réseaux !
          </p>
          
          <div class="certificates-grid">
            <div class="certificate-card card" onclick="Certificates.viewCertificate('level-5')">
              <div class="cert-preview" style="background:linear-gradient(135deg,#fbbf24,#f59e0b);">
                <span>🎓</span>
              </div>
              <h4>Niveau 5 atteint</h4>
              <span class="badge badge-accent">Élève Distingué</span>
              <p style="font-size:.8rem;color:var(--text-secondary);">Obtenu le 15/02/2026</p>
            </div>
            
            <div class="certificate-card card" onclick="Certificates.viewCertificate('maths-101')">
              <div class="cert-preview" style="background:linear-gradient(135deg,#6c63ff,#8b83ff);">
                <span>📐</span>
              </div>
              <h4>Fonctions affines</h4>
              <span class="badge badge-primary">Cours complété</span>
              <p style="font-size:.8rem;color:var(--text-secondary);">Obtenu le 10/02/2026</p>
            </div>
          </div>
        </main>
      </div>
    `;
  },
  
  viewCertificate(id) {
    openModal(`
      <div class="certificate-view text-center">
        <div class="certificate" style="background:linear-gradient(135deg,#fef3c7,#fcd34d);padding:30px;border-radius:20px;border:5px solid #f59e0b;">
          <div style="border:2px dashed #f59e0b;padding:20px;border-radius:15px;">
            <h1 style="font-family:serif;color:#78350f;">CERTIFICAT</h1>
            <p style="color:#92400e;margin:10px 0;">Ce certificat est décerné à</p>
            <h2 style="color:#78350f;font-size:1.8rem;">${State.profile.displayName || 'Élève'}</h2>
            <p style="color:#92400e;margin:15px 0;">pour avoir atteint le</p>
            <h3 style="color:#78350f;">🎓 Niveau 5 - Élève Distingué</h3>
            <p style="color:#92400e;font-size:.9rem;margin-top:20px;">Neoclass - L'excellence à portée de main</p>
            <p style="color:#92400e;font-size:.8rem;">15 Février 2026</p>
          </div>
        </div>
        
        <div class="flex gap-2 justify-center mt-3">
          <button class="btn btn-primary" onclick="Certificates.share()">📤 Partager</button>
          <button class="btn btn-accent" onclick="Certificates.download()">📥 Télécharger</button>
        </div>
      </div>
    `);
  },
  
  share() {
    if (navigator.share) {
      navigator.share({
        title: 'Mon certificat Neoclass',
        text: 'J\'ai atteint le Niveau 5 sur Neoclass ! 🎓',
        url: window.location.href
      });
    } else {
      showToast('Lien copié ! Partage-le sur WhatsApp', 'success');
    }
  },
  
  download() {
    showToast('Téléchargement du certificat...', 'info');
    // Utiliser jsPDF pour générer le PDF
  }
};

// ============================================================
// 💰 PAIEMENT MOBILE MONEY
// ============================================================
const MobilePayment = {
  providers: [
    { id: 'orange', name: 'Orange Money', icon: '🟠', prefix: '62' },
    { id: 'mtn', name: 'MTN Money', icon: '🟡', prefix: '66' },
    { id: 'visa', name: 'Carte Visa', icon: '💳', prefix: '' }
  ],
  
  render(app) {
    const sl = getSidebarLinks(State.profile.role);
    
    app.innerHTML = `
      <div class="layout-dashboard">
        <aside class="sidebar"><div class="sidebar-section">Menu</div>${sl}</aside>
        <main class="main-content animate-fade">
          <h1>💰 Abonnement Premium</h1>
          
          <div class="pricing-cards">
            <div class="pricing-card card">
              <div class="pricing-badge">Bronze</div>
              <h3>15 000 GNF</h3>
              <span>/mois</span>
              <ul>
                <li>✅ Cours illimités</li>
                <li>✅ Quiz et exercices</li>
                <li>❌ Pas de vidéos</li>
                <li>❌ Pas de certificats</li>
              </ul>
              <button class="btn btn-outline btn-block" onclick="MobilePayment.subscribe('bronze')">Choisir</button>
            </div>
            
            <div class="pricing-card card popular" style="border-color:var(--accent);transform:scale(1.05);">
              <div class="pricing-badge" style="background:var(--accent);color:#000;">🔥 Populaire</div>
              <h3>30 000 GNF</h3>
              <span>/mois</span>
              <ul>
                <li>✅ Tout Bronze +</li>
                <li>✅ Vidéos HD</li>
                <li>✅ Résumés audio</li>
                <li>✅ Certificats</li>
              </ul>
              <button class="btn btn-accent btn-block" onclick="MobilePayment.subscribe('silver')">Choisir</button>
            </div>
            
            <div class="pricing-card card" style="background:linear-gradient(135deg,#fbbf24,#f59e0b);color:#000;">
              <div class="pricing-badge" style="background:#000;color:#fbbf24;">👑 VIP</div>
              <h3>50 000 GNF</h3>
              <span>/mois</span>
              <ul style="color:#000;">
                <li>✅ Tout Silver +</li>
                <li>✅ Mentorat 1-on-1</li>
                <li>✅ Examens illimités</li>
                <li>✅ Support prioritaire</li>
              </ul>
              <button class="btn btn-block" style="background:#000;color:#fbbf24;" onclick="MobilePayment.subscribe('gold')">Choisir</button>
            </div>
          </div>
        </main>
      </div>
    `;
  },
  
  subscribe(plan) {
    const prices = { bronze: 15000, silver: 30000, gold: 50000 };
    const price = prices[plan];
    
    openModal(`
      <div class="payment-modal">
        <h2>💰 Paiement - ${plan.charAt(0).toUpperCase() + plan.slice(1)}</h2>
        <p class="text-center" style="font-size:1.5rem;font-weight:700;color:var(--accent);">${price.toLocaleString()} GNF</p>
        
        <div class="payment-methods mt-3">
          ${this.providers.map(p => `
            <div class="payment-method" onclick="MobilePayment.selectProvider('${p.id}')">
              <span style="font-size:2rem;">${p.icon}</span>
              <span>${p.name}</span>
            </div>
          `).join('')}
        </div>
        
        <div id="paymentForm" class="mt-3" style="display:none;">
          <div class="form-group">
            <label>Numéro de téléphone</label>
            <input type="tel" class="form-input" id="paymentPhone" placeholder="6X XXX XX XX">
          </div>
          <button class="btn btn-primary btn-block" onclick="MobilePayment.processPayment('${plan}')">
            Payer ${price.toLocaleString()} GNF
          </button>
        </div>
      </div>
    `);
  },
  
  selectProvider(providerId) {
    document.querySelectorAll('.payment-method').forEach(el => el.classList.remove('selected'));
    event.currentTarget.classList.add('selected');
    document.getElementById('paymentForm').style.display = 'block';
    this.selectedProvider = providerId;
  },
  
  async processPayment(plan) {
    const phone = document.getElementById('paymentPhone')?.value;
    if (!phone || phone.length < 9) {
      showToast('Numéro invalide', 'error');
      return;
    }
    
    openModal(`
      <div class="text-center">
        <div class="spinner" style="margin:30px auto;"></div>
        <h3>Traitement en cours...</h3>
        <p style="color:var(--text-secondary);">Un code USSD va être envoyé sur votre téléphone</p>
      </div>
    `);
    
    // Simuler le traitement
    setTimeout(() => {
      openModal(`
        <div class="text-center">
          <div style="font-size:5rem;">✅</div>
          <h2 style="color:var(--success);">Paiement réussi !</h2>
          <p>Bienvenue dans Neoclass ${plan.charAt(0).toUpperCase() + plan.slice(1)} !</p>
          <button class="btn btn-primary mt-3" onclick="closeModal();navigate('dashboard');">
            Commencer à apprendre
          </button>
        </div>
      `);
      
      launchConfetti();
    }, 3000);
  }
};

// ============================================================
// 📶 MODE DATA-LIGHT
// ============================================================
const DataLightMode = {
  enabled: false,
  
  toggle() {
    this.enabled = !this.enabled;
    document.body.classList.toggle('low-data-mode', this.enabled);
    localStorage.setItem('dataLightMode', this.enabled);
    
    if (this.enabled) {
      showToast('📶 Mode économie de données activé', 'info');
    } else {
      showToast('Mode normal activé', 'info');
    }
  },
  
  init() {
    this.enabled = localStorage.getItem('dataLightMode') === 'true';
    if (this.enabled) {
      document.body.classList.add('low-data-mode');
    }
  },
  
  // Compresser les images
  optimizeImage(url, quality = 50) {
    if (this.enabled && url) {
      // Ajouter des paramètres de compression si c'est un service d'images
      return url.replace(/\.(jpg|jpeg|png)/, `.$1?quality=${quality}`);
    }
    return url;
  }
};

// ============================================================
// 🎮 FLASHCARDS INTERACTIVES AVEC IA
// ============================================================
const Flashcards = {
  cards: [],
  defaultCards: [
    { id: 1, front: 'Qu\'est-ce que Δ (discriminant) ?', back: 'Δ = b² - 4ac dans ax² + bx + c = 0', subject: 'Maths' },
    { id: 2, front: 'Formule de la vitesse ?', back: 'v = d / t (distance / temps)', subject: 'Physique' },
    { id: 3, front: 'Conjuguez "être" au subjonctif présent', back: 'que je sois, que tu sois, qu\'il soit...', subject: 'Français' },
    { id: 4, front: 'Quelle est la formule de l\'aire d\'un cercle ?', back: 'A = πr² (pi fois le rayon au carré)', subject: 'Maths' },
    { id: 5, front: 'Quel est le symbole chimique de l\'eau ?', back: 'H₂O (2 atomes d\'hydrogène + 1 oxygène)', subject: 'Chimie' }
  ],
  
  currentIndex: 0,
  flipped: false,
  isLoading: false,
  
  render(app) {
    if (this.cards.length === 0) {
      this.cards = [...this.defaultCards];
    }
    
    const sl = getSidebarLinks(State.profile?.role || 'student');
    const sys = State.profile?.system || 'guinea';
    const data = eduData[sys];
    const subjects = [...new Set([...(data?.subjects?.primary||[]), ...(data?.subjects?.middle||[])])];
    
    app.innerHTML = `
      <div class="layout-dashboard">
        <aside class="sidebar"><div class="sidebar-section">Menu</div>${sl}</aside>
        <main class="main-content animate-fade">
          <div class="flex justify-between items-center mb-3">
            <h1>🃏 Flashcards IA</h1>
            <button class="btn btn-primary" onclick="Flashcards.openGenerator()">🤖 Générer avec IA</button>
          </div>
          
          ${this.isLoading ? `
            <div class="card text-center p-4">
              <div class="spinner"></div>
              <p style="color:var(--primary);font-weight:600;margin-top:15px;">🤖 DARX génère vos flashcards...</p>
            </div>
          ` : `
            <div class="flashcard-container" onclick="Flashcards.flip()">
              <div class="flashcard ${this.flipped ? 'flipped' : ''}" id="currentFlashcard">
                <div class="flashcard-front">
                  <span class="badge badge-primary">${this.cards[this.currentIndex]?.subject || 'Général'}</span>
                  <p style="font-size:1.2rem;margin-top:20px;">${this.cards[this.currentIndex]?.front || 'Question'}</p>
                </div>
                <div class="flashcard-back">
                  <p style="font-size:1.1rem;">${this.cards[this.currentIndex]?.back || 'Réponse'}</p>
                </div>
              </div>
              <p class="text-center mt-2" style="color:var(--text-secondary);">👆 Clique pour retourner</p>
            </div>
            
            <div class="flashcard-controls mt-3">
              <button class="btn btn-danger" onclick="Flashcards.answer(false)">❌ Je ne savais pas</button>
              <button class="btn btn-success" onclick="Flashcards.answer(true)">✅ Je savais</button>
            </div>
            
            <div class="flashcard-progress mt-3">
              <span style="font-weight:600;">${this.currentIndex + 1} / ${this.cards.length}</span>
              <div class="progress-bar" style="flex:1;margin-left:15px;">
                <div class="progress-fill" style="width:${((this.currentIndex + 1) / this.cards.length) * 100}%;"></div>
              </div>
            </div>
            
            <div class="flex gap-2 mt-3 justify-center">
              <button class="btn btn-primary" onclick="Flashcards.downloadPDF()">📥 Télécharger PDF</button>
              <button class="btn btn-outline" onclick="Flashcards.share()">📤 Partager</button>
            </div>
          `}
          
          <div class="card mt-3" style="background:linear-gradient(135deg, #f0f4ff, #e8f5e9);">
            <h3>💡 Conseils</h3>
            <ul style="margin:10px 0 0 20px;">
              <li>Révise tes flashcards tous les jours pour mieux mémoriser</li>
              <li>Si tu ne connais pas la réponse, la carte reviendra plus tard</li>
              <li>Génère des flashcards IA sur n'importe quel sujet !</li>
            </ul>
          </div>
        </main>
      </div>
    `;
  },
  
  openGenerator() {
    const sys = State.profile?.system || 'guinea';
    const data = eduData[sys];
    const subjects = [...new Set([...(data?.subjects?.primary||[]), ...(data?.subjects?.middle||[])])];
    
    openModal(`
      <div style="max-width:500px;">
        <h2>🤖 Générer des Flashcards avec IA</h2>
        <p style="color:var(--text-secondary);margin:10px 0;">DARX va créer des flashcards personnalisées pour toi.</p>
        
        <div class="form-group">
          <label>Matière</label>
          <select class="form-input" id="fcSubject">
            ${subjects.map(s => `<option>${s}</option>`).join('')}
          </select>
        </div>
        
        <div class="form-group">
          <label>Sujet / Chapitre</label>
          <input class="form-input" id="fcTopic" placeholder="Ex: Les fractions, La Révolution française..." />
        </div>
        
        <div class="form-group">
          <label>Nombre de cartes</label>
          <select class="form-input" id="fcCount">
            <option value="5">5 cartes</option>
            <option value="10" selected>10 cartes</option>
            <option value="15">15 cartes</option>
            <option value="20">20 cartes</option>
          </select>
        </div>
        
        <div class="flex gap-2 mt-3">
          <button class="btn btn-primary" onclick="Flashcards.generateWithAI()">🚀 Générer</button>
          <button class="btn btn-outline" onclick="closeModal()">Annuler</button>
        </div>
      </div>
    `);
  },
  
  async generateWithAI() {
    const subject = document.getElementById('fcSubject')?.value || 'Mathématiques';
    const topic = document.getElementById('fcTopic')?.value?.trim() || subject;
    const count = parseInt(document.getElementById('fcCount')?.value) || 10;
    const level = State.profile?.level || '9ème';
    
    closeModal();
    this.isLoading = true;
    this.render(document.getElementById('app'));
    
    const prompt = `Tu es un professeur expert. Génère exactement ${count} flashcards pour un élève de ${level} sur le sujet: "${topic}" (matière: ${subject}).

IMPORTANT: Réponds UNIQUEMENT avec un tableau JSON valide, sans texte avant ni après.
Format exact:
[
  {"front": "Question 1?", "back": "Réponse 1"},
  {"front": "Question 2?", "back": "Réponse 2"}
]

Les questions doivent être claires, les réponses concises et éducatives.`;
    
    try {
      const res = await fetch('http://127.0.0.1:3001/api/darx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, userContext: { role: 'student', classe: level } })
      });
      const data = await res.json();
      
      // Parser la réponse JSON
      let generatedCards = [];
      try {
        const answer = data.answer || '[]';
        // Extraire le JSON de la réponse
        const jsonMatch = answer.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          generatedCards = JSON.parse(jsonMatch[0]);
        }
      } catch(e) {
        console.error('Erreur parsing flashcards:', e);
      }
      
      if (generatedCards.length > 0) {
        this.cards = generatedCards.map((c, i) => ({
          id: i + 1,
          front: c.front || c.question || 'Question',
          back: c.back || c.answer || c.reponse || 'Réponse',
          subject: subject
        }));
        this.currentIndex = 0;
        this.flipped = false;
        showToast(`✅ ${this.cards.length} flashcards générées !`, 'success');
        GamificationEngine.addXP(20, 'Flashcards IA générées');
      } else {
        showToast('Erreur de génération, essaie encore', 'error');
        this.cards = [...this.defaultCards];
      }
      
    } catch(e) {
      console.error('Erreur génération flashcards:', e);
      showToast('❌ Serveur IA indisponible. Lance: node ai.js', 'error');
      this.cards = [...this.defaultCards];
    }
    
    this.isLoading = false;
    this.render(document.getElementById('app'));
  },
  
  flip() {
    this.flipped = !this.flipped;
    const card = document.getElementById('currentFlashcard');
    if (card) {
      card.classList.toggle('flipped', this.flipped);
    }
  },
  
  answer(correct) {
    if (correct) {
      if (typeof GamificationEngine !== 'undefined') GamificationEngine.addXP(5, 'Flashcard correcte');
      if (typeof playSound === 'function') playSound('success');
    } else {
      // Remettre la carte à la fin pour la revoir
      const card = this.cards.splice(this.currentIndex, 1)[0];
      this.cards.push(card);
    }
    
    this.flipped = false;
    
    if (this.currentIndex < this.cards.length - 1 || !correct) {
      this.currentIndex = correct ? this.currentIndex + 1 : this.currentIndex;
      if (this.currentIndex >= this.cards.length) this.currentIndex = 0;
      this.render(document.getElementById('app'));
    } else {
      // Session terminée
      openModal(`
        <div class="text-center">
          <div style="font-size:5rem;">🎉</div>
          <h2>Session terminée !</h2>
          <p>Tu as révisé ${this.cards.length} cartes</p>
          <div class="flex gap-2 mt-3 justify-center">
            <button class="btn btn-primary" onclick="Flashcards.downloadPDF();closeModal();">📥 PDF</button>
            <button class="btn btn-accent" onclick="closeModal();navigate('dashboard');">Continuer</button>
          </div>
        </div>
      `);
      if (typeof launchConfetti === 'function') launchConfetti();
    }
  },
  
  // Télécharger les flashcards en PDF
  downloadPDF() {
    if (this.cards.length === 0) {
      showToast('Aucune flashcard à télécharger', 'error');
      return;
    }
    
    const date = new Date().toLocaleDateString('fr-FR');
    const studentName = State.profile?.fullName || 'Élève';
    const subject = this.cards[0]?.subject || 'Révisions';
    
    if (typeof jsPDF === 'undefined') {
      showToast('Préparation du PDF...', 'info');
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.onload = () => this.generateFlashcardsPDF(subject, date, studentName);
      document.head.appendChild(script);
    } else {
      this.generateFlashcardsPDF(subject, date, studentName);
    }
  },
  
  generateFlashcardsPDF(subject, date, studentName) {
    try {
      const { jsPDF } = window.jspdf || window;
      const doc = new jsPDF();
      
      // En-tête
      doc.setFillColor(99, 102, 241);
      doc.rect(0, 0, 210, 35, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.text('NEOCLASS - FLASHCARDS', 105, 15, { align: 'center' });
      doc.setFontSize(12);
      doc.text(`${subject} - ${this.cards.length} cartes`, 105, 27, { align: 'center' });
      
      // Infos
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.text(`Élève: ${studentName}`, 15, 45);
      doc.text(`Date: ${date}`, 150, 45);
      
      // Ligne de séparation
      doc.setDrawColor(99, 102, 241);
      doc.line(15, 50, 195, 50);
      
      // Flashcards
      let y = 60;
      doc.setFontSize(11);
      
      this.cards.forEach((card, i) => {
        if (y > 260) {
          doc.addPage();
          y = 20;
        }
        
        // Question
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(99, 102, 241);
        doc.text(`${i + 1}. ${card.front}`, 15, y);
        
        // Réponse
        y += 7;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 100, 0);
        const answerLines = doc.splitTextToSize(`→ ${card.back}`, 175);
        answerLines.forEach(line => {
          doc.text(line, 20, y);
          y += 5;
        });
        
        y += 8;
      });
      
      // Pied de page
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(`Page ${i}/${pageCount} - Généré par Neoclass IA`, 105, 290, { align: 'center' });
      }
      
      doc.save(`flashcards_${subject.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
      showToast('📥 Flashcards PDF téléchargées !', 'success');
      GamificationEngine.addXP(5, 'PDF flashcards');
      
    } catch(e) {
      console.error('Erreur PDF flashcards:', e);
      showToast('Erreur génération PDF', 'error');
    }
  },
  
  // Partager les flashcards
  share() {
    if (this.cards.length === 0) {
      showToast('Aucune flashcard à partager', 'error');
      return;
    }
    
    // Créer un texte partageable
    let shareText = '📚 Mes Flashcards Neoclass\n\n';
    this.cards.forEach((card, i) => {
      shareText += `${i + 1}. ${card.front}\n   → ${card.back}\n\n`;
    });
    shareText += '---\nCréées avec Neoclass IA 🤖';
    
    if (navigator.share) {
      navigator.share({
        title: 'Mes Flashcards Neoclass',
        text: shareText
      }).catch(e => console.log('Partage annulé'));
    } else {
      // Copier dans le presse-papier
      navigator.clipboard.writeText(shareText).then(() => {
        showToast('📋 Copié ! Tu peux maintenant coller', 'success');
      });
    }
  }
};

// ============================================================
// 🚀 INITIALISATION DES NOUVEAUX SYSTÈMES
// ============================================================
function initNewFeatures() {
  // Initialiser le mode data-light
  DataLightMode.init();
  
  // Initialiser les vies si connecté
  if (State.user && State.profile) {
    LivesSystem.init();
    DailyRewards.checkDailyReward();
    AdventureMode.init();
    
    // Vérifier les notifications toutes les heures
    setInterval(() => SmartNotifications.checkAndNotify(), 60 * 60 * 1000);
    SmartNotifications.checkAndNotify();
  }
}

// Appeler après le chargement de Firebase Auth
if (typeof auth !== 'undefined') {
  auth.onAuthStateChanged(user => {
    if (user) {
      setTimeout(initNewFeatures, 1000);
    }
  });
}

console.log('🚀 Neoclass Features chargées !');
