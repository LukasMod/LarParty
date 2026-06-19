import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { ThemedText } from '@/components/themed-text'
import { FormCard } from '@/shared/components/form-card'
import { CharacterCardListItem } from '@/features/cards/components/character-card-list-item'
import { CharacterCard } from '@/features/cards/types'
import { ThemeCategory } from '@/features/parties/types'

interface PartyCardListSectionProps {
  partyId: string
  partyThemeCategory: ThemeCategory
  cards: CharacterCard[]
}

export function PartyCardListSection({
  partyId,
  partyThemeCategory,
  cards,
}: PartyCardListSectionProps) {
  return (
    <FormCard style={styles.card}>
      <ThemedText type="smallBold">Character Cards</ThemedText>
      {cards.length === 0 ? (
        <ThemedText themeColor="textSecondary">
          No cards yet. This party is ready for its first character.
        </ThemedText>
      ) : (
        <View style={styles.cardList}>
          {cards.map((card) => (
            <CharacterCardListItem
              key={card.id}
              partyId={partyId}
              partyThemeCategory={partyThemeCategory}
              card={card}
            />
          ))}
        </View>
      )}
    </FormCard>
  )
}

const styles = StyleSheet.create((theme) => ({
  card: {
    gap: theme.spacing.two,
  },
  cardList: {
    gap: theme.spacing.two,
    marginTop: theme.spacing.two,
  },
}))
