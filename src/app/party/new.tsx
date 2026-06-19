import { useTranslation } from 'react-i18next'

import { ThemedText } from '@/components/themed-text'
import { useNewPartyForm } from '@/features/parties/hooks/use-new-party-form'
import { Button } from '@/shared/components/button'
import { ChipOptionGroup } from '@/shared/components/chip-option-group'
import { FormCard } from '@/shared/components/form-card'
import { FormField } from '@/shared/components/form-field'
import { FormTextInput } from '@/shared/components/form-text-input'
import { Screen } from '@/shared/components/screen'
import { partyMoods, themeCategories } from '@/shared/constants/party-options'
import {
  getPartyMoodLabel,
  getThemeCategoryLabel,
} from '@/shared/i18n/labels'

export default function NewPartyScreen() {
  const { t } = useTranslation(['common', 'parties'])
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
      <ThemedText type="subtitle">{t('parties:form.title')}</ThemedText>

      <FormCard>
        <FormField
          label={t('parties:form.nameLabel')}
          helperText={showValidationError ? t('parties:form.nameRequired') : undefined}
        >
          <FormTextInput
            value={title}
            onChangeText={handleTitleChange}
            placeholder={t('parties:form.namePlaceholder')}
          />
        </FormField>

        <FormField label={t('parties:form.themeCategoryLabel')}>
          <ChipOptionGroup
            options={themeCategories}
            selectedOptions={[themeCategory]}
            getLabel={(option) => getThemeCategoryLabel(t, option)}
            onPress={setThemeCategory}
          />
        </FormField>

        <FormField label={t('parties:form.moodLabel')}>
          <ChipOptionGroup
            options={partyMoods}
            selectedOptions={[mood]}
            getLabel={(option) => getPartyMoodLabel(t, option)}
            onPress={setMood}
          />
        </FormField>
      </FormCard>

      <Button label={t('actions.save')} onPress={handleCreateParty} />
    </Screen>
  )
}

