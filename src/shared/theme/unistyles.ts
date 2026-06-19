import { Platform } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

const spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const

const radius = {
  pill: 999,
  card: 24,
  control: 16,
} as const

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
})

const sharedTheme = {
  spacing,
  radius,
  fonts,
} as const

const createTheme = (colors: {
  text: string
  textSecondary: string
  background: string
  backgroundMuted: string
  surface: string
  surfaceMuted: string
  surfaceSelected: string
  border: string
  primary: string
  primaryText: string
  danger: string
  dangerText: string
  inputBackground: string
  inputBorder: string
  headerBackground: string
  cardPreviewAccent: string
}) => ({
  ...sharedTheme,
  colors: {
    ...colors,
    backgroundElement: colors.surface,
    backgroundSelected: colors.surfaceSelected,
  },
})

export const appThemes = {
  default: createTheme({
    text: '#2F241F',
    textSecondary: '#6E5B4B',
    background: '#F8F3E9',
    backgroundMuted: '#EFE7D8',
    surface: '#E8DCC8',
    surfaceMuted: '#DDD0BB',
    surfaceSelected: '#CDBA9C',
    border: '#A78F74',
    primary: '#7A4AE0',
    primaryText: '#FFF8F1',
    danger: '#B54141',
    dangerText: '#FFF8F1',
    inputBackground: '#FCF8F1',
    inputBorder: '#A78F74',
    headerBackground: '#F8F3E9',
    cardPreviewAccent: '#7A4AE0',
  }),
  fantasy: createTheme({
    text: '#F6E7C8',
    textSecondary: '#D5C29C',
    background: '#102417',
    backgroundMuted: '#183222',
    surface: '#21452D',
    surfaceMuted: '#2A5739',
    surfaceSelected: '#3D754F',
    border: '#6D9B62',
    primary: '#D9A441',
    primaryText: '#102417',
    danger: '#A64646',
    dangerText: '#F6E7C8',
    inputBackground: '#183222',
    inputBorder: '#6D9B62',
    headerBackground: '#102417',
    cardPreviewAccent: '#8FD694',
  }),
  'sci-fi': createTheme({
    text: '#E9F7FF',
    textSecondary: '#98C7E6',
    background: '#07111F',
    backgroundMuted: '#0B1A30',
    surface: '#102746',
    surfaceMuted: '#16345E',
    surfaceSelected: '#1D4D86',
    border: '#2D7FF9',
    primary: '#12E6FF',
    primaryText: '#07111F',
    danger: '#FF4FA3',
    dangerText: '#07111F',
    inputBackground: '#0B1A30',
    inputBorder: '#2D7FF9',
    headerBackground: '#07111F',
    cardPreviewAccent: '#12E6FF',
  }),
  horror: createTheme({
    text: '#F0E6E1',
    textSecondary: '#BFAEAA',
    background: '#0D090B',
    backgroundMuted: '#161013',
    surface: '#22161A',
    surfaceMuted: '#2E1A20',
    surfaceSelected: '#4A1F29',
    border: '#7A2837',
    primary: '#D72638',
    primaryText: '#FFF1F1',
    danger: '#8B0000',
    dangerText: '#F0E6E1',
    inputBackground: '#161013',
    inputBorder: '#7A2837',
    headerBackground: '#0D090B',
    cardPreviewAccent: '#FF4D5A',
  }),
  magic: createTheme({
    text: '#F4EEFF',
    textSecondary: '#CFC2F6',
    background: '#120F2F',
    backgroundMuted: '#1A1542',
    surface: '#241C5A',
    surfaceMuted: '#302473',
    surfaceSelected: '#4935A8',
    border: '#7D5CFF',
    primary: '#B388FF',
    primaryText: '#120F2F',
    danger: '#FF68C3',
    dangerText: '#120F2F',
    inputBackground: '#1A1542',
    inputBorder: '#7D5CFF',
    headerBackground: '#120F2F',
    cardPreviewAccent: '#7FFFD4',
  }),
  casual: createTheme({
    text: '#2B59C3',
    textSecondary: '#7D6B5D',
    background: '#FFF4E8',
    backgroundMuted: '#FFE7D6',
    surface: '#FFD3B6',
    surfaceMuted: '#FFC7AD',
    surfaceSelected: '#FFB4A2',
    border: '#FF8E72',
    primary: '#FF6B6B',
    primaryText: '#FFF8F4',
    danger: '#D94F70',
    dangerText: '#FFF8F4',
    inputBackground: '#FFF8EF',
    inputBorder: '#FF8E72',
    headerBackground: '#FFF4E8',
    cardPreviewAccent: '#4EC5F1',
  }),
  corporation: createTheme({
    text: '#EEF4FA',
    textSecondary: '#AAB8C8',
    background: '#161C24',
    backgroundMuted: '#1E2630',
    surface: '#273240',
    surfaceMuted: '#324052',
    surfaceSelected: '#42546A',
    border: '#62748A',
    primary: '#3B82F6',
    primaryText: '#F8FBFF',
    danger: '#F59E0B',
    dangerText: '#161C24',
    inputBackground: '#1E2630',
    inputBorder: '#62748A',
    headerBackground: '#161C24',
    cardPreviewAccent: '#22C7A9',
  }),
} as const

export type AppThemeName = keyof typeof appThemes
export type AppTheme = (typeof appThemes)[AppThemeName]
export type ThemeColors = AppTheme['colors']
export type ThemeColor = keyof ThemeColors

export const breakpoints = {
  xs: 0,
  md: 768,
} as const

StyleSheet.configure({
  settings: {
    initialTheme: 'default',
  },
  breakpoints,
  themes: appThemes,
})
