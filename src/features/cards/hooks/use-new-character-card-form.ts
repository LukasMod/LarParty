import { router } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { InputTrait, SexOption, TraitLevels } from '@/features/cards/types'
import { useCardStore } from '@/features/cards/store/card-store'
import {
  CARD_FORM_ERROR_KEYS,
  MAX_CARD_TRAITS,
  setTraitLevel,
  toggleCardTrait,
  validateCardForm,
} from '@/features/cards/utils/card-form'
import { useCharacterCardGeneration } from '@/features/generation/hooks/use-character-card-generation'
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
  const [age, setAge] = useState('25')
  const [selectedTraits, setSelectedTraits] = useState<InputTrait[]>([])
  const [traitLevels, setTraitLevels] = useState<TraitLevels>({})
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  function toggleTrait(trait: InputTrait) {
    const next = toggleCardTrait(selectedTraits, trait)

    setSelectedTraits(next)

    // Drop the deselected trait's level on the spot rather than pruning on
    // submit: a re-selected trait should start fresh on 0, and the collapsing
    // row is the only thing still reading the old entry.
    if (!next.includes(trait)) {
      setTraitLevels(({ [trait]: _removed, ...rest }) => rest)
    }
  }

  function changeTraitLevel(trait: InputTrait, level: number) {
    setTraitLevels((currentLevels) => setTraitLevel(currentLevels, trait, level))
  }

  async function handleGenerateCard() {
    if (!party) {
      setErrorMessage(t(CARD_FORM_ERROR_KEYS.partyNotFound))
      return
    }

    const validation = validateCardForm(
      { name, age, selectedTraits, traitLevels },
      sex,
    )

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
    age,
    selectedTraits,
    traitLevels,
    errorMessage,
    isGenerating: generation.isGenerating,
    maxTraits: MAX_CARD_TRAITS,
    setName,
    setSex,
    setAge,
    toggleTrait,
    changeTraitLevel,
    handleGenerateCard,
    cancelGeneration: generation.cancel,
  }
}
