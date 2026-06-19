import { PropsWithChildren } from 'react'
import { StyleProp, ViewStyle } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { ThemedView } from '@/components/themed-view'

type FormCardProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>
}>

export function FormCard({ children, style }: FormCardProps) {
  return (
    <ThemedView type="backgroundElement" style={[styles.card, style]}>
      {children}
    </ThemedView>
  )
}

const styles = StyleSheet.create((theme) => ({
  card: {
    borderRadius: theme.radius.card,
    padding: theme.spacing.four,
    gap: theme.spacing.four,
  },
}))
