import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, View } from 'react-native';

import { Text, TileIcon } from '@/components/ui';
import { useTheme } from '@/theme';

export type QuickAction = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  tint: 'primary' | 'accent' | 'success' | 'info';
  onPress: () => void;
};

/** Rangée de 4 raccourcis sous la carte DARX (maquette d'accueil). */
export function QuickActions({ actions }: { actions: QuickAction[] }) {
  const { colors, spacing } = useTheme();

  const tints: Record<QuickAction['tint'], { bg: string; fg: string }> = {
    primary: { bg: colors.brandSoft, fg: colors.primary },
    accent: { bg: colors.accentSoft, fg: colors.warning },
    success: { bg: colors.successSoft, fg: colors.success },
    info: { bg: colors.infoSoft, fg: colors.info },
  };

  return (
    <View style={{ flexDirection: 'row', gap: spacing.sm }}>
      {actions.map((action) => (
        <Pressable
          key={action.key}
          accessibilityRole="button"
          accessibilityLabel={action.label}
          onPress={action.onPress}
          style={({ pressed }) => ({
            flex: 1,
            alignItems: 'center',
            gap: spacing.xs,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <TileIcon icon={action.icon} bg={tints[action.tint].bg} fg={tints[action.tint].fg} size={52} />
          <Text variant="caption" tone="muted" center numberOfLines={1}>
            {action.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
