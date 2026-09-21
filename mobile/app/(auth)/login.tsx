import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';

import { Logo } from '@/components/domain/Logo';
import { BrandScreen, Button, Card, Input, Text } from '@/components/ui';
import { useSession } from '@/contexts/SessionContext';
import { useTheme } from '@/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { spacing } = useTheme();
  const { signIn } = useSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const next: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = 'Adresse e-mail invalide.';
    if (password.length < 6) next.password = 'Au moins 6 caractères.';
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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ padding: spacing.xl, gap: spacing.xl, flexGrow: 1, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ alignItems: 'center', gap: spacing.md }}>
            <Logo size={64} />
            <Text variant="h1" tone="onBrand">
              NeoClass
            </Text>
            <Text variant="small" tone="onBrandMuted" center>
              Plateforme éducative pour une Afrique meilleure
            </Text>
          </View>

          <Card style={{ gap: spacing.lg }}>
            <Text variant="h2">Se connecter</Text>

            <Input
              label="Adresse e-mail"
              icon="mail-outline"
              placeholder="ton.email@exemple.com"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              inputMode="email"
            />

            <Input
              label="Mot de passe"
              icon="lock-closed-outline"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              autoCapitalize="none"
              autoComplete="current-password"
              secure
            />

            <Pressable accessibilityRole="button" hitSlop={8} style={{ alignSelf: 'flex-end' }}>
              <Text variant="caption" tone="primary">
                Mot de passe oublié ?
              </Text>
            </Pressable>

            <Button label="Se connecter" size="lg" loading={loading} onPress={handleSubmit} />

            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing.xs }}>
              <Text variant="small" tone="muted">
                Pas de compte ?
              </Text>
              <Pressable accessibilityRole="button" onPress={() => router.push('/(auth)/register')} hitSlop={8}>
                <Text variant="small" tone="primary">
                  Créer un compte
                </Text>
              </Pressable>
            </View>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </BrandScreen>
  );
}
