import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useTheme } from '@/theme';

import { Button } from './Button';
import { Text } from './Text';

/** Indicateur de chargement centré. */
export function Loader({ label }: { label?: string }) {
  const { colors, spacing } = useTheme();
  return (
    <View style={{ paddingVertical: spacing.huge, alignItems: 'center', gap: spacing.md }}>
      <ActivityIndicator color={colors.primary} size="large" />
      {label && (
        <Text variant="small" tone="muted">
          {label}
        </Text>
      )}
    </View>
  );
}

/**
 * Bloc gris qui préfigure le contenu pendant le chargement.
 * Préféré au spinner sur les listes : l'écran ne « saute » pas.
 */
export function Skeleton({ height = 16, width = '100%', radius: r }: { height?: number; width?: number | `${number}%`; radius?: number }) {
  const { colors, radius } = useTheme();
  return (
    <View
      style={{
        height,
        width,
        borderRadius: r ?? radius.sm,
        backgroundColor: colors.surfaceMuted,
      }}
    />
  );
}

export type EmptyStateProps = {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ icon = 'sparkles-outline', title, message, actionLabel, onAction }: EmptyStateProps) {
  const { colors, spacing, radius } = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingVertical: spacing.huge, paddingHorizontal: spacing.xl, gap: spacing.md }}>
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: radius.xxl,
          backgroundColor: colors.brandSoft,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={icon} size={28} color={colors.primary} />
      </View>
      <Text variant="h3" center>
        {title}
      </Text>
      {message && (
        <Text variant="small" tone="muted" center>
          {message}
        </Text>
      )}
      {actionLabel && onAction && <Button label={actionLabel} onPress={onAction} fullWidth={false} size="sm" />}
    </View>
  );
}

export type ErrorStateProps = {
  message?: string;
  onRetry?: () => void;
};

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <EmptyState
      icon="cloud-offline-outline"
      title="Impossible de charger"
      message={message ?? 'Vérifie ta connexion et réessaie.'}
      actionLabel={onRetry ? 'Réessayer' : undefined}
      onAction={onRetry}
    />
  );
}
