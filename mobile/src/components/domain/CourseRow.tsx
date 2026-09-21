import React from 'react';
import { View } from 'react-native';

import { Badge, Card, ProgressBar, SubjectIcon, Text } from '@/components/ui';
import { useTheme } from '@/theme';
import type { Course, Progress } from '@/types';
import { formatDuration } from '@/utils/format';

export type CourseRowProps = {
  course: Course;
  progress?: Progress;
  onPress?: () => void;
};

/**
 * Ligne de la liste « Mes cours » : icône de matière, titre, niveau,
 * modules terminés, durée, puis pastille de progression à droite.
 */
export function CourseRow({ course, progress, onPress }: CourseRowProps) {
  const { colors, spacing } = useTheme();
  const ratio = progress?.ratio ?? 0;
  const percent = Math.round(ratio * 100);

  return (
    <Card onPress={onPress} style={{ gap: spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <SubjectIcon subject={course.subject} />

        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="bodyStrong" numberOfLines={1}>
            {course.title}
          </Text>
          <Text variant="small" tone="muted" numberOfLines={1}>
            {course.level}
          </Text>
          <Text variant="caption" tone="faint" numberOfLines={1}>
            {progress
              ? `${progress.completedModules}/${progress.totalModules} modules · ${formatDuration(course.durationMin)}`
              : `${course.moduleCount} modules · ${formatDuration(course.durationMin)}`}
          </Text>
        </View>

        <Badge
          label={`${percent}%`}
          tone={percent >= 60 ? 'success' : percent > 0 ? 'warning' : 'neutral'}
        />
      </View>

      <ProgressBar
        value={ratio}
        label={`Progression de ${course.title}`}
        color={percent >= 60 ? colors.success : colors.primary}
      />
    </Card>
  );
}
