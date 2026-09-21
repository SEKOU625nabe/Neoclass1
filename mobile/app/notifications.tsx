import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';

import { BrandHeader, Card, EmptyState, ErrorState, SectionHeader, Skeleton, Text } from '@/components/ui';
import { useAsync } from '@/hooks/useAsync';
import { notificationService } from '@/services';
import { useTheme } from '@/theme';
import type { AppNotification, NotificationKind } from '@/types';
import { formatRelativeTime } from '@/utils/format';

type Visual = { icon: keyof typeof Ionicons.glyphMap; tint: 'primary' | 'accent' | 'success' | 'info' };

const VISUALS: Record<NotificationKind, Visual> = {
  message: { icon: 'chatbubble-ellipses-outline', tint: 'info' },
  exam: { icon: 'calendar-outline', tint: 'primary' },
  reward: { icon: 'wallet-outline', tint: 'accent' },
  system: { icon: 'megaphone-outline', tint: 'success' },
};

/** Écran vers lequel une notification renvoie quand on la touche. */
const DESTINATIONS: Record<NotificationKind, string> = {
  message: '/(tabs)/messages',
  exam: '/exams',
  reward: '/(tabs)/nabecoins',
  system: '/(tabs)/courses',
};

function isToday(iso: string): boolean {
  const date = new Date(iso);
  return !Number.isNaN(date.getTime()) && date.toDateString() === new Date().toDateString();
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { colors, spacing, radius } = useTheme();

  const load = useCallback(() => notificationService.list(), []);
  const { state, refreshing, refresh, reload } = useAsync(load, []);

  const items = state.status === 'ready' ? state.data : [];
  const today = items.filter((n) => isToday(n.createdAt));
  const earlier = items.filter((n) => !isToday(n.createdAt));
  const unread = items.filter((n) => !n.read).length;

  async function open(notification: AppNotification) {
    await notificationService.markRead(notification.id);
    reload();
    router.push(DESTINATIONS[notification.kind] as never);
  }

  async function markAll() {
    await notificationService.markAllRead();
    reload();
  }

  function renderRow(notification: AppNotification) {
    const visual = VISUALS[notification.kind];
    const tint =
      visual.tint === 'accent'
        ? colors.warning
        : visual.tint === 'success'
          ? colors.success
          : visual.tint === 'info'
            ? colors.info
            : colors.primary;

    return (
      <Card
        key={notification.id}
        onPress={() => void open(notification)}
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: spacing.md,
          borderWidth: notification.read ? 0 : 1,
          borderColor: colors.brandSoft,
        }}
      >
        <View
          style={{
            width: 38,
            height: 38,
            borderRadius: radius.md,
            backgroundColor: colors.surfaceMuted,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name={visual.icon} size={19} color={tint} />
        </View>

        <View style={{ flex: 1, gap: 2 }}>
          <Text variant={notification.read ? 'body' : 'bodyStrong'} numberOfLines={1}>
            {notification.title}
          </Text>
          <Text variant="small" tone="muted">
            {notification.body}
          </Text>
          <Text variant="caption" tone="faint">
            {formatRelativeTime(notification.createdAt)}
          </Text>
        </View>

        {!notification.read && (
          <View style={{ width: 8, height: 8, borderRadius: radius.pill, backgroundColor: colors.primary, marginTop: 6 }} />
        )}
      </Card>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <BrandHeader
        title="Notifications"
        subtitle={unread > 0 ? `${unread} non lue${unread > 1 ? 's' : ''}` : 'Tout est à jour'}
        back
        right={
          unread > 0 ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Tout marquer comme lu" onPress={() => void markAll()} hitSlop={12}>
              <Text variant="small" tone="onBrand">
                Tout lire
              </Text>
            </Pressable>
          ) : undefined
        }
      />

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.huge, gap: spacing.md }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
      >
        {state.status === 'loading' && [0, 1, 2, 3].map((i) => <Skeleton key={i} height={86} radius={20} />)}

        {state.status === 'error' && <ErrorState message={state.error} onRetry={reload} />}

        {state.status === 'empty' && (
          <EmptyState
            icon="notifications-off-outline"
            title="Aucune notification"
            message="Tes rappels d'examens et tes gains apparaîtront ici."
          />
        )}

        {today.length > 0 && (
          <>
            <SectionHeader title="Aujourd'hui" />
            {today.map(renderRow)}
          </>
        )}

        {earlier.length > 0 && (
          <>
            <SectionHeader title="Plus tôt" />
            {earlier.map(renderRow)}
          </>
        )}
      </ScrollView>
    </View>
  );
}
