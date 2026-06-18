import { appThemes, type ThemeColor } from '@/shared/theme/unistyles'

export type { ThemeColor }

export const Colors = {
  light: appThemes.default.colors,
  dark: appThemes.horror.colors,
  default: appThemes.default.colors,
  fantasy: appThemes.fantasy.colors,
  'sci-fi': appThemes['sci-fi'].colors,
  horror: appThemes.horror.colors,
  magic: appThemes.magic.colors,
  casual: appThemes.casual.colors,
  corporation: appThemes.corporation.colors,
} as const

export const Fonts = appThemes.default.fonts

export const Spacing = appThemes.default.spacing

export const Radius = appThemes.default.radius

export const MaxContentWidth = 800
