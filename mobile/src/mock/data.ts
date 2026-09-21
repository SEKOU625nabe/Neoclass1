/**
 * Données de démonstration.
 * Elles permettent de faire tourner et valider l'interface avant le
 * branchement Firebase (Phase 4). Chaque écran lit ces données via
 * `src/services/`, jamais directement — la bascule vers Firestore ne
 * touchera donc pas les écrans.
 */

import type {
  AppNotification,
  Certification,
  CoinEntry,
  Conversation,
  Course,
  Exam,
  Exercise,
  Message,
  Progress,
  QuizQuestion,
  Reward,
  User,
} from '@/types';

export const mockUser: User = {
  id: 'demo-user',
  fullName: 'Sekou Djafode Nabe',
  email: 'sekou@neoclass.app',
  role: 'student',
  system: 'guinea',
  level: 'Terminale SM',
  nabecoins: 1250,
  xp: 3480,
  streak: 7,
  rank: 3,
};

export const mockCourses: Course[] = [
  {
    id: 'c-maths',
    title: 'Mathématiques',
    subject: 'maths',
    level: 'Terminale SM',
    category: 'academique',
    description:
      "Ce cours couvre tout le programme de mathématiques de Terminale SM : fonctions, limites, dérivées, intégrales, probabilités, géométrie dans l'espace.",
    durationMin: 265,
    moduleCount: 12,
    rating: 4.8,
    ratingCount: 1200,
    objectives: [
      'Maîtriser les fonctions et les limites',
      'Calculer les dérivées et intégrales',
      'Résoudre des problèmes de probabilité',
      "Géométrie dans l'espace",
    ],
  },
  {
    id: 'c-physique',
    title: 'Physique',
    subject: 'physique',
    level: 'Terminale SM',
    category: 'academique',
    description: 'Mécanique, électricité, ondes et physique nucléaire au programme de Terminale.',
    durationMin: 195,
    moduleCount: 10,
    rating: 4.6,
    ratingCount: 840,
    objectives: ['Lois de Newton', 'Circuits RLC', 'Ondes mécaniques', 'Radioactivité'],
  },
  {
    id: 'c-chimie',
    title: 'Chimie',
    subject: 'chimie',
    level: 'Terminale SM',
    category: 'academique',
    description: 'Cinétique, équilibres chimiques, acides-bases et chimie organique.',
    durationMin: 160,
    moduleCount: 8,
    rating: 4.5,
    ratingCount: 610,
    objectives: ['Cinétique chimique', 'Équilibres', 'Acides et bases', 'Chimie organique'],
  },
  {
    id: 'c-francais',
    title: 'Français',
    subject: 'francais',
    level: 'Terminale',
    category: 'academique',
    description: "Méthodologie de la dissertation, du commentaire composé et de l'oral.",
    durationMin: 190,
    moduleCount: 10,
    rating: 4.4,
    ratingCount: 520,
    objectives: ['Dissertation', 'Commentaire composé', 'Analyse littéraire', "Préparation à l'oral"],
  },
  {
    id: 'c-economie',
    title: 'Économie',
    subject: 'economie',
    level: 'Terminale',
    category: 'academique',
    description: "Micro-économie, macro-économie et économie du développement.",
    durationMin: 140,
    moduleCount: 8,
    rating: 4.3,
    ratingCount: 410,
    objectives: ['Offre et demande', 'Inflation', 'Commerce international', 'Développement'],
  },
  {
    id: 'c-philo',
    title: 'Philosophie',
    subject: 'philosophie',
    level: 'Terminale',
    category: 'academique',
    description: 'Les grandes notions du programme et la méthode de la dissertation philosophique.',
    durationMin: 150,
    moduleCount: 9,
    rating: 4.2,
    ratingCount: 330,
    objectives: ['La conscience', 'La liberté', 'La vérité', 'Méthode de dissertation'],
  },
  {
    id: 'c-info',
    title: 'Initiation à Python',
    subject: 'informatique',
    level: 'Tous niveaux',
    category: 'professionnel',
    description: 'Apprendre à programmer en Python, des bases aux premiers projets.',
    durationMin: 300,
    moduleCount: 14,
    rating: 4.9,
    ratingCount: 2100,
    objectives: ['Variables et boucles', 'Fonctions', 'Fichiers et données', 'Premier projet'],
  },
];

export const mockProgress: Progress[] = [
  { courseId: 'c-maths', completedModules: 3, totalModules: 12, ratio: 0.45 },
  { courseId: 'c-physique', completedModules: 2, totalModules: 10, ratio: 0.45 },
  { courseId: 'c-chimie', completedModules: 1, totalModules: 8, ratio: 0.3 },
  { courseId: 'c-francais', completedModules: 2, totalModules: 10, ratio: 0.6 },
  { courseId: 'c-economie', completedModules: 1, totalModules: 8, ratio: 0.2 },
  { courseId: 'c-philo', completedModules: 0, totalModules: 9, ratio: 0 },
  { courseId: 'c-info', completedModules: 4, totalModules: 14, ratio: 0.3 },
];

