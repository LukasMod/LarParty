import { Link, router, Stack, useLocalSearchParams } from 'expo-router'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { useTranslation } from 'react-i18next'

import { ThemedText } from '@/components/themed-text'
import { PartyCardListSection } from '@/features/cards/components/party-card-list-section'
import { PartyMetaLine } from '@/features/parties/components/party-meta-line'
import { usePartyDetailsActions } from '@/features/parties/hooks/use-party-details-actions'
import { usePartyDetailsScreenModel } from '@/features/parties/hooks/use-party-details-screen-model'
import { Button } from '@/shared/components/button'
import { IconButton } from '@/shared/components/icon-button'
import { Screen } from '@/shared/components/screen'
import { ScreenHeader } from '@/shared/components/screen-header'
import { ScreenStateCard } from '@/shared/components/screen-state-card'

export default function PartyDetailsScreen() {
  const { t } = useTranslation(['common'])
  const { partyId } = useLocalSearchParams<{ partyId: string }>()
  const { status, party, cards } = usePartyDetailsScreenModel(partyId)
  const { handleDeleteParty } = usePartyDetailsActions({ party })

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScreenHeader
        leading={
          <View style={styles.headerTitle}>
            <IconButton
              symbol="chevron.left"
              label={t('actions.back')}
              onPress={() => router.back()}
            />
            {status === 'ready' ? (
              <ThemedText type="displaySmall" numberOfLines={1}>
                {party.title}
              </ThemedText>
            ) : null}
          </View>
        }
        trailing={
          status === 'ready' ? (
            <Link
              href={{
                pathname: '/party/[partyId]/card/new',
                params: { partyId: party.id },
              }}
              asChild
            >
              <IconButton
                symbol="plus"
                label={t('actions.createCharacterCard')}
              />
            </Link>
          ) : null
        }
      />

      <Screen contentStyle={styles.content}>
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
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: 0,
  },
  header: {
    gap: theme.spacing.one,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.two,
  },
}))
