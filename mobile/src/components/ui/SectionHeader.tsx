import React from 'react';
import { Pressable, View } from 'react-native';

import { useTheme } from '@/theme';

import { Text } from './Text';

export type SectionHeaderProps = {
  title: string;
  /** Lien « Voir tout » à droite. */
  actionLabel?: string;
  onAction?: () => void;
  onBrand?: boolean;
};

export function SectionHeader({ title, actionLabel, onAction, onBrand }: SectionHeaderProps) {
  const { spacing } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.md,
      }}
    >
      <Text variant="h3" tone={onBrand ? 'onBrand' : 'default'}>
        {title}
      </Text>

      {actionLabel && onAction && (
        <Pressable accessibilityRole="button" onPress={onAction} hitSlop={10}>
          <Text variant="small" tone={onBrand ? 'onBrandMuted' : 'primary'}>
            {actionLabel}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
