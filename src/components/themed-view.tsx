import { View, type ViewProps } from 'react-native'

import { ThemeColor } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'
import { AppTheme } from '@/shared/theme/unistyles'

export type ThemedViewProps = ViewProps & {
  type?: ThemeColor
  themeOverride?: AppTheme
}

export function ThemedView({
  style,
  type,
  themeOverride,
  ...otherProps
}: ThemedViewProps) {
  const theme = useTheme()
  const colors = themeOverride?.colors ?? theme

  return (
    <View
      style={[{ backgroundColor: colors[type ?? 'background'] }, style]}
      {...otherProps}
    />
  )
}
