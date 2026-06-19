import { getLocales } from 'expo-localization'

export const supportedLanguageCodes = ['en', 'pl'] as const

export type SupportedLanguageCode = (typeof supportedLanguageCodes)[number]
export type LanguagePreference = SupportedLanguageCode | 'system'

export function isSupportedLanguageCode(
  value: string | null | undefined,
): value is SupportedLanguageCode {
  return supportedLanguageCodes.includes(value as SupportedLanguageCode)
}

export function resolveLanguageFromTag(
  languageTag: string | null | undefined,
): SupportedLanguageCode {
  if (!languageTag) {
    return 'en'
  }

  const [languageCode] = languageTag.toLowerCase().split('-')

  return isSupportedLanguageCode(languageCode) ? languageCode : 'en'
}

export function resolveDeviceLanguage(): SupportedLanguageCode {
  const locale = getLocales()[0]

  return resolveLanguageFromTag(locale?.languageTag ?? locale?.languageCode)
}

export function resolveAppLanguage(
  languagePreference: LanguagePreference,
  languageTag?: string | null,
): SupportedLanguageCode {
  if (languagePreference !== 'system') {
    return languagePreference
  }

  return resolveLanguageFromTag(languageTag)
}
