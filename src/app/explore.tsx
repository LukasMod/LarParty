import { Link } from 'expo-router'
import { ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { Button } from '@/shared/components/button'
import { Spacing } from '@/constants/theme'

const checklistItems = [
  'Create and persist parties locally',
  'Add character card input flow',
  'Wire card drafts and accepted states',
  'Integrate local LLM generation',
]

export default function ExploreScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <ThemedText type="subtitle">Explore</ThemedText>
            <ThemedText themeColor="textSecondary">
              A simple project overview for the current LarParty proof of
              concept.
            </ThemedText>
          </View>

          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="smallBold">Current progress</ThemedText>
            <View style={styles.list}>
              {checklistItems.map((item) => (
                <ThemedText key={item} themeColor="textSecondary">
                  • {item}
                </ThemedText>
              ))}
            </View>
          </ThemedView>

          <Link href="/" asChild>
            <Button label="Back to parties" />
          </Link>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    width: '100%',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    gap: Spacing.four,
  },
  header: {
    gap: Spacing.two,
  },
  card: {
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  list: {
    gap: Spacing.two,
  },
})
