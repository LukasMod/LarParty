import { PropsWithChildren } from 'react'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { ThemedText } from '@/components/themed-text'

interface FormFieldProps extends PropsWithChildren {
  label: string
  helperText?: string
}

export function FormField({ label, helperText, children }: FormFieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <ThemedText type="smallBold">{label}</ThemedText>
      {children}
      {helperText ? (
        <ThemedText themeColor="textSecondary">{helperText}</ThemedText>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  fieldGroup: {
    gap: theme.spacing.two,
  },
}))
