import type { ViewStyle } from 'react-native';

export const Colors = {
  primary: '#16A34A',
  secondary: '#86EFAC',
  text: '#1F2937',
  textSecondary: '#6B7280',
  background: '#F3F4F6',
  card: '#FFFFFF',
  white: '#FFFFFF',
  border: '#E5E7EB',
  success: '#15803D',
  error: '#EF4444',
  softGreen: '#DCFCE7',
  softRed: '#FEE2E2',
  placeholder: '#9CA3AF',
  overlay: 'rgba(17, 24, 39, 0.45)',
} as const;

export const Radius = {
  card: 16,
  button: 12,
  input: 12,
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
  section: 20,
} as const;

export const Shadow: { card: ViewStyle; floating: ViewStyle } = {
  card: {
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  floating: {
    elevation: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
  },
};
