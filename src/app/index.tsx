import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { getCardsForParty } from '@/features/cards/selectors';
import { useCardStore } from '@/features/cards/store/card-store';
import { usePartyStore } from '@/features/parties/store/party-store';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { Screen } from '@/shared/components/screen';
import { partyMoodLabels, themeCategoryLabels } from '@/shared/constants/party-options';

export default function PartyListScreen() {
  const hasHydrated = usePartyStore((state) => state.hasHydrated);
  const parties = usePartyStore((state) => state.parties);
  const cards = useCardStore((state) => state.cards);
  const theme = useTheme();

  return (
    <Screen>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          LarParty
        </ThemedText>
        <ThemedText style={styles.subtitle} themeColor="textSecondary">
          Create themed parties and generate character cards for your next LARP-inspired event.
        </ThemedText>
      </View>

      {!hasHydrated ? (
        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="subtitle">Loading parties...</ThemedText>
          <ThemedText themeColor="textSecondary">Restoring your saved local party data.</ThemedText>
        </ThemedView>
      ) : parties.length === 0 ? (
        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="subtitle">Party List</ThemedText>
          <ThemedText themeColor="textSecondary">
            No parties yet. Create your first party to start generating character cards.
          </ThemedText>
        </ThemedView>
      ) : (
        <View style={styles.partyList}>
          {parties.map((party) => {
            const partyCards = getCardsForParty(cards, party.id);

            return (
              <Link key={party.id} href={{ pathname: '/party/[partyId]', params: { partyId: party.id } }} asChild>
                <Pressable>
                  <ThemedView type="backgroundElement" style={styles.partyCard}>
                    <View style={styles.partyCardHeader}>
                      <ThemedText type="subtitle" style={styles.partyCardTitle}>
                        {party.title}
                      </ThemedText>
                      <ThemedText themeColor="textSecondary">
                        {partyCards.length} {partyCards.length === 1 ? 'card' : 'cards'}
                      </ThemedText>
                    </View>
                    <ThemedText themeColor="textSecondary">
                      {themeCategoryLabels[party.themeCategory]} · {partyMoodLabels[party.mood]}
                    </ThemedText>
                  </ThemedView>
                </Pressable>
              </Link>
            );
          })}
        </View>
      )}

      <Link href="/party/new" asChild>
        <Pressable style={{ ...styles.primaryButton, backgroundColor: theme.primary }}>
          <ThemedText style={{ ...styles.primaryButtonText, color: theme.primaryText }}>Create a new party</ThemedText>
        </Pressable>
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.two,
  },
  title: {
    fontSize: 42,
    lineHeight: 46,
  },
  subtitle: {},
  card: {
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  partyList: {
    gap: Spacing.three,
  },
  partyCard: {
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  partyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
    alignItems: 'center',
  },
  partyCardTitle: {
    flex: 1,
    fontSize: 24,
    lineHeight: 30,
  },
  primaryButton: {
    backgroundColor: '#7A3FF2',
    borderRadius: 999,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFF8F1',
    fontWeight: '700',
  },
});
