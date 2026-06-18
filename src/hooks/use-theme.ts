import { useUnistyles } from 'react-native-unistyles';

export function useTheme() {
  const { theme } = useUnistyles();

  return theme.colors;
}
