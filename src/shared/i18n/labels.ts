import { TFunction } from 'i18next'

import {
  cardDisplayModes,
  cardTraits,
  partyMoods,
  sexOptions,
  themeCategories,
} from '@/shared/constants/party-options'

export function getThemeCategoryLabel(
  t: TFunction,
  value: (typeof themeCategories)[number],
) {
  return t(`options.themeCategory.${value}`)
}

export function getPartyMoodLabel(
  t: TFunction,
  value: (typeof partyMoods)[number],
) {
  return t(`options.partyMood.${value}`)
}

export function getCardTraitLabel(
  t: TFunction,
  value: (typeof cardTraits)[number],
) {
  return t(`options.cardTrait.${value}`)
}

export function getSexOptionLabel(
  t: TFunction,
  value: (typeof sexOptions)[number],
) {
  return t(`options.sex.${value}`)
}

export function getCardDisplayModeLabel(
  t: TFunction,
  value: (typeof cardDisplayModes)[number],
) {
  return t(`options.cardDisplayMode.${value}`)
}
