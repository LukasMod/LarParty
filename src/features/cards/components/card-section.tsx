import { ReactNode } from 'react'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { ThemedText } from '@/components/themed-text'
import { AppTheme } from '@/shared/theme/unistyles'

interface CardSectionProps {
  title: string
  themeOverride?: AppTheme
  children: ReactNode
}

export function CardSection({
  title,
  themeOverride,
  children,
}: CardSectionProps) {
  return (
    <View style={styles.section}>
      <ThemedText
        type="smallBold"
        themeOverride={themeOverride}
        themeColor="textSecondary"
      >
        {title}
      </ThemedText>
      {children}
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  section: {
    gap: theme.spacing.two,
  },
}))
