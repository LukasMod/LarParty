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
  colors: {
    ...colors,
    backgroundElement: colors.surface,
    backgroundSelected: colors.surfaceSelected,
  },
  spacing,
  radius,
  fonts,
})

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
  fantasy: createTheme({
    text: '#F8E7C9',
    textSecondary: '#D9C7A6',
    background: '#241032',
    backgroundMuted: '#311645',
    surface: '#3A1A53',
    surfaceMuted: '#452062',
    surfaceSelected: '#5B2A7E',
    border: '#7B4AA0',
    primary: '#F4B400',
    primaryText: '#241032',
    danger: '#A1297E',
    dangerText: '#F8E7C9',
    inputBackground: '#311645',
    inputBorder: '#7B4AA0',
    headerBackground: '#241032',
    cardPreviewAccent: '#0FA67A',
  }),
  'sci-fi': createTheme({
    text: '#EAF7FF',
    textSecondary: '#9CC7E8',
    background: '#081229',
    backgroundMuted: '#0D1A3A',
    surface: '#13244D',
    surfaceMuted: '#18305F',
    surfaceSelected: '#1E3D78',
    border: '#2E6BFF',
    primary: '#11E5FF',
    primaryText: '#081229',
    danger: '#FF2DA6',
    dangerText: '#081229',
    inputBackground: '#0D1A3A',
    inputBorder: '#2E6BFF',
    headerBackground: '#081229',
    cardPreviewAccent: '#11E5FF',
  }),
  horror: createTheme({
    text: '#F2E8E1',
    textSecondary: '#C9B8B3',
    background: '#140B12',
    backgroundMuted: '#1E111A',
    surface: '#2B1622',
    surfaceMuted: '#381B2B',
    surfaceSelected: '#5A2747',
    border: '#7A334F',
    primary: '#FF4D6D',
    primaryText: '#140B12',
    danger: '#8E1122',
    dangerText: '#F2E8E1',
    inputBackground: '#1E111A',
    inputBorder: '#7A334F',
    headerBackground: '#140B12',
    cardPreviewAccent: '#FF4D6D',
  }),
  magic: createTheme({
    text: '#F6F0FF',
    textSecondary: '#D8C9F7',
    background: '#1A114A',
    backgroundMuted: '#22155E',
    surface: '#2B1B6F',
    surfaceMuted: '#352287',
    surfaceSelected: '#4B2FB8',
    border: '#7C3CFF',
    primary: '#6BFFCB',
    primaryText: '#1A114A',
    danger: '#FF5FD2',
    dangerText: '#1A114A',
    inputBackground: '#22155E',
    inputBorder: '#7C3CFF',
    headerBackground: '#1A114A',
    cardPreviewAccent: '#6BFFCB',
  }),
  casual: createTheme({
    text: '#2D5BFF',
    textSecondary: '#7A6F63',
    background: '#FFF5E8',
    backgroundMuted: '#FFECD6',
    surface: '#FFDCCF',
    surfaceMuted: '#FFD1BF',
    surfaceSelected: '#FFBFAE',
    border: '#FF9F8D',
    primary: '#FF6B6B',
    primaryText: '#FFF5E8',
    danger: '#D9485F',
    dangerText: '#FFF5E8',
    inputBackground: '#FFF9F0',
    inputBorder: '#FF9F8D',
    headerBackground: '#FFF5E8',
    cardPreviewAccent: '#32C5FF',
  }),
  corporation: createTheme({
    text: '#F7FBFF',
    textSecondary: '#B5C4D6',
    background: '#1F2430',
    backgroundMuted: '#252B38',
    surface: '#2D3442',
    surfaceMuted: '#384152',
    surfaceSelected: '#465166',
    border: '#5F6C84',
    primary: '#005BFF',
    primaryText: '#F7FBFF',
    danger: '#FF7A00',
    dangerText: '#1F2430',
    inputBackground: '#252B38',
    inputBorder: '#5F6C84',
    headerBackground: '#1F2430',
    cardPreviewAccent: '#00C2B8',
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
