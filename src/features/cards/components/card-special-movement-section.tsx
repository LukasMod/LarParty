import { useTranslation } from 'react-i18next'

import { ThemedText } from '@/components/themed-text'
import { CardSection } from '@/features/cards/components/card-section'
import { ThemeCategory } from '@/features/parties/types'
import { getPartyTheme } from '@/shared/theme/party-theme'

interface CardSpecialMovementSectionProps {
  partyThemeCategory: ThemeCategory
  specialMovement: string
}

export function CardSpecialMovementSection({
  partyThemeCategory,
  specialMovement,
}: CardSpecialMovementSectionProps) {
  const { t } = useTranslation('cards')
  const partyTheme = getPartyTheme(partyThemeCategory)

  return (
    <CardSection title={t('sections.specialMovement')} themeOverride={partyTheme}>
      <ThemedText themeOverride={partyTheme}>{specialMovement}</ThemedText>
    </CardSection>
  )
}
