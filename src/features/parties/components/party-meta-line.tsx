import { ThemedText } from '@/components/themed-text'
import { Party } from '@/features/parties/types'
import {
  partyMoodLabels,
  themeCategoryLabels,
} from '@/shared/constants/party-options'

interface PartyMetaLineProps {
  party: Pick<Party, 'themeCategory' | 'mood'>
}

export function PartyMetaLine({ party }: PartyMetaLineProps) {
  return (
    <ThemedText themeColor="textSecondary">
      {themeCategoryLabels[party.themeCategory]} · {partyMoodLabels[party.mood]}
    </ThemedText>
  )
}
