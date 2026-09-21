import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/theme';
import type { SubjectKey } from '@/types';

import { Text } from './Text';

/** Glyphe affiché par matière, repris des maquettes (Σ pour les maths…). */
const GLYPH: Record<SubjectKey, string> = {
  maths: 'Σ',
  physique: '⚛',
  chimie: '⚗',
  francais: '📖',
  economie: '📈',
  philosophie: '🧠',
  informatique: '💻',
};

const LABEL: Record<SubjectKey, string> = {
  maths: 'Mathématiques',
  physique: 'Physique',
  chimie: 'Chimie',
  francais: 'Français',
  economie: 'Économie',
  philosophie: 'Philosophie',
  informatique: 'Informatique',
};

export function subjectLabel(subject: SubjectKey): string {
  return LABEL[subject];
}

export type SubjectIconProps = {
  subject: SubjectKey;
  size?: number;
};

export function SubjectIcon({ subject, size = 48 }: SubjectIconProps) {
  const { radius, subjectTints } = useTheme();
  const tint = subjectTints[subject] ?? subjectTints.default!;

  return (
    <View
      accessibilityLabel={LABEL[subject]}
      style={{
        width: size,
        height: size,
        borderRadius: radius.lg,
        backgroundColor: tint.bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: size * 0.42, color: tint.fg, fontWeight: '700' }}>{GLYPH[subject]}</Text>
    </View>
  );
}

/** Variante avec une icône Ionicons plutôt qu'un glyphe (actions rapides). */
export function TileIcon({
  icon,
  bg,
  fg,
  size = 48,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  bg: string;
  fg: string;
  size?: number;
}) {
  const { radius } = useTheme();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius.lg,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons name={icon} size={size * 0.46} color={fg} />
    </View>
  );
}