export const mockExercises: Exercise[] = [
  { id: 'e1', courseId: 'c-maths', title: 'Exercice 1 — Dérivées', questionCount: 10, difficulty: 'moyenne', status: 'done' },
  { id: 'e2', courseId: 'c-maths', title: 'Exercice 2 — Probabilités', questionCount: 8, difficulty: 'facile', status: 'in_progress' },
  { id: 'e3', courseId: 'c-maths', title: 'Exercice 3 — Géométrie', questionCount: 12, difficulty: 'difficile', status: 'todo' },
  { id: 'e4', courseId: 'c-maths', title: 'Exercice 4 — Suites numériques', questionCount: 10, difficulty: 'moyenne', status: 'todo' },
];

/**
 * Questions par exercice.
 * `questionCount` des exercices annonce le total visé ; on n'en écrit
 * ici que les premières, suffisantes pour dérouler tout le parcours.
 */
export const mockQuizzes: Record<string, QuizQuestion[]> = {
  e1: [
    {
      id: 'e1-q1',
      prompt: 'Quelle est la limite de f(x) = (x² − 1) / (x − 1) quand x tend vers 1 ?',
      options: [
        { id: 'a', label: '2' },
        { id: 'b', label: '1' },
        { id: 'c', label: 'x' },
        { id: 'd', label: '0' },
      ],
      correctOptionId: 'a',
    },
    {
      id: 'e1-q2',
      prompt: 'Quelle est la dérivée de f(x) = x³ ?',
      options: [
        { id: 'a', label: '3x' },
        { id: 'b', label: '3x²' },
        { id: 'c', label: 'x²' },
        { id: 'd', label: 'x⁴ / 4' },
      ],
      correctOptionId: 'b',
    },
    {
      id: 'e1-q3',
      prompt: 'Si f est dérivable et f′(x) > 0 sur un intervalle I, alors sur I la fonction f est :',
      options: [
        { id: 'a', label: 'décroissante' },
        { id: 'b', label: 'constante' },
        { id: 'c', label: 'croissante' },
        { id: 'd', label: 'nulle' },
      ],
      correctOptionId: 'c',
    },
    {
      id: 'e1-q4',
      prompt: 'Quelle est la dérivée de f(x) = ln(x) pour x > 0 ?',
      options: [
        { id: 'a', label: '1 / x' },
        { id: 'b', label: 'ln(x) / x' },
        { id: 'c', label: 'x ln(x)' },
        { id: 'd', label: 'eˣ' },
      ],
      correctOptionId: 'a',
    },
  ],
  e2: [
    {
      id: 'e2-q1',
      prompt: 'On lance un dé équilibré à six faces. Quelle est la probabilité d’obtenir un nombre pair ?',
      options: [
        { id: 'a', label: '1/6' },
        { id: 'b', label: '1/3' },
        { id: 'c', label: '1/2' },
        { id: 'd', label: '2/3' },
      ],
      correctOptionId: 'c',
    },
    {
      id: 'e2-q2',
      prompt: 'A et B sont indépendants avec P(A) = 0,4 et P(B) = 0,5. Combien vaut P(A ∩ B) ?',
      options: [
        { id: 'a', label: '0,9' },
        { id: 'b', label: '0,2' },
        { id: 'c', label: '0,1' },
        { id: 'd', label: '0,45' },
      ],
      correctOptionId: 'b',
    },
    {
      id: 'e2-q3',
      prompt: 'Quelle est la probabilité de l’événement contraire d’un événement de probabilité 0,3 ?',
      options: [
        { id: 'a', label: '0,3' },
        { id: 'b', label: '0,5' },
        { id: 'c', label: '0,7' },
        { id: 'd', label: '1,3' },
      ],
      correctOptionId: 'c',
    },
  ],
  e3: [
    {
      id: 'e3-q1',
      prompt: 'Dans l’espace, deux droites non coplanaires sont dites :',
      options: [
        { id: 'a', label: 'parallèles' },
        { id: 'b', label: 'sécantes' },
        { id: 'c', label: 'confondues' },
        { id: 'd', label: 'non coplanaires (gauches)' },
      ],
      correctOptionId: 'd',
    },
    {
      id: 'e3-q2',
      prompt: 'Le produit scalaire de deux vecteurs orthogonaux non nuls vaut :',
      options: [
        { id: 'a', label: '0' },
        { id: 'b', label: '1' },
        { id: 'c', label: 'leur norme' },
        { id: 'd', label: '−1' },
      ],
      correctOptionId: 'a',
    },
    {
      id: 'e3-q3',
      prompt: 'Quel est le volume d’une sphère de rayon R ?',
      options: [
        { id: 'a', label: '4πR²' },
        { id: 'b', label: '(4/3)πR³' },
        { id: 'c', label: 'πR³' },
        { id: 'd', label: '(1/3)πR²' },
      ],
      correctOptionId: 'b',
    },
  ],
  e4: [
    {
      id: 'e4-q1',
      prompt: 'La suite définie par uₙ = 3n + 2 est :',
      options: [
        { id: 'a', label: 'géométrique de raison 3' },
        { id: 'b', label: 'arithmétique de raison 3' },
        { id: 'c', label: 'constante' },
        { id: 'd', label: 'alternée' },
      ],
      correctOptionId: 'b',
    },
    {
      id: 'e4-q2',
      prompt: 'Pour une suite géométrique de raison q avec 0 < q < 1, la limite de qⁿ quand n tend vers +∞ est :',
      options: [
        { id: 'a', label: '+∞' },
        { id: 'b', label: '1' },
        { id: 'c', label: '0' },
        { id: 'd', label: 'q' },
      ],
      correctOptionId: 'c',
    },
    {
      id: 'e4-q3',
      prompt: 'Une suite croissante et majorée est :',
      options: [
        { id: 'a', label: 'divergente' },
        { id: 'b', label: 'convergente' },
        { id: 'c', label: 'périodique' },
        { id: 'd', label: 'nulle à partir d’un rang' },
      ],
      correctOptionId: 'b',
    },
  ],
};

