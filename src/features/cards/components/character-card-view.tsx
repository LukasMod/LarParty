import { StyleSheet } from 'react-native-unistyles'

import { CardHistorySection } from '@/features/cards/components/card-history-section'
import { CardSpecialMovementSection } from '@/features/cards/components/card-special-movement-section'
import { CardSpecialPhraseSection } from '@/features/cards/components/card-special-phrase-section'
import { CardTraitsSection } from '@/features/cards/components/card-traits-section'
import { ThemedView } from '@/components/themed-view'
import { CardDisplayMode } from '@/features/cards/types'

interface CharacterCardViewProps {
  displayMode: CardDisplayMode
  backgroundHistory: string
  characterTraits: readonly string[]
  specialMovement: string
  specialPhrase: string
}

export function CharacterCardView({
  displayMode,
  backgroundHistory,
  characterTraits,
  specialMovement,
  specialPhrase,
}: CharacterCardViewProps) {
  return (
    <ThemedView
      type="backgroundElement"
      style={[
        styles.card,
        displayMode === 'collectible'
          ? styles.collectibleCard
          : styles.infoCard,
      ]}
    >
      <CardHistorySection backgroundHistory={backgroundHistory} />
      <CardTraitsSection characterTraits={characterTraits} />
      <CardSpecialMovementSection specialMovement={specialMovement} />
      <CardSpecialPhraseSection specialPhrase={specialPhrase} />
    </ThemedView>
  )
}

const styles = StyleSheet.create((theme) => ({
  card: {
    borderRadius: theme.radius.card,
    padding: theme.spacing.four,
    gap: theme.spacing.three,
  },
  collectibleCard: {
    borderWidth: 2,
    borderColor: theme.colors.cardPreviewAccent,
  },
  infoCard: {
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
}))
