import { Link } from 'expo-router';
import { Pressable, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { getCardsForParty } from '@/features/cards/selectors';
import { useCardStore } from '@/features/cards/store/card-store';
import { usePartyStore } from '@/features/parties/store/party-store';
import { Screen } from '@/shared/components/screen';
import { partyMoodLabels, themeCategoryLabels } from '@/shared/constants/party-options';

const partyAccentByTheme = {
  fantasy: Colors.default.cardPreviewAccent,
  'sci-fi': Colors.ocean.cardPreviewAccent,
  horror: Colors.dusk.cardPreviewAccent,
  starwars: Colors.ocean.cardPreviewAccent,
  'harry-potter': Colors.dusk.cardPreviewAccent,
  witcher: Colors.forest.cardPreviewAccent,
} as const;

export default function PartyListScreen() {
  const hasHydrated = usePartyStore((state) => state.hasHydrated);
  const parties = usePartyStore((state) => state.parties);
  const cards = useCardStore((state) => state.cards);

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
            const accentColor = partyAccentByTheme[party.themeCategory];

            return (
              <Link key={party.id} href={{ pathname: '/party/[partyId]', params: { partyId: party.id } }} asChild>
                <Pressable>
                  <ThemedView type="backgroundElement" style={styles.partyCard}>
                    <View style={[styles.partyAccent, { backgroundColor: accentColor }]} />
                    <View style={styles.partyCardContent}>
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
                    </View>
                  </ThemedView>
                </Pressable>
              </Link>
            );
          })}
        </View>
      )}

      <Link href="/party/new" asChild>
        <Pressable style={styles.primaryButton}>
          <ThemedText style={styles.primaryButtonText}>Create a new party</ThemedText>
        </Pressable>
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create(theme => ({
  header: {
    gap: theme.spacing.two,
  },
  title: {
    fontSize: 42,
    lineHeight: 46,
  },
  subtitle: {},
  card: {
    borderRadius: theme.radius.card,
    padding: theme.spacing.four,
    gap: theme.spacing.two,
  },
  partyList: {
    gap: theme.spacing.three,
  },
  partyCard: {
    borderRadius: theme.radius.card,
    padding: theme.spacing.three,
    gap: theme.spacing.three,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  partyAccent: {
    width: 8,
    minHeight: 72,
    borderRadius: theme.radius.pill,
  },
  partyCardContent: {
    flex: 1,
    gap: theme.spacing.two,
  },
  partyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.two,
    alignItems: 'center',
  },
  partyCardTitle: {
    flex: 1,
    fontSize: 24,
    lineHeight: 30,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.four,
    paddingVertical: theme.spacing.three,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: theme.colors.primaryText,
    fontWeight: '700',
  },
}));
