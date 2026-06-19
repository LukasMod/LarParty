import { useLocalSearchParams } from 'expo-router'
import { StyleSheet } from 'react-native-unistyles'

import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { Button } from '@/shared/components/button'
import { CardDetailsHeader } from '@/features/cards/components/card-details-header'
import { CardDisplayModeSwitch } from '@/features/cards/components/card-display-mode-switch'
import { CharacterCardView } from '@/features/cards/components/character-card-view'
import { useCardDetailsActions } from '@/features/cards/hooks/use-card-details-actions'
import { useCardDetailsScreenModel } from '@/features/cards/hooks/use-card-details-screen-model'
import { usePreferencesStore } from '@/features/preferences/store/preferences-store'
import { Screen } from '@/shared/components/screen'

export default function CardDetailsScreen() {
  const { partyId, cardId } = useLocalSearchParams<{
    partyId: string
    cardId: string
  }>()
  const { status, party, card } = useCardDetailsScreenModel(partyId, cardId)
  const cardDisplayMode = usePreferencesStore((state) => state.cardDisplayMode)
  const {
    errorMessage,
    isRegenerating,
    handleAcceptCard,
    handleDeleteCard,
    handleRegenerateCard,
  } = useCardDetailsActions({ party, card })

  if (status === 'loading') {
    return (
      <Screen>
        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="subtitle">Loading card...</ThemedText>
          <ThemedText themeColor="textSecondary">
            Restoring saved party and card data.
          </ThemedText>
        </ThemedView>
      </Screen>
    )
  }

  if (status === 'missing') {
    return (
      <Screen>
        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="subtitle">Card not found</ThemedText>
          <ThemedText themeColor="textSecondary">
            This card may have been deleted or does not belong to this party.
          </ThemedText>
        </ThemedView>
      </Screen>
    )
  }

  return (
    <Screen>
      <CardDetailsHeader
        generatedNameWithClass={card.generated.generatedNameWithClass}
        statusLabel={card.status === 'accepted' ? 'Accepted card' : 'Draft card'}
        partyTitle={party.title}
      />
      <CardDisplayModeSwitch />
      <CharacterCardView
        displayMode={cardDisplayMode}
        backgroundHistory={card.generated.backgroundHistory}
        characterTraits={card.generated.characterTraits}
        specialMovement={card.generated.specialMovement}
        specialPhrase={card.generated.specialPhrase}
      />

      {errorMessage ? (
        <ThemedText themeColor="textSecondary">{errorMessage}</ThemedText>
      ) : null}

      {card.status === 'draft' ? (
        <Button label="Accept card" onPress={handleAcceptCard} />
      ) : null}

      <Button
        disabled={isRegenerating}
        label={isRegenerating ? 'Regenerating...' : 'Regenerate card'}
        variant="secondary"
        onPress={handleRegenerateCard}
      />

      <Button
        label="Delete card"
        variant="secondary"
        onPress={handleDeleteCard}
      />
    </Screen>
  )
}

const styles = StyleSheet.create((theme) => ({
  card: {
    borderRadius: theme.radius.card,
    padding: theme.spacing.four,
    gap: theme.spacing.three,
  },
}))
