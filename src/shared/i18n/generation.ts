import { TFunction } from 'i18next'

import { CharacterCardInput } from '@/features/cards/types'
import { Party } from '@/features/parties/types'
import {
  getCardTraitLabel,
  getPartyMoodLabel,
  getSexOptionLabel,
  getThemeCategoryLabel,
} from '@/shared/i18n/labels'
import { SupportedLanguageCode } from '@/shared/i18n/locale'
import { levelLabel } from '@/shared/utils/level'
import { resources } from '@/shared/i18n/resources'

const languageNames: Record<SupportedLanguageCode, string> = {
  en: 'English',
  pl: 'Polish',
}

type TranslationResource = typeof resources.en.common | typeof resources.pl.common

export function getGenerationLanguageName(outputLanguage: SupportedLanguageCode) {
  return languageNames[outputLanguage]
}

export function getGenerationTranslator(outputLanguage: SupportedLanguageCode) {
  return createResourceTranslator(resources[outputLanguage].common)
}

export function getGenerationPromptLabels(
  t: TFunction,
  party: Party,
  input: CharacterCardInput,
) {
  return {
    themeCategory: getThemeCategoryLabel(t, party.themeCategory),
    mood: getPartyMoodLabel(t, party.mood),
    sex: getSexOptionLabel(t, input.sex),
    // A 0 level is left off the label: an unannotated trait already reads as
    // plain flavour, so only the tuned ones carry a number the model must honour.
    selectedTraits: input.selectedTraits.map((trait) => {
      const label = getCardTraitLabel(t, trait)
      const level = input.traitLevels?.[trait] ?? 0

      return level === 0 ? label : `${label} (${levelLabel(level)})`
    }),
  }
}

function createResourceTranslator(resource: TranslationResource) {
  return ((key: string) => {
    const normalizedKey = key.replace(/^common:/, '')
    const parts = normalizedKey.split('.')
    let value: unknown = resource

    for (const part of parts) {
      if (typeof value !== 'object' || value === null) {
        return key
      }

      value = (value as Record<string, unknown>)[part]
    }

    return typeof value === 'string' ? value : key
  }) as TFunction
}
