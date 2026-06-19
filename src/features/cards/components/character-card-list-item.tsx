import { Link } from 'expo-router'
import { Pressable } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { ThemedText } from '@/components/themed-text'
import { CharacterCard, CardStatus } from '@/features/cards/types'
import { ThemeCategory } from '@/features/parties/types'
import { getPartyTheme } from '@/shared/theme/party-theme'

interface CharacterCardListItemProps {
  partyId: string
  partyThemeCategory: ThemeCategory
  card: CharacterCard
}

export function CharacterCardListItem({
  partyId,
  partyThemeCategory,
  card,
}: CharacterCardListItemProps) {
  const partyTheme = getPartyTheme(partyThemeCategory)

  return (
    <Link
      href={{
        pathname: '/party/[partyId]/card/[cardId]',
        params: { partyId, cardId: card.id },
      }}
      asChild
    >
      <Pressable style={styles.cardItem(partyTheme, card.status)}>
        <ThemedText type="smallBold" themeOverride={partyTheme}>
          {card.generated.generatedNameWithClass}
        </ThemedText>
        <ThemedText themeOverride={partyTheme} themeColor="textSecondary">
          {card.status === 'accepted' ? 'Accepted' : 'Draft'} · {card.input.name}
        </ThemedText>
      </Pressable>
    </Link>
  )
}

const styles = StyleSheet.create((theme) => ({
  cardItem: (partyTheme: ReturnType<typeof getPartyTheme>, status: CardStatus) => ({
    borderRadius: theme.radius.control,
    paddingHorizontal: theme.spacing.three,
    paddingVertical: theme.spacing.three,
    gap: theme.spacing.one,
    borderWidth: 1,
    backgroundColor:
      status === 'accepted'
        ? partyTheme.colors.surfaceSelected
        : partyTheme.colors.surfaceMuted,
    borderColor: partyTheme.colors.border,
  }),
}))
