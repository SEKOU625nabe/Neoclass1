import React from 'react';
import { Pressable, View, type ViewProps, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

export type CardProps = ViewProps & {
  onPress?: () => void;
  /** `flat` retire l'ombre : utile pour les cartes posées sur un fond violet. */
  elevation?: 'flat' | 'card' | 'raised';
  padded?: boolean;
  style?: ViewStyle;
};

export function Card({ onPress, elevation = 'card', padded = true, style, children, ...rest }: CardProps) {
  const { colors, radius, spacing, shadows } = useTheme();

  const base: ViewStyle = {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: padded ? spacing.lg : 0,
  };

  const shadow = elevation === 'flat' ? shadows.none : elevation === 'raised' ? shadows.raised : shadows.card;

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [base, shadow, { opacity: pressed ? 0.92 : 1 }, style]}
        {...rest}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={[base, shadow, style]} {...rest}>
      {children}
    </View>
  );
}