/** Quiz servi par défaut à la fin d'une leçon. */
export const mockQuiz: QuizQuestion[] = mockQuizzes.e1 ?? [];

export const mockExams: Exam[] = [
  {
    id: 'x1',
    title: 'Bac Blanc — Mathématiques',
    subject: 'maths',
    date: '2025-09-15T08:00:00.000Z',
    durationMin: 120,
    questionCount: 50,
    status: 'upcoming',
  },
  {
    id: 'x2',
    title: 'Bac Blanc — Physique',
    subject: 'physique',
    date: '2025-09-17T08:00:00.000Z',
    durationMin: 120,
    questionCount: 45,
    status: 'upcoming',
  },
];

export const mockCertifications: Certification[] = [
  { id: 'k1', title: 'Certificat de fin de cycle', issuer: 'NeoClass', progress: 92, validated: true },
  { id: 'k2', title: 'Certification Python', issuer: 'NeoClass Pro', progress: 66, validated: false },
  { id: 'k3', title: 'HTML / CSS / JavaScript', issuer: 'NeoClass Pro', progress: 40, validated: false },
];

export const mockConversations: Conversation[] = [
  {
    id: 'v1',
    title: 'Classe de Terminale SM',
    kind: 'class',
    lastMessage: '12 nouveaux messages',
    lastMessageAt: new Date(Date.now() - 3 * 3600_000).toISOString(),
    unreadCount: 12,
  },
  {
    id: 'v2',
    title: 'Groupe Physique',
    kind: 'group',
    lastMessage: 'Adam : Merci prof !',
    lastMessageAt: new Date(Date.now() - 5 * 3600_000).toISOString(),
    unreadCount: 0,
  },
  {
    id: 'v3',
    title: 'Équipe NeoClass',
    kind: 'system',
    lastMessage: "Bienvenue dans l'équipe !",
    lastMessageAt: new Date(Date.now() - 26 * 3600_000).toISOString(),
    unreadCount: 1,
  },
  {
    id: 'v4',
    title: 'Mamadou',
    kind: 'direct',
    lastMessage: 'Tu as fait l’exercice ?',
    lastMessageAt: new Date(Date.now() - 30 * 3600_000).toISOString(),
    unreadCount: 0,
  },
  {
    id: 'v5',
    title: 'Aicha',
    kind: 'direct',
    lastMessage: 'Bonne chance !',
    lastMessageAt: new Date(Date.now() - 4 * 86_400_000).toISOString(),
    unreadCount: 0,
  },
];

