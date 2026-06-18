import { Link, router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getCardsForParty } from '@/features/cards/selectors';
import { useCardStore } from '@/features/cards/store/card-store';
import { getPartyById } from '@/features/parties/selectors';
import { usePartyStore } from '@/features/parties/store/party-store';
import { partyMoodLabels, themeCategoryLabels } from '@/shared/constants/party-options';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

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
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
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
        </ScrollView>
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
  },
  content: {
    width: '100%',
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
  cardList: {
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  cardItem: {
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    gap: Spacing.one,
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
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#D6C7AF',
    borderRadius: 999,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
});
