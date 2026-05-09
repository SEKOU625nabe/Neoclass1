// gamification.js - Services de gamification pour Neoclass
// Backend Node.js pour gérer streaks, XP, badges et missions quotidiennes

const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// ============================================================
// 📊 CONFIGURATION GAMIFICATION
// ============================================================
const GAMIFICATION_CONFIG = {
  // Points XP
  XP_EXERCISE_SUCCESS: 10,
  XP_LESSON_COMPLETE: 50,
  XP_STREAK_7_DAYS: 100,
  XP_STREAK_30_DAYS: 300,
  XP_WEEK_COMPLETE: 300,
  XP_DAILY_LOGIN: 5,
  XP_QUIZ_PERFECT: 25,
  XP_CHALLENGE_WIN: 75,
  
  // Niveaux (XP requis pour chaque niveau)
  LEVEL_THRESHOLDS: [
    0,      // Niveau 1
    100,    // Niveau 2
    250,    // Niveau 3
    500,    // Niveau 4
    850,    // Niveau 5
    1300,   // Niveau 6
    1900,   // Niveau 7
    2600,   // Niveau 8
    3500,   // Niveau 9
    4600,   // Niveau 10
    5900,   // Niveau 11
    7400,   // Niveau 12
    9100,   // Niveau 13
    11000,  // Niveau 14
    13100,  // Niveau 15
    15400,  // Niveau 16
    17900,  // Niveau 17
    20600,  // Niveau 18
    23500,  // Niveau 19
    26600,  // Niveau 20+
  ],
  
  // Difficulté adaptative
  DIFFICULTY_LEVELS: {
    facile: { multiplier: 0.7, xpMultiplier: 0.8 },
    normal: { multiplier: 1.0, xpMultiplier: 1.0 },
    difficile: { multiplier: 1.3, xpMultiplier: 1.3 },
    expert: { multiplier: 1.6, xpMultiplier: 1.5 }
  }
};

// ============================================================
// 🏅 BADGES DÉFINITIONS
// ============================================================
const BADGES = {
  // Badges de streak
  streak_3: { id: 'streak_3', icon: '🔥', name: '3 jours de feu', desc: 'Série de 3 jours consécutifs', xpReward: 20 },
  streak_7: { id: 'streak_7', icon: '⚡', name: '7 jours champion', desc: 'Série de 7 jours consécutifs', xpReward: 50 },
  streak_14: { id: 'streak_14', icon: '💫', name: '2 semaines héroïque', desc: 'Série de 14 jours consécutifs', xpReward: 100 },
  streak_30: { id: 'streak_30', icon: '🏆', name: '30 jours légendaire', desc: 'Série de 30 jours consécutifs', xpReward: 200 },
  streak_100: { id: 'streak_100', icon: '👑', name: 'Centurion', desc: 'Série de 100 jours consécutifs', xpReward: 500 },
  
  // Badges d'exercices
  exercises_10: { id: 'exercises_10', icon: '📝', name: 'Bon début', desc: 'Réussir 10 exercices', xpReward: 15 },
  exercises_50: { id: 'exercises_50', icon: '✍️', name: 'Travailleur', desc: 'Réussir 50 exercices', xpReward: 50 },
  exercises_100: { id: 'exercises_100', icon: '📚', name: 'Studieux', desc: 'Réussir 100 exercices', xpReward: 100 },
  exercises_500: { id: 'exercises_500', icon: '🎯', name: 'Expert', desc: 'Réussir 500 exercices', xpReward: 250 },
  
  // Badges de leçons
  lessons_5: { id: 'lessons_5', icon: '📖', name: 'Curieux', desc: 'Compléter 5 leçons', xpReward: 25 },
  lessons_10: { id: 'lessons_10', icon: '📘', name: 'Lecteur', desc: 'Compléter 10 leçons', xpReward: 50 },
  lessons_25: { id: 'lessons_25', icon: '📗', name: 'Érudit', desc: 'Compléter 25 leçons', xpReward: 100 },
  lessons_50: { id: 'lessons_50', icon: '🎓', name: 'Savant', desc: 'Compléter 50 leçons', xpReward: 200 },
  
  // Badges spéciaux
  first_perfect: { id: 'first_perfect', icon: '💯', name: 'Perfect!', desc: 'Premier quiz parfait', xpReward: 30 },
  quiz_master: { id: 'quiz_master', icon: '🧠', name: 'Maître Quiz', desc: '10 quiz parfaits', xpReward: 150 },
  early_bird: { id: 'early_bird', icon: '🌅', name: 'Lève-tôt', desc: 'Étudier avant 7h', xpReward: 20 },
  night_owl: { id: 'night_owl', icon: '🦉', name: 'Noctambule', desc: 'Étudier après 22h', xpReward: 20 },
  weekend_warrior: { id: 'weekend_warrior', icon: '🗓️', name: 'Weekend Warrior', desc: 'Étudier 4 weekends consécutifs', xpReward: 75 },
  
  // Badges sociaux
  first_post: { id: 'first_post', icon: '💬', name: 'Première voix', desc: 'Premier post social', xpReward: 10 },
  helper: { id: 'helper', icon: '🤝', name: 'Entraide', desc: 'Aider 5 camarades', xpReward: 50 },
  popular: { id: 'popular', icon: '⭐', name: 'Populaire', desc: 'Recevoir 50 likes', xpReward: 75 },
  
  // Badges Coran
  quran_reader: { id: 'quran_reader', icon: '📿', name: 'Lecteur Coran', desc: 'Lire 10 sourates', xpReward: 50 },
  quran_complete: { id: 'quran_complete', icon: '🕌', name: 'Khatm', desc: 'Lire les 114 sourates', xpReward: 500 }
};

