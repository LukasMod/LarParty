import { Link, useLocalSearchParams } from 'expo-router'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { useTranslation } from 'react-i18next'

import { ThemedText } from '@/components/themed-text'
import { PartyCardListSection } from '@/features/cards/components/party-card-list-section'
import { PartyMetaLine } from '@/features/parties/components/party-meta-line'
import { usePartyDetailsActions } from '@/features/parties/hooks/use-party-details-actions'
import { usePartyDetailsScreenModel } from '@/features/parties/hooks/use-party-details-screen-model'
import { Button } from '@/shared/components/button'
import { Screen } from '@/shared/components/screen'
import { ScreenStateCard } from '@/shared/components/screen-state-card'

export default function PartyDetailsScreen() {
  const { t } = useTranslation(['common'])
  const { partyId } = useLocalSearchParams<{ partyId: string }>()
  const { status, party, cards } = usePartyDetailsScreenModel(partyId)
  const { handleDeleteParty } = usePartyDetailsActions({ party })

  return (
    <Screen>
      {status === 'loading' ? (
        <ScreenStateCard
          title={t('state.loadingPartyTitle')}
          body={t('state.restoringPartyData')}
        />
      ) : status === 'missing' ? (
        <ScreenStateCard
          title={t('state.partyNotFoundTitle')}
          body={t('state.partyNotFoundBody')}
        />
      ) : (
        <>
          <View style={styles.header}>
            <ThemedText type="subtitle">{party.title}</ThemedText>
            <PartyMetaLine party={party} />
          </View>

          <PartyCardListSection
            partyId={party.id}
            partyThemeCategory={party.themeCategory}
            cards={cards}
          />

          <Link
            href={{
              pathname: '/party/[partyId]/card/new',
              params: { partyId: party.id },
            }}
            asChild
          >
            <Button label={t('actions.createCharacterCard')} />
          </Link>

          <Button
            label={t('actions.deleteParty')}
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
