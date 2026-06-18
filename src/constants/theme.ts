import '@/global.css';

export const Colors = {
  light: {
    text: '#1F1B2D',
    background: '#FFF8F1',
    backgroundElement: '#F4EBDD',
    backgroundSelected: '#E9DCC5',
    textSecondary: '#6E5F4A',
    border: '#D6C7AF',
    primary: '#7A3FF2',
    primaryText: '#FFF8F1',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light;

export const Fonts = {
  sans: 'normal',
  serif: 'serif',
  rounded: 'normal',
  mono: 'monospace',
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const MaxContentWidth = 800;
