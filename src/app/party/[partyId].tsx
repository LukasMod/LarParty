import { Link, useLocalSearchParams } from 'expo-router'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { ThemedText } from '@/components/themed-text'
import { PartyCardListSection } from '@/features/cards/components/party-card-list-section'
import { PartyMetaLine } from '@/features/parties/components/party-meta-line'
import { usePartyDetailsActions } from '@/features/parties/hooks/use-party-details-actions'
import { usePartyDetailsScreenModel } from '@/features/parties/hooks/use-party-details-screen-model'
import { Button } from '@/shared/components/button'
import { Screen } from '@/shared/components/screen'
import { ScreenStateCard } from '@/shared/components/screen-state-card'

export default function PartyDetailsScreen() {
  const { partyId } = useLocalSearchParams<{ partyId: string }>()
  const { status, party, cards } = usePartyDetailsScreenModel(partyId)
  const { handleDeleteParty } = usePartyDetailsActions({ party })

  return (
    <Screen>
      {status === 'loading' ? (
        <ScreenStateCard
          title="Loading party..."
          body="Restoring your saved local party data."
        />
      ) : status === 'missing' ? (
        <ScreenStateCard
          title="Party not found"
          body="This party may have been deleted or does not exist."
        />
      ) : (
        <>
          <View style={styles.header}>
            <ThemedText type="subtitle">{party.title}</ThemedText>
            <PartyMetaLine party={party} />
          </View>

          <PartyCardListSection partyId={party.id} cards={cards} />

          <Link
            href={{
              pathname: '/party/[partyId]/card/new',
              params: { partyId: party.id },
            }}
            asChild
          >
            <Button label="Create a character card" />
          </Link>

          <Button
            label="Delete party"
            variant="secondary"
            onPress={handleDeleteParty}
          />
        </>
      )}
    </Screen>
  )
}

const styles = StyleSheet.create((theme) => ({
  header: {
    gap: theme.spacing.one,
  },
}))
