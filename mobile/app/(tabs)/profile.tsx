import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Avatar, Badge, BrandHeader, Card, Text } from '@/components/ui';
import { useSession } from '@/contexts/SessionContext';
import { useTheme } from '@/theme';
import { formatNumber } from '@/utils/format';

type Row = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  danger?: boolean;
};

export default function ProfileScreen() {
  const router = useRouter();
  const { colors, spacing, radius, mode, setMode } = useTheme();
  const { user, signOut } = useSession();

  const rows: Row[] = [
    { key: 'profile', label: 'Mon profil', icon: 'person-outline' },
    { key: 'courses', label: 'Mes cours', icon: 'book-outline', onPress: () => router.push('/(tabs)/courses') },
    { key: 'certs', label: 'Mes certifications', icon: 'ribbon-outline', onPress: () => router.push('/exams') },
    { key: 'wallet', label: 'Mon portefeuille NabeCoins', icon: 'wallet-outline', onPress: () => router.push('/(tabs)/nabecoins') },
    { key: 'notifications', label: 'Notifications', icon: 'notifications-outline', onPress: () => router.push('/notifications') },
    { key: 'settings', label: 'Paramètres', icon: 'settings-outline' },
    { key: 'help', label: 'Aide & support', icon: 'help-circle-outline' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <BrandHeader title="Profil">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}>
          <Avatar name={user?.fullName ?? 'NeoClass'} size={64} ring />

          <View style={{ flex: 1, gap: spacing.xs }}>
            <Text variant="h3" tone="onBrand" numberOfLines={1}>
              {user?.fullName ?? 'Invité'}
            </Text>
            <Text variant="caption" tone="onBrandMuted">
              {user?.level ?? '—'}
            </Text>

            <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs }}>
              <Badge label={`Niveau ${user?.rank ?? 1}`} tone="accent" />
              <Badge label={`${formatNumber(user?.nabecoins ?? 0)} NabeCoins`} tone="primary" />
            </View>
          </View>
        </View>
      </BrandHeader>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.huge }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          {[
            { label: 'Série', value: `${user?.streak ?? 0} j`, icon: 'flame-outline' as const, tint: colors.warning },
            { label: 'XP', value: formatNumber(user?.xp ?? 0), icon: 'trending-up-outline' as const, tint: colors.success },
            { label: 'Niveau', value: `${user?.rank ?? 1}`, icon: 'trophy-outline' as const, tint: colors.primary },
          ].map((stat) => (
            <Card key={stat.label} style={{ flex: 1, alignItems: 'center', gap: spacing.xs }}>
              <Ionicons name={stat.icon} size={20} color={stat.tint} />
              <Text variant="h3">{stat.value}</Text>
              <Text variant="caption" tone="faint">
                {stat.label}
              </Text>
            </Card>
          ))}
        </View>

        <Card padded={false} style={{ paddingHorizontal: spacing.lg }}>
          {rows.map((row, index) => (
            <Pressable
              key={row.key}
              accessibilityRole="button"
              accessibilityLabel={row.label}
              onPress={row.onPress}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
                paddingVertical: spacing.lg - 2,
                borderTopWidth: index === 0 ? 0 : 1,
                borderTopColor: colors.border,
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: radius.md,
                  backgroundColor: colors.brandSoft,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name={row.icon} size={17} color={colors.primary} />
              </View>

              <Text variant="body" style={{ flex: 1 }}>
                {row.label}
              </Text>

              <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
            </Pressable>
          ))}
        </Card>

        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <Ionicons name={mode === 'dark' ? 'moon' : 'sunny'} size={20} color={colors.primary} />
          <Text variant="body" style={{ flex: 1 }}>
            Thème sombre
          </Text>
          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: mode === 'dark' }}
            onPress={() => setMode(mode === 'dark' ? 'light' : 'dark')}
            style={{
              width: 48,
              height: 28,
              borderRadius: radius.pill,
              backgroundColor: mode === 'dark' ? colors.primary : colors.surfaceMuted,
              padding: 3,
              justifyContent: 'center',
              alignItems: mode === 'dark' ? 'flex-end' : 'flex-start',
            }}
          >
            <View style={{ width: 22, height: 22, borderRadius: radius.pill, backgroundColor: colors.surface }} />
          </Pressable>
        </Card>

        <Pressable
          accessibilityRole="button"
          onPress={() => {
            signOut();
            router.replace('/(auth)/login');
          }}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.sm,
            paddingVertical: spacing.lg,
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Ionicons name="log-out-outline" size={18} color={colors.danger} />
          <Text variant="bodyStrong" tone="danger">
            Déconnexion
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
