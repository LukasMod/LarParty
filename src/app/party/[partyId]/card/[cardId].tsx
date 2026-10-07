import { router, Stack, useLocalSearchParams } from 'expo-router'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { useTranslation } from 'react-i18next'

import { ThemedText } from '@/components/themed-text'
import { CardDetailsActions } from '@/features/cards/components/card-details-actions'
import { CharacterCardView } from '@/features/cards/components/character-card-view'
import { useCardDetailsActions } from '@/features/cards/hooks/use-card-details-actions'
import { useCardDetailsScreenModel } from '@/features/cards/hooks/use-card-details-screen-model'
import { IconButton } from '@/shared/components/icon-button'
import { Screen } from '@/shared/components/screen'
import { ScreenHeader } from '@/shared/components/screen-header'
import { ScreenStateCard } from '@/shared/components/screen-state-card'

export default function CardDetailsScreen() {
  const { t } = useTranslation('common')
  const { partyId, cardId } = useLocalSearchParams<{
    partyId: string
    cardId: string
  }>()
  const { status, party, card } = useCardDetailsScreenModel(partyId, cardId)
  const {
    errorMessage,
    isRegenerating,
    handleAcceptCard,
    handleDeleteCard,
    handleRegenerateCard,
  } = useCardDetailsActions({ party, card })

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScreenHeader
        leading={
          <IconButton
            symbol="chevron.left"
            label={t('actions.back')}
            onPress={() => router.back()}
          />
        }
      />

      <Screen contentStyle={styles.content}>
        {status === 'loading' ? (
          <ScreenStateCard
            title={t('state.loadingCardTitle')}
            body={t('state.restoringCardData')}
          />
        ) : status === 'missing' ? (
          <ScreenStateCard
            title={t('state.cardNotFoundTitle')}
            body={t('state.cardNotFoundBody')}
          />
        ) : (
          <>
            <View style={styles.titleBlock}>
              <ThemedText type="displaySmall">
                {card.generated.generatedNameWithClass}
              </ThemedText>
              <ThemedText themeColor="textSecondary" type="small">
                {card.status === 'accepted'
                  ? t('status.acceptedCard')
                  : t('status.draftCard')}{' '}
                · {party.title}
              </ThemedText>
            </View>
            <CharacterCardView
              displayMode="collectible"
              partyThemeCategory={party.themeCategory}
              backgroundHistory={card.generated.backgroundHistory}
              characterTraits={card.generated.characterTraits}
              specialMovement={card.generated.specialMovement}
              specialPhrase={card.generated.specialPhrase}
            />

            <CardDetailsActions
              status={card.status}
              errorMessage={errorMessage}
              isRegenerating={isRegenerating}
              onAcceptCard={handleAcceptCard}
              onRegenerateCard={handleRegenerateCard}
              onDeleteCard={handleDeleteCard}
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
    paddingTop: theme.spacing.two,
  },
  titleBlock: {
    gap: theme.spacing.one,
  },
}))
