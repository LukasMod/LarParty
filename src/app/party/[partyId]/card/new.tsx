import { router, useLocalSearchParams } from 'expo-router'
import { useMemo, useState } from 'react'
import { TextInput, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useCardStore } from '@/features/cards/store/card-store'
import { Button } from '@/shared/components/button'
import { ChipButton } from '@/shared/components/chip-button'
import {
  CharacterCardInput,
  InputTrait,
  SexOption,
} from '@/features/cards/types'
import { generateCharacterCard } from '@/features/generation/gemini'
import { getPartyById } from '@/features/parties/selectors'
import { usePartyStore } from '@/features/parties/store/party-store'
import { Screen } from '@/shared/components/screen'
import {
  cardTraitLabels,
  cardTraits,
  sexOptionLabels,
  sexOptions,
  themeCategoryLabels,
} from '@/shared/constants/party-options'

const MAX_TRAITS = 3

export default function NewCharacterCardScreen() {
  const { partyId } = useLocalSearchParams<{ partyId: string }>()
  const parties = usePartyStore((state) => state.parties)
  const party = useMemo(
    () => getPartyById(parties, partyId),
    [parties, partyId],
  )
  const createDraftCard = useCardStore((state) => state.createDraftCard)

  const [name, setName] = useState('')
  const [sex, setSex] = useState<SexOption>('other')
  const [age, setAge] = useState('25')
  const [selectedTraits, setSelectedTraits] = useState<InputTrait[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  function toggleTrait(trait: InputTrait) {
    setSelectedTraits((currentTraits) => {
      if (currentTraits.includes(trait)) {
        return currentTraits.filter((currentTrait) => currentTrait !== trait)
      }

      if (currentTraits.length >= MAX_TRAITS) {
        return currentTraits
      }

      return [...currentTraits, trait]
    })
  }

  async function handleGenerateCard() {
    if (!party) {
      setErrorMessage('Party not found.')
      return
    }

    const trimmedName = name.trim()
    const parsedAge = Number.parseInt(age, 10)

    if (!trimmedName) {
      setErrorMessage('Character name is required.')
      return
    }

    if (!Number.isFinite(parsedAge) || parsedAge <= 0) {
      setErrorMessage('Enter a valid age.')
      return
    }

    if (selectedTraits.length === 0 || selectedTraits.length > MAX_TRAITS) {
      setErrorMessage('Choose between 1 and 3 traits.')
      return
    }

    const input: CharacterCardInput = {
      name: trimmedName,
      sex,
      age: parsedAge,
      selectedTraits,
    }

    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      const generated = await generateCharacterCard({
        party,
        input,
      })

      const cardId = createDraftCard({
        partyId: party.id,
        input,
        generated,
      })

      router.replace({
        pathname: '/party/[partyId]/card/[cardId]',
        params: { partyId: party.id, cardId },
      })
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to generate card right now.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Screen>
      {!party ? (
        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="subtitle">Party not found</ThemedText>
          <ThemedText themeColor="textSecondary">
            This party may have been deleted or is still loading.
          </ThemedText>
        </ThemedView>
      ) : (
        <>
          <View style={styles.header}>
            <ThemedText type="subtitle">Create Character Card</ThemedText>
            <ThemedText themeColor="textSecondary">
              {party.title} · {themeCategoryLabels[party.themeCategory]}
            </ThemedText>
          </View>

          <ThemedView type="backgroundElement" style={styles.card}>
            <View style={styles.fieldGroup}>
              <ThemedText type="smallBold">Character name</ThemedText>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Mira Nightbloom"
                placeholderTextColor={styles.placeholder.color}
                style={styles.input}
              />
            </View>

            <View style={styles.fieldGroup}>
              <ThemedText type="smallBold">Sex</ThemedText>
              <View style={styles.optionGrid}>
                {sexOptions.map((option) => {
                  const isSelected = option === sex

                  return (
                    <ChipButton
                      key={option}
                      label={sexOptionLabels[option]}
                      selected={isSelected}
                      onPress={() => setSex(option)}
                    />
                  )
                })}
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <ThemedText type="smallBold">Age</ThemedText>
              <TextInput
                value={age}
                onChangeText={setAge}
                placeholder="25"
                placeholderTextColor={styles.placeholder.color}
                keyboardType="number-pad"
                style={styles.input}
              />
            </View>

            <View style={styles.fieldGroup}>
              <ThemedText type="smallBold">Traits</ThemedText>
              <ThemedText themeColor="textSecondary">
                Pick up to {MAX_TRAITS} traits.
              </ThemedText>
              <View style={styles.optionGrid}>
                {cardTraits.map((trait) => {
                  const isSelected = selectedTraits.includes(trait)
                  const isDisabled =
                    !isSelected && selectedTraits.length >= MAX_TRAITS

                  return (
                    <ChipButton
                      key={trait}
                      disabled={isDisabled}
                      label={cardTraitLabels[trait]}
                      selected={isSelected}
                      onPress={() => toggleTrait(trait)}
                    />
                  )
                })}
              </View>
            </View>

            {errorMessage ? (
              <ThemedText themeColor="textSecondary">{errorMessage}</ThemedText>
            ) : null}
          </ThemedView>

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
  card: {
    borderRadius: theme.radius.card,
    padding: theme.spacing.four,
    gap: theme.spacing.four,
  },
  fieldGroup: {
    gap: theme.spacing.two,
  },
  placeholder: {
    color: theme.colors.textSecondary,
  },
  input: {
    backgroundColor: theme.colors.inputBackground,
    color: theme.colors.text,
    borderRadius: theme.radius.control,
    paddingHorizontal: theme.spacing.three,
    paddingVertical: theme.spacing.three,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.two,
  },
}))
