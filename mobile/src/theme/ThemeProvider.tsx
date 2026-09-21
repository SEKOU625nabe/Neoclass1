import React, { createContext, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

import { darkColors, gradients, lightColors, palette, subjectTints, type ThemeColors } from './colors';
import { radius, shadows, spacing, typography } from './tokens';

export type ThemeMode = 'light' | 'dark' | 'system';

export type Theme = {
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  shadows: typeof shadows;
  gradients: typeof gradients;
  palette: typeof palette;
  subjectTints: typeof subjectTints;
  isDark: boolean;
};

type ThemeContextValue = Theme & {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('light');

  const value = useMemo<ThemeContextValue>(() => {
    const isDark = mode === 'system' ? systemScheme === 'dark' : mode === 'dark';
    return {
      colors: isDark ? darkColors : lightColors,
      spacing,
      radius,
      typography,
      shadows,
      gradients,
      palette,
      subjectTints,
      isDark,
      mode,
      setMode,
    };
  }, [mode, systemScheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme doit être utilisé dans un <ThemeProvider>.');
  return ctx;
}
