import { useTranslation } from 'react-i18next'

import { ThemedText } from '@/components/themed-text'
import {
  InputTrait,
  SexOption,
} from '@/features/cards/types'
import { FormCard } from '@/shared/components/form-card'
import { FormField } from '@/shared/components/form-field'
import { FormTextInput } from '@/shared/components/form-text-input'
import { ChipOptionGroup } from '@/shared/components/chip-option-group'
import { cardTraits, sexOptions } from '@/shared/constants/party-options'
import { getCardTraitLabel, getSexOptionLabel } from '@/shared/i18n/labels'

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
  const { t } = useTranslation(['cards'])

  return (
    <FormCard>
      <FormField label={t('cards:form.nameLabel')}>
        <FormTextInput
          value={name}
          onChangeText={onNameChange}
          placeholder={t('cards:form.namePlaceholder')}
        />
      </FormField>

      <FormField label={t('cards:form.sexLabel')}>
        <ChipOptionGroup
          options={sexOptions}
          selectedOptions={[sex]}
          getLabel={(option) => getSexOptionLabel(t, option)}
          onPress={onSexChange}
        />
      </FormField>

      <FormField label={t('cards:form.ageLabel')}>
        <FormTextInput
          value={age}
          onChangeText={onAgeChange}
          placeholder={t('cards:form.agePlaceholder')}
          keyboardType="number-pad"
        />
      </FormField>

      <FormField
        label={t('cards:form.traitsLabel')}
        helperText={t('cards:form.traitsHelper', { maxTraits })}
      >
        <ChipOptionGroup
          options={cardTraits}
          selectedOptions={selectedTraits}
          getLabel={(trait) => getCardTraitLabel(t, trait)}
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
