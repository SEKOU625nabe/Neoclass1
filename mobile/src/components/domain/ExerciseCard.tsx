import React from 'react';
import { View } from 'react-native';

import { Badge, Button, Card, Text } from '@/components/ui';
import { useTheme } from '@/theme';
import type { Difficulty, Exercise } from '@/types';

const DIFFICULTY_TONE: Record<Difficulty, 'success' | 'warning' | 'danger'> = {
  facile: 'success',
  moyenne: 'warning',
  difficile: 'danger',
};

const STATUS_LABEL: Record<Exercise['status'], string> = {
  todo: 'Commencer',
  in_progress: 'Reprendre',
  done: 'Revoir',
};

export type ExerciseCardProps = {
  exercise: Exercise;
  /** Rang affiché dans la pastille de gauche (1, 2, 3…). */
  index: number;
  onPress: () => void;
};

export function ExerciseCard({ exercise, index, onPress }: ExerciseCardProps) {
  const { colors, spacing, radius } = useTheme();

  return (
    <Card style={{ gap: spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md }}>
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: radius.md,
            backgroundColor: colors.accentSoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text variant="caption" style={{ color: colors.warning }}>
            {index}
          </Text>
        </View>

        <View style={{ flex: 1, gap: spacing.xs }}>
          <Text variant="bodyStrong" numberOfLines={2}>
            {exercise.title}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Text variant="caption" tone="faint">
              {exercise.questionCount} questions
            </Text>
            <Badge label={`Difficulté ${exercise.difficulty}`} tone={DIFFICULTY_TONE[exercise.difficulty]} />
          </View>
        </View>
      </View>

      <Button
        label={STATUS_LABEL[exercise.status]}
        onPress={onPress}
        size="sm"
        variant={exercise.status === 'done' ? 'outline' : 'primary'}
      />
    </Card>
  );
}
