import { Link } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import { LinearGradient } from 'expo-linear-gradient'
import { Pressable, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { useTranslation } from 'react-i18next'

import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { PartyMetaLine } from '@/features/parties/components/party-meta-line'
import { Party } from '@/features/parties/types'
import { partyThemeGlyphs } from '@/shared/constants/party-options'
import { withAlpha } from '@/shared/theme/alpha'
import { getPartyTheme } from '@/shared/theme/party-theme'

interface PartyListItemProps {
  party: Party
  cardCount: number
}

export function PartyListItem({ party, cardCount }: PartyListItemProps) {
  const { t } = useTranslation('common')
  const partyTheme = getPartyTheme(party.themeCategory)
  const { primary } = partyTheme.colors

  return (
    <Link
      href={{
        pathname: '/party/[partyId]',
        params: { partyId: party.id },
      }}
      asChild
    >
      <Pressable>
        <ThemedView
          themeOverride={partyTheme}
          type="background"
          style={styles.partyCard}
        >
          <LinearGradient
            colors={[withAlpha(primary, 0.32), withAlpha(primary, 0)]}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={[primary, withAlpha(primary, 0)]}
            style={styles.partyAccent}
          />
          <View
            style={[
              styles.glyphTile,
              {
                backgroundColor: withAlpha(primary, 0.16),
                shadowColor: primary,
              },
            ]}
          >
            <ThemedText
              style={styles.glyph}
              themeOverride={partyTheme}
              themeColor="primary"
            >
              {partyThemeGlyphs[party.themeCategory]}
            </ThemedText>
          </View>
          <View style={styles.partyCardContent}>
            <ThemedText
              type="displaySmall"
              themeOverride={partyTheme}
              style={styles.partyCardTitle}
            >
              {party.title}
            </ThemedText>
            <PartyMetaLine party={party} themeOverride={partyTheme} />
            <ThemedText
              type="small"
              themeOverride={partyTheme}
              themeColor="textSecondary"
            >
              {t('counts.characters', { count: cardCount })}
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
  partyCard: {
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
  partyAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
  },
  glyphTile: {
    width: 52,
    height: 52,
    borderRadius: theme.radius.control,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.9,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  glyph: {
    fontSize: 26,
    lineHeight: 30,
  },
  partyCardContent: {
    flex: 1,
    gap: theme.spacing.one,
  },
  partyCardTitle: {
    fontSize: 18,
    lineHeight: 24,
  },
  chevron: {
    marginLeft: theme.spacing.one,
  },
}))
