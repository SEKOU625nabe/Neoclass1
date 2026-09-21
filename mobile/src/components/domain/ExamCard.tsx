import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';

import { Badge, Button, Card, ProgressBar, Text, TileIcon } from '@/components/ui';
import { useTheme } from '@/theme';
import type { Certification, Exam, ExamStatus } from '@/types';
import { formatDate, formatDuration } from '@/utils/format';

const STATUS: Record<ExamStatus, { label: string; tone: 'info' | 'warning' | 'success' | 'danger' }> = {
  upcoming: { label: 'À venir', tone: 'info' },
  in_progress: { label: 'En cours', tone: 'warning' },
  passed: { label: 'Validé', tone: 'success' },
  failed: { label: 'Échoué', tone: 'danger' },
};

export function ExamCard({ exam, onPress }: { exam: Exam; onPress: () => void }) {
  const { colors, spacing } = useTheme();
  const status = STATUS[exam.status];

  return (
    <Card style={{ gap: spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md }}>
        <TileIcon icon="document-text-outline" bg={colors.accentSoft} fg={colors.warning} size={40} />

        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="bodyStrong" numberOfLines={2}>
            {exam.title}
          </Text>
          <Text variant="caption" tone="faint">
            {formatDate(exam.date)}
          </Text>
          <Text variant="caption" tone="faint">
            {formatDuration(exam.durationMin)} · {exam.questionCount} questions
          </Text>
        </View>

        <Badge label={status.label} tone={status.tone} />
      </View>

      <Button label="Voir les détails" onPress={onPress} size="sm" variant="outline" />
    </Card>
  );
}

export function CertificationCard({
  certification,
  onPress,
}: {
  certification: Certification;
  onPress: () => void;
}) {
  const { colors, spacing } = useTheme();

  return (
    <Card onPress={onPress} style={{ gap: spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <TileIcon
          icon={certification.validated ? 'ribbon' : 'school-outline'}
          bg={certification.validated ? colors.successSoft : colors.brandSoft}
          fg={certification.validated ? colors.success : colors.primary}
          size={40}
        />

        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="bodyStrong" numberOfLines={1}>
            {certification.title}
          </Text>
          <Text variant="caption" tone="faint">
            {certification.issuer} · {certification.progress}%
          </Text>
        </View>

        {certification.validated ? (
          <Ionicons name="checkmark-circle" size={22} color={colors.success} />
        ) : (
          <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
        )}
      </View>

      <ProgressBar
        value={certification.progress / 100}
        label={certification.title}
        color={certification.validated ? colors.success : colors.primary}
      />
    </Card>
  );
}
