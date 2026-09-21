import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';

import { CourseRow, DarxBanner, QuickActions, type QuickAction } from '@/components/domain';
import {
  Avatar,
  BrandHeader,
  EmptyState,
  ErrorState,
  Input,
  SectionHeader,
  Skeleton,
  Text,
} from '@/components/ui';
import { useSession } from '@/contexts/SessionContext';
import { useAsync } from '@/hooks/useAsync';
import { courseService, notificationService } from '@/services';
import { useTheme } from '@/theme';
import { firstName } from '@/utils/format';

export default function HomeScreen() {
  const router = useRouter();
  const { colors, spacing, radius } = useTheme();
  const { user } = useSession();

  const load = useCallback(() => courseService.continueLearning(3), []);
  const { state, refreshing, refresh, reload } = useAsync(load, []);

  // Le badge de la cloche se recalcule au retour de l'écran Notifications.
  const [unread, setUnread] = useState(0);
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      void notificationService.unreadCount().then((count) => {
        if (alive) setUnread(count);
      });
      return () => {
        alive = false;
      };
    }, []),
  );

  const actions: QuickAction[] = [
    { key: 'courses', label: 'Mes cours', icon: 'book-outline', tint: 'primary', onPress: () => router.push('/(tabs)/courses') },
    { key: 'exercises', label: 'Exercices', icon: 'create-outline', tint: 'accent', onPress: () => router.push('/exercises') },
    { key: 'exams', label: 'Examens', icon: 'document-text-outline', tint: 'info', onPress: () => router.push('/exams') },
    { key: 'certs', label: 'Certifications', icon: 'ribbon-outline', tint: 'success', onPress: () => router.push('/exams') },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <BrandHeader
        title={`Bonjour, ${user ? firstName(user.fullName) : 'invité'} 👋`}
        subtitle="Apprends aujourd’hui, construis demain."
        right={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              onPress={() => router.push('/notifications')}
              hitSlop={10}
            >
              <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
              {unread > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    top: -2,
                    right: -2,
                    width: 9,
                    height: 9,
                    borderRadius: radius.pill,
                    backgroundColor: colors.accent,
                  }}
                />
              )}
            </Pressable>
            <Avatar name={user?.fullName ?? 'NeoClass'} size={36} ring />
          </View>
        }
      >
        <Input
          icon="search-outline"
          placeholder="Rechercher un cours, une matière..."
          onFocus={() => router.push('/(tabs)/courses')}
        />
      </BrandHeader>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl, paddingBottom: spacing.huge }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
      >
        <DarxBanner onPress={() => router.push('/darx')} />

        <QuickActions actions={actions} />

        <View style={{ gap: spacing.md }}>
          <SectionHeader
            title="Continuer mes cours"
            actionLabel="Voir tout"
            onAction={() => router.push('/(tabs)/courses')}
          />

          {state.status === 'loading' && (
            <View style={{ gap: spacing.md }}>
              <Skeleton height={104} radius={20} />
              <Skeleton height={104} radius={20} />
            </View>
          )}

          {state.status === 'error' && <ErrorState message={state.error} onRetry={reload} />}

          {state.status === 'empty' && (
            <EmptyState
              icon="book-outline"
              title="Aucun cours en cours"
              message="Explore le catalogue et commence ton premier cours."
              actionLabel="Voir les cours"
              onAction={() => router.push('/(tabs)/courses')}
            />
          )}

          {state.status === 'ready' &&
            state.data.map((course) => (
              <CourseRow
                key={course.id}
                course={course}
                progress={course.progress}
                onPress={() => router.push(`/course/${course.id}`)}
              />
            ))}
        </View>

        <Text variant="caption" tone="faint" center>
          NeoClass · Apprendre · progresser · réussir
        </Text>
      </ScrollView>
    </View>
  );
}
