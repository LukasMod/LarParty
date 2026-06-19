import { useLocalSearchParams } from 'expo-router'
import { CardDetailsActions } from '@/features/cards/components/card-details-actions'
import { CardDetailsHeader } from '@/features/cards/components/card-details-header'
import { CardDisplayModeSwitch } from '@/features/cards/components/card-display-mode-switch'
import { CharacterCardView } from '@/features/cards/components/character-card-view'
import { useCardDetailsActions } from '@/features/cards/hooks/use-card-details-actions'
import { useCardDetailsScreenModel } from '@/features/cards/hooks/use-card-details-screen-model'
import { usePreferencesStore } from '@/features/preferences/store/preferences-store'
import { Screen } from '@/shared/components/screen'
import { ScreenStateCard } from '@/shared/components/screen-state-card'

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
        <ScreenStateCard
          title="Loading card..."
          body="Restoring saved party and card data."
        />
      </Screen>
    )
  }

  if (status === 'missing') {
    return (
      <Screen>
        <ScreenStateCard
          title="Card not found"
          body="This card may have been deleted or does not belong to this party."
        />
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

      <CardDetailsActions
        status={card.status}
        errorMessage={errorMessage}
        isRegenerating={isRegenerating}
        onAcceptCard={handleAcceptCard}
        onRegenerateCard={handleRegenerateCard}
        onDeleteCard={handleDeleteCard}
      />
    </Screen>
  )
}

