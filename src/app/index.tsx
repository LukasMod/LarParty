import { Link } from 'expo-router'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { ThemedText } from '@/components/themed-text'
import { Button } from '@/shared/components/button'
import { PartyListItem } from '@/features/parties/components/party-list-item'
import { usePartyListScreenModel } from '@/features/parties/hooks/use-party-list-screen-model'
import { Screen } from '@/shared/components/screen'
import { ScreenStateCard } from '@/shared/components/screen-state-card'

export default function PartyListScreen() {
  const { hasHydrated, items } = usePartyListScreenModel()

  return (
    <Screen>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          LarParty
        </ThemedText>
        <ThemedText style={styles.subtitle} themeColor="textSecondary">
          Create themed parties and generate character cards for your next
          LARP-inspired event.
        </ThemedText>
      </View>

      {!hasHydrated ? (
        <ScreenStateCard
          title="Loading parties..."
          body="Restoring your saved local party data."
        />
      ) : items.length === 0 ? (
        <ScreenStateCard
          title="Party List"
          body="No parties yet. Create your first party to start generating character cards."
        />
      ) : (
        <View style={styles.partyList}>
          {items.map(({ party, cardCount, accentColor }) => (
            <PartyListItem
              key={party.id}
              party={party}
              cardCount={cardCount}
              accentColor={accentColor}
            />
          ))}
        </View>
      )}

      <Link href="/party/new" asChild>
        <Button label="Create a new party" />
      </Link>
    </Screen>
  )
}

const styles = StyleSheet.create((theme) => ({
  header: {
    gap: theme.spacing.two,
  },
  title: {
    fontSize: 42,
    lineHeight: 46,
  },
  subtitle: {},
  partyList: {
    gap: theme.spacing.three,
  },
}))
