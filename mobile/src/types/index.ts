/**
 * Modèle de données NeoClass.
 * Reprend les rôles et la hiérarchie pédagogique déjà utilisés par la
 * plateforme web, en les typant strictement.
 */

export type UserRole =
  | 'student'
  | 'indep_student'
  | 'teacher'
  | 'indep_teacher'
  | 'parent'
  | 'school'
  | 'admin';

/** Profils proposés à l'inscription (maquette « Choix du profil »). */
export type OnboardingRole = Extract<UserRole, 'student' | 'indep_student' | 'teacher' | 'parent'>;

export type EducationSystem = 'guinea' | 'france';

export type Permission =
  | 'course.read'
  | 'course.publish'
  | 'exercise.submit'
  | 'exam.take'
  | 'grade.write'
  | 'child.track'
  | 'school.manage'
  | 'platform.admin';

export type User = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  system: EducationSystem;
  /** Niveau scolaire affiché, ex. « Terminale SM ». */
  level?: string;
  classId?: string;
  schoolId?: string;
  avatarUrl?: string;
  nabecoins: number;
  xp: number;
  streak: number;
  /** Niveau de gamification (« Niveau 3 » sur la maquette Profil). */
  rank: number;
};

export type SubjectKey =
  | 'maths'
  | 'physique'
  | 'chimie'
  | 'francais'
  | 'economie'
  | 'philosophie'
  | 'informatique';

export type CourseCategory = 'academique' | 'professionnel';

export type Course = {
  id: string;
  title: string;
  subject: SubjectKey;
  level: string;
  category: CourseCategory;
  description: string;
  /** Durée totale en minutes. */
  durationMin: number;
  moduleCount: number;
  rating: number;
  ratingCount: number;
  coverUrl?: string;
  objectives: string[];
};

export type Module = {
  id: string;
  courseId: string;
  title: string;
  order: number;
  lessonCount: number;
};

export type LessonKind = 'video' | 'text' | 'document';

export type Lesson = {
  id: string;
  moduleId: string;
  courseId: string;
  title: string;
  kind: LessonKind;
  durationMin: number;
  videoUrl?: string;
};

export type Progress = {
  courseId: string;
  completedModules: number;
  totalModules: number;
  /** Ratio 0 → 1. */
  ratio: number;
};

export type Difficulty = 'facile' | 'moyenne' | 'difficile';

export type ExerciseStatus = 'todo' | 'in_progress' | 'done';

export type Exercise = {
  id: string;
  courseId: string;
  title: string;
  questionCount: number;
  difficulty: Difficulty;
  status: ExerciseStatus;
};

export type QuizOption = {
  id: string;
  label: string;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: QuizOption[];
  correctOptionId: string;
};

/** Bilan d'un quiz terminé, renvoyé par le service à la dernière question. */
export type QuizResult = {
  total: number;
  correct: number;
  /** Ratio 0 → 1, utilisé pour la note et le message de fin. */
  ratio: number;
  coinsEarned: number;
};

export type ExamStatus = 'upcoming' | 'in_progress' | 'passed' | 'failed';

export type Exam = {
  id: string;
  title: string;
  subject: SubjectKey;
  date: string;
  durationMin: number;
  questionCount: number;
  status: ExamStatus;
};

export type Certification = {
  id: string;
  title: string;
  issuer: string;
  /** Pourcentage d'avancement, 0 → 100. */
  progress: number;
  validated: boolean;
};

export type ConversationKind = 'class' | 'group' | 'direct' | 'system';

export type Conversation = {
  id: string;
  title: string;
  kind: ConversationKind;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  avatarUrl?: string;
};

/** Auteur d'un message, vu depuis l'utilisateur courant. */
export type MessageAuthor = 'me' | 'other' | 'system';

export type Message = {
  id: string;
  conversationId: string;
  author: MessageAuthor;
  /** Nom affiché au-dessus des messages des autres, dans les groupes. */
  authorName: string;
  text: string;
  sentAt: string;
  /** Message envoyé localement, pas encore confirmé par le serveur. */
  pending?: boolean;
};

export type NotificationKind = 'message' | 'exam' | 'reward' | 'system';

export type AppNotification = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
};

export type CoinEntryKind = 'earn' | 'spend';

export type CoinEntry = {
  id: string;
  kind: CoinEntryKind;
  label: string;
  amount: number;
  createdAt: string;
};

export type Reward = {
  id: string;
  title: string;
  subtitle: string;
  cost: number;
  icon: string;
};

/** État générique d'un écran distant : évite de réinventer loading/error partout. */
export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'empty' }
  | { status: 'ready'; data: T };
