import { router } from 'expo-router'
import { Alert } from 'react-native'
import { useTranslation } from 'react-i18next'

import { hasPartyWorld } from '@/features/generation/utils/party-world'
import { usePartyStore } from '@/features/parties/store/party-store'
import { Party } from '@/features/parties/types'

interface UsePartyDetailsActionsParams {
  party: Party | null
}

export function usePartyDetailsActions({
  party,
}: UsePartyDetailsActionsParams) {
  const { t } = useTranslation(['common', 'parties'])
  const deleteParty = usePartyStore((state) => state.deleteParty)

  function handleDeleteParty() {
    if (!party) {
      return
    }

    Alert.alert(t('parties:details.deleteTitle'), t('parties:details.deleteBody', {
      title: party.title,
    }), [
      { text: t('actions.cancel'), style: 'cancel' },
      {
        text: t('actions.delete'),
        style: 'destructive',
        onPress: () => {
          deleteParty(party.id)
          router.replace('/')
        },
      },
    ])
  }

  function handleShowPartyWorld() {
    if (!party || !hasPartyWorld(party.partyHistory)) {
      return
    }

    Alert.alert(t('parties:details.worldTitle'), party.partyHistory, [
      { text: t('actions.close'), style: 'cancel' },
    ])
  }

  return {
    handleDeleteParty,
    handleShowPartyWorld,
  }
}
