import '@/global.css';

import { appThemes, type ThemeColor } from '@/shared/theme/unistyles';

const lightTheme = appThemes.default.colors;

export const Colors = {
  light: lightTheme,
  dark: appThemes.dusk.colors,
} as const;

export type { ThemeColor };

export const Fonts = appThemes.default.fonts;

export const Spacing = appThemes.default.spacing;

export const Radius = appThemes.default.radius;

export const MaxContentWidth = 800;
