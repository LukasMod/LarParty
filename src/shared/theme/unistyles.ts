import { Platform } from "react-native"
import { StyleSheet } from "react-native-unistyles"

const defaultTheme = {
  colors: {
    text: "#1F1B2D",
    textSecondary: "#6E5F4A",
    background: "#FFF8F1",
    backgroundElement: "#F4EBDD",
    backgroundSelected: "#E9DCC5",
    border: "#D6C7AF",
    primary: "#7A3FF2",
    primaryText: "#FFF8F1",
    danger: "#B33A3A",
    dangerText: "#FFF8F1",
    inputBackground: "#FFF8F1",
    inputBorder: "#D6C7AF",
    headerBackground: "#FFF8F1",
    cardPreviewAccent: "#7A3FF2",
  },
  spacing: {
    half: 2,
    one: 4,
    two: 8,
    three: 16,
    four: 24,
    five: 32,
    six: 64,
  },
  radius: {
    pill: 999,
    card: 24,
    control: 16,
  },
  fonts: Platform.select({
    ios: {
      sans: "system-ui",
      serif: "ui-serif",
      rounded: "ui-rounded",
      mono: "ui-monospace",
    },
    default: {
      sans: "normal",
      serif: "serif",
      rounded: "normal",
      mono: "monospace",
    },
    web: {
      sans: "var(--font-display)",
      serif: "var(--font-serif)",
      rounded: "var(--font-rounded)",
      mono: "var(--font-mono)",
    },
  }),
} as const

export const appThemes = {
  default: defaultTheme,
} as const

export const breakpoints = {
  xs: 0,
  md: 768,
} as const

StyleSheet.configure({
  settings: {
    initialTheme: "default",
  },
  breakpoints,
  themes: appThemes,
})

