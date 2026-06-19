import { router } from 'expo-router'
import { useState } from 'react'
import { Alert } from 'react-native'

import { useCardStore } from '@/features/cards/store/card-store'
import { CharacterCard } from '@/features/cards/types'
import { generateCharacterCard } from '@/features/generation/gemini'
import { Party } from '@/features/parties/types'
import { useAppLanguage } from '@/shared/i18n/use-app-language'

interface UseCardDetailsActionsParams {
  party: Party | null
  card: CharacterCard | null
}

export function useCardDetailsActions({
  party,
  card,
}: UseCardDetailsActionsParams) {
  const acceptCard = useCardStore((state) => state.acceptCard)
  const { resolvedLanguage } = useAppLanguage()
  const createDraftCard = useCardStore((state) => state.createDraftCard)
  const deleteCard = useCardStore((state) => state.deleteCard)

  const [isRegenerating, setIsRegenerating] = useState(false)
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

    Alert.alert('Delete card?', 'Remove this saved character card?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
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
      'Regenerate card?',
      'Create a new draft variation from the same character input?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Regenerate',
          onPress: async () => {
            setErrorMessage(null)
            setIsRegenerating(true)

            let nextErrorMessage: string | null = null

            try {
              const generated = await generateCharacterCard({
                party,
                input: card.input,
                outputLanguage: resolvedLanguage,
              })

              const nextCardId = createDraftCard({
                partyId: card.partyId,
                input: card.input,
                generated,
                basedOnCardId: card.id,
                generationGroupId: card.generationGroupId,
              })

              router.replace({
                pathname: '/party/[partyId]/card/[cardId]',
                params: { partyId: card.partyId, cardId: nextCardId },
              })
            } catch (error) {
              nextErrorMessage =
                error instanceof Error
                  ? error.message
                  : 'Unable to regenerate card right now.'
            }

            setIsRegenerating(false)

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
    isRegenerating,
    handleAcceptCard,
    handleDeleteCard,
    handleRegenerateCard,
  }
}
