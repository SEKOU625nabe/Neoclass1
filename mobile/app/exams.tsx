import React, { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';

import { CertificationCard, ExamCard } from '@/components/domain';
import { BrandHeader, EmptyState, ErrorState, Skeleton, Text } from '@/components/ui';
import { useAsync } from '@/hooks/useAsync';
import { examService } from '@/services';
import { useTheme } from '@/theme';

type Tab = 'examens' | 'certifications';

export default function ExamsScreen() {
  const { colors, spacing, radius } = useTheme();
  const [tab, setTab] = useState<Tab>('examens');

  const load = useCallback(
    async () => ({
      exams: await examService.list(),
      certifications: await examService.certifications(),
    }),
    [],
  );
  const { state, refreshing, refresh, reload } = useAsync(load, [], { emptyWhenArrayEmpty: false });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <BrandHeader title="Examens & Certifications" back>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {(
            [
              { key: 'examens', label: 'Mes examens' },
              { key: 'certifications', label: 'Certifications' },
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

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.huge }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
      >
        {state.status === 'loading' && [0, 1, 2].map((i) => <Skeleton key={i} height={130} radius={20} />)}

        {state.status === 'error' && <ErrorState message={state.error} onRetry={reload} />}

        {state.status === 'ready' && tab === 'examens' && (
          state.data.exams.length === 0 ? (
            <EmptyState icon="document-text-outline" title="Aucun examen programmé" />
          ) : (
            state.data.exams.map((exam) => <ExamCard key={exam.id} exam={exam} onPress={() => undefined} />)
          )
        )}

        {state.status === 'ready' && tab === 'certifications' && (
          state.data.certifications.length === 0 ? (
            <EmptyState icon="ribbon-outline" title="Aucune certification" />
          ) : (
            state.data.certifications.map((certification) => (
              <CertificationCard key={certification.id} certification={certification} onPress={() => undefined} />
            ))
          )
        )}

        <Text variant="caption" tone="faint" center>
          Les certificats validés sont téléchargeables en PDF.
        </Text>
      </ScrollView>
    </View>
  );
}
