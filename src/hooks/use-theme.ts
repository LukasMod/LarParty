import { useUnistyles } from 'react-native-unistyles';

import { appThemes, type ThemeColors } from '@/shared/theme/unistyles';

export function useTheme(): ThemeColors {
  const { theme } = useUnistyles();

  return theme?.colors ?? appThemes.default.colors;
}
