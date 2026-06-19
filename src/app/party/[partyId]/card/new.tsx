import { useLocalSearchParams } from 'expo-router'
import { useMemo } from 'react'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { ThemedText } from '@/components/themed-text'
import { NewCharacterCardForm } from '@/features/cards/components/new-character-card-form'
import { useNewCharacterCardForm } from '@/features/cards/hooks/use-new-character-card-form'
import { Button } from '@/shared/components/button'
import { getPartyById } from '@/features/parties/selectors'
import { usePartyStore } from '@/features/parties/store/party-store'
import { Screen } from '@/shared/components/screen'
import { ScreenStateCard } from '@/shared/components/screen-state-card'
import { themeCategoryLabels } from '@/shared/constants/party-options'

export default function NewCharacterCardScreen() {
  const { partyId } = useLocalSearchParams<{ partyId: string }>()
  const parties = usePartyStore((state) => state.parties)
  const party = useMemo(
    () => getPartyById(parties, partyId),
    [parties, partyId],
  )
  const {
    name,
    sex,
    age,
    selectedTraits,
    errorMessage,
    isSubmitting,
    maxTraits,
    setName,
    setSex,
    setAge,
    toggleTrait,
    handleGenerateCard,
  } = useNewCharacterCardForm({ party })

  return (
    <Screen>
      {!party ? (
        <ScreenStateCard
          title="Party not found"
          body="This party may have been deleted or is still loading."
        />
      ) : (
        <>
          <View style={styles.header}>
            <ThemedText type="subtitle">Create Character Card</ThemedText>
            <ThemedText themeColor="textSecondary">
              {party.title} · {themeCategoryLabels[party.themeCategory]}
            </ThemedText>
          </View>

          <NewCharacterCardForm
            name={name}
            sex={sex}
            age={age}
            selectedTraits={selectedTraits}
            maxTraits={maxTraits}
            errorMessage={errorMessage}
            onNameChange={setName}
            onSexChange={setSex}
            onAgeChange={setAge}
            onToggleTrait={toggleTrait}
          />

          <Button
            disabled={isSubmitting}
            label={
              isSubmitting ? 'Generating...' : 'Generate character card'
            }
            onPress={handleGenerateCard}
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
