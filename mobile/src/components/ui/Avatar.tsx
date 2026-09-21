import { Image } from 'expo-image';
import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/theme';

import { Text } from './Text';

export type AvatarProps = {
  name: string;
  uri?: string;
  size?: number;
  /** Anneau clair, pour les avatars posés sur un en-tête violet. */
  ring?: boolean;
};

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function Avatar({ name, uri, size = 40, ring }: AvatarProps) {
  const { colors, palette } = useTheme();

  const ringStyle = ring ? { borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)' } : null;

  if (uri) {
    return (
      <Image
        source={{ uri }}
        accessibilityLabel={name}
        style={[{ width: size, height: size, borderRadius: size / 2 }, ringStyle]}
        contentFit="cover"
        transition={200}
      />
    );
  }

  return (
    <View
      accessibilityLabel={name}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: palette.violet100,
          alignItems: 'center',
          justifyContent: 'center',
        },
        ringStyle,
      ]}
    >
      <Text style={{ fontSize: size * 0.38, fontWeight: '800', color: colors.primary }}>
        {initials(name)}
      </Text>
    </View>
  );
}
