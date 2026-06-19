import { router } from 'expo-router'
import { useState } from 'react'
import { TextInput, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { usePartyStore } from '@/features/parties/store/party-store'
import { Button } from '@/shared/components/button'
import { ChipButton } from '@/shared/components/chip-button'
import { PartyMood, ThemeCategory } from '@/features/parties/types'
import { Screen } from '@/shared/components/screen'
import {
  partyMoodLabels,
  partyMoods,
  themeCategoryLabels,
  themeCategories,
} from '@/shared/constants/party-options'

export default function NewPartyScreen() {
  const createParty = usePartyStore((state) => state.createParty)
  const [title, setTitle] = useState('')
  const [themeCategory, setThemeCategory] = useState<ThemeCategory>('fantasy')
  const [mood, setMood] = useState<PartyMood>('fun')
  const [showValidationError, setShowValidationError] = useState(false)

  function handleCreateParty() {
    const trimmedTitle = title.trim()

    if (!trimmedTitle) {
      setShowValidationError(true)
      return
    }

    const partyId = createParty({
      title: trimmedTitle,
      themeCategory,
      mood,
    })

    router.replace({
      pathname: '/party/[partyId]',
      params: { partyId },
    })
  }

  return (
    <Screen>
      <ThemedText type="subtitle">Create Party</ThemedText>

      <ThemedView type="backgroundElement" style={styles.card}>
        <View style={styles.fieldGroup}>
          <ThemedText type="smallBold">Party name</ThemedText>
          <TextInput
            value={title}
            onChangeText={(value) => {
              setTitle(value)
              if (showValidationError && value.trim()) {
                setShowValidationError(false)
              }
            }}
            placeholder="Friday Tavern Night"
            placeholderTextColor={styles.placeholder.color}
            style={styles.input}
          />
          {showValidationError ? (
            <ThemedText themeColor="textSecondary">
              Party name is required.
            </ThemedText>
          ) : null}
        </View>

        <View style={styles.fieldGroup}>
          <ThemedText type="smallBold">Theme category</ThemedText>
          <View style={styles.optionGrid}>
            {themeCategories.map((option) => {
              const isSelected = option === themeCategory

              return (
                <ChipButton
                  key={option}
                  label={themeCategoryLabels[option]}
                  selected={isSelected}
                  onPress={() => setThemeCategory(option)}
                />
              )
            })}
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <ThemedText type="smallBold">Mood</ThemedText>
          <View style={styles.optionGrid}>
            {partyMoods.map((option) => {
              const isSelected = option === mood

              return (
                <ChipButton
                  key={option}
                  label={partyMoodLabels[option]}
                  selected={isSelected}
                  onPress={() => setMood(option)}
                />
              )
            })}
          </View>
        </View>
      </ThemedView>

      <Button label="Save party" onPress={handleCreateParty} />
    </Screen>
  )
}

const styles = StyleSheet.create((theme) => ({
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
