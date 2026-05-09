/**
 * ============================================================
 * 🎮 NEOCLASS - Module Gamification
 * Système XP, niveaux, séries, achievements (style Duolingo)
 * ============================================================
 */

class GamificationService {
  constructor() {
    this.xpMultiplier = 1;
    this.streakBonus = 0;
    this.listeners = new Set();
  }
  
  // ═══════════════════════════════════════════════════════════
  // XP SYSTEM
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Calculer le niveau à partir des XP
   * @param {number} totalXP
   */
  calculateLevel(totalXP) {
    const config = CONFIG?.xp || { baseXP: 100, multiplier: 1.5 };
    let level = 1;
    let xpRequired = config.baseXP;
    let xpAccumulated = 0;
    
    while (xpAccumulated + xpRequired <= totalXP) {
      xpAccumulated += xpRequired;
      level++;
      xpRequired = Math.floor(config.baseXP * Math.pow(config.multiplier, level - 1));
    }
    
    return {
      level,
      currentXP: totalXP - xpAccumulated,
      xpForNextLevel: xpRequired,
      totalXP,
      progress: (totalXP - xpAccumulated) / xpRequired
    };
  }
  
  /**
   * XP requis pour un niveau spécifique
   * @param {number} level
   */
  getXPForLevel(level) {
    const config = CONFIG?.xp || { baseXP: 100, multiplier: 1.5 };
    let total = 0;
    
    for (let i = 1; i < level; i++) {
      total += Math.floor(config.baseXP * Math.pow(config.multiplier, i - 1));
    }
    
    return total;
  }
  
  /**
   * Ajouter des XP à l'utilisateur
   * @param {string} userId
   * @param {number} amount
   * @param {string} source - 'quiz', 'lesson', 'streak', 'achievement'
   */
  async addXP(userId, amount, source = 'generic') {
    const firebase = window.Firebase;
    if (!firebase || !userId) return null;
    
    try {
      // Appliquer les multiplicateurs
      let finalAmount = Math.floor(amount * this.xpMultiplier);
      
      // Bonus de série
      if (this.streakBonus > 0) {
        finalAmount = Math.floor(finalAmount * (1 + this.streakBonus / 100));
      }
      
      // Récupérer les données actuelles
      const profile = await firebase.getUserProfile(userId);
      const oldXP = profile?.xp || 0;
      const newXP = oldXP + finalAmount;
      
      // Calculer les niveaux
      const oldLevel = this.calculateLevel(oldXP);
      const newLevel = this.calculateLevel(newXP);
      
      // Mettre à jour Firebase
      await firebase.updateDoc('users', userId, {
        xp: newXP,
        level: newLevel.level,
        lastActivity: new Date()
      });
      
      // Enregistrer l'historique XP
      await firebase.createDoc('xp_history', {
        userId,
        amount: finalAmount,
        source,
        timestamp: new Date()
      });
      
      // Notifier les listeners
      const result = {
        added: finalAmount,
        oldXP,
        newXP,
        oldLevel: oldLevel.level,
        newLevel: newLevel.level,
        levelUp: newLevel.level > oldLevel.level
      };
      
      this.emit('xpGained', result);
      
      // Animation XP
      this.showXPAnimation(finalAmount);
      
      // Level up?
      if (result.levelUp) {
        this.handleLevelUp(newLevel.level);
      }
      
      return result;
      
    } catch (error) {
      console.error('Erreur ajout XP:', error);
      return null;
    }
  }
  
  /**
   * Afficher l'animation XP
   * @param {number} amount
   */
  showXPAnimation(amount) {
    // Créer l'élément d'animation
    const xpPop = document.createElement('div');
    xpPop.className = 'xp-popup animate-xp-gain';
    xpPop.innerHTML = `
      <span class="xp-icon">⚡</span>
      <span class="xp-amount">+${amount} XP</span>
    `;
    
    // Position aléatoire en haut
    xpPop.style.left = `${50 + (Math.random() - 0.5) * 20}%`;
    
    document.body.appendChild(xpPop);
    
    // Supprimer après animation
    setTimeout(() => xpPop.remove(), 2000);
  }
  
