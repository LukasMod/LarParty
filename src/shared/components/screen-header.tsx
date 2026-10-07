import { ReactNode } from 'react'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Spacing } from '@/constants/theme'

interface ScreenHeaderProps {
  leading: ReactNode
  trailing?: ReactNode
}

export function ScreenHeader({ leading, trailing }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets()

  return (
    <View
      style={[styles.container, { paddingTop: insets.top + Spacing.three }]}
    >
      <View style={styles.row}>
        <View style={styles.leading}>{leading}</View>
        <View style={styles.trailing}>{trailing}</View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    paddingHorizontal: theme.spacing.four,
    paddingBottom: theme.spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.three,
    minHeight: 44,
  },
  leading: {
    flexShrink: 1,
  },
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.two,
  },
}))
