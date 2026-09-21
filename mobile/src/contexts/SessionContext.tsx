import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { mockUser } from '@/mock/data';
import type { OnboardingRole, Permission, User, UserRole } from '@/types';

/**
 * Permissions par rôle.
 * Les écrans interrogent `can()` plutôt que de tester le rôle
 * directement : ajouter un rôle ne demande alors qu'une ligne ici.
 */
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  student: ['course.read', 'exercise.submit', 'exam.take'],
  indep_student: ['course.read', 'exercise.submit', 'exam.take'],
  teacher: ['course.read', 'course.publish', 'grade.write'],
  indep_teacher: ['course.read', 'course.publish', 'grade.write'],
  parent: ['course.read', 'child.track'],
  school: ['course.read', 'grade.write', 'school.manage'],
  admin: [
    'course.read',
    'course.publish',
    'exercise.submit',
    'exam.take',
    'grade.write',
    'child.track',
    'school.manage',
    'platform.admin',
  ],
};

type SessionContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  /** Rôle choisi pendant l'onboarding, avant la création du compte. */
  pendingRole: OnboardingRole | null;
  setPendingRole: (role: OnboardingRole) => void;
  can: (permission: Permission) => boolean;
  signIn: () => Promise<void>;
  signOut: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [pendingRole, setPendingRole] = useState<OnboardingRole | null>(null);

  const signIn = useCallback(async () => {
    // Phase 4 : remplacé par authService.signIn(email, password).
    setUser(pendingRole ? { ...mockUser, role: pendingRole } : mockUser);
  }, [pendingRole]);

  const signOut = useCallback(() => {
    setUser(null);
    setPendingRole(null);
  }, []);

  const can = useCallback(
    (permission: Permission) => (user ? ROLE_PERMISSIONS[user.role].includes(permission) : false),
    [user],
  );

  const value = useMemo<SessionContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      pendingRole,
      setPendingRole,
      can,
      signIn,
      signOut,
    }),
    [user, pendingRole, can, signIn, signOut],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession doit être utilisé dans un <SessionProvider>.');
  return ctx;
}
