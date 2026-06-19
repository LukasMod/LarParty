import { ThemedText } from '@/components/themed-text'
import { Party } from '@/features/parties/types'
import { AppTheme } from '@/shared/theme/unistyles'
import {
  partyMoodLabels,
  themeCategoryLabels,
} from '@/shared/constants/party-options'

interface PartyMetaLineProps {
  party: Pick<Party, 'themeCategory' | 'mood'>
  themeOverride?: AppTheme
}

export function PartyMetaLine({ party, themeOverride }: PartyMetaLineProps) {
  return (
    <ThemedText themeOverride={themeOverride} themeColor="textSecondary">
      {themeCategoryLabels[party.themeCategory]} · {partyMoodLabels[party.mood]}
    </ThemedText>
  )
}
