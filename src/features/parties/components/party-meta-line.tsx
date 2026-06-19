import { useTranslation } from 'react-i18next'

import { ThemedText } from '@/components/themed-text'
import { Party } from '@/features/parties/types'
import {
  getPartyMoodLabel,
  getThemeCategoryLabel,
} from '@/shared/i18n/labels'
import { AppTheme } from '@/shared/theme/unistyles'

interface PartyMetaLineProps {
  party: Pick<Party, 'themeCategory' | 'mood'>
  themeOverride?: AppTheme
}

export function PartyMetaLine({ party, themeOverride }: PartyMetaLineProps) {
  const { t } = useTranslation()

  return (
    <ThemedText themeOverride={themeOverride} themeColor="textSecondary">
      {getThemeCategoryLabel(t, party.themeCategory)} · {getPartyMoodLabel(t, party.mood)}
    </ThemedText>
  )
}
