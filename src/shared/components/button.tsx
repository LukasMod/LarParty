import { ElementRef, forwardRef } from 'react'
import {
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
} from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { ThemedText } from '@/components/themed-text'

type ButtonVariant = 'primary' | 'secondary'

interface ButtonProps extends PressableProps {
  label: string
  variant?: ButtonVariant
}

export const Button = forwardRef<ElementRef<typeof Pressable>, ButtonProps>(
  function Button(
    { label, variant = 'primary', disabled, style, ...props },
    ref,
  ) {
    return (
      <Pressable
        ref={ref}
        disabled={disabled}
        style={(state) => {
          const nextStyle: StyleProp<ViewStyle>[] = [
            styles.button,
            variant === 'primary'
              ? styles.primaryButton
              : styles.secondaryButton,
            disabled ? styles.buttonDisabled : null,
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
        <ThemedText
          style={variant === 'primary' ? styles.primaryButtonText : undefined}
        >
          {label}
        </ThemedText>
      </Pressable>
    )
  },
)

const styles = StyleSheet.create((theme) => ({
  button: {
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.four,
    paddingVertical: theme.spacing.three,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  primaryButtonText: {
    color: theme.colors.primaryText,
    fontWeight: '700',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
}))
