/** Fonctions de présentation partagées : aucune logique métier ici. */

/** 265 → « 4 h 25 min », 45 → « 45 min ». */
export function formatDuration(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes <= 0) return '—';
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m.toString().padStart(2, '0')} min`;
}

/** 1250 → « 1 250 » (espace insécable fine, lisible en français). */
export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return '0';
  return Math.round(value).toLocaleString('fr-FR');
}

/** 50000 → « 50 000 GNF ». */
export function formatGNF(value: number): string {
  return `${formatNumber(value)} GNF`;
}

/** Date ISO → « 15 septembre 2025 ». */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Date ISO → « 10:24 », « Hier », « Lun ». */
export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';

  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Hier';

  const daysAgo = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
  if (daysAgo < 7) return d.toLocaleDateString('fr-FR', { weekday: 'short' });

  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
}

/** « Sekou Djafode Nabe » → « Sekou ». */
export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}
