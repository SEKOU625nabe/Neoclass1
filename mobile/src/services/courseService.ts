import { mockCourses, mockExercises, mockProgress, mockQuiz, mockQuizzes } from '@/mock/data';
import type { Course, CourseCategory, Exercise, Progress, QuizQuestion, QuizResult } from '@/types';

import { delay } from './source';

export type CourseWithProgress = Course & { progress?: Progress };

function withProgress(course: Course): CourseWithProgress {
  const progress = mockProgress.find((p) => p.courseId === course.id);
  return progress ? { ...course, progress } : { ...course };
}

/** 10 NabeCoins par bonne réponse, plus 20 si le quiz est parfait. */
const COINS_PER_CORRECT = 10;
const PERFECT_BONUS = 20;

export const courseService = {
  async list(category?: CourseCategory): Promise<CourseWithProgress[]> {
    const courses = category ? mockCourses.filter((c) => c.category === category) : mockCourses;
    return delay(courses.map(withProgress));
  },

  async search(query: string): Promise<CourseWithProgress[]> {
    const q = query.trim().toLowerCase();
    if (!q) return this.list();
    const found = mockCourses.filter(
      (c) => c.title.toLowerCase().includes(q) || c.level.toLowerCase().includes(q),
    );
    return delay(found.map(withProgress), 250);
  },

  /** Cours repris en priorité sur le tableau de bord (progression entamée). */
  async continueLearning(limit = 3): Promise<CourseWithProgress[]> {
    const started = mockCourses
      .map(withProgress)
      .filter((c) => (c.progress?.ratio ?? 0) > 0)
      .sort((a, b) => (b.progress?.ratio ?? 0) - (a.progress?.ratio ?? 0))
      .slice(0, limit);
    return delay(started);
  },

  async byId(id: string): Promise<CourseWithProgress | null> {
    const course = mockCourses.find((c) => c.id === id);
    return delay(course ? withProgress(course) : null);
  },

  async exercises(courseId: string): Promise<Exercise[]> {
    return delay(mockExercises.filter((e) => e.courseId === courseId));
  },

  async exerciseById(id: string): Promise<Exercise | null> {
    return delay(mockExercises.find((e) => e.id === id) ?? null, 150);
  },

  /** Questions d'un exercice, dans l'ordre de passage. */
  async exerciseQuiz(exerciseId: string): Promise<QuizQuestion[]> {
    return delay(mockQuizzes[exerciseId] ?? [], 300);
  },

  async lessonQuiz(_lessonId: string): Promise<QuizQuestion[]> {
    return delay(mockQuiz, 200);
  },

  /**
   * Corrige une tentative : `answers` associe l'identifiant d'une
   * question à l'option choisie. La correction se fera côté serveur en
   * Phase 10 — les bonnes réponses ne descendront plus dans l'app, et
   * le crédit des NabeCoins restera une Cloud Function.
   */
  async submitQuiz(exerciseId: string, answers: Record<string, string>): Promise<QuizResult> {
    const questions = mockQuizzes[exerciseId] ?? [];
    const correct = questions.filter((q) => answers[q.id] === q.correctOptionId).length;
    const total = questions.length;
    const perfect = total > 0 && correct === total;

    const exercise = mockExercises.find((e) => e.id === exerciseId);
    if (exercise) exercise.status = 'done';

    return delay(
      {
        total,
        correct,
        ratio: total === 0 ? 0 : correct / total,
        coinsEarned: correct * COINS_PER_CORRECT + (perfect ? PERFECT_BONUS : 0),
      },
      400,
    );
  },
};
