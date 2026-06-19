import { useTranslation } from 'react-i18next'

import { ThemedText } from '@/components/themed-text'
import { CardSection } from '@/features/cards/components/card-section'
import { ThemeCategory } from '@/features/parties/types'
import { getPartyTheme } from '@/shared/theme/party-theme'

interface CardSpecialPhraseSectionProps {
  partyThemeCategory: ThemeCategory
  specialPhrase: string
}

export function CardSpecialPhraseSection({
  partyThemeCategory,
  specialPhrase,
}: CardSpecialPhraseSectionProps) {
  const { t } = useTranslation('cards')
  const partyTheme = getPartyTheme(partyThemeCategory)

  return (
    <CardSection title={t('sections.specialPhrase')} themeOverride={partyTheme}>
      <ThemedText themeOverride={partyTheme}>“{specialPhrase}”</ThemedText>
    </CardSection>
  )
}
