import { SymbolView } from 'expo-symbols'
import { Link, Stack } from 'expo-router'
import { Pressable, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { useTranslation } from 'react-i18next'

import { ThemedText } from '@/components/themed-text'
import { PartyListItem } from '@/features/parties/components/party-list-item'
import { usePartyListScreenModel } from '@/features/parties/hooks/use-party-list-screen-model'
import { Button } from '@/shared/components/button'
import { Screen } from '@/shared/components/screen'
import { ScreenStateCard } from '@/shared/components/screen-state-card'

export default function PartyListScreen() {
  const { t } = useTranslation(['common', 'home'])
  const { hasHydrated, items } = usePartyListScreenModel()

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
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
          ),
        }}
      />

      <Screen>
      <View style={styles.header}>
        <ThemedText style={styles.subtitle} themeColor="textSecondary">
          {t('home:subtitle')}
        </ThemedText>
      </View>

      <Link href="/party/new" asChild>
        <Button label={t('actions.createParty')} />
      </Link>

      {!hasHydrated ? (
        <ScreenStateCard
          title={t('state.loadingPartiesTitle')}
          body={t('state.restoringPartyData')}
        />
      ) : items.length === 0 ? (
        <ScreenStateCard
          title={t('home:emptyTitle')}
          body={t('home:emptyBody')}
        />
      ) : (
        <View style={styles.partyList}>
          {items.map(({ party, cardCount }) => (
            <PartyListItem key={party.id} party={party} cardCount={cardCount} />
          ))}
        </View>
      )}
      </Screen>
    </>
  )
}

const styles = StyleSheet.create((theme) => ({
  header: {
    paddingTop: theme.spacing.two,
  },
  title: {
    fontSize: 42,
    lineHeight: 46,
  },
  subtitle: {},
  partyList: {
    gap: theme.spacing.three,
  },
  headerAction: {
    paddingVertical: theme.spacing.one,
    paddingLeft: theme.spacing.two,
  },
  headerActionPressed: {
    opacity: 0.6,
  },
  headerActionIcon: {
    color: theme.colors.primary,
  },
}))
