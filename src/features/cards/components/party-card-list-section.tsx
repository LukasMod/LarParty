import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { useTranslation } from 'react-i18next'

import { ThemedText } from '@/components/themed-text'
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
  const { t } = useTranslation('cards')

  return (
    <View style={styles.section}>
      <ThemedText type="smallBold">{t('sections.listTitle')}</ThemedText>
      {cards.length === 0 ? (
        <ThemedText themeColor="textSecondary" style={styles.emptyList}>
          {t('sections.emptyList')}
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
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  section: {
    gap: theme.spacing.three,
  },
  emptyList: {
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.three,
  },
  cardList: {
    gap: theme.spacing.three,
  },
}))
