import { Link } from 'expo-router'
import { Pressable } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { CharacterCard } from '@/features/cards/types'

interface CharacterCardListItemProps {
  partyId: string
  card: CharacterCard
}

export function CharacterCardListItem({
  partyId,
  card,
}: CharacterCardListItemProps) {
  return (
    <Link
      href={{
        pathname: '/party/[partyId]/card/[cardId]',
        params: { partyId, cardId: card.id },
      }}
      asChild
    >
      <Pressable>
        <ThemedView style={styles.cardItem}>
          <ThemedText type="smallBold">
            {card.generated.generatedNameWithClass}
          </ThemedText>
          <ThemedText themeColor="textSecondary">
            {card.status === 'accepted' ? 'Accepted' : 'Draft'} · {card.input.name}
          </ThemedText>
        </ThemedView>
      </Pressable>
    </Link>
  )
}

const styles = StyleSheet.create((theme) => ({
  cardItem: {
    borderRadius: theme.radius.control,
    paddingHorizontal: theme.spacing.three,
    paddingVertical: theme.spacing.three,
    gap: theme.spacing.one,
  },
}))
