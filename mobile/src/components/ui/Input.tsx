import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, TextInput, View, type TextInputProps } from 'react-native';

import { useTheme } from '@/theme';
import { hitSize } from '@/theme/tokens';

import { Text } from './Text';

export type InputProps = Omit<TextInputProps, 'style'> & {
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
  /** Affiche l'œil de bascule et masque la saisie. */
  secure?: boolean;
};

export function Input({ label, icon, error, secure, ...rest }: InputProps) {
  const { colors, radius, spacing, typography } = useTheme();
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(!!secure);

  const borderColor = error ? colors.danger : focused ? colors.primary : colors.border;

  return (
    <View style={{ gap: spacing.xs }}>
      {label && (
        <Text variant="small" tone="muted">
          {label}
        </Text>
      )}

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          minHeight: hitSize + 6,
          paddingHorizontal: spacing.lg,
          borderRadius: radius.lg,
          borderWidth: 1.5,
          borderColor,
          backgroundColor: colors.surface,
        }}
      >
        {icon && <Ionicons name={icon} size={18} color={colors.textFaint} />}

        <TextInput
          style={[typography.body, { flex: 1, color: colors.text, paddingVertical: spacing.md }]}
          placeholderTextColor={colors.textFaint}
          secureTextEntry={hidden}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />

        {secure && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Afficher le mot de passe' : 'Masquer le mot de passe'}
            onPress={() => setHidden((v) => !v)}
            hitSlop={12}
          >
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={18} color={colors.textFaint} />
          </Pressable>
        )}
      </View>

      {error && (
        <Text variant="caption" tone="danger">
          {error}
        </Text>
      )}
    </View>
  );
}
