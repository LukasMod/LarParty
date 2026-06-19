import { ThemedText } from '@/components/themed-text'
import {
  InputTrait,
  SexOption,
} from '@/features/cards/types'
import { FormCard } from '@/shared/components/form-card'
import { FormField } from '@/shared/components/form-field'
import { FormTextInput } from '@/shared/components/form-text-input'
import { ChipOptionGroup } from '@/shared/components/chip-option-group'
import {
  cardTraitLabels,
  cardTraits,
  sexOptionLabels,
  sexOptions,
} from '@/shared/constants/party-options'

interface NewCharacterCardFormProps {
  name: string
  sex: SexOption
  age: string
  selectedTraits: InputTrait[]
  maxTraits: number
  errorMessage: string | null
  onNameChange: (value: string) => void
  onSexChange: (value: SexOption) => void
  onAgeChange: (value: string) => void
  onToggleTrait: (trait: InputTrait) => void
}

export function NewCharacterCardForm({
  name,
  sex,
  age,
  selectedTraits,
  maxTraits,
  errorMessage,
  onNameChange,
  onSexChange,
  onAgeChange,
  onToggleTrait,
}: NewCharacterCardFormProps) {
  return (
    <FormCard>
      <FormField label="Character name">
        <FormTextInput
          value={name}
          onChangeText={onNameChange}
          placeholder="Mira Nightbloom"
        />
      </FormField>

      <FormField label="Sex">
        <ChipOptionGroup
          options={sexOptions}
          selectedOptions={[sex]}
          getLabel={(option) => sexOptionLabels[option]}
          onPress={onSexChange}
        />
      </FormField>

      <FormField label="Age">
        <FormTextInput
          value={age}
          onChangeText={onAgeChange}
          placeholder="25"
          keyboardType="number-pad"
        />
      </FormField>

      <FormField label="Traits" helperText={`Pick up to ${maxTraits} traits.`}>
        <ChipOptionGroup
          options={cardTraits}
          selectedOptions={selectedTraits}
          getLabel={(trait) => cardTraitLabels[trait]}
          isOptionDisabled={(trait) =>
            !selectedTraits.includes(trait) && selectedTraits.length >= maxTraits
          }
          onPress={onToggleTrait}
        />
      </FormField>

      {errorMessage ? (
        <ThemedText themeColor="textSecondary">{errorMessage}</ThemedText>
      ) : null}
    </FormCard>
  )
}