// ============================================================
// 🎯 MISSIONS QUOTIDIENNES
// ============================================================
const DAILY_MISSION_TYPES = [
  { type: 'lesson', action: 'Lire 1 mini-leçon', icon: '📖', xpReward: 15 },
  { type: 'exercises', action: 'Réussir 3 exercices', icon: '✍️', count: 3, xpReward: 25 },
  { type: 'quiz', action: 'Compléter 1 quiz', icon: '✅', xpReward: 20 },
  { type: 'revision', action: 'Réviser une ancienne erreur', icon: '🔄', xpReward: 15 },
  { type: 'streak', action: 'Maintenir ta série', icon: '🔥', xpReward: 10 },
  { type: 'perfect', action: 'Obtenir un score parfait', icon: '💯', xpReward: 30 },
  { type: 'time', action: 'Étudier 15 minutes', icon: '⏰', xpReward: 20 },
  { type: 'quran', action: 'Lire 5 versets du Coran', icon: '📿', xpReward: 20 }
];

// ============================================================
// 🤖 MESSAGES MASCOTTE AFRICAINE
// ============================================================
const MASCOT_MESSAGES = {
  idle: [
    "Prêt à apprendre aujourd'hui ? 🚀",
    "Salut champion ! On révise ? 📚",
    "Hey ! J'ai hâte de voir tes progrès ! ⭐",
    "Tu es là ! Je t'attendais ! 🎉",
    "Prêt à battre ton record ? 💪"
  ],
  happy: [
    "Super travail ! Continue comme ça ! ⭐",
    "Tu es en feu ! 🔥",
    "Génial ! Tu progresses vite ! 🚀",
    "Bravo champion ! 🏆",
    "Je suis fier de toi ! 💪",
    "Excellent ! Tu gères ! 🎯"
  ],
  celebrating: [
    "INCROYABLE ! Tu es un génie ! 🎉",
    "PARFAIT ! Continue cette lancée ! 🌟",
    "WOW ! Tu m'impressionnes ! 🏆",
    "EXTRAORDINAIRE ! Tu vas loin ! 🚀",
    "CHAMPION ! Rien ne t'arrête ! 👑"
  ],
  thinking: [
    "Hmm, laisse-moi réfléchir... 🤔",
    "Intéressant, analysons ça... 💭",
    "Je cherche la meilleure explication... 🔍",
    "Bonne question ! Voyons voir... 📖"
  ],
  encouraging: [
    "Ne te décourage pas ! Tu peux y arriver ! 💪",
    "Presque ! Essaie encore ! 🎯",
    "C'est normal de faire des erreurs, continue ! 📚",
    "Tu apprends de tes erreurs, c'est super ! ⭐",
    "Pas grave ! La prochaine sera la bonne ! 🌟",
    "Respire, tu vas réussir ! 🙏"
  ],
  sad: [
    "Hey, on t'a manqué ! Reviens ! 🥺",
    "Ton streak est en danger ! Sauve-le ! 😢",
    "5 minutes suffisent pour continuer ! ⏰",
    "Ne perds pas tes progrès ! 💔",
    "Juste un petit exercice ? 🙏"
  ],
  levelUp: [
    "NIVEAU SUPÉRIEUR ! Tu évolues ! 🎊",
    "Tu montes en niveau ! Félicitations ! 🆙",
    "Nouvelle étape franchie ! Continue ! 🏅",
    "Tu deviens de plus en plus fort ! 💪"
  ],
  badge: [
    "Nouveau badge débloqué ! 🏅",
    "Tu as gagné une récompense ! 🎁",
    "Félicitations pour ce badge ! 🏆",
    "Collection enrichie ! Continue ! ⭐"
  ]
};

