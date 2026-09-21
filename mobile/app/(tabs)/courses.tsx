import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, RefreshControl, View } from 'react-native';

import { CourseRow } from '@/components/domain';
import { BrandHeader, EmptyState, ErrorState, Input, Skeleton, Text } from '@/components/ui';
import { useAsync } from '@/hooks/useAsync';
import { courseService } from '@/services';
import { useTheme } from '@/theme';
import type { CourseCategory } from '@/types';

type Filter = 'toutes' | CourseCategory;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'toutes', label: 'Toutes' },
  { key: 'academique', label: 'Académique' },
  { key: 'professionnel', label: 'Professionnel' },
];

export default function CoursesScreen() {
  const router = useRouter();
  const { colors, spacing, radius } = useTheme();

  const [filter, setFilter] = useState<Filter>('toutes');
  const [query, setQuery] = useState('');

  const load = useCallback(() => {
    if (query.trim()) return courseService.search(query);
    return courseService.list(filter === 'toutes' ? undefined : filter);
  }, [filter, query]);

  const { state, refreshing, refresh, reload } = useAsync(load, [filter, query]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <BrandHeader title="Mes cours" back>
        <Input
          icon="search-outline"
          placeholder="Rechercher une matière..."
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
        />
      </BrandHeader>

      <View style={{ flexDirection: 'row', gap: spacing.sm, padding: spacing.lg, paddingBottom: spacing.md }}>
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
      </View>

      {state.status === 'loading' && (
        <View style={{ paddingHorizontal: spacing.lg, gap: spacing.md }}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} height={104} radius={20} />
          ))}
        </View>
      )}

      {state.status === 'error' && <ErrorState message={state.error} onRetry={reload} />}

      {state.status === 'empty' && (
        <EmptyState
          icon="search-outline"
          title="Aucun cours trouvé"
          message={query ? `Rien ne correspond à « ${query} ».` : 'Aucun cours dans cette catégorie.'}
        />
      )}

      {state.status === 'ready' && (
        <FlashList
          data={state.data}
          keyExtractor={(item) => item.id}
          estimatedItemSize={116}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.huge }}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
          renderItem={({ item }) => (
            <CourseRow
              course={item}
              progress={item.progress}
              onPress={() => router.push(`/course/${item.id}`)}
            />
          )}
        />
      )}
    </View>
  );
}
