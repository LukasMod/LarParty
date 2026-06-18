import { Platform, Text, type TextProps } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();
  const color = type === 'linkPrimary' ? theme.primary : theme[themeColor ?? 'text'];

  return (
    <Text
      style={[
        styles.base,
        type === 'title' && styles.title,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'subtitle' && styles.subtitle,
        type === 'link' && styles.link,
        type === 'linkPrimary' && styles.link,
        type === 'code' && styles.code,
        { color },
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create(theme => ({
  base: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    color: theme.colors.text,
  },
  small: {
    fontSize: 14,
    lineHeight: 20,
  },
  smallBold: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  title: {
    fontSize: 48,
    fontWeight: '600',
    lineHeight: 52,
  },
  subtitle: {
    fontSize: 32,
    lineHeight: 44,
    fontWeight: '600',
  },
  link: {
    lineHeight: 30,
    fontSize: 14,
  },
  code: {
    fontFamily: theme.fonts.mono,
    fontWeight: Platform.select({ android: '700', default: '500' }),
    fontSize: 12,
  },
}));
