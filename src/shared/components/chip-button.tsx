import {
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
} from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { ThemedText } from '@/components/themed-text'

interface ChipButtonProps extends PressableProps {
  label: string
  selected?: boolean
}

export function ChipButton({
  label,
  selected = false,
  disabled,
  style,
  ...props
}: ChipButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      style={(state) => {
        const nextStyle: StyleProp<ViewStyle>[] = [
          styles.chip,
          selected ? styles.chipSelected : null,
          disabled ? styles.chipDisabled : null,
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
      <ThemedText style={selected ? styles.chipTextSelected : undefined}>
        {label}
      </ThemedText>
    </Pressable>
  )
}

const styles = StyleSheet.create((theme) => ({
  chip: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.three,
    paddingVertical: theme.spacing.two,
    backgroundColor: theme.colors.inputBackground,
  },
  chipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipDisabled: {
    opacity: 0.45,
  },
  chipTextSelected: {
    color: theme.colors.primaryText,
    fontWeight: '700',
  },
}))
