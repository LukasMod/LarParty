import { ThemedText } from '@/components/themed-text'
import { CardSection } from '@/features/cards/components/card-section'
import { ThemeCategory } from '@/features/parties/types'
import { getPartyTheme } from '@/shared/theme/party-theme'

interface CardHistorySectionProps {
  partyThemeCategory: ThemeCategory
  backgroundHistory: string
}

export function CardHistorySection({
  partyThemeCategory,
  backgroundHistory,
}: CardHistorySectionProps) {
  const partyTheme = getPartyTheme(partyThemeCategory)

  return (
    <CardSection title="Background" themeOverride={partyTheme}>
      <ThemedText themeOverride={partyTheme}>{backgroundHistory}</ThemedText>
    </CardSection>
  )
}
