import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { BrandHeader, Button, Card, ErrorState, Loader, ProgressBar, SubjectIcon, Text } from '@/components/ui';
import { useAsync } from '@/hooks/useAsync';
import { courseService } from '@/services';
import { useTheme } from '@/theme';
import { formatDuration, formatNumber } from '@/utils/format';

type Tab = 'apropos' | 'modules' | 'avis';

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, spacing, radius } = useTheme();
  const [tab, setTab] = useState<Tab>('apropos');

  const load = useCallback(() => courseService.byId(String(id)), [id]);
  const { state, reload } = useAsync(load, [id], { emptyWhenArrayEmpty: false });

  if (state.status === 'loading') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <BrandHeader title="Cours" back />
        <Loader label="Chargement du cours…" />
      </View>
    );
  }

  if (state.status === 'error' || state.status === 'empty' || !state.data) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <BrandHeader title="Cours" back />
        <ErrorState message="Ce cours est introuvable." onRetry={reload} />
      </View>
    );
  }

  const course = state.data;
  const ratio = course.progress?.ratio ?? 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <BrandHeader title={course.title} subtitle={course.level} back>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}>
          <SubjectIcon subject={course.subject} size={56} />
          <View style={{ flex: 1, gap: spacing.xs }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              <Ionicons name="star" size={14} color="#FBBF24" />
              <Text variant="caption" tone="onBrand">
                {course.rating.toFixed(1)} ({formatNumber(course.ratingCount)} avis)
              </Text>
            </View>
            <Text variant="caption" tone="onBrandMuted">
              {course.moduleCount} modules · {formatDuration(course.durationMin)}
            </Text>
          </View>
        </View>
      </BrandHeader>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.huge }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {(
            [
              { key: 'apropos', label: 'À propos' },
              { key: 'modules', label: 'Modules' },
              { key: 'avis', label: 'Avis' },
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
                  borderBottomWidth: 2,
                  borderBottomColor: active ? colors.primary : 'transparent',
                }}
              >
                <Text variant="small" tone={active ? 'primary' : 'muted'}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {course.progress && (
          <Card style={{ gap: spacing.sm }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text variant="small" tone="muted">
                Ta progression
              </Text>
              <Text variant="small" tone="primary">
                {Math.round(ratio * 100)} %
              </Text>
            </View>
            <ProgressBar value={ratio} label={`Progression de ${course.title}`} />
            <Text variant="caption" tone="faint">
              {course.progress.completedModules} modules terminés sur {course.progress.totalModules}
            </Text>
          </Card>
        )}

        {tab === 'apropos' && (
          <>
            <Text variant="body" tone="muted">
              {course.description}
            </Text>

            <Button
              label={ratio > 0 ? 'Continuer le cours' : 'Commencer le cours'}
              variant="accent"
              size="lg"
              icon="play"
              onPress={() => router.push(`/lesson/${course.id}`)}
            />

            <Card style={{ gap: spacing.md }}>
              <Text variant="h3">Ce que vous allez apprendre</Text>
              {course.objectives.map((objective) => (
                <View key={objective} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm }}>
                  <Ionicons name="checkmark" size={16} color={colors.success} style={{ marginTop: 3 }} />
                  <Text variant="small" tone="muted" style={{ flex: 1 }}>
                    {objective}
                  </Text>
                </View>
              ))}
            </Card>
          </>
        )}

        {tab === 'modules' && (
          <View style={{ gap: spacing.md }}>
            {Array.from({ length: course.moduleCount }, (_, i) => i + 1).map((n) => {
              const done = n <= (course.progress?.completedModules ?? 0);
              return (
                <Card key={n} onPress={() => router.push(`/lesson/${course.id}`)}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                    <View
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: radius.md,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: done ? colors.successSoft : colors.brandSoft,
                      }}
                    >
                      <Ionicons
                        name={done ? 'checkmark' : 'play'}
                        size={15}
                        color={done ? colors.success : colors.primary}
                      />
                    </View>

                    <View style={{ flex: 1, gap: 2 }}>
                      <Text variant="bodyStrong">Module {n}</Text>
                      <Text variant="caption" tone="faint">
                        {done ? 'Terminé' : 'Non commencé'}
                      </Text>
                    </View>

                    <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
                  </View>
                </Card>
              );
            })}
          </View>
        )}

        {tab === 'avis' && (
          <Card style={{ alignItems: 'center', gap: spacing.sm }}>
            <Text variant="display">{course.rating.toFixed(1)}</Text>
            <View style={{ flexDirection: 'row', gap: 2 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Ionicons
                  key={n}
                  name={n <= Math.round(course.rating) ? 'star' : 'star-outline'}
                  size={18}
                  color="#FBBF24"
                />
              ))}
            </View>
            <Text variant="small" tone="muted">
              {formatNumber(course.ratingCount)} avis d’élèves
            </Text>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}
