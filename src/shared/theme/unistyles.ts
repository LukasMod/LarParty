import { Platform } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

const spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

const radius = {
  pill: 999,
  card: 24,
  control: 16,
} as const;

const fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

const createTheme = (colors: {
  text: string;
  textSecondary: string;
  background: string;
  backgroundMuted: string;
  surface: string;
  surfaceMuted: string;
  surfaceSelected: string;
  border: string;
  primary: string;
  primaryText: string;
  danger: string;
  dangerText: string;
  inputBackground: string;
  inputBorder: string;
  headerBackground: string;
  cardPreviewAccent: string;
}) => ({
  colors: {
    ...colors,
    backgroundElement: colors.surface,
    backgroundSelected: colors.surfaceSelected,
  },
  spacing,
  radius,
  fonts,
});

export const appThemes = {
  default: createTheme({
    text: '#1F1B2D',
    textSecondary: '#5C5140',
    background: '#FFF8F1',
    backgroundMuted: '#F7EFE2',
    surface: '#F4EBDD',
    surfaceMuted: '#EEE2CF',
    surfaceSelected: '#E4D4B9',
    border: '#CDBB9D',
    primary: '#6F3CEB',
    primaryText: '#FFF8F1',
    danger: '#B33A3A',
    dangerText: '#FFF8F1',
    inputBackground: '#FFFDF9',
    inputBorder: '#CDBB9D',
    headerBackground: '#FFF8F1',
    cardPreviewAccent: '#6F3CEB',
  }),
  forest: createTheme({
    text: '#1B2A1F',
    textSecondary: '#47594C',
    background: '#F6FBF6',
    backgroundMuted: '#EBF4EB',
    surface: '#E4F0E4',
    surfaceMuted: '#D7E7D7',
    surfaceSelected: '#C7DDC7',
    border: '#A8C3A8',
    primary: '#2F6B45',
    primaryText: '#F6FBF6',
    danger: '#A63D3D',
    dangerText: '#FFF5F5',
    inputBackground: '#FCFEFC',
    inputBorder: '#A8C3A8',
    headerBackground: '#F6FBF6',
    cardPreviewAccent: '#2F6B45',
  }),
  ocean: createTheme({
    text: '#13283A',
    textSecondary: '#486172',
    background: '#F4FAFD',
    backgroundMuted: '#E7F1F7',
    surface: '#DCEBF4',
    surfaceMuted: '#CFDFEA',
    surfaceSelected: '#BED4E2',
    border: '#9FBDD0',
    primary: '#1F5F8B',
    primaryText: '#F4FAFD',
    danger: '#B04A4A',
    dangerText: '#FFF7F7',
    inputBackground: '#FBFEFF',
    inputBorder: '#9FBDD0',
    headerBackground: '#F4FAFD',
    cardPreviewAccent: '#1F5F8B',
  }),
  dusk: createTheme({
    text: '#F4F0FF',
    textSecondary: '#D0C7EA',
    background: '#221B33',
    backgroundMuted: '#2B2240',
    surface: '#34294A',
    surfaceMuted: '#3F3258',
    surfaceSelected: '#4D3C6C',
    border: '#6C5B91',
    primary: '#C5A8FF',
    primaryText: '#221B33',
    danger: '#F0A7A7',
    dangerText: '#221B33',
    inputBackground: '#2B2240',
    inputBorder: '#6C5B91',
    headerBackground: '#221B33',
    cardPreviewAccent: '#C5A8FF',
  }),
} as const;

export type AppThemeName = keyof typeof appThemes;
export type AppTheme = (typeof appThemes)[AppThemeName];
export type ThemeColors = AppTheme['colors'];
export type ThemeColor = keyof ThemeColors;

export const breakpoints = {
  xs: 0,
  md: 768,
} as const;

StyleSheet.configure({
  settings: {
    initialTheme: 'default',
  },
  breakpoints,
  themes: appThemes,
});
