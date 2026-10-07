import { SymbolView, type SFSymbol } from 'expo-symbols'
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { useTheme } from '@/hooks/use-theme'

interface IconButtonProps extends Omit<PressableProps, 'children'> {
  symbol: SFSymbol
  label: string
  symbolSize?: number
}

export function IconButton({
  symbol,
  label,
  symbolSize = 20,
  disabled,
  style,
  ...props
}: IconButtonProps) {
  const colors = useTheme()

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      disabled={disabled}
      hitSlop={8}
      style={(state) => {
        const nextStyle: StyleProp<ViewStyle>[] = [
          styles.button,
          state.pressed && styles.pressed,
          disabled && styles.disabled,
        ]

        if (typeof style === 'function') {
          nextStyle.push(style(state))
        } else if (style) {
          nextStyle.push(style)
        }

        return nextStyle
      }}
      {...props}
    >
      <SymbolView name={symbol} size={symbolSize} tintColor={colors.text} />
    </Pressable>
  )
}

const styles = StyleSheet.create((theme) => ({
  button: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
  disabled: {
    opacity: 0.45,
  },
}))
