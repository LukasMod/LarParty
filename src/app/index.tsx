import { Link, Stack } from 'expo-router'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { useTranslation } from 'react-i18next'

import { ThemedText } from '@/components/themed-text'
import { HomeEmptyState } from '@/features/parties/components/home-empty-state'
import { PartyListItem } from '@/features/parties/components/party-list-item'
import { usePartyListScreenModel } from '@/features/parties/hooks/use-party-list-screen-model'
import { IconButton } from '@/shared/components/icon-button'
import { Screen } from '@/shared/components/screen'
import { ScreenHeader } from '@/shared/components/screen-header'
import { ScreenStateCard } from '@/shared/components/screen-state-card'

export default function PartyListScreen() {
  const { t } = useTranslation(['common', 'home'])
  const { hasHydrated, items } = usePartyListScreenModel()
  const hasParties = hasHydrated && items.length > 0

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.container}>
        <ScreenHeader
          leading={
            <ThemedText type="display">{t('common:screens.home')}</ThemedText>
          }
          trailing={
            <>
              {hasParties ? (
                <Link href="/party/new" asChild>
                  <IconButton symbol="plus" label={t('actions.createParty')} />
                </Link>
              ) : null}
              <Link href="/settings" asChild>
                <IconButton
                  symbol="gearshape"
                  label={t('actions.openSettings')}
                  symbolSize={18}
                />
              </Link>
            </>
          }
        />

        <Screen contentStyle={styles.content}>
          {!hasHydrated ? (
            <ScreenStateCard
              title={t('state.loadingPartiesTitle')}
              body={t('state.restoringPartyData')}
            />
          ) : items.length === 0 ? (
            <HomeEmptyState />
          ) : (
            <View style={styles.partyList}>
              {items.map(({ party, cardCount }) => (
                <PartyListItem
                  key={party.id}
                  party={party}
                  cardCount={cardCount}
                />
              ))}
            </View>
          )}
        </Screen>
      </View>
    </>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: 0,
  },
  partyList: {
    gap: theme.spacing.three,
    paddingTop: theme.spacing.two,
  },
}))
