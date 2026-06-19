import { router } from 'expo-router'
import { useState } from 'react'

import { PartyMood, ThemeCategory } from '@/features/parties/types'
import { usePartyStore } from '@/features/parties/store/party-store'

export function useNewPartyForm() {
  const createParty = usePartyStore((state) => state.createParty)
  const [title, setTitle] = useState('')
  const [themeCategory, setThemeCategory] = useState<ThemeCategory>('fantasy')
  const [mood, setMood] = useState<PartyMood>('fun')
  const [showValidationError, setShowValidationError] = useState(false)

  function handleTitleChange(value: string) {
    setTitle(value)

    if (showValidationError && value.trim()) {
      setShowValidationError(false)
    }
  }

  function handleCreateParty() {
    const trimmedTitle = title.trim()

    if (!trimmedTitle) {
      setShowValidationError(true)
      return
    }

    const partyId = createParty({
      title: trimmedTitle,
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
