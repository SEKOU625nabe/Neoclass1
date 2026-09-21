/**
 * Palette NeoClass, relevée sur les maquettes :
 * violet profond (identité), or (récompense / action secondaire), blanc.
 * Le mode sombre est défini dès maintenant pour éviter une reprise
 * complète des écrans plus tard.
 */

export const palette = {
  // Violet — couleur d'identité, en-têtes et fonds immersifs
  violet900: '#1B0F4D',
  violet800: '#241663',
  violet700: '#2D1B69',
  violet600: '#3B2A8C',
  violet500: '#4C3BCF',
  violet400: '#6C5CE7',
  violet300: '#9B8CFF',
  violet100: '#E7E3FF',
  violet50: '#F4F2FF',

  // Or — NabeCoins, boutons d'accent, mises en avant
  gold600: '#D99A0B',
  gold500: '#F5A524',
  gold400: '#FBBF24',
  gold300: '#FCD34D',
  gold100: '#FEF3C7',

  // Neutres
  white: '#FFFFFF',
  ink900: '#14102B',
  ink700: '#2A2450',
  ink500: '#5B5478',
  ink400: '#8A84A3',
  ink300: '#C7C3D8',
  ink200: '#E6E3F0',
  ink100: '#F2F1F8',
  lavender: '#F7F6FD',

  // États
  green500: '#16A34A',
  green100: '#DCFCE7',
  red500: '#DC2626',
  red100: '#FEE2E2',
  blue500: '#2563EB',
  blue100: '#DBEAFE',
  orange500: '#EA580C',
  orange100: '#FFEDD5',
} as const;

export type ThemeColors = {
  /** Fond général de l'écran */
  background: string;
  /** Fond des cartes et surfaces posées */
  surface: string;
  /** Surface légèrement teintée (champs, puces) */
  surfaceMuted: string;
  /** Fond violet immersif (en-têtes, splash) */
  brand: string;
  brandDeep: string;
  brandSoft: string;
  /** Couleur d'action principale */
  primary: string;
  primaryOn: string;
  /** Accent or */
  accent: string;
  accentOn: string;
  accentSoft: string;
  /** Textes */
  text: string;
  textMuted: string;
  textFaint: string;
  /** Texte posé sur un fond violet */
  onBrand: string;
  onBrandMuted: string;
  /** Bordures et séparateurs */
  border: string;
  /** Sémantique */
  success: string;
  successSoft: string;
  danger: string;
  dangerSoft: string;
  info: string;
  infoSoft: string;
  warning: string;
  warningSoft: string;
};

export const lightColors: ThemeColors = {
  background: palette.lavender,
  surface: palette.white,
  surfaceMuted: palette.ink100,
  brand: palette.violet700,
  brandDeep: palette.violet900,
  brandSoft: palette.violet50,
  primary: palette.violet500,
  primaryOn: palette.white,
  accent: palette.gold400,
  accentOn: palette.ink900,
  accentSoft: palette.gold100,
  text: palette.ink900,
  textMuted: palette.ink500,
  textFaint: palette.ink400,
  onBrand: palette.white,
  onBrandMuted: 'rgba(255,255,255,0.72)',
  border: palette.ink200,
  success: palette.green500,
  successSoft: palette.green100,
  danger: palette.red500,
  dangerSoft: palette.red100,
  info: palette.blue500,
  infoSoft: palette.blue100,
  warning: palette.orange500,
  warningSoft: palette.orange100,
};

export const darkColors: ThemeColors = {
  background: '#0F0A28',
  surface: '#1A1240',
  surfaceMuted: '#241A52',
  brand: palette.violet800,
  brandDeep: '#120A38',
  brandSoft: '#221845',
  primary: palette.violet400,
  primaryOn: palette.white,
  accent: palette.gold400,
  accentOn: palette.ink900,
  accentSoft: '#3A2D14',
  text: '#F4F2FF',
  textMuted: '#B3ACD4',
  textFaint: '#857DA8',
  onBrand: palette.white,
  onBrandMuted: 'rgba(255,255,255,0.72)',
  border: '#2E2358',
  success: '#4ADE80',
  successSoft: '#14331F',
  danger: '#F87171',
  dangerSoft: '#3A1717',
  info: '#60A5FA',
  infoSoft: '#132743',
  warning: '#FB923C',
  warningSoft: '#3A2210',
};

/** Dégradés réutilisés (splash, en-têtes, carte DARX). */
export const gradients = {
  brand: [palette.violet900, palette.violet600] as const,
  header: [palette.violet700, palette.violet500] as const,
  darx: [palette.violet500, palette.violet400] as const,
  gold: [palette.gold400, palette.gold500] as const,
};

/** Teintes par matière, comme sur la liste de cours des maquettes. */
export const subjectTints: Record<string, { bg: string; fg: string }> = {
  maths: { bg: palette.violet100, fg: palette.violet500 },
  physique: { bg: palette.blue100, fg: palette.blue500 },
  chimie: { bg: palette.green100, fg: palette.green500 },
  francais: { bg: palette.orange100, fg: palette.orange500 },
  economie: { bg: palette.green100, fg: palette.green500 },
  philosophie: { bg: palette.violet100, fg: palette.violet400 },
  informatique: { bg: palette.blue100, fg: palette.blue500 },
  default: { bg: palette.ink100, fg: palette.ink500 },
};