  // ═══════════════════════════════════════════════════════════
  // LEVEL SYSTEM
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Gérer le passage de niveau
   * @param {number} newLevel
   */
  handleLevelUp(newLevel) {
    this.emit('levelUp', { level: newLevel });
    
    // Animation level up
    this.showLevelUpModal(newLevel);
    
    // Jouer le son
    this.playSound('levelUp');
    
    // Vérifier les récompenses de niveau
    const reward = this.getLevelReward(newLevel);
    if (reward) {
      this.grantReward(reward);
    }
  }
  
  /**
   * Afficher la modal de level up
   * @param {number} level
   */
  showLevelUpModal(level) {
    const modal = document.createElement('div');
    modal.className = 'level-up-modal animate-level-up';
    modal.innerHTML = `
      <div class="level-up-content">
        <div class="level-up-stars">
          <span>⭐</span>
          <span>🌟</span>
          <span>⭐</span>
        </div>
        <h2>Niveau ${level}</h2>
        <p>Félicitations ! Tu progresses ! 🎉</p>
        <div class="level-up-reward">
          ${this.getLevelRewardText(level)}
        </div>
        <button class="btn-primary" onclick="this.closest('.level-up-modal').remove()">
          Continuer
        </button>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Confetti
    this.showConfetti();
  }
  
  /**
   * Obtenir les récompenses d'un niveau
   * @param {number} level
   */
  getLevelReward(level) {
    const rewards = {
      5: { type: 'badge', value: 'debutant', label: 'Badge Débutant' },
      10: { type: 'badge', value: 'apprenti', label: 'Badge Apprenti' },
      15: { type: 'xp_boost', value: 0.1, label: '+10% XP pendant 1h' },
      20: { type: 'badge', value: 'intermediaire', label: 'Badge Intermédiaire' },
      25: { type: 'coins', value: 50, label: '50 pièces bonus' },
      30: { type: 'badge', value: 'avance', label: 'Badge Avancé' },
      50: { type: 'badge', value: 'expert', label: 'Badge Expert' },
      100: { type: 'badge', value: 'maitre', label: 'Badge Maître' }
    };
    
    return rewards[level] || null;
  }
  
  /**
   * Texte de récompense pour un niveau
   * @param {number} level
   */
  getLevelRewardText(level) {
    const reward = this.getLevelReward(level);
    if (!reward) return '';
    
    switch (reward.type) {
      case 'badge':
        return `<span class="reward-badge">🏅 ${reward.label}</span>`;
      case 'xp_boost':
        return `<span class="reward-boost">⚡ ${reward.label}</span>`;
      case 'coins':
        return `<span class="reward-coins">🪙 ${reward.label}</span>`;
      default:
        return '';
    }
  }
  
  // ═══════════════════════════════════════════════════════════
  // STREAK SYSTEM (Séries)
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Vérifier et mettre à jour la série
   * @param {string} userId
   */
  async checkStreak(userId) {
    const firebase = window.Firebase;
    if (!firebase || !userId) return null;
    
    try {
      const profile = await firebase.getUserProfile(userId);
      const streak = profile?.streak || 0;
      const lastActivity = profile?.lastActivity?.toDate?.() || new Date(0);
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const lastDay = new Date(lastActivity.getFullYear(), lastActivity.getMonth(), lastActivity.getDate());
      
      const daysDiff = Math.floor((today - lastDay) / (1000 * 60 * 60 * 24));
      
      let newStreak = streak;
      let streakStatus = 'maintained';
      
      if (daysDiff === 0) {
        // Même jour, pas de changement
        streakStatus = 'same-day';
      } else if (daysDiff === 1) {
        // Jour suivant, série continue
        newStreak = streak + 1;
        streakStatus = 'extended';
      } else {
        // Série perdue
        newStreak = 1;
        streakStatus = 'reset';
      }
      
      // Mettre à jour Firebase
      const updates = {
        streak: newStreak,
        lastActivity: now
      };
      
      // Record de série
      if (newStreak > (profile?.maxStreak || 0)) {
        updates.maxStreak = newStreak;
      }
      
      await firebase.updateDoc('users', userId, updates);
      
      // Calculer le bonus de série
      this.streakBonus = this.calculateStreakBonus(newStreak);
      
      // Notifier
      const result = {
        streak: newStreak,
        previousStreak: streak,
        status: streakStatus,
        bonus: this.streakBonus,
        maxStreak: Math.max(newStreak, profile?.maxStreak || 0)
      };
      
      this.emit('streakUpdated', result);
      
      // Animation si série étendue
      if (streakStatus === 'extended') {
        this.showStreakAnimation(newStreak);
      }
      
      return result;
      
    } catch (error) {
      console.error('Erreur vérification série:', error);
      return null;
    }
  }
  
  /**
   * Calculer le bonus de série
   * @param {number} streak
   */
  calculateStreakBonus(streak) {
    // +2% par jour de série, max +50%
    return Math.min(streak * 2, 50);
  }
  
  /**
   * Afficher l'animation de série
   * @param {number} streak
   */
  showStreakAnimation(streak) {
    const streakPop = document.createElement('div');
    streakPop.className = 'streak-popup animate-streak-fire';
    streakPop.innerHTML = `
      <span class="streak-fire">🔥</span>
      <span class="streak-count">${streak} jours</span>
      <span class="streak-bonus">+${this.streakBonus}% XP</span>
    `;
    
    document.body.appendChild(streakPop);
    
    setTimeout(() => streakPop.remove(), 3000);
  }
  
  // ═══════════════════════════════════════════════════════════
  // ACHIEVEMENTS SYSTEM
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Liste des achievements
   */
  static ACHIEVEMENTS = {
    first_lesson: {
      id: 'first_lesson',
      icon: '📚',
      name: 'Première Leçon',
      description: 'Termine ta première leçon',
      xp: 50
    },
    first_quiz: {
      id: 'first_quiz',
      icon: '✅',
      name: 'Premier Quiz',
      description: 'Réussis ton premier quiz',
      xp: 50
    },
    perfect_quiz: {
      id: 'perfect_quiz',
      icon: '💯',
      name: 'Sans Faute',
      description: 'Obtiens 100% à un quiz',
      xp: 100
    },
    streak_7: {
      id: 'streak_7',
      icon: '🔥',
      name: 'Semaine de Feu',
      description: 'Maintiens une série de 7 jours',
      xp: 200
    },
    streak_30: {
      id: 'streak_30',
      icon: '🌟',
      name: 'Mois Parfait',
      description: 'Maintiens une série de 30 jours',
      xp: 500
    },
    level_10: {
      id: 'level_10',
      icon: '🎖️',
      name: 'Apprenti',
      description: 'Atteins le niveau 10',
      xp: 200
    },
    level_25: {
      id: 'level_25',
      icon: '🏅',
      name: 'Intermédiaire',
      description: 'Atteins le niveau 25',
      xp: 400
    },
    level_50: {
      id: 'level_50',
      icon: '🏆',
      name: 'Expert',
      description: 'Atteins le niveau 50',
      xp: 1000
    },
    course_complete: {
      id: 'course_complete',
      icon: '🎓',
      name: 'Cours Terminé',
      description: 'Termine un cours complet',
      xp: 300
    },
    early_bird: {
      id: 'early_bird',
      icon: '🌅',
      name: 'Lève-tôt',
      description: 'Étudie avant 7h du matin',
      xp: 75
    },
    night_owl: {
      id: 'night_owl',
      icon: '🦉',
      name: 'Oiseau de Nuit',
      description: 'Étudie après 22h',
      xp: 75
    },
    speed_demon: {
      id: 'speed_demon',
      icon: '⚡',
      name: 'Rapide comme l\'éclair',
      description: 'Termine un quiz en moins de 2 minutes',
      xp: 100
    },
    social_butterfly: {
      id: 'social_butterfly',
      icon: '🦋',
      name: 'Papillon Social',
      description: 'Invite 3 amis sur Neoclass',
      xp: 150
    }
  };
  
  /**
   * Débloquer un achievement
   * @param {string} userId
   * @param {string} achievementId
   */
  async unlockAchievement(userId, achievementId) {
    const firebase = window.Firebase;
    const achievement = GamificationService.ACHIEVEMENTS[achievementId];
    
    if (!firebase || !userId || !achievement) return null;
    
    try {
      // Vérifier si déjà débloqué
      const profile = await firebase.getUserProfile(userId);
      const achievements = profile?.achievements || [];
      
      if (achievements.includes(achievementId)) {
        return null; // Déjà débloqué
      }
      
      // Ajouter l'achievement
      achievements.push(achievementId);
      await firebase.updateDoc('users', userId, {
        achievements
      });
      
      // Ajouter les XP bonus
      await this.addXP(userId, achievement.xp, 'achievement');
      
      // Notifier
      this.emit('achievementUnlocked', achievement);
      
      // Afficher la notification
      this.showAchievementNotification(achievement);
      
      return achievement;
      
    } catch (error) {
      console.error('Erreur déblocage achievement:', error);
      return null;
    }
  }
  
  /**
   * Afficher la notification d'achievement
   * @param {object} achievement
   */
  showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification animate-slide-up';
    notification.innerHTML = `
      <div class="achievement-icon">${achievement.icon}</div>
      <div class="achievement-info">
        <span class="achievement-title">🏆 Nouveau Badge !</span>
        <span class="achievement-name">${achievement.name}</span>
        <span class="achievement-xp">+${achievement.xp} XP</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Son
    this.playSound('achievement');
    
    // Supprimer après 5s
    setTimeout(() => {
      notification.classList.add('animate-slide-down');
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  }
  
  /**
   * Vérifier les conditions d'achievements
   * @param {string} userId
   * @param {string} event - 'lesson_complete', 'quiz_complete', etc.
   * @param {object} data
   */
  async checkAchievements(userId, event, data = {}) {
    switch (event) {
      case 'lesson_complete':
        await this.unlockAchievement(userId, 'first_lesson');
        break;
        
      case 'quiz_complete':
        await this.unlockAchievement(userId, 'first_quiz');
        if (data.score === 100) {
          await this.unlockAchievement(userId, 'perfect_quiz');
        }
        if (data.duration && data.duration < 120) {
          await this.unlockAchievement(userId, 'speed_demon');
        }
        break;
        
      case 'streak_update':
        if (data.streak >= 7) {
          await this.unlockAchievement(userId, 'streak_7');
        }
        if (data.streak >= 30) {
          await this.unlockAchievement(userId, 'streak_30');
        }
        break;
        
      case 'level_up':
        if (data.level >= 10) {
          await this.unlockAchievement(userId, 'level_10');
        }
        if (data.level >= 25) {
          await this.unlockAchievement(userId, 'level_25');
        }
        if (data.level >= 50) {
          await this.unlockAchievement(userId, 'level_50');
        }
        break;
        
      case 'course_complete':
        await this.unlockAchievement(userId, 'course_complete');
        break;
        
      case 'session_start':
        const hour = new Date().getHours();
        if (hour < 7) {
          await this.unlockAchievement(userId, 'early_bird');
        }
        if (hour >= 22) {
          await this.unlockAchievement(userId, 'night_owl');
        }
        break;
    }
  }
  
  // ═══════════════════════════════════════════════════════════
  // LEADERBOARD
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Obtenir le classement
   * @param {string} type - 'global', 'weekly', 'daily', 'friends'
   * @param {number} limit
   */
  async getLeaderboard(type = 'global', limit = 50) {
    const firebase = window.Firebase;
    if (!firebase) return [];
    
    try {
      let orderByField = 'xp';
      
      if (type === 'weekly') {
        orderByField = 'weeklyXP';
      } else if (type === 'daily') {
        orderByField = 'dailyXP';
      }
      
      // Appeler getDocs avec la bonne signature (objet options)
      const result = await firebase.getDocs('users', {
        where: [['isPublicProfile', '==', true]],
        orderBy: [orderByField, 'desc'],
        limit: limit
      });
      
      // Vérifier le résultat
      if (!result || !result.success || !result.data) {
        console.warn('[Gamification] Aucun utilisateur trouvé pour le leaderboard');
        return [];
      }
      
      const users = result.data;
      
      return users.map((user, index) => ({
        rank: index + 1,
        userId: user.id,
        displayName: user.displayName || 'Anonyme',
        photoURL: user.photoURL,
        xp: user[orderByField] || user.xp || 0,
        level: user.level || 1,
        streak: user.streak || 0,
        country: user.country || 'GN'
      }));
      
    } catch (error) {
      console.error('Erreur leaderboard:', error);
      return [];
    }
  }
  
  /**
   * Obtenir le rang d'un utilisateur
   * @param {string} userId
   */
  async getUserRank(userId) {
    const leaderboard = await this.getLeaderboard('global', 1000);
    const userIndex = leaderboard.findIndex(u => u.userId === userId);
    
    return userIndex === -1 ? null : userIndex + 1;
  }
  
  // ═══════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Jouer un son
   * @param {string} sound
   */
  playSound(sound) {
    const sounds = {
      xp: '/assets/sounds/xp.mp3',
      levelUp: '/assets/sounds/level-up.mp3',
      achievement: '/assets/sounds/achievement.mp3',
      streak: '/assets/sounds/streak.mp3',
      correct: '/assets/sounds/correct.mp3',
      wrong: '/assets/sounds/wrong.mp3'
    };
    
    const soundUrl = sounds[sound];
    if (!soundUrl) return;
    
    try {
      const audio = new Audio(soundUrl);
      audio.volume = 0.5;
      audio.play().catch(() => {}); // Ignorer les erreurs d'autoplay
    } catch (e) {
      // Ignorer
    }
  }
  
  /**
   * Afficher des confettis
   */
  showConfetti() {
    const colors = ['#58CC02', '#FFD900', '#FF6F61', '#00BCD4', '#9B59B6'];
    const container = document.createElement('div');
    container.className = 'confetti-container';
    
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti animate-confetti';
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = `${Math.random() * 0.5}s`;
      container.appendChild(confetti);
    }
    
    document.body.appendChild(container);
    
    setTimeout(() => container.remove(), 3000);
  }
  
  /**
   * Émettre un événement
   * @param {string} event
   * @param {*} data
   */
  emit(event, data) {
    this.listeners.forEach(listener => {
      if (listener.event === event) {
        listener.callback(data);
      }
    });
    
    // Aussi dispatcher un événement DOM
    window.dispatchEvent(new CustomEvent(`gamification:${event}`, { detail: data }));
  }
  
  /**
   * S'abonner à un événement
   * @param {string} event
   * @param {function} callback
   */
  on(event, callback) {
    const listener = { event, callback };
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  /**
   * Définir le multiplicateur XP temporaire
   * @param {number} multiplier
   * @param {number} durationMs
   */
  setXPMultiplier(multiplier, durationMs = 3600000) {
    this.xpMultiplier = multiplier;
    
    setTimeout(() => {
      this.xpMultiplier = 1;
      this.emit('xpMultiplierEnded', { multiplier: 1 });
    }, durationMs);
    
    this.emit('xpMultiplierStarted', { multiplier, duration: durationMs });
  }
}

// ─── Instance globale ───
window.Gamification = new GamificationService();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = GamificationService;
}
