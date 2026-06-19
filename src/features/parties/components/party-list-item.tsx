import { Link } from 'expo-router'
import { Pressable, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { PartyMetaLine } from '@/features/parties/components/party-meta-line'
import { Party } from '@/features/parties/types'
import { getPartyTheme } from '@/shared/theme/party-theme'

interface PartyListItemProps {
  party: Party
  cardCount: number
}

export function PartyListItem({
  party,
  cardCount,
}: PartyListItemProps) {
  const partyTheme = getPartyTheme(party.themeCategory)

  return (
    <Link
      href={{
        pathname: '/party/[partyId]',
        params: { partyId: party.id },
      }}
      asChild
    >
      <Pressable>
        <ThemedView themeOverride={partyTheme} type="surface" style={styles.partyCard}>
          <ThemedView
            themeOverride={partyTheme}
            type="cardPreviewAccent"
            style={styles.partyAccent}
          />
          <View style={styles.partyCardContent}>
            <View style={styles.partyCardHeader}>
              <ThemedText
                type="subtitle"
                themeOverride={partyTheme}
                style={styles.partyCardTitle}
              >
                {party.title}
              </ThemedText>
              <ThemedText themeOverride={partyTheme} themeColor="textSecondary">
                {cardCount} {cardCount === 1 ? 'card' : 'cards'}
              </ThemedText>
            </View>
            <PartyMetaLine party={party} themeOverride={partyTheme} />
          </View>
        </ThemedView>
      </Pressable>
    </Link>
  )
}

const styles = StyleSheet.create((theme) => ({
  partyCard: {
    borderRadius: theme.radius.card,
    padding: theme.spacing.three,
    gap: theme.spacing.three,
    flexDirection: 'row',
    alignItems: 'stretch',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  partyAccent: {
    width: 8,
    minHeight: 72,
    borderRadius: theme.radius.pill,
  },
  partyCardContent: {
    flex: 1,
    gap: theme.spacing.two,
  },
  partyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.two,
    alignItems: 'center',
  },
  partyCardTitle: {
    flex: 1,
    fontSize: 24,
    lineHeight: 30,
  },
}))