/** Fils de discussion, indexés par identifiant de conversation. */
export const mockMessages: Record<string, Message[]> = {
  v1: [
    {
      id: 'v1-m1',
      conversationId: 'v1',
      author: 'other',
      authorName: 'M. Camara',
      text: 'Bonjour à tous. Le devoir de mathématiques est à rendre vendredi.',
      sentAt: new Date(Date.now() - 6 * 3600_000).toISOString(),
    },
    {
      id: 'v1-m2',
      conversationId: 'v1',
      author: 'other',
      authorName: 'Aicha',
      text: 'Merci monsieur. On traite aussi les suites ?',
      sentAt: new Date(Date.now() - 5 * 3600_000).toISOString(),
    },
    {
      id: 'v1-m3',
      conversationId: 'v1',
      author: 'other',
      authorName: 'M. Camara',
      text: 'Oui, les exercices 3 et 4 du chapitre sur les suites numériques.',
      sentAt: new Date(Date.now() - 4 * 3600_000).toISOString(),
    },
    {
      id: 'v1-m4',
      conversationId: 'v1',
      author: 'me',
      authorName: 'Moi',
      text: 'C’est noté, merci.',
      sentAt: new Date(Date.now() - 3 * 3600_000).toISOString(),
    },
  ],
  v2: [
    {
      id: 'v2-m1',
      conversationId: 'v2',
      author: 'other',
      authorName: 'Mme Diallo',
      text: 'La correction du TP sur les circuits RLC est en ligne.',
      sentAt: new Date(Date.now() - 7 * 3600_000).toISOString(),
    },
    {
      id: 'v2-m2',
      conversationId: 'v2',
      author: 'other',
      authorName: 'Adam',
      text: 'Merci prof !',
      sentAt: new Date(Date.now() - 5 * 3600_000).toISOString(),
    },
  ],
  v3: [
    {
      id: 'v3-m1',
      conversationId: 'v3',
      author: 'system',
      authorName: 'NeoClass',
      text: 'Bienvenue dans l’équipe ! Retrouve ici les annonces de la plateforme.',
      sentAt: new Date(Date.now() - 26 * 3600_000).toISOString(),
    },
  ],
  v4: [
    {
      id: 'v4-m1',
      conversationId: 'v4',
      author: 'other',
      authorName: 'Mamadou',
      text: 'Salut ! Tu as fait l’exercice ?',
      sentAt: new Date(Date.now() - 30 * 3600_000).toISOString(),
    },
    {
      id: 'v4-m2',
      conversationId: 'v4',
      author: 'me',
      authorName: 'Moi',
      text: 'Les deux premiers seulement, je bloque sur la question 3.',
      sentAt: new Date(Date.now() - 29 * 3600_000).toISOString(),
    },
  ],
  v5: [
    {
      id: 'v5-m1',
      conversationId: 'v5',
      author: 'other',
      authorName: 'Aicha',
      text: 'Bonne chance pour le bac blanc !',
      sentAt: new Date(Date.now() - 4 * 86_400_000).toISOString(),
    },
  ],
};

export const mockNotifications: AppNotification[] = [
  {
    id: 'n1',
    kind: 'message',
    title: 'Nouveau message',
    body: 'Classe de Terminale SM · 12 nouveaux messages',
    createdAt: new Date(Date.now() - 18 * 60_000).toISOString(),
    read: false,
  },
  {
    id: 'n2',
    kind: 'exam',
    title: "Rappel d'examen",
    body: 'Bac Blanc Mathématiques dans 2 jours',
    createdAt: new Date(Date.now() - 3 * 3600_000).toISOString(),
    read: false,
  },
  {
    id: 'n3',
    kind: 'reward',
    title: 'NabeCoins',
    body: 'Tu as gagné 50 NabeCoins pour ta série de 7 jours',
    createdAt: new Date(Date.now() - 26 * 3600_000).toISOString(),
    read: true,
  },
  {
    id: 'n4',
    kind: 'system',
    title: 'Nouveau cours disponible',
    body: 'Physique · Module 3 : ondes mécaniques',
    createdAt: new Date(Date.now() - 3 * 86_400_000).toISOString(),
    read: true,
  },
];

export const mockCoinHistory: CoinEntry[] = [
  { id: 'h1', kind: 'earn', label: 'Série de 7 jours', amount: 50, createdAt: new Date(Date.now() - 2 * 3600_000).toISOString() },
  { id: 'h2', kind: 'earn', label: 'Exercice 1 — Dérivées terminé', amount: 20, createdAt: new Date(Date.now() - 26 * 3600_000).toISOString() },
  { id: 'h3', kind: 'spend', label: 'Thème « Nuit étoilée »', amount: 120, createdAt: new Date(Date.now() - 3 * 86_400_000).toISOString() },
  { id: 'h4', kind: 'earn', label: 'Parrainage — Mamadou', amount: 50, createdAt: new Date(Date.now() - 5 * 86_400_000).toISOString() },
  { id: 'h5', kind: 'earn', label: 'Module 2 de Physique terminé', amount: 35, createdAt: new Date(Date.now() - 6 * 86_400_000).toISOString() },
];

export const mockRewards: Reward[] = [
  { id: 'r1', title: 'Carte cadeau', subtitle: '50 000 GNF', cost: 50_000, icon: '🎁' },
  { id: 'r2', title: 'Réduction boutique', subtitle: '−20 %', cost: 800, icon: '🏷️' },
  { id: 'r3', title: 'Abonnement premium', subtitle: '1 mois', cost: 3_000, icon: '⭐' },
];
