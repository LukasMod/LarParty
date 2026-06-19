import { StyleSheet } from 'react-native-unistyles'

import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'

interface ScreenStateCardProps {
  title: string
  body: string
}

export function ScreenStateCard({ title, body }: ScreenStateCardProps) {
  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <ThemedText type="subtitle">{title}</ThemedText>
      <ThemedText themeColor="textSecondary">{body}</ThemedText>
    </ThemedView>
  )
}

const styles = StyleSheet.create((theme) => ({
  card: {
    borderRadius: theme.radius.card,
    padding: theme.spacing.four,
    gap: theme.spacing.three,
  },
}))
