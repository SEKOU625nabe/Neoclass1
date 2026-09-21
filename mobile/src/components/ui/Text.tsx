import React from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { useTheme } from '@/theme';
import type { typography } from '@/theme/tokens';

type Variant = keyof typeof typography;
type Tone = 'default' | 'muted' | 'faint' | 'onBrand' | 'onBrandMuted' | 'primary' | 'accent' | 'success' | 'danger';

export type TextProps = RNTextProps & {
  variant?: Variant;
  tone?: Tone;
  center?: boolean;
};

/**
 * Seul composant texte de l'app : garantit que toute typographie passe
 * par l'échelle du thème plutôt que par des tailles écrites à la main.
 */
export function Text({ variant = 'body', tone = 'default', center, style, ...rest }: TextProps) {
  const { colors, typography: type } = useTheme();

  const toneColor: Record<Tone, string> = {
    default: colors.text,
    muted: colors.textMuted,
    faint: colors.textFaint,
    onBrand: colors.onBrand,
    onBrandMuted: colors.onBrandMuted,
    primary: colors.primary,
    accent: colors.accent,
    success: colors.success,
    danger: colors.danger,
  };

  return (
    <RNText
      style={[type[variant], { color: toneColor[tone] }, center && { textAlign: 'center' }, style]}
      {...rest}
    />
  );
}
