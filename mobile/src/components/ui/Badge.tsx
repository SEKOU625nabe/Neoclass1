import React from 'react';
import { View, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

import { Text } from './Text';

type Tone = 'neutral' | 'primary' | 'accent' | 'success' | 'danger' | 'info' | 'warning';

export type BadgeProps = {
  label: string;
  tone?: Tone;
  style?: ViewStyle;
};

export function Badge({ label, tone = 'neutral', style }: BadgeProps) {
  const { colors, radius, spacing } = useTheme();

  const map: Record<Tone, { bg: string; fg: string }> = {
    neutral: { bg: colors.surfaceMuted, fg: colors.textMuted },
    primary: { bg: colors.brandSoft, fg: colors.primary },
    accent: { bg: colors.accentSoft, fg: colors.accentOn },
    success: { bg: colors.successSoft, fg: colors.success },
    danger: { bg: colors.dangerSoft, fg: colors.danger },
    info: { bg: colors.infoSoft, fg: colors.info },
    warning: { bg: colors.warningSoft, fg: colors.warning },
  };

  return (
    <View
      style={[
        {
          alignSelf: 'flex-start',
          backgroundColor: map[tone].bg,
          borderRadius: radius.pill,
          paddingHorizontal: spacing.sm + 2,
          paddingVertical: 3,
        },
        style,
      ]}
    >
      <Text variant="caption" style={{ color: map[tone].fg }}>
        {label}
      </Text>
    </View>
  );
}
