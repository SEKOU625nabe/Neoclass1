import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';

import { BrandScreen, ProgressBar, Text } from '@/components/ui';
import { Logo } from '@/components/domain/Logo';
import { useTheme } from '@/theme';

/** Écran de démarrage : logo, signature, puis bascule vers l'onboarding. */
export default function SplashScreen() {
  const router = useRouter();
  const { spacing } = useTheme();

  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(rise, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => router.replace('/(auth)/onboarding'), 1900);
    return () => clearTimeout(timer);
  }, [fade, rise, router]);

  return (
    <BrandScreen>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.xxl }}>
        <Animated.View style={{ opacity: fade, transform: [{ translateY: rise }], alignItems: 'center', gap: spacing.md }}>
          <Logo size={96} />
          <Text variant="display" tone="onBrand">
            NeoClass
          </Text>
          <Text variant="small" tone="onBrandMuted">
            Apprendre · progresser · réussir
          </Text>
        </Animated.View>
      </View>

      <View style={{ paddingHorizontal: spacing.huge, paddingBottom: spacing.huge, gap: spacing.lg }}>
        <Text variant="small" tone="onBrandMuted" center>
          Une nouvelle façon d’apprendre en Afrique et au-delà.
        </Text>
        <ProgressBar value={0.35} trackColor="rgba(255,255,255,0.2)" color="#FBBF24" label="Chargement" />
      </View>
    </BrandScreen>
  );
}
