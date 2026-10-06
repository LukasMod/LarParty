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

// Every theme declares the same nine color tokens. `scripts/contrast-check.mjs`
// enforces the same WCAG ratios for every theme, so no theme needs a bespoke list.
// The three party themes keep one shared neutral base — text, textSecondary,
// background and surface are identical across them, and only primary, primaryText,
// border, surfaceSelected and accent carry the theme's identity. The checker asserts
// that the shared base never drifts.
const createTheme = (colors: {
  text: string
  textSecondary: string
  background: string
  surface: string
  surfaceSelected: string
  border: string
  primary: string
  primaryText: string
  accent: string
}) => ({
  ...sharedTheme,
  colors,
})

export const partyThemeBaseColors = {
  text: '#F0E6E1',
  textSecondary: '#BFAEAA',
  background: '#0D090B',
  surface: '#22161A',
} as const

export const partyThemeNames = ['fantasy', 'sci-fi', 'horror'] as const

export const appThemes = {
  default: createTheme({
    text: '#2F241F',
    textSecondary: '#6E5B4B',
    background: '#F8F3E9',
    surface: '#E8DCC8',
    surfaceSelected: '#CDBA9C',
    border: '#93795D',
    primary: '#7A4AE0',
    primaryText: '#FFF8F1',
    accent: '#7A4AE0',
  }),
  fantasy: createTheme({
    text: '#F0E6E1',
    textSecondary: '#BFAEAA',
    background: '#0D090B',
    surface: '#22161A',
    surfaceSelected: '#493A66',
    border: '#8065B8',
    primary: '#B58CFF',
    primaryText: '#160F24',
    accent: '#72E0C0',
  }),
  'sci-fi': createTheme({
    text: '#F0E6E1',
    textSecondary: '#BFAEAA',
    background: '#0D090B',
    surface: '#22161A',
    surfaceSelected: '#15556A',
    border: '#27B8D6',
    primary: '#36D5F5',
    primaryText: '#041015',
    accent: '#B7FF5C',
  }),
  horror: createTheme({
    text: '#F0E6E1',
    textSecondary: '#BFAEAA',
    background: '#0D090B',
    surface: '#22161A',
    surfaceSelected: '#54252A',
    border: '#A54750',
    primary: '#D94A55',
    primaryText: '#180608',
    accent: '#A6B56B',
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
