import { Platform, TextStyle } from 'react-native';

/** Échelle d'espacement en multiples de 4. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
} as const;

/** Rayons : les maquettes utilisent des cartes très arrondies. */
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  pill: 999,
} as const;

/** Hauteur minimale d'une cible tactile (accessibilité). */
export const hitSize = 44;

type TypeScale = Pick<TextStyle, 'fontSize' | 'lineHeight' | 'fontWeight' | 'letterSpacing'>;

export const typography = {
  display: { fontSize: 30, lineHeight: 36, fontWeight: '800' },
  h1: { fontSize: 24, lineHeight: 30, fontWeight: '800' },
  h2: { fontSize: 20, lineHeight: 26, fontWeight: '700' },
  h3: { fontSize: 17, lineHeight: 23, fontWeight: '700' },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '500' },
  bodyStrong: { fontSize: 15, lineHeight: 22, fontWeight: '700' },
  small: { fontSize: 13, lineHeight: 18, fontWeight: '500' },
  caption: { fontSize: 11, lineHeight: 15, fontWeight: '600', letterSpacing: 0.2 },
} satisfies Record<string, TypeScale>;

/**
 * Ombres. iOS et Android n'utilisent pas les mêmes propriétés :
 * on produit ici un objet valide pour les deux.
 */
function shadow(elevation: number, opacity: number, radiusPx: number, offsetY: number) {
  return Platform.select({
    ios: {
      shadowColor: '#1B0F4D',
      shadowOpacity: opacity,
      shadowRadius: radiusPx,
      shadowOffset: { width: 0, height: offsetY },
    },
    android: { elevation },
    default: {},
  });
}

export const shadows = {
  none: {},
  card: shadow(2, 0.06, 12, 4),
  raised: shadow(6, 0.12, 20, 8),
  floating: shadow(10, 0.18, 28, 12),
} as const;
