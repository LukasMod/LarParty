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
  const partyTheme = getPartyTheme(partyThemeCategory)

  return (
    <CardSection title="Special phrase" themeOverride={partyTheme}>
      <ThemedText themeOverride={partyTheme}>“{specialPhrase}”</ThemedText>
    </CardSection>
  )
}
