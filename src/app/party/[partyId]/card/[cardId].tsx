import { useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation('common')
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
          title={t('state.loadingCardTitle')}
          body={t('state.restoringCardData')}
        />
      </Screen>
    )
  }

  if (status === 'missing') {
    return (
      <Screen>
        <ScreenStateCard
          title={t('state.cardNotFoundTitle')}
          body={t('state.cardNotFoundBody')}
        />
      </Screen>
    )
  }

  return (
    <Screen>
      <CardDetailsHeader
        generatedNameWithClass={card.generated.generatedNameWithClass}
        statusLabel={
          card.status === 'accepted'
            ? t('status.acceptedCard')
            : t('status.draftCard')
        }
        partyTitle={party.title}
      />
      <CardDisplayModeSwitch />
      <CharacterCardView
        displayMode={cardDisplayMode}
        partyThemeCategory={party.themeCategory}
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

