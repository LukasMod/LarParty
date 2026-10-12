import { router } from 'expo-router'
import { useState } from 'react'

import { PartyMood, ThemeCategory } from '@/features/parties/types'
import { usePartyStore } from '@/features/parties/store/party-store'
import {
  isPartyTitleValid,
  normalizePartyTitle,
  shouldClearPartyTitleError,
} from '@/features/parties/utils/party-form'

export function useNewPartyForm() {
  const createParty = usePartyStore((state) => state.createParty)
  const [title, setTitle] = useState('')
  const [themeCategory, setThemeCategory] = useState<ThemeCategory>('fantasy')
  const [mood, setMood] = useState<PartyMood>('fun')
  const [showValidationError, setShowValidationError] = useState(false)

  function handleTitleChange(value: string) {
    setTitle(value)

    if (shouldClearPartyTitleError(showValidationError, value)) {
      setShowValidationError(false)
    }
  }

  function handleCreateParty() {
    if (!isPartyTitleValid(title)) {
      setShowValidationError(true)
      return
    }

    const partyId = createParty({
      title: normalizePartyTitle(title),
      themeCategory,
      mood,
    })

    router.replace({
      pathname: '/party/[partyId]',
      params: { partyId },
    })
  }

  return {
    title,
    themeCategory,
    mood,
    showValidationError,
    handleTitleChange,
    setThemeCategory,
    setMood,
    handleCreateParty,
  }
}
