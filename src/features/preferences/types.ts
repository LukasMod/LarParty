import { CardDisplayMode } from '@/features/cards/types'
import { LanguagePreference } from '@/shared/i18n/locale'

export interface PreferencesState {
  cardDisplayMode: CardDisplayMode
  languagePreference: LanguagePreference
}
