import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

export const palette = {
  bg: '#0b1220',
  surface: '#111827',
  surface2: '#1f2937',
  accent: '#22d3ee',
  accent2: '#a78bfa',
  success: '#34d399',
  warning: '#fbbf24',
  danger: '#fb7185',
  text: '#f8fafc',
  muted: '#94a3b8',
};

export const paperDark = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: palette.accent,
    secondary: palette.accent2,
    background: palette.bg,
    surface: palette.surface,
    surfaceVariant: palette.surface2,
    onSurface: palette.text,
    onSurfaceVariant: palette.muted,
    outline: '#334155',
    error: palette.danger,
  },
};

export const paperLight = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#0891b2',
    secondary: '#7c3aed',
    background: '#f8fafc',
    surface: '#ffffff',
    surfaceVariant: '#e2e8f0',
    onSurface: '#0f172a',
    onSurfaceVariant: '#475569',
    outline: '#cbd5e1',
    error: '#e11d48',
  },
};
