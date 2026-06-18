import { Link, router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getCardsForParty } from '@/features/cards/selectors';
import { useCardStore } from '@/features/cards/store/card-store';
import { getPartyById } from '@/features/parties/selectors';
import { usePartyStore } from '@/features/parties/store/party-store';
import { Screen } from '@/shared/components/screen';
import { partyMoodLabels, themeCategoryLabels } from '@/shared/constants/party-options';

export default function PartyDetailsScreen() {
  const { partyId } = useLocalSearchParams<{ partyId: string }>();
  const parties = usePartyStore((state) => state.parties);
  const deleteParty = usePartyStore((state) => state.deleteParty);
  const allCards = useCardStore((state) => state.cards);
  const party = useMemo(() => getPartyById(parties, partyId), [parties, partyId]);
  const cards = useMemo(() => getCardsForParty(allCards, partyId), [allCards, partyId]);

  function handleDeleteParty() {
    if (!party) {
      return;
    }

    Alert.alert('Delete party?', `Remove ${party.title} and all saved cards?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteParty(party.id);
          router.replace('/');
        },
      },
    ]);
  }

  return (
    <Screen>
      {!party ? (
        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="subtitle">Party not found</ThemedText>
          <ThemedText themeColor="textSecondary">
            This party may have been deleted or is still loading.
          </ThemedText>
        </ThemedView>
      ) : (
        <>
          <View style={styles.header}>
            <ThemedText type="subtitle">{party.title}</ThemedText>
            <ThemedText themeColor="textSecondary">
              {themeCategoryLabels[party.themeCategory]} · {partyMoodLabels[party.mood]}
            </ThemedText>
          </View>

          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="smallBold">Character Cards</ThemedText>
            {cards.length === 0 ? (
              <ThemedText themeColor="textSecondary">
                No cards yet. This party is ready for its first character.
              </ThemedText>
            ) : (
              <View style={styles.cardList}>
                {cards.map((card) => (
                  <Link
                    key={card.id}
                    href={{
                      pathname: '/party/[partyId]/card/[cardId]',
                      params: { partyId: party.id, cardId: card.id },
                    }}
                    asChild>
                    <Pressable>
                      <ThemedView style={styles.cardItem}>
                        <ThemedText type="smallBold">{card.generated.generatedNameWithClass}</ThemedText>
                        <ThemedText themeColor="textSecondary">
                          {card.status === 'accepted' ? 'Accepted' : 'Draft'} · {card.input.name}
                        </ThemedText>
                      </ThemedView>
                    </Pressable>
                  </Link>
                ))}
              </View>
            )}
          </ThemedView>

          <Link href={{ pathname: '/party/[partyId]/card/new', params: { partyId: party.id } }} asChild>
            <Pressable style={styles.primaryButton}>
              <ThemedText style={styles.primaryButtonText}>Create a character card</ThemedText>
            </Pressable>
          </Link>

          <Pressable style={styles.secondaryButton} onPress={handleDeleteParty}>
            <ThemedText>Delete party</ThemedText>
          </Pressable>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create(theme => ({
  header: {
    gap: theme.spacing.one,
  },
  card: {
    borderRadius: theme.radius.card,
    padding: theme.spacing.four,
    gap: theme.spacing.two,
  },
  cardList: {
    gap: theme.spacing.two,
    marginTop: theme.spacing.two,
  },
  cardItem: {
    borderRadius: theme.radius.control,
    paddingHorizontal: theme.spacing.three,
    paddingVertical: theme.spacing.three,
    gap: theme.spacing.one,
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
  secondaryButton: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.four,
    paddingVertical: theme.spacing.three,
    alignItems: 'center',
  },
}));
