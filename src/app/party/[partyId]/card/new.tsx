import { Link, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';

export default function NewCharacterCardScreen() {
  const { partyId } = useLocalSearchParams<{ partyId: string }>();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.header}>
            <ThemedText type="subtitle">New Character Card</ThemedText>
            <ThemedText themeColor="textSecondary">Party ID: {partyId}</ThemedText>
          </View>

          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText>
              This placeholder screen will host the character input form with name, sex, age, and traits.
            </ThemedText>
          </ThemedView>

          <Link
            href={{
              pathname: '/party/[partyId]/card/[cardId]',
              params: { partyId, cardId: 'draft-preview' },
            }}
            asChild>
            <Pressable style={styles.secondaryButton}>
              <ThemedText>Open placeholder card details</ThemedText>
            </Pressable>
          </Link>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    gap: Spacing.four,
  },
  header: {
    gap: Spacing.one,
  },
  card: {
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#C8B69B',
    borderRadius: 999,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
});
