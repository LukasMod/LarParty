import { router } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { InputTrait, SexOption } from '@/features/cards/types'
import { useCardStore } from '@/features/cards/store/card-store'
import {
  CARD_FORM_ERROR_KEYS,
  MAX_CARD_TRAITS,
  toggleCardTrait,
  validateCardForm,
} from '@/features/cards/utils/card-form'
import { useCharacterCardGeneration } from '@/features/generation/hooks/use-character-card-generation'
import { getPromptSiblings } from '@/features/generation/utils/party-context'
import { Party } from '@/features/parties/types'
import { useAppLanguage } from '@/shared/i18n/use-app-language'
import { resolveErrorMessage } from '@/shared/utils/error'

interface UseNewCharacterCardFormParams {
  party: Party | null
}

export function useNewCharacterCardForm({
  party,
}: UseNewCharacterCardFormParams) {
  const { t } = useTranslation('cards')
  const createDraftCard = useCardStore((state) => state.createDraftCard)
  const { resolvedLanguage } = useAppLanguage()
  const generation = useCharacterCardGeneration()

  const [name, setName] = useState('')
  const [sex, setSex] = useState<SexOption>('other')
  const [selectedTraits, setSelectedTraits] = useState<InputTrait[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  function toggleTrait(trait: InputTrait) {
    setSelectedTraits((currentTraits) => toggleCardTrait(currentTraits, trait))
  }

  async function handleGenerateCard() {
    if (!party) {
      setErrorMessage(t(CARD_FORM_ERROR_KEYS.partyNotFound))
      return
    }

    const validation = validateCardForm({ name, selectedTraits }, sex)

    if (!validation.ok) {
      setErrorMessage(t(validation.errorKey))
      return
    }

    const input = validation.input

    setErrorMessage(null)

    try {
      const { generated, cancelled } = await generation.start({
        party,
        input,
        outputLanguage: resolvedLanguage,
        siblings: getPromptSiblings({
          cards: useCardStore.getState().cards,
          partyId: party.id,
        }),
      })

      if (cancelled || !generated) {
        return
      }

      const cardId = createDraftCard({
        partyId: party.id,
        input,
        generated,
      })

      router.replace({
        pathname: '/party/[partyId]/card/[cardId]',
        params: { partyId: party.id, cardId },
      })
    } catch (error) {
      setErrorMessage(
        resolveErrorMessage(error, t('form.errors.generationFailed')),
      )
    }
  }

  return {
    name,
    sex,
    selectedTraits,
    errorMessage,
    isGenerating: generation.isGenerating,
    maxTraits: MAX_CARD_TRAITS,
    setName,
    setSex,
    toggleTrait,
    handleGenerateCard,
    cancelGeneration: generation.cancel,
  }
}
