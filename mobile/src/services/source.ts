/**
 * Point de bascule unique entre les données de démonstration et Firebase.
 *
 * Tant que `USE_MOCK` vaut true, les services renvoient les jeux de
 * données de `src/mock`. En Phase 4, chaque service recevra une
 * implémentation Firestore et ce drapeau passera à false : aucun écran
 * n'aura besoin d'être modifié.
 */

export const USE_MOCK = true;

/** Simule la latence réseau pour que les états de chargement soient réels. */
export function delay<T>(value: T, ms = 450): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}
