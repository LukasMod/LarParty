import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { ThemedText } from '@/components/themed-text'

interface CardDetailsHeaderProps {
  generatedNameWithClass: string
  statusLabel: string
  partyTitle: string
}

export function CardDetailsHeader({
  generatedNameWithClass,
  statusLabel,
  partyTitle,
}: CardDetailsHeaderProps) {
  return (
    <View style={styles.header}>
      <ThemedText type="subtitle">{generatedNameWithClass}</ThemedText>
      <ThemedText themeColor="textSecondary">
        {statusLabel} · {partyTitle}
      </ThemedText>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  header: {
    gap: theme.spacing.one,
  },
}))
