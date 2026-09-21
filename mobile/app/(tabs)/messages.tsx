import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, RefreshControl, View } from 'react-native';

import { ConversationRow } from '@/components/domain';
import { BrandHeader, EmptyState, ErrorState, Skeleton, Text } from '@/components/ui';
import { useAsync } from '@/hooks/useAsync';
import { messageService } from '@/services';
import { useTheme } from '@/theme';

type Tab = 'conversations' | 'communaute';

export default function MessagesScreen() {
  const router = useRouter();
  const { colors, spacing, radius, shadows } = useTheme();
  const [tab, setTab] = useState<Tab>('conversations');

  const load = useCallback(() => messageService.conversations(), []);
  const { state, refreshing, refresh, reload } = useAsync(load, []);

  const visible =
    state.status === 'ready'
      ? state.data.filter((c) => (tab === 'communaute' ? c.kind !== 'direct' : true))
      : [];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <BrandHeader title="Messages">
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {(
            [
              { key: 'conversations', label: 'Mes conversations' },
              { key: 'communaute', label: 'Communauté' },
            ] as { key: Tab; label: string }[]
          ).map((item) => {
            const active = tab === item.key;
            return (
              <Pressable
                key={item.key}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                onPress={() => setTab(item.key)}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  paddingVertical: spacing.sm + 2,
                  borderRadius: radius.pill,
                  backgroundColor: active ? '#FFFFFF' : 'rgba(255,255,255,0.14)',
                }}
              >
                <Text variant="small" style={{ color: active ? colors.primary : '#FFFFFF' }}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </BrandHeader>

      {state.status === 'loading' && (
        <View style={{ padding: spacing.lg, gap: spacing.lg }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={52} radius={12} />
          ))}
        </View>
      )}

      {state.status === 'error' && <ErrorState message={state.error} onRetry={reload} />}

      {state.status === 'empty' && (
        <EmptyState
          icon="chatbubbles-outline"
          title="Aucune conversation"
          message="Tes échanges avec ta classe et tes professeurs apparaîtront ici."
        />
      )}

      {state.status === 'ready' && (
        <FlashList
          data={visible}
          keyExtractor={(item) => item.id}
          estimatedItemSize={74}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.huge }}
          ItemSeparatorComponent={() => (
            <View style={{ height: 1, backgroundColor: colors.border, marginLeft: 58 }} />
          )}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
          renderItem={({ item }) => <ConversationRow conversation={item} onPress={() => router.push(`/conversation/${item.id}`)} />}
        />
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Nouvelle conversation"
        onPress={() => router.push('/darx')}
        style={({ pressed }) => [
          {
            position: 'absolute',
            right: spacing.lg,
            bottom: spacing.xl,
            width: 56,
            height: 56,
            borderRadius: radius.pill,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.88 : 1,
          },
          shadows.floating,
        ]}
      >
        <Ionicons name="create-outline" size={24} color={colors.primaryOn} />
      </Pressable>
    </View>
  );
}
