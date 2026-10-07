import { SymbolView } from 'expo-symbols'
import { Link, Stack } from 'expo-router'
import { Pressable, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { useTranslation } from 'react-i18next'

import { ThemedText } from '@/components/themed-text'
import { HomeEmptyState } from '@/features/parties/components/home-empty-state'
import { PartyListItem } from '@/features/parties/components/party-list-item'
import { usePartyListScreenModel } from '@/features/parties/hooks/use-party-list-screen-model'
import { Screen } from '@/shared/components/screen'
import { ScreenStateCard } from '@/shared/components/screen-state-card'

export default function PartyListScreen() {
  const { t } = useTranslation(['common', 'home'])
  const { hasHydrated, items } = usePartyListScreenModel()
  const hasParties = hasHydrated && items.length > 0

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: '',
          headerLeft: () => (
            <ThemedText type="display" style={styles.wordmark}>
              {t('common:screens.home')}
            </ThemedText>
          ),
          headerRight: () => (
            <View style={styles.headerActions}>
              {hasParties ? (
                <Link href="/party/new" asChild>
                  <Pressable
                    accessibilityLabel={t('actions.createParty')}
                    accessibilityRole="button"
                    hitSlop={8}
                    style={({ pressed }) => [
                      styles.headerAction,
                      pressed && styles.headerActionPressed,
                    ]}
                  >
                    <SymbolView
                      name="plus"
                      size={20}
                      tintColor={styles.headerActionIcon.color}
                    />
                  </Pressable>
                </Link>
              ) : null}
              <Link href="/settings" asChild>
                <Pressable
                  accessibilityLabel={t('actions.openSettings')}
                  accessibilityRole="button"
                  hitSlop={8}
                  style={({ pressed }) => [
                    styles.headerAction,
                    pressed && styles.headerActionPressed,
                  ]}
                >
                  <SymbolView
                    name="gearshape"
                    size={18}
                    tintColor={styles.headerActionIcon.color}
                  />
                </Pressable>
              </Link>
            </View>
          ),
        }}
      />

      <Screen>
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
    </>
  )
}

const styles = StyleSheet.create((theme) => ({
  wordmark: {},
  partyList: {
    gap: theme.spacing.three,
    paddingTop: theme.spacing.two,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.two,
  },
  headerAction: {
    paddingVertical: theme.spacing.one,
    paddingLeft: theme.spacing.two,
  },
  headerActionPressed: {
    opacity: 0.6,
  },
  headerActionIcon: {
    color: theme.colors.text,
  },
}))
