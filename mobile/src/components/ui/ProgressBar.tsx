import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/theme';

export type ProgressBarProps = {
  /** Ratio 0 → 1. Les valeurs hors bornes sont ramenées dans l'intervalle. */
  value: number;
  height?: number;
  color?: string;
  trackColor?: string;
  label?: string;
};

export function ProgressBar({ value, height = 6, color, trackColor, label }: ProgressBarProps) {
  const { colors, radius } = useTheme();
  const ratio = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(ratio * 100) }}
      style={{
        height,
        borderRadius: radius.pill,
        backgroundColor: trackColor ?? colors.surfaceMuted,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          width: `${ratio * 100}%`,
          height: '100%',
          borderRadius: radius.pill,
          backgroundColor: color ?? colors.primary,
        }}
      />
    </View>
  );
}
