import { ReactNode } from 'react'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { ThemedText } from '@/components/themed-text'

interface CardSectionProps {
  title: string
  children: ReactNode
}

export function CardSection({ title, children }: CardSectionProps) {
  return (
    <View style={styles.section}>
      <ThemedText type="smallBold">{title}</ThemedText>
      {children}
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  section: {
    gap: theme.spacing.two,
  },
}))
