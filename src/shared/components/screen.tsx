import { PropsWithChildren } from 'react'
import { ScrollView, View, type StyleProp, type ViewStyle } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StyleSheet } from 'react-native-unistyles'

import { Spacing } from '@/constants/theme'

type ScreenProps = PropsWithChildren<{
  scrollable?: boolean
  contentStyle?: StyleProp<ViewStyle>
  safeAreaStyle?: StyleProp<ViewStyle>
}>

export function Screen({
  children,
  scrollable = true,
  contentStyle,
  safeAreaStyle,
}: ScreenProps) {
  const content = <View style={[styles.content, contentStyle]}>{children}</View>

  return scrollable ? (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        automaticallyAdjustContentInsets={false}
        contentInsetAdjustmentBehavior="never"
      >
        <SafeAreaView style={[styles.safeArea, safeAreaStyle]} edges={['left', 'right', 'bottom']}>
          {content}
        </SafeAreaView>
      </ScrollView>
    </View>
  ) : (
    <View style={styles.container}>
      <SafeAreaView style={[styles.safeArea, safeAreaStyle]} edges={['left', 'right', 'bottom']}>
        {content}
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.four,
  },
  content: {
    width: '100%',
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
})
