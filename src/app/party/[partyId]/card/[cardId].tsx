import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { useCardStore } from '@/features/cards/store/card-store';
import { generateCharacterCard } from '@/features/generation/gemini';
import { getPartyById } from '@/features/parties/selectors';
import { usePartyStore } from '@/features/parties/store/party-store';
import { usePreferencesStore } from '@/features/preferences/store/preferences-store';
import { cardDisplayModes } from '@/shared/constants/party-options';

export default function CardDetailsScreen() {
  const { partyId, cardId } = useLocalSearchParams<{ partyId: string; cardId: string }>();
  const parties = usePartyStore((state) => state.parties);
  const party = useMemo(() => getPartyById(parties, partyId), [parties, partyId]);

  const cards = useCardStore((state) => state.cards);
  const acceptCard = useCardStore((state) => state.acceptCard);
  const createDraftCard = useCardStore((state) => state.createDraftCard);
  const deleteCard = useCardStore((state) => state.deleteCard);

  const card = useMemo(() => cards.find((entry) => entry.id === cardId), [cards, cardId]);

  const cardDisplayMode = usePreferencesStore((state) => state.cardDisplayMode);
  const setCardDisplayMode = usePreferencesStore((state) => state.setCardDisplayMode);

  const [isRegenerating, setIsRegenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleAcceptCard() {
    if (!card || card.status === 'accepted') {
      return;
    }

    acceptCard(card.id);
  }

  function handleDeleteCard() {
    if (!card) {
      return;
    }

    Alert.alert('Delete card?', 'Remove this saved character card?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteCard(card.id);
          router.replace({
            pathname: '/party/[partyId]',
            params: { partyId: card.partyId },
          });
        },
      },
    ]);
  }

  function handleRegenerateCard() {
    if (!card || !party) {
      return;
    }

    Alert.alert('Regenerate card?', 'Create a new draft variation from the same character input?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Regenerate',
        onPress: async () => {
          setErrorMessage(null);
          setIsRegenerating(true);

          try {
            const generated = await generateCharacterCard({
              party,
              input: card.input,
            });

            const nextCardId = createDraftCard({
              partyId: card.partyId,
              input: card.input,
              generated,
              basedOnCardId: card.id,
              generationGroupId: card.generationGroupId,
            });

            router.replace({
              pathname: '/party/[partyId]/card/[cardId]',
              params: { partyId: card.partyId, cardId: nextCardId },
            });
          } catch (error) {
            setErrorMessage(
              error instanceof Error ? error.message : 'Unable to regenerate card right now.'
            );
          } finally {
            setIsRegenerating(false);
          }
        },
      },
    ]);
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          {!party || !card ? (
            <ThemedView type="backgroundElement" style={styles.card}>
              <ThemedText type="subtitle">Card not found</ThemedText>
              <ThemedText themeColor="textSecondary">
                This card may have been deleted or is still loading.
              </ThemedText>
            </ThemedView>
          ) : (
            <>
              <View style={styles.header}>
                <ThemedText type="subtitle">{card.generated.generatedNameWithClass}</ThemedText>
                <ThemedText themeColor="textSecondary">
                  {card.status === 'accepted' ? 'Accepted card' : 'Draft card'} · {party.title}
                </ThemedText>
              </View>

              <View style={styles.modeSwitch}>
                {cardDisplayModes.map((mode) => {
                  const isSelected = mode === cardDisplayMode;

                  return (
                    <Pressable
                      key={mode}
                      onPress={() => setCardDisplayMode(mode)}
                      style={[styles.modeChip, isSelected && styles.modeChipSelected]}>
                      <ThemedText style={isSelected ? styles.modeChipTextSelected : undefined}>
                        {mode === 'collectible' ? 'Collectible view' : 'Info view'}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>

              <ThemedView
                type="backgroundElement"
                style={[
                  styles.card,
                  cardDisplayMode === 'collectible' ? styles.collectibleCard : styles.infoCard,
                ]}>
                <View style={styles.section}>
                  <ThemedText type="smallBold">Background</ThemedText>
                  <ThemedText>{card.generated.backgroundHistory}</ThemedText>
                </View>

                <View style={styles.section}>
                  <ThemedText type="smallBold">Character traits</ThemedText>
                  <View style={styles.traitList}>
                    {card.generated.characterTraits.map((trait) => (
                      <ThemedView key={trait} style={styles.traitItem}>
                        <ThemedText>{trait}</ThemedText>
                      </ThemedView>
                    ))}
                  </View>
                </View>

                <View style={styles.section}>
                  <ThemedText type="smallBold">Special movement</ThemedText>
                  <ThemedText>{card.generated.specialMovement}</ThemedText>
                </View>

                <View style={styles.section}>
                  <ThemedText type="smallBold">Special phrase</ThemedText>
                  <ThemedText>“{card.generated.specialPhrase}”</ThemedText>
                </View>
              </ThemedView>

              {errorMessage ? <ThemedText themeColor="textSecondary">{errorMessage}</ThemedText> : null}

              {card.status === 'draft' ? (
                <Pressable style={styles.primaryButton} onPress={handleAcceptCard}>
                  <ThemedText style={styles.primaryButtonText}>Accept card</ThemedText>
                </Pressable>
              ) : null}

              <Pressable
                style={[styles.secondaryButton, isRegenerating && styles.buttonDisabled]}
                disabled={isRegenerating}
                onPress={handleRegenerateCard}>
                <ThemedText>{isRegenerating ? 'Regenerating...' : 'Regenerate card'}</ThemedText>
              </Pressable>

              <Pressable style={styles.secondaryButton} onPress={handleDeleteCard}>
                <ThemedText>Delete card</ThemedText>
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
  modeSwitch: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  modeChip: {
    borderWidth: 1,
    borderColor: '#D6C7AF',
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    backgroundColor: Colors.light.background,
  },
  modeChipSelected: {
    backgroundColor: '#7A3FF2',
    borderColor: '#7A3FF2',
  },
  modeChipTextSelected: {
    color: '#FFF8F1',
    fontWeight: '700',
  },
  card: {
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  collectibleCard: {
    borderWidth: 2,
    borderColor: '#B9953B',
  },
  infoCard: {
    borderWidth: 1,
    borderColor: '#D6C7AF',
  },
  section: {
    gap: Spacing.two,
  },
  traitList: {
    gap: Spacing.two,
  },
  traitItem: {
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
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
  buttonDisabled: {
    opacity: 0.65,
  },
});
