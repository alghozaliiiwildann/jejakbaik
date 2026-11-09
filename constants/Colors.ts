import type { ViewStyle } from 'react-native';

export const Colors = {
  primary: '#16A34A',
  primaryDark: '#15803D',
  primaryLight: '#22C55E',
  secondary: '#86EFAC',
  accent: '#DCFCE7',

  text: '#0F172A',
  textSecondary: '#64748B',
  background: '#F8FAFC',
  card: '#FFFFFF',
  border: '#E2E8F0',

  streakFire: '#FB923C',
  white: '#FFFFFF',
  error: '#EF4444',
  softRed: '#FEE2E2',
  placeholder: '#94A3B8',
  overlay: 'rgba(15, 23, 42, 0.5)',
  shadow: '#0F172A',
  darkSurface: '#0B3D24',
} as const;

/**
 * Gradient tuples are declared with `as const` so they satisfy
 * expo-linear-gradient's `readonly [string, string, ...string[]]` type.
 */
export const Gradients = {
  primary: ['#16A34A', '#22C55E', '#4ADE80'] as const,
  header: ['#16A34A', '#22C55E'] as const,
  dark: ['#15803D', '#166534'] as const,
  streak: ['#166534', '#15803D', '#16A34A'] as const,
  fire: ['#FB923C', '#F97316'] as const,
  soft: ['#F0FDF4', '#DCFCE7'] as const,
  cardSheen: ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.65)'] as const,
} as const;

/** Aksen warna yang bisa dipilih saat membuat kebiasaan. */
export const HABIT_ACCENT_COLORS = [
  '#16A34A',
  '#0D9488',
  '#0EA5E9',
  '#6366F1',
  '#8B5CF6',
  '#EC4899',
  '#F97316',
  '#F59E0B',
] as const;

/** 5 level warna heatmap, dari kosong sampai penuh. */
export const HEATMAP_COLORS = [
  '#F1F5F9',
  '#DCFCE7',
  '#BBF7D0',
  '#4ADE80',
  '#16A34A',
] as const;

export const Radius = {
  card: 20,
  button: 14,
  input: 14,
  pill: 999,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  screen: 20,
  section: 24,
} as const;

export const Shadow: { card: ViewStyle; floating: ViewStyle; soft: ViewStyle } = {
  card: {
    elevation: 3,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
  },
  floating: {
    elevation: 10,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
  },
  soft: {
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
};
