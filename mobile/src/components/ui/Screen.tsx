import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, View, type ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

import { Text } from './Text';

export type ScreenProps = {
  children: React.ReactNode;
  /** Ajoute le défilement vertical et le padding horizontal standard. */
  scroll?: boolean;
  refreshControl?: React.ReactElement;
  contentStyle?: ViewStyle;
  padded?: boolean;
};

/** Conteneur d'écran : fond du thème, zone sûre, gouttière de 16 px. */
export function Screen({ children, scroll, refreshControl, contentStyle, padded = true }: ScreenProps) {
  const { colors, spacing } = useTheme();

  const inner: ViewStyle = {
    paddingHorizontal: padded ? spacing.lg : 0,
    paddingBottom: spacing.huge,
    gap: spacing.lg,
  };

  if (scroll) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView
          contentContainerStyle={[inner, contentStyle]}
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}
        >
          {children}
        </ScrollView>
      </View>
    );
  }

  return <View style={[{ flex: 1, backgroundColor: colors.background }, inner, contentStyle]}>{children}</View>;
}

export type BrandHeaderProps = {
  title: string;
  subtitle?: string;
  /** Contenu aligné à droite (cloche, avatar…). */
  right?: React.ReactNode;
  /** Affiche la flèche de retour. */
  back?: boolean;
  /** Bloc libre rendu sous le titre, à l'intérieur du dégradé. */
  children?: React.ReactNode;
};

/**
 * En-tête violet à coins inférieurs arrondis, présent sur la plupart
 * des écrans des maquettes.
 */
export function BrandHeader({ title, subtitle, right, back, children }: BrandHeaderProps) {
  const { gradients, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <LinearGradient
      colors={gradients.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        paddingTop: insets.top + spacing.md,
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xl,
        borderBottomLeftRadius: radius.xxl,
        borderBottomRightRadius: radius.xxl,
        gap: spacing.lg,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        {back && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retour"
            onPress={() => router.back()}
            hitSlop={12}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </Pressable>
        )}

        <View style={{ flex: 1 }}>
          <Text variant="h2" tone="onBrand" numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text variant="small" tone="onBrandMuted" numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        {right}
      </View>

      {children}
    </LinearGradient>
  );
}

/** Écran à fond violet plein (splash, onboarding). */
export function BrandScreen({ children }: { children: React.ReactNode }) {
  const { gradients } = useTheme();
  return (
    <LinearGradient colors={gradients.brand} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>{children}</SafeAreaView>
    </LinearGradient>
  );
}
