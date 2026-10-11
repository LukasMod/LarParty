import { LinearGradient } from 'expo-linear-gradient'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { CardHistorySection } from '@/features/cards/components/card-history-section'
import { CardSpecialMovementSection } from '@/features/cards/components/card-special-movement-section'
import { CardSpecialPhraseSection } from '@/features/cards/components/card-special-phrase-section'
import { CardTraitsSection } from '@/features/cards/components/card-traits-section'
import { ThemedView } from '@/components/themed-view'
import { CardDisplayMode } from '@/features/cards/types'
import { ThemeCategory } from '@/features/parties/types'
import { CardBorderGlow } from '@/shared/components/card-glow'
import { withAlpha } from '@/shared/theme/alpha'
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
    <View style={styles.wrapper}>
      <CardBorderGlow
        color={partyTheme.colors.primary}
        peakAlpha={0.6}
        style={styles.borderGlow}
      />
      <ThemedView
        themeOverride={partyTheme}
        type="background"
        style={styles.card(displayMode)}
      >
        <LinearGradient
          colors={[
            withAlpha(partyTheme.colors.primary, 0.22),
            withAlpha(partyTheme.colors.primary, 0),
          ]}
          style={StyleSheet.absoluteFill}
        />
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
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  wrapper: {
    // Unclipped so the border halo can bleed past the card edges.
    position: 'relative',
  },
  borderGlow: {
    // Fills the wrapper behind the card; the card's opaque background covers
    // the inset half of the shadow, so only the outward glow shows.
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: theme.radius.card,
  },
  card: (displayMode: CardDisplayMode) => ({
    borderRadius: theme.radius.card,
    padding: theme.spacing.four,
    gap: theme.spacing.three,
    borderWidth: displayMode === 'collectible' ? 2 : 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  }),
}))
