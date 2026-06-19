import { useLocalSearchParams } from 'expo-router'
import { Pressable } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
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
        <Pressable style={styles.primaryButton} onPress={handleAcceptCard}>
          <ThemedText style={styles.primaryButtonText}>Accept card</ThemedText>
        </Pressable>
      ) : null}

      <Pressable
        style={[styles.secondaryButton, isRegenerating && styles.buttonDisabled]}
        disabled={isRegenerating}
        onPress={handleRegenerateCard}
      >
        <ThemedText>
          {isRegenerating ? 'Regenerating...' : 'Regenerate card'}
        </ThemedText>
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={handleDeleteCard}>
        <ThemedText>Delete card</ThemedText>
      </Pressable>
    </Screen>
  )
}

const styles = StyleSheet.create((theme) => ({
  card: {
    borderRadius: theme.radius.card,
    padding: theme.spacing.four,
    gap: theme.spacing.three,
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
  buttonDisabled: {
    opacity: 0.65,
  },
}))
