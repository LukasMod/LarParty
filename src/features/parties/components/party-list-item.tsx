import { Link } from 'expo-router'
import { Pressable, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { Party } from '@/features/parties/types'
import { PartyMetaLine } from '@/features/parties/components/party-meta-line'

interface PartyListItemProps {
  party: Party
  cardCount: number
  accentColor: string
}

export function PartyListItem({
  party,
  cardCount,
  accentColor,
}: PartyListItemProps) {
  return (
    <Link
      href={{
        pathname: '/party/[partyId]',
        params: { partyId: party.id },
      }}
      asChild
    >
      <Pressable>
        <ThemedView type="backgroundElement" style={styles.partyCard}>
          <View
            style={[
              styles.partyAccent,
              { backgroundColor: accentColor },
            ]}
          />
          <View style={styles.partyCardContent}>
            <View style={styles.partyCardHeader}>
              <ThemedText type="subtitle" style={styles.partyCardTitle}>
                {party.title}
              </ThemedText>
              <ThemedText themeColor="textSecondary">
                {cardCount} {cardCount === 1 ? 'card' : 'cards'}
              </ThemedText>
            </View>
            <PartyMetaLine party={party} />
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
