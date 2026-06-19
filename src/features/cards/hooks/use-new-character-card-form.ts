import { router } from 'expo-router'
import { useState } from 'react'

import {
  CharacterCardInput,
  InputTrait,
  SexOption,
} from '@/features/cards/types'
import { useCardStore } from '@/features/cards/store/card-store'
import { generateCharacterCard } from '@/features/generation/gemini'
import { Party } from '@/features/parties/types'

const MAX_TRAITS = 3

interface UseNewCharacterCardFormParams {
  party: Party | null
}

export function useNewCharacterCardForm({
  party,
}: UseNewCharacterCardFormParams) {
  const createDraftCard = useCardStore((state) => state.createDraftCard)

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
      setErrorMessage('Party not found.')
      return
    }

    const trimmedName = name.trim()
    const parsedAge = Number.parseInt(age, 10)

    if (!trimmedName) {
      setErrorMessage('Character name is required.')
      return
    }

    if (!Number.isFinite(parsedAge) || parsedAge <= 0) {
      setErrorMessage('Enter a valid age.')
      return
    }

    if (selectedTraits.length === 0 || selectedTraits.length > MAX_TRAITS) {
      setErrorMessage('Choose between 1 and 3 traits.')
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
        error instanceof Error
          ? error.message
          : 'Unable to generate card right now.',
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
