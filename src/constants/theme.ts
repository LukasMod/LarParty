import { appThemes, type ThemeColor } from '@/shared/theme/unistyles';

export type { ThemeColor };

export const Colors = {
  light: appThemes.default.colors,
  dark: appThemes.dusk.colors,
  default: appThemes.default.colors,
  forest: appThemes.forest.colors,
  ocean: appThemes.ocean.colors,
  dusk: appThemes.dusk.colors,
} as const;

export const Fonts = appThemes.default.fonts;

export const Spacing = appThemes.default.spacing;

export const Radius = appThemes.default.radius;

export const MaxContentWidth = 800;
