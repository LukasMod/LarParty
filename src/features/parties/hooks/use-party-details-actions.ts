import { router } from 'expo-router'
import { Alert } from 'react-native'

import { usePartyStore } from '@/features/parties/store/party-store'
import { Party } from '@/features/parties/types'

interface UsePartyDetailsActionsParams {
  party: Party | null
}

export function usePartyDetailsActions({
  party,
}: UsePartyDetailsActionsParams) {
  const deleteParty = usePartyStore((state) => state.deleteParty)

  function handleDeleteParty() {
    if (!party) {
      return
    }

    Alert.alert('Delete party?', `Remove ${party.title} and all saved cards?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteParty(party.id)
          router.replace('/')
        },
      },
    ])
  }

  return {
    handleDeleteParty,
  }
}
