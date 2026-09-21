import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

import { palette } from '@/theme';

export type LogoProps = {
  size?: number;
  /** Version claire pour les fonds violets (par défaut), sinon violette. */
  onDark?: boolean;
};

/**
 * Monogramme NeoClass : le « N » surmonté de la toque de diplômé.
 * Dessiné en SVG pour rester net à toutes les tailles et sur toutes
 * les densités d'écran.
 */
export function Logo({ size = 64, onDark = true }: LogoProps) {
  const mark = onDark ? palette.white : palette.violet600;
  const accent = palette.gold400;

  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" accessibilityLabel="Logo NeoClass">
      {/* Toque */}
      <Path d="M32 6 L58 17 L32 28 L6 17 Z" fill={accent} />
      <Path d="M48 22 V33 C48 33 41 38 32 38 C23 38 16 33 16 33 V22" fill="none" stroke={accent} strokeWidth={3.2} strokeLinecap="round" />

      {/* Lettre N */}
      <Rect x="16" y="34" width="6" height="24" rx="3" fill={mark} />
      <Rect x="42" y="34" width="6" height="24" rx="3" fill={mark} />
      <Path d="M19 36 L45 58" stroke={mark} strokeWidth={6} strokeLinecap="round" />
    </Svg>
  );
}
