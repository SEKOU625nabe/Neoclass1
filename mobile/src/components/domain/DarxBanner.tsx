import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui';
import { useTheme } from '@/theme';

export type DarxBannerProps = {
  onPress: () => void;
};

/**
 * Carte de mise en avant de DARX AI sur le tableau de bord.
 * Reprend le bloc violet à robot de la maquette d'accueil.
 */
export function DarxBanner({ onPress }: DarxBannerProps) {
  const { gradients, radius, spacing, shadows } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Ouvrir DARX AI, ton assistant intelligent"
      onPress={onPress}
      style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }, shadows.raised]}
    >
      <LinearGradient
        colors={gradients.darx}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: radius.xl,
          padding: spacing.lg,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
        }}
      >
        <View style={{ flex: 1, gap: spacing.xs }}>
          <Text variant="h3" tone="onBrand">
            DARX AI
          </Text>
          <Text variant="caption" tone="onBrandMuted">
            Votre assistant intelligent
          </Text>
          <Text variant="small" tone="onBrandMuted">
            Posez vos questions, obtenez des explications, des résumés et bien plus.
          </Text>

          <View
            style={{
              marginTop: spacing.sm,
              alignSelf: 'flex-start',
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.xs,
              backgroundColor: 'rgba(255,255,255,0.18)',
              borderRadius: radius.pill,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.xs + 2,
            }}
          >
            <Text variant="caption" tone="onBrand">
              Ouvrir
            </Text>
            <Ionicons name="arrow-forward" size={12} color="#FFFFFF" />
          </View>
        </View>

        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: radius.xl,
            backgroundColor: 'rgba(255,255,255,0.16)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="sparkles" size={30} color="#FBBF24" />
        </View>
      </LinearGradient>
    </Pressable>
  );
}
