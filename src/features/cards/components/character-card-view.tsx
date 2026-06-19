import { StyleSheet } from 'react-native-unistyles'

import { CardHistorySection } from '@/features/cards/components/card-history-section'
import { CardSpecialMovementSection } from '@/features/cards/components/card-special-movement-section'
import { CardSpecialPhraseSection } from '@/features/cards/components/card-special-phrase-section'
import { CardTraitsSection } from '@/features/cards/components/card-traits-section'
import { ThemedView } from '@/components/themed-view'
import { CardDisplayMode } from '@/features/cards/types'
import { ThemeCategory } from '@/features/parties/types'
import { getPartyTheme } from '@/shared/theme/party-theme'

interface CharacterCardViewProps {
  displayMode: CardDisplayMode
  partyThemeCategory: ThemeCategory
  backgroundHistory: string
  characterTraits: readonly string[]
  specialMovement: string
  specialPhrase: string
}

export function CharacterCardView({
  displayMode,
  partyThemeCategory,
  backgroundHistory,
  characterTraits,
  specialMovement,
  specialPhrase,
}: CharacterCardViewProps) {
  const partyTheme = getPartyTheme(partyThemeCategory)

  return (
    <ThemedView
      themeOverride={partyTheme}
      type={displayMode === 'collectible' ? 'surface' : 'backgroundMuted'}
      style={styles.card(partyTheme, displayMode)}
    >
      <CardHistorySection
        partyThemeCategory={partyThemeCategory}
        backgroundHistory={backgroundHistory}
      />
      <CardTraitsSection
        characterTraits={characterTraits}
        partyThemeCategory={partyThemeCategory}
      />
      <CardSpecialMovementSection
        partyThemeCategory={partyThemeCategory}
        specialMovement={specialMovement}
      />
      <CardSpecialPhraseSection
        partyThemeCategory={partyThemeCategory}
        specialPhrase={specialPhrase}
      />
    </ThemedView>
  )
}

const styles = StyleSheet.create((theme) => ({
  card: (partyTheme: ReturnType<typeof getPartyTheme>, displayMode: CardDisplayMode) => ({
    borderRadius: theme.radius.card,
    padding: theme.spacing.four,
    gap: theme.spacing.three,
    borderWidth: displayMode === 'collectible' ? 2 : 1,
    borderColor:
      displayMode === 'collectible'
        ? partyTheme.colors.cardPreviewAccent
        : partyTheme.colors.border,
  }),
}))
