import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';

import { BrandScreen, Button, Card, Input, Text } from '@/components/ui';
import { useSession } from '@/contexts/SessionContext';
import { useTheme } from '@/theme';
import type { EducationSystem } from '@/types';

const SYSTEMS: { key: EducationSystem; label: string }[] = [
  { key: 'guinea', label: 'Système guinéen 🇬🇳' },
  { key: 'france', label: 'Système français 🇫🇷' },
];

export default function RegisterScreen() {
  const router = useRouter();
  const { colors, spacing, radius } = useTheme();
  const { signIn, pendingRole } = useSession();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [system, setSystem] = useState<EducationSystem>('guinea');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (fullName.trim().length < 3) next.fullName = 'Indique ton nom complet.';
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = 'Adresse e-mail invalide.';
    if (password.length < 6) next.password = 'Au moins 6 caractères.';
    if (confirm !== password) next.confirm = 'Les mots de passe ne correspondent pas.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    try {
      await signIn();
      router.replace('/(tabs)');
    } finally {
      setLoading(false);
    }
  }

  return (
    <BrandScreen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg, flexGrow: 1, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ gap: spacing.xs }}>
            <Text variant="h1" tone="onBrand">
              Créer mon compte
            </Text>
            {pendingRole && (
              <Text variant="small" tone="onBrandMuted">
                Profil sélectionné : {pendingRole === 'student' ? 'Élève' : pendingRole === 'indep_student' ? 'Étudiant' : pendingRole === 'teacher' ? 'Enseignant' : 'Parent'}
              </Text>
            )}
          </View>

          <Card style={{ gap: spacing.lg }}>
            <Input
              label="Nom complet"
              icon="person-outline"
              placeholder="Prénom Nom"
              value={fullName}
              onChangeText={setFullName}
              error={errors.fullName}
              autoComplete="name"
            />

            <Input
              label="Adresse e-mail"
              icon="mail-outline"
              placeholder="ton.email@exemple.com"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              autoCapitalize="none"
              keyboardType="email-address"
              inputMode="email"
            />

            <View style={{ gap: spacing.sm }}>
              <Text variant="small" tone="muted">
                Système éducatif
              </Text>
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                {SYSTEMS.map((option) => {
                  const active = system === option.key;
                  return (
                    <Pressable
                      key={option.key}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: active }}
                      onPress={() => setSystem(option.key)}
                      style={{
                        flex: 1,
                        paddingVertical: spacing.md,
                        borderRadius: radius.lg,
                        borderWidth: 1.5,
                        borderColor: active ? colors.primary : colors.border,
                        backgroundColor: active ? colors.brandSoft : colors.surface,
                        alignItems: 'center',
                      }}
                    >
                      <Text variant="small" tone={active ? 'primary' : 'muted'}>
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <Input
              label="Mot de passe"
              icon="lock-closed-outline"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              autoCapitalize="none"
              secure
            />

            <Input
              label="Confirmer le mot de passe"
              icon="lock-closed-outline"
              placeholder="••••••••"
              value={confirm}
              onChangeText={setConfirm}
              error={errors.confirm}
              autoCapitalize="none"
              secure
            />

            <Button label="Créer mon compte" size="lg" loading={loading} onPress={handleSubmit} />

            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing.xs }}>
              <Text variant="small" tone="muted">
                Déjà un compte ?
              </Text>
              <Pressable accessibilityRole="button" onPress={() => router.replace('/(auth)/login')} hitSlop={8}>
                <Text variant="small" tone="primary">
                  Se connecter
                </Text>
              </Pressable>
            </View>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </BrandScreen>
  );
}
