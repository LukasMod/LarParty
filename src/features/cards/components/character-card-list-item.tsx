import { Link } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import { LinearGradient } from 'expo-linear-gradient'
import { Pressable, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { useTranslation } from 'react-i18next'

import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { CharacterCard } from '@/features/cards/types'
import { ThemeCategory } from '@/features/parties/types'
import { withAlpha } from '@/shared/theme/alpha'
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
  const { t } = useTranslation('common')
  const partyTheme = getPartyTheme(partyThemeCategory)
  const { primary } = partyTheme.colors
  const isAccepted = card.status === 'accepted'

  return (
    <Link
      href={{
        pathname: '/party/[partyId]/card/[cardId]',
        params: { partyId, cardId: card.id },
      }}
      asChild
    >
      <Pressable>
        <ThemedView
          themeOverride={partyTheme}
          type="background"
          style={styles.cardItem}
        >
          {isAccepted ? (
            <LinearGradient
              colors={[withAlpha(primary, 0.22), withAlpha(primary, 0)]}
              style={StyleSheet.absoluteFill}
            />
          ) : null}
          <LinearGradient
            colors={[
              isAccepted ? primary : withAlpha(primary, 0.4),
              withAlpha(primary, 0),
            ]}
            style={styles.accent}
          />
          <View style={styles.content}>
            <ThemedText
              type="displaySmall"
              themeOverride={partyTheme}
              style={styles.title}
            >
              {card.generated.generatedNameWithClass}
            </ThemedText>
            <ThemedText
              type="small"
              themeOverride={partyTheme}
              themeColor="textSecondary"
            >
              {isAccepted ? t('status.accepted') : t('status.draft')} ·{' '}
              {card.input.name}
            </ThemedText>
          </View>
          <SymbolView
            name="chevron.right"
            size={16}
            tintColor={partyTheme.colors.textSecondary}
            style={styles.chevron}
          />
        </ThemedView>
      </Pressable>
    </Link>
  )
}

const styles = StyleSheet.create((theme) => ({
  cardItem: {
    borderRadius: theme.radius.card,
    padding: theme.spacing.three,
    paddingLeft: theme.spacing.four,
    gap: theme.spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  accent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
  },
  content: {
    flex: 1,
    gap: theme.spacing.one,
  },
  title: {
    fontSize: 17,
    lineHeight: 22,
  },
  chevron: {
    marginLeft: theme.spacing.one,
  },
}))
