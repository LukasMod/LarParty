import { useTranslation } from 'react-i18next'

import { ThemedText } from '@/components/themed-text'
import { usePreferencesStore } from '@/features/preferences/store/preferences-store'
import {
  supportedLanguageCodes,
  type LanguagePreference,
} from '@/shared/i18n/locale'
import { useAppLanguage } from '@/shared/i18n/use-app-language'
import { ChipOptionGroup } from '@/shared/components/chip-option-group'
import { FormCard } from '@/shared/components/form-card'
import { Screen } from '@/shared/components/screen'

const languageOptions: readonly LanguagePreference[] = [
  'system',
  ...supportedLanguageCodes,
]

export default function SettingsScreen() {
  const { t } = useTranslation(['common', 'settings'])
  const { languagePreference, resolvedLanguage } = useAppLanguage()
  const setLanguagePreference = usePreferencesStore(
    (state) => state.setLanguagePreference,
  )

  const resolvedLanguageLabel = t(`common:languages.${resolvedLanguage}`)


  console.log('TEST ', resolvedLanguageLabel)

  return (
    <Screen>
      <FormCard>
        <ThemedText type="subtitle">
          {t('settings:language.sectionTitle')}
        </ThemedText>

        <ChipOptionGroup
          options={languageOptions}
          selectedOptions={[languagePreference]}
          getLabel={(option) =>
            option === 'system'
              ? t('settings:language.system')
              : t(`common:languages.${option}`)
          }
          onPress={(option) => {
            setLanguagePreference(option)
          }}
        />

        <ThemedText themeColor="textSecondary">
          {languagePreference === 'system'
            ? t('settings:language.followingSystem', {
                language: resolvedLanguageLabel,
              })
            : t('settings:language.current', {
                language: resolvedLanguageLabel,
              })}
        </ThemedText>
      </FormCard>
    </Screen>
  )
}