// ============================================================
// 🧮 FONCTIONS UTILITAIRES
// ============================================================

// Calculer le niveau à partir de l'XP
function calculateLevel(xp) {
  const thresholds = GAMIFICATION_CONFIG.LEVEL_THRESHOLDS;
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (xp >= thresholds[i]) {
      return i + 1;
    }
  }
  return 1;
}

// Calculer l'XP pour le prochain niveau
function xpForNextLevel(currentLevel) {
  const thresholds = GAMIFICATION_CONFIG.LEVEL_THRESHOLDS;
  if (currentLevel >= thresholds.length) {
    return thresholds[thresholds.length - 1] + (currentLevel - thresholds.length + 1) * 3000;
  }
  return thresholds[currentLevel];
}

// Calculer le pourcentage de progression vers le niveau suivant
function levelProgress(xp, currentLevel) {
  const currentThreshold = GAMIFICATION_CONFIG.LEVEL_THRESHOLDS[currentLevel - 1] || 0;
  const nextThreshold = xpForNextLevel(currentLevel);
  const progress = ((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
  return Math.min(Math.max(progress, 0), 100);
}

// Obtenir l'avatar de la mascotte selon le niveau
function getMascotAvatar(level) {
  if (level >= 20) return '🦸🏾‍♂️'; // Super-héros
  if (level >= 15) return '👨🏾‍🎓'; // Diplômé
  if (level >= 10) return '🧑🏾‍💼'; // Professionnel
  if (level >= 5) return '👦🏾🏅';  // Avec médaille
  return '👦🏾';                    // Élève simple
}

// Obtenir le titre de niveau
function getLevelTitle(level) {
  if (level >= 20) return 'Génie Légendaire';
  if (level >= 15) return 'Expert Suprême';
  if (level >= 10) return 'Maître Érudit';
  if (level >= 7) return 'Érudit Confirmé';
  if (level >= 5) return 'Élève Distingué';
  if (level >= 3) return 'Apprenti Motivé';
  return 'Débutant Curieux';
}

// Message aléatoire de la mascotte
function getRandomMessage(category) {
  const messages = MASCOT_MESSAGES[category] || MASCOT_MESSAGES.idle;
  return messages[Math.floor(Math.random() * messages.length)];
}

// Vérifier si c'est un nouveau jour
function isNewDay(lastDate) {
  if (!lastDate) return true;
  const last = new Date(lastDate);
  const now = new Date();
  return last.toDateString() !== now.toDateString();
}

// Calculer la différence en heures
function hoursDifference(date1, date2) {
  return Math.abs(date1 - date2) / (1000 * 60 * 60);
}

// Générer les missions quotidiennes
function generateDailyMissions(userProfile) {
  const today = new Date().toDateString();
  
  // Missions fixes
  const missions = [
    { ...DAILY_MISSION_TYPES[0], completed: false }, // Lire 1 leçon
    { ...DAILY_MISSION_TYPES[1], completed: false, progress: 0 }, // 3 exercices
    { ...DAILY_MISSION_TYPES[3], completed: false }, // Révision
  ];
  
  // Ajouter une mission aléatoire supplémentaire
  const randomIdx = Math.floor(Math.random() * (DAILY_MISSION_TYPES.length - 3)) + 3;
  missions.push({ ...DAILY_MISSION_TYPES[randomIdx], completed: false });
  
  return {
    date: today,
    missions: missions,
    bonusXP: 50, // Bonus si toutes les missions sont complétées
    allCompleted: false
  };
}

// Vérifier les badges à débloquer
function checkBadgesToUnlock(userStats, currentBadges = []) {
  const newBadges = [];
  
  // Badges de streak
  if (userStats.streakCurrent >= 3 && !currentBadges.includes('streak_3')) {
    newBadges.push(BADGES.streak_3);
  }
  if (userStats.streakCurrent >= 7 && !currentBadges.includes('streak_7')) {
    newBadges.push(BADGES.streak_7);
  }
  if (userStats.streakCurrent >= 14 && !currentBadges.includes('streak_14')) {
    newBadges.push(BADGES.streak_14);
  }
  if (userStats.streakCurrent >= 30 && !currentBadges.includes('streak_30')) {
    newBadges.push(BADGES.streak_30);
  }
  if (userStats.streakCurrent >= 100 && !currentBadges.includes('streak_100')) {
    newBadges.push(BADGES.streak_100);
  }
  
  // Badges d'exercices
  if (userStats.exercisesCompleted >= 10 && !currentBadges.includes('exercises_10')) {
    newBadges.push(BADGES.exercises_10);
  }
  if (userStats.exercisesCompleted >= 50 && !currentBadges.includes('exercises_50')) {
    newBadges.push(BADGES.exercises_50);
  }
  if (userStats.exercisesCompleted >= 100 && !currentBadges.includes('exercises_100')) {
    newBadges.push(BADGES.exercises_100);
  }
  if (userStats.exercisesCompleted >= 500 && !currentBadges.includes('exercises_500')) {
    newBadges.push(BADGES.exercises_500);
  }
  
  // Badges de leçons
  if (userStats.lessonsCompleted >= 5 && !currentBadges.includes('lessons_5')) {
    newBadges.push(BADGES.lessons_5);
  }
  if (userStats.lessonsCompleted >= 10 && !currentBadges.includes('lessons_10')) {
    newBadges.push(BADGES.lessons_10);
  }
  if (userStats.lessonsCompleted >= 25 && !currentBadges.includes('lessons_25')) {
    newBadges.push(BADGES.lessons_25);
  }
  if (userStats.lessonsCompleted >= 50 && !currentBadges.includes('lessons_50')) {
    newBadges.push(BADGES.lessons_50);
  }
  
  // Badge quiz parfait
  if (userStats.perfectQuizzes >= 1 && !currentBadges.includes('first_perfect')) {
    newBadges.push(BADGES.first_perfect);
  }
  if (userStats.perfectQuizzes >= 10 && !currentBadges.includes('quiz_master')) {
    newBadges.push(BADGES.quiz_master);
  }
  
  // Badges Coran
  if (userStats.surahsRead >= 10 && !currentBadges.includes('quran_reader')) {
    newBadges.push(BADGES.quran_reader);
  }
  if (userStats.surahsRead >= 114 && !currentBadges.includes('quran_complete')) {
    newBadges.push(BADGES.quran_complete);
  }
  
  return newBadges;
}

// Calculer la nouvelle difficulté adaptative
function calculateAdaptiveDifficulty(consecutiveWins, consecutiveLosses, currentDifficulty) {
  if (consecutiveLosses >= 3) {
    return { difficulty: 'facile', reason: 'encouraging' };
  }
  if (consecutiveWins >= 5 && currentDifficulty !== 'expert') {
    if (currentDifficulty === 'facile') return { difficulty: 'normal', reason: 'happy' };
    if (currentDifficulty === 'normal') return { difficulty: 'difficile', reason: 'celebrating' };
    if (currentDifficulty === 'difficile') return { difficulty: 'expert', reason: 'celebrating' };
  }
  if (consecutiveWins >= 3 && currentDifficulty === 'facile') {
    return { difficulty: 'normal', reason: 'happy' };
  }
  return { difficulty: currentDifficulty, reason: null };
}

// ============================================================
// 📡 ENDPOINTS API
// ============================================================

// Health check
app.get('/api/gamification/health', (req, res) => {
  res.json({ status: 'ok', message: 'Gamification service running' });
});

// Mettre à jour le streak
app.post('/api/gamification/streak', (req, res) => {
  const { userId, lastActivityDate, currentStreak, bestStreak } = req.body;
  
  const now = new Date();
  let newStreak = currentStreak || 0;
  let streakLost = false;
  let mascotState = 'idle';
  
  if (lastActivityDate) {
    const lastActivity = new Date(lastActivityDate);
    const hoursDiff = hoursDifference(now, lastActivity);
    
    if (hoursDiff > 48) {
      // Plus de 48h sans activité = streak perdu
      newStreak = 1;
      streakLost = true;
      mascotState = 'sad';
    } else if (isNewDay(lastActivityDate)) {
      // Nouveau jour = streak +1
      newStreak = currentStreak + 1;
      mascotState = 'happy';
      if (newStreak % 7 === 0) mascotState = 'celebrating';
    } else {
      // Même jour = pas de changement
      mascotState = 'idle';
    }
  } else {
    // Premier jour
    newStreak = 1;
    mascotState = 'happy';
  }
  
  const newBestStreak = Math.max(newStreak, bestStreak || 0);
  const xpEarned = streakLost ? 0 : GAMIFICATION_CONFIG.XP_DAILY_LOGIN;
  
  res.json({
    streakCurrent: newStreak,
    streakBest: newBestStreak,
    streakLost,
    xpEarned,
    mascotState,
    mascotMessage: getRandomMessage(mascotState)
  });
});

// Enregistrer une activité (exercice, leçon, quiz)
app.post('/api/gamification/activity', (req, res) => {
  const { 
    userId, 
    activityType, // 'exercise', 'lesson', 'quiz'
    success,
    score, // 0-100
    userStats 
  } = req.body;
  
  let xpEarned = 0;
  let mascotState = 'idle';
  let newBadges = [];
  
  // Calculer XP selon le type d'activité
  if (success) {
    switch (activityType) {
      case 'exercise':
        xpEarned = GAMIFICATION_CONFIG.XP_EXERCISE_SUCCESS;
        mascotState = 'happy';
        break;
      case 'lesson':
        xpEarned = GAMIFICATION_CONFIG.XP_LESSON_COMPLETE;
        mascotState = 'happy';
        break;
      case 'quiz':
        xpEarned = score >= 100 ? GAMIFICATION_CONFIG.XP_QUIZ_PERFECT : Math.floor(score * 0.3);
        mascotState = score >= 100 ? 'celebrating' : 'happy';
        break;
    }
    
    // Bonus de difficulté
    const difficultyConfig = GAMIFICATION_CONFIG.DIFFICULTY_LEVELS[userStats?.difficultyLevel || 'normal'];
    xpEarned = Math.floor(xpEarned * difficultyConfig.xpMultiplier);
  } else {
    mascotState = 'encouraging';
  }
  
  // Vérifier nouveaux badges
  if (userStats) {
    newBadges = checkBadgesToUnlock(userStats, userStats.badges || []);
  }
  
  // Vérifier changement de niveau
  const oldLevel = calculateLevel(userStats?.totalXP || 0);
  const newLevel = calculateLevel((userStats?.totalXP || 0) + xpEarned);
  const leveledUp = newLevel > oldLevel;
  
  if (leveledUp) {
    mascotState = 'levelUp';
  }
  
  res.json({
    xpEarned,
    mascotState,
    mascotMessage: getRandomMessage(mascotState),
    newBadges,
    leveledUp,
    newLevel,
    newLevelTitle: getLevelTitle(newLevel),
    newMascotAvatar: getMascotAvatar(newLevel)
  });
});

// Obtenir les missions quotidiennes
app.post('/api/gamification/daily-missions', (req, res) => {
  const { userId, currentMissions, userProfile } = req.body;
  
  const today = new Date().toDateString();
  
  // Si les missions existent déjà pour aujourd'hui, les retourner
  if (currentMissions && currentMissions.date === today) {
    res.json(currentMissions);
    return;
  }
  
  // Générer de nouvelles missions
  const newMissions = generateDailyMissions(userProfile);
  
  res.json(newMissions);
});

// Mettre à jour une mission
app.post('/api/gamification/update-mission', (req, res) => {
  const { missionType, progress, missions } = req.body;
  
  const updatedMissions = { ...missions };
  let xpEarned = 0;
  let missionCompleted = false;
  
  const mission = updatedMissions.missions.find(m => m.type === missionType);
  if (mission && !mission.completed) {
    if (mission.count) {
      mission.progress = (mission.progress || 0) + 1;
      if (mission.progress >= mission.count) {
        mission.completed = true;
        missionCompleted = true;
        xpEarned = mission.xpReward;
      }
    } else {
      mission.completed = true;
      missionCompleted = true;
      xpEarned = mission.xpReward;
    }
  }
  
  // Vérifier si toutes les missions sont complétées
  const allCompleted = updatedMissions.missions.every(m => m.completed);
  if (allCompleted && !updatedMissions.allCompleted) {
    updatedMissions.allCompleted = true;
    xpEarned += updatedMissions.bonusXP;
  }
  
  res.json({
    missions: updatedMissions,
    xpEarned,
    missionCompleted,
    allCompleted,
    mascotState: allCompleted ? 'celebrating' : (missionCompleted ? 'happy' : 'idle'),
    mascotMessage: allCompleted 
      ? "TOUTES LES MISSIONS COMPLÉTÉES ! Tu es incroyable ! 🎉🏆"
      : (missionCompleted ? getRandomMessage('happy') : null)
  });
});

// Difficulté adaptative après quiz/exercice
app.post('/api/gamification/adaptive-difficulty', (req, res) => {
  const { success, consecutiveWins, consecutiveLosses, currentDifficulty } = req.body;
  
  const newConsecutiveWins = success ? consecutiveWins + 1 : 0;
  const newConsecutiveLosses = success ? 0 : consecutiveLosses + 1;
  
  const result = calculateAdaptiveDifficulty(newConsecutiveWins, newConsecutiveLosses, currentDifficulty);
  
  let adaptiveMessage = null;
  if (result.difficulty !== currentDifficulty) {
    if (newConsecutiveLosses >= 3) {
      adaptiveMessage = "Ne te décourage pas ! J'ai adapté les prochains exercices pour t'aider. On y va pas à pas ! 💪🏾";
    } else if (newConsecutiveWins >= 3) {
      adaptiveMessage = "Tu es en feu ! 🔥 Je monte le niveau, voyons si tu peux relever le défi !";
    }
  }
  
  res.json({
    newDifficulty: result.difficulty,
    consecutiveWins: newConsecutiveWins,
    consecutiveLosses: newConsecutiveLosses,
    mascotState: result.reason || 'idle',
    mascotMessage: adaptiveMessage || getRandomMessage(result.reason || 'idle'),
    difficultyChanged: result.difficulty !== currentDifficulty
  });
});

// Obtenir l'état de la mascotte
app.post('/api/gamification/mascot-state', (req, res) => {
  const { userProfile } = req.body;
  
  const level = calculateLevel(userProfile.totalXP || 0);
  const streakCurrent = userProfile.streakCurrent || 0;
  const lastActivity = userProfile.lastActivityDate;
  
  let state = 'idle';
  let message = '';
  
  // Vérifier si le streak est en danger
  if (lastActivity) {
    const hoursSinceLastActivity = hoursDifference(new Date(), new Date(lastActivity));
    if (hoursSinceLastActivity > 20 && hoursSinceLastActivity < 48) {
      state = 'sad';
      message = `Attention ! Plus que ${Math.floor(48 - hoursSinceLastActivity)} heures pour sauver ta série de ${streakCurrent} jours ! 🔥`;
    } else if (streakCurrent === 0) {
      state = 'encouraging';
      message = "On t'attendait ! 5 minutes suffisent pour commencer une nouvelle série ! 🌟";
    }
  }
  
  if (state === 'idle') {
    message = getRandomMessage('idle');
  }
  
  res.json({
    avatar: getMascotAvatar(level),
    level,
    levelTitle: getLevelTitle(level),
    state,
    message,
    xpProgress: levelProgress(userProfile.totalXP || 0, level),
    xpCurrent: userProfile.totalXP || 0,
    xpNext: xpForNextLevel(level)
  });
});

// Notifications intelligentes
app.post('/api/gamification/smart-notifications', (req, res) => {
  const { userProfile } = req.body;
  
  const notifications = [];
  const streakCurrent = userProfile.streakCurrent || 0;
  const streakBest = userProfile.streakBest || 0;
  const lastActivity = userProfile.lastActivityDate;
  
  // Notification si absent depuis 2 jours
  if (lastActivity) {
    const hoursSince = hoursDifference(new Date(), new Date(lastActivity));
    
    if (hoursSince > 48 && hoursSince < 72) {
      notifications.push({
        type: 'return',
        title: "On t'attend ! 🎓",
        message: "5 minutes suffisent pour apprendre quelque chose de nouveau aujourd'hui !",
        priority: 'high'
      });
    }
    
    // Notification si proche du record
    if (streakCurrent > 0 && streakCurrent === streakBest - 1) {
      notifications.push({
        type: 'streak_record',
        title: "Tu y es presque ! 🏆",
        message: `Plus qu'un jour pour battre ton record de ${streakBest} jours !`,
        priority: 'medium'
      });
    }
    
    // Notification si sur le point de perdre le streak
    if (hoursSince > 20 && hoursSince < 24 && streakCurrent > 0) {
      notifications.push({
        type: 'streak_warning',
        title: "Sauve ta série ! 🔥",
        message: `Ta série de ${streakCurrent} jours est en danger ! Fais une activité maintenant !`,
        priority: 'urgent'
      });
    }
  }
  
  // Notification de félicitations pour jalons
  if (streakCurrent === 7 || streakCurrent === 14 || streakCurrent === 30) {
    notifications.push({
      type: 'milestone',
      title: `${streakCurrent} jours ! 🎉`,
      message: `Félicitations pour cette série de ${streakCurrent} jours ! Tu es incroyable !`,
      priority: 'celebration'
    });
  }
  
  res.json({ notifications });
});

// ============================================================
// 🚀 DÉMARRAGE SERVEUR
// ============================================================
const PORT = process.env.GAMIFICATION_PORT || 3002;
app.listen(PORT, () => {
  console.log(`✅ Gamification service running on http://localhost:${PORT}`);
});

module.exports = {
  GAMIFICATION_CONFIG,
  BADGES,
  MASCOT_MESSAGES,
  calculateLevel,
  getMascotAvatar,
  getLevelTitle,
  checkBadgesToUnlock
};
