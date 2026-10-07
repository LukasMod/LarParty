import { router } from 'expo-router'
import { Alert } from 'react-native'
import { useTranslation } from 'react-i18next'

import { useCardStore } from '@/features/cards/store/card-store'
import { usePartyStore } from '@/features/parties/store/party-store'
import {
  buildLargeDebugDataset,
  buildSmallDebugDataset,
  DebugDataset,
} from '@/shared/debug/debug-data'

// Dev-only fixture seeding. Writes straight into the persisted stores so the
// data survives a reload like real data; no Gemini call and no API key needed.
export function useDebugActions() {
  const { t } = useTranslation(['common', 'debug'])

  function seed(dataset: DebugDataset) {
    usePartyStore.setState({
      parties: dataset.parties,
      hasHydrated: true,
    })
    useCardStore.setState({ cards: dataset.cards, hasHydrated: true })
    router.replace('/')
  }

  function handleSeedSmall() {
    seed(buildSmallDebugDataset())
  }

  function handleSeedLarge() {
    seed(buildLargeDebugDataset())
  }

  function handleClear() {
    Alert.alert(t('debug:clear.title'), t('debug:clear.body'), [
      { text: t('actions.cancel'), style: 'cancel' },
      {
        text: t('actions.delete'),
        style: 'destructive',
        onPress: () => {
          usePartyStore.setState({ parties: [] })
          useCardStore.setState({ cards: [] })
          router.replace('/')
        },
      },
    ])
  }

  return {
    handleSeedSmall,
    handleSeedLarge,
    handleClear,
  }
}
