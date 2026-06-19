import { forwardRef } from 'react'
import { TextInput, TextInputProps } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

export const FormTextInput = forwardRef<TextInput, TextInputProps>(
  function FormTextInput({ style, placeholderTextColor, ...props }, ref) {
    return (
      <TextInput
        ref={ref}
        placeholderTextColor={placeholderTextColor ?? styles.placeholder.color}
        style={[styles.input, style]}
        {...props}
      />
    )
  },
)

const styles = StyleSheet.create((theme) => ({
  placeholder: {
    color: theme.colors.textSecondary,
  },
  input: {
    backgroundColor: theme.colors.inputBackground,
    color: theme.colors.text,
    borderRadius: theme.radius.control,
    paddingHorizontal: theme.spacing.three,
    paddingVertical: theme.spacing.three,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
  },
}))
