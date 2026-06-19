import { ThemedText } from '@/components/themed-text'
import { useNewPartyForm } from '@/features/parties/hooks/use-new-party-form'
import { Button } from '@/shared/components/button'
import { ChipOptionGroup } from '@/shared/components/chip-option-group'
import { FormCard } from '@/shared/components/form-card'
import { FormField } from '@/shared/components/form-field'
import { FormTextInput } from '@/shared/components/form-text-input'
import { Screen } from '@/shared/components/screen'
import {
  partyMoodLabels,
  partyMoods,
  themeCategoryLabels,
  themeCategories,
} from '@/shared/constants/party-options'

export default function NewPartyScreen() {
  const {
    title,
    themeCategory,
    mood,
    showValidationError,
    handleTitleChange,
    setThemeCategory,
    setMood,
    handleCreateParty,
  } = useNewPartyForm()

  return (
    <Screen>
      <ThemedText type="subtitle">Create Party</ThemedText>

      <FormCard>
        <FormField
          label="Party name"
          helperText={showValidationError ? 'Party name is required.' : undefined}
        >
          <FormTextInput
            value={title}
            onChangeText={handleTitleChange}
            placeholder="Friday Tavern Night"
          />
        </FormField>

        <FormField label="Theme category">
          <ChipOptionGroup
            options={themeCategories}
            selectedOptions={[themeCategory]}
            getLabel={(option) => themeCategoryLabels[option]}
            onPress={setThemeCategory}
          />
        </FormField>

        <FormField label="Mood">
          <ChipOptionGroup
            options={partyMoods}
            selectedOptions={[mood]}
            getLabel={(option) => partyMoodLabels[option]}
            onPress={setMood}
          />
        </FormField>
      </FormCard>

      <Button label="Save party" onPress={handleCreateParty} />
    </Screen>
  )
}

