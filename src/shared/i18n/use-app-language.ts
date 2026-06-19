import { useEffect } from 'react'

import { useLocales } from 'expo-localization'

import { usePreferencesStore } from '@/features/preferences/store/preferences-store'
import { i18n } from '@/shared/i18n/index'
import { resolveAppLanguage } from '@/shared/i18n/locale'

export function useAppLanguage() {
  const languagePreference = usePreferencesStore(
    (state) => state.languagePreference,
  )
  const locales = useLocales()

  const resolvedLanguage = resolveAppLanguage(
    languagePreference,
    locales[0]?.languageTag ?? locales[0]?.languageCode,
  )

  useEffect(() => {
    if (i18n.resolvedLanguage !== resolvedLanguage) {
      void i18n.changeLanguage(resolvedLanguage)
    }
  }, [resolvedLanguage])

  return {
    languagePreference,
    resolvedLanguage,
  }
}
