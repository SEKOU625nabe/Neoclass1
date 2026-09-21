import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';

import { BrandHeader, Button, Card, EmptyState, ErrorState, SectionHeader, Skeleton, Text } from '@/components/ui';
import { useSession } from '@/contexts/SessionContext';
import { useAsync } from '@/hooks/useAsync';
import { rewardService } from '@/services';
import { useTheme } from '@/theme';
import { formatNumber, formatRelativeTime } from '@/utils/format';

export default function NabeCoinsScreen() {
  const { colors, spacing, radius, gradients } = useTheme();
  const { user } = useSession();

  const load = useCallback(
    async () => ({
      history: await rewardService.history(),
      rewards: await rewardService.rewards(),
    }),
    [],
  );
  const { state, refreshing, refresh, reload } = useAsync(load, [], { emptyWhenArrayEmpty: false });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <BrandHeader title="NabeCoins" subtitle="Apprends · Gagne · Échange" />

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl, paddingBottom: spacing.huge }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
      >
        <LinearGradient
          colors={gradients.gold}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: radius.xl, padding: spacing.xl, gap: spacing.xs }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Ionicons name="wallet" size={20} color={colors.accentOn} />
            <Text variant="small" style={{ color: colors.accentOn }}>
              Solde disponible
            </Text>
          </View>
          <Text variant="display" style={{ color: colors.accentOn }}>
            {formatNumber(user?.nabecoins ?? 0)}
          </Text>
          <Text variant="caption" style={{ color: colors.accentOn, opacity: 0.8 }}>
            NabeCoins
          </Text>
        </LinearGradient>

        <Card style={{ gap: spacing.md }}>
          <Text variant="h3">Gagne des NabeCoins en :</Text>
          {[
            'suivant des cours',
            'réussissant des exercices',
            'participant aux défis',
            'invitant tes amis',
          ].map((line) => (
            <View key={line} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text variant="small" tone="muted">
                {line}
              </Text>
            </View>
          ))}
          <Button label="Échanger mes NabeCoins" variant="accent" icon="swap-horizontal-outline" />
        </Card>

        {state.status === 'loading' && (
          <View style={{ gap: spacing.md }}>
            <Skeleton height={120} radius={20} />
            <Skeleton height={180} radius={20} />
          </View>
        )}

        {state.status === 'error' && <ErrorState message={state.error} onRetry={reload} />}

        {state.status === 'ready' && (
          <>
            <View style={{ gap: spacing.md }}>
              <SectionHeader title="Récompenses populaires" />
              <View style={{ flexDirection: 'row', gap: spacing.md }}>
                {state.data.rewards.map((reward) => (
                  <Card key={reward.id} style={{ flex: 1, alignItems: 'center', gap: spacing.xs }}>
                    <Text style={{ fontSize: 26 }}>{reward.icon}</Text>
                    <Text variant="caption" center numberOfLines={2}>
                      {reward.title}
                    </Text>
                    <Text variant="caption" tone="faint" center>
                      {reward.subtitle}
                    </Text>
                  </Card>
                ))}
              </View>
            </View>

            <View style={{ gap: spacing.md }}>
              <SectionHeader title="Historique" />

              {state.data.history.length === 0 ? (
                <EmptyState icon="time-outline" title="Aucune transaction" />
              ) : (
                <Card padded={false} style={{ paddingHorizontal: spacing.lg }}>
                  {state.data.history.map((entry, index) => (
                    <View
                      key={entry.id}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: spacing.md,
                        paddingVertical: spacing.md,
                        borderTopWidth: index === 0 ? 0 : 1,
                        borderTopColor: colors.border,
                      }}
                    >
                      <View
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: radius.md,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: entry.kind === 'earn' ? colors.successSoft : colors.dangerSoft,
                        }}
                      >
                        <Ionicons
                          name={entry.kind === 'earn' ? 'arrow-down' : 'arrow-up'}
                          size={16}
                          color={entry.kind === 'earn' ? colors.success : colors.danger}
                        />
                      </View>

                      <View style={{ flex: 1, gap: 2 }}>
                        <Text variant="small" numberOfLines={1}>
                          {entry.label}
                        </Text>
                        <Text variant="caption" tone="faint">
                          {formatRelativeTime(entry.createdAt)}
                        </Text>
                      </View>

                      <Text
                        variant="bodyStrong"
                        style={{ color: entry.kind === 'earn' ? colors.success : colors.danger }}
                      >
                        {entry.kind === 'earn' ? '+' : '−'}
                        {formatNumber(entry.amount)}
                      </Text>
                    </View>
                  ))}
                </Card>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
