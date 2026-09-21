import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Logo } from '@/components/domain/Logo';
import { BrandScreen, Button, Text } from '@/components/ui';
import { useSession } from '@/contexts/SessionContext';
import { useTheme } from '@/theme';
import type { OnboardingRole } from '@/types';

type RoleOption = {
  role: OnboardingRole;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const ROLES: RoleOption[] = [
  { role: 'student', title: 'Élève', subtitle: 'Du primaire au lycée', icon: 'school-outline' },
  { role: 'indep_student', title: 'Étudiant', subtitle: 'Université & formations', icon: 'library-outline' },
  { role: 'teacher', title: 'Enseignant', subtitle: 'Gérer vos classes', icon: 'easel-outline' },
  { role: 'parent', title: 'Parent', subtitle: 'Suivre la progression', icon: 'people-outline' },
];

/** Choix du profil, premier écran après le splash. */
export default function OnboardingScreen() {
  const router = useRouter();
  const { colors, spacing, radius } = useTheme();
  const { setPendingRole } = useSession();
  const [selected, setSelected] = useState<OnboardingRole | null>(null);

  function handleContinue() {
    if (!selected) return;
    setPendingRole(selected);
    router.push('/(auth)/login');
  }

  return (
    <BrandScreen>
      <ScrollView
        contentContainerStyle={{ padding: spacing.xl, gap: spacing.xl, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Logo size={40} />
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/(auth)/login')}
            hitSlop={12}
          >
            <Text variant="small" tone="onBrandMuted">
              Passer
            </Text>
          </Pressable>
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text variant="display" tone="onBrand">
            Bienvenue sur{'\n'}NeoClass 👋
          </Text>
          <Text variant="body" tone="onBrandMuted">
            Votre avenir commence ici. Choisissez votre profil pour une expérience personnalisée.
          </Text>
        </View>

        <View style={{ gap: spacing.md }}>
          {ROLES.map((option) => {
            const active = selected === option.role;
            return (
              <Pressable
                key={option.role}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`${option.title}. ${option.subtitle}`}
                onPress={() => setSelected(option.role)}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.md,
                  padding: spacing.lg,
                  borderRadius: radius.xl,
                  backgroundColor: active ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)',
                  borderWidth: 1.5,
                  borderColor: active ? colors.accent : 'rgba(255,255,255,0.14)',
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: radius.md,
                    backgroundColor: 'rgba(255,255,255,0.16)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name={option.icon} size={22} color={active ? colors.accent : '#FFFFFF'} />
                </View>

                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="bodyStrong" tone="onBrand">
                    {option.title}
                  </Text>
                  <Text variant="caption" tone="onBrandMuted">
                    {option.subtitle}
                  </Text>
                </View>

                <Ionicons
                  name={active ? 'checkmark-circle' : 'chevron-forward'}
                  size={20}
                  color={active ? colors.accent : 'rgba(255,255,255,0.5)'}
                />
              </Pressable>
            );
          })}
        </View>

        <View style={{ flex: 1 }} />

        <Button
          label="Continuer"
          icon="arrow-forward"
          iconAfter
          size="lg"
          disabled={!selected}
          onPress={handleContinue}
        />
      </ScrollView>
    </BrandScreen>
  );
}
