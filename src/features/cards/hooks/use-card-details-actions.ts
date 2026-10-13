import { router } from 'expo-router'
import { useState } from 'react'
import { Alert } from 'react-native'
import { useTranslation } from 'react-i18next'

import { useCardStore } from '@/features/cards/store/card-store'
import { CharacterCard } from '@/features/cards/types'
import { useCharacterCardGeneration } from '@/features/generation/hooks/use-character-card-generation'
import {
  getGenerationAttempt,
  getPromptSiblings,
} from '@/features/generation/utils/party-context'
import { splitGeneratedWorld } from '@/features/generation/utils/party-world'
import { Party } from '@/features/parties/types'
import { usePartyStore } from '@/features/parties/store/party-store'
import { useAppLanguage } from '@/shared/i18n/use-app-language'
import { resolveErrorMessage } from '@/shared/utils/error'

interface UseCardDetailsActionsParams {
  party: Party | null
  card: CharacterCard | null
}

export function useCardDetailsActions({
  party,
  card,
}: UseCardDetailsActionsParams) {
  const { t } = useTranslation(['common', 'cards'])
  const acceptCard = useCardStore((state) => state.acceptCard)
  const { resolvedLanguage } = useAppLanguage()
  const createDraftCard = useCardStore((state) => state.createDraftCard)
  const deleteCard = useCardStore((state) => state.deleteCard)
  const setPartyHistory = usePartyStore((state) => state.setPartyHistory)
  const generation = useCharacterCardGeneration()

  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  function handleAcceptCard() {
    if (!card || card.status === 'accepted') {
      return
    }

    acceptCard(card.id)
  }

  function handleDeleteCard() {
    if (!card) {
      return
    }

    Alert.alert(t('cards:details.deleteTitle'), t('cards:details.deleteBody'), [
      { text: t('actions.cancel'), style: 'cancel' },
      {
        text: t('actions.delete'),
        style: 'destructive',
        onPress: () => {
          deleteCard(card.id)
          router.replace({
            pathname: '/party/[partyId]',
            params: { partyId: card.partyId },
          })
        },
      },
    ])
  }

  function handleRegenerateCard() {
    if (!card || !party) {
      return
    }

    Alert.alert(
      t('cards:details.regenerateTitle'),
      t('cards:details.regenerateBody'),
      [
        { text: t('actions.cancel'), style: 'cancel' },
        {
          text: t('actions.regenerate'),
          onPress: async () => {
            setErrorMessage(null)

            let nextErrorMessage: string | null = null

            try {
              const partyCards = useCardStore.getState().cards
              const { generated, cancelled } = await generation.start({
                party,
                input: card.input,
                outputLanguage: resolvedLanguage,
                partyHistory: party.partyHistory,
                attempt: getGenerationAttempt(
                  partyCards,
                  card.generationGroupId,
                ),
                siblings: getPromptSiblings({
                  cards: partyCards,
                  partyId: card.partyId,
                  excludeGenerationGroupId: card.generationGroupId,
                }),
              })

              if (cancelled || !generated) {
                return
              }

              const { generated: cardGenerated, partyHistory } =
                splitGeneratedWorld(generated)

              if (partyHistory) {
                setPartyHistory(card.partyId, partyHistory)
              }

              const nextCardId = createDraftCard({
                partyId: card.partyId,
                input: card.input,
                generated: cardGenerated,
                basedOnCardId: card.id,
                generationGroupId: card.generationGroupId,
              })

              router.replace({
                pathname: '/party/[partyId]/card/[cardId]',
                params: { partyId: card.partyId, cardId: nextCardId },
              })
            } catch (error) {
              nextErrorMessage = resolveErrorMessage(
                error,
                t('cards:details.regenerationFailed'),
              )
            }

            if (nextErrorMessage) {
              setErrorMessage(nextErrorMessage)
            }
          },
        },
      ],
    )
  }

  return {
    errorMessage,
    isRegenerating: generation.isGenerating,
    handleAcceptCard,
    handleDeleteCard,
    handleRegenerateCard,
    cancelRegeneration: generation.cancel,
  }
}
