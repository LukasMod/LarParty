import { router } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  CharacterCardInput,
  InputTrait,
  SexOption,
} from '@/features/cards/types'
import { useCardStore } from '@/features/cards/store/card-store'
import { generateCharacterCard } from '@/features/generation/gemini'
import { Party } from '@/features/parties/types'
import { useAppLanguage } from '@/shared/i18n/use-app-language'

const MAX_TRAITS = 3

interface UseNewCharacterCardFormParams {
  party: Party | null
}

export function useNewCharacterCardForm({
  party,
}: UseNewCharacterCardFormParams) {
  const { t } = useTranslation('cards')
  const createDraftCard = useCardStore((state) => state.createDraftCard)
  const { resolvedLanguage } = useAppLanguage()

  const [name, setName] = useState('')
  const [sex, setSex] = useState<SexOption>('other')
  const [age, setAge] = useState('25')
  const [selectedTraits, setSelectedTraits] = useState<InputTrait[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  function toggleTrait(trait: InputTrait) {
    setSelectedTraits((currentTraits) => {
      if (currentTraits.includes(trait)) {
        return currentTraits.filter((currentTrait) => currentTrait !== trait)
      }

      if (currentTraits.length >= MAX_TRAITS) {
        return currentTraits
      }

      return [...currentTraits, trait]
    })
  }

  async function handleGenerateCard() {
    if (!party) {
      setErrorMessage(t('form.errors.partyNotFound'))
      return
    }

    const trimmedName = name.trim()
    const parsedAge = Number.parseInt(age, 10)

    if (!trimmedName) {
      setErrorMessage(t('form.errors.nameRequired'))
      return
    }

    if (!Number.isFinite(parsedAge) || parsedAge <= 0) {
      setErrorMessage(t('form.errors.invalidAge'))
      return
    }

    if (selectedTraits.length === 0 || selectedTraits.length > MAX_TRAITS) {
      setErrorMessage(t('form.errors.invalidTraits'))
      return
    }

    const input: CharacterCardInput = {
      name: trimmedName,
      sex,
      age: parsedAge,
      selectedTraits,
    }

    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      const generated = await generateCharacterCard({
        party,
        input,
        outputLanguage: resolvedLanguage,
      })

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
        error instanceof Error ? error.message : t('form.errors.generationFailed'),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    name,
    sex,
    age,
    selectedTraits,
    errorMessage,
    isSubmitting,
    maxTraits: MAX_TRAITS,
    setName,
    setSex,
    setAge,
    toggleTrait,
    handleGenerateCard,
  }
}
