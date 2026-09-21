import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';
import { hitSize } from '@/theme/tokens';

import { Text } from './Text';

type Variant = 'primary' | 'accent' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

export type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  icon?: keyof typeof Ionicons.glyphMap;
  /** Place l'icône après le libellé (ex. « Continuer → »). */
  iconAfter?: boolean;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconAfter,
  loading,
  disabled,
  fullWidth = true,
  style,
}: ButtonProps) {
  const { colors, radius, spacing } = useTheme();
  const isDisabled = disabled || loading;

  const height = size === 'sm' ? 38 : size === 'lg' ? 56 : hitSize + 4;
  const textVariant = size === 'sm' ? 'small' : 'bodyStrong';

  const surface: Record<Variant, ViewStyle> = {
    primary: { backgroundColor: colors.primary },
    accent: { backgroundColor: colors.accent },
    outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.border },
    ghost: { backgroundColor: 'transparent' },
  };

  const foreground: Record<Variant, string> = {
    primary: colors.primaryOn,
    accent: colors.accentOn,
    outline: colors.text,
    ghost: colors.primary,
  };

  const content = (
    <>
      {icon && !iconAfter && <Ionicons name={icon} size={18} color={foreground[variant]} />}
      <Text variant={textVariant} style={{ color: foreground[variant] }}>
        {label}
      </Text>
      {icon && iconAfter && <Ionicons name={icon} size={18} color={foreground[variant]} />}
    </>
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      accessibilityLabel={label}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        surface[variant],
        {
          height,
          borderRadius: radius.lg,
          paddingHorizontal: spacing.xl,
          gap: spacing.sm,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <View style={styles.base}>
          <ActivityIndicator color={foreground[variant]} />
        </View>
      ) : (
        content
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
