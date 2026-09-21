import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';

import { ExerciseCard } from '@/components/domain';
import { BrandHeader, EmptyState, ErrorState, Skeleton, SubjectIcon, Text } from '@/components/ui';
import { useAsync } from '@/hooks/useAsync';
import { courseService } from '@/services';
import { useTheme } from '@/theme';
import type { ExerciseStatus } from '@/types';

type Filter = 'tous' | ExerciseStatus;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'tous', label: 'Tous' },
  { key: 'todo', label: 'Non faits' },
  { key: 'in_progress', label: 'En cours' },
  { key: 'done', label: 'Terminés' },
];

export default function ExercisesScreen() {
  const router = useRouter();
  const { colors, spacing, radius } = useTheme();
  const [filter, setFilter] = useState<Filter>('tous');

  const load = useCallback(() => courseService.exercises('c-maths'), []);
  const { state, refreshing, refresh, reload } = useAsync(load, []);

  const visible =
    state.status === 'ready'
      ? state.data.filter((e) => (filter === 'tous' ? true : e.status === filter))
      : [];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <BrandHeader title="Exercices" back>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <SubjectIcon subject="maths" size={44} />
          <View style={{ gap: 2 }}>
            <Text variant="bodyStrong" tone="onBrand">
              Mathématiques
            </Text>
            <Text variant="caption" tone="onBrandMuted">
              Terminale SM
            </Text>
          </View>
        </View>
      </BrandHeader>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: spacing.sm, padding: spacing.lg, paddingBottom: spacing.md }}
        style={{ flexGrow: 0 }}
      >
        {FILTERS.map((item) => {
          const active = filter === item.key;
          return (
            <Pressable
              key={item.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              onPress={() => setFilter(item.key)}
              style={{
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.sm,
                borderRadius: radius.pill,
                backgroundColor: active ? colors.primary : colors.surface,
                borderWidth: 1,
                borderColor: active ? colors.primary : colors.border,
              }}
            >
              <Text variant="small" style={{ color: active ? colors.primaryOn : colors.textMuted }}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.huge, gap: spacing.md }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
      >
        {state.status === 'loading' &&
          [0, 1, 2].map((i) => <Skeleton key={i} height={130} radius={20} />)}

        {state.status === 'error' && <ErrorState message={state.error} onRetry={reload} />}

        {state.status === 'empty' && (
          <EmptyState icon="create-outline" title="Aucun exercice" message="Reviens plus tard." />
        )}

        {state.status === 'ready' && visible.length === 0 && (
          <EmptyState icon="filter-outline" title="Rien dans ce filtre" message="Change de filtre pour voir d’autres exercices." />
        )}

        {visible.map((exercise, index) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            index={index + 1}
            onPress={() => router.push(`/quiz/${exercise.id}`)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
