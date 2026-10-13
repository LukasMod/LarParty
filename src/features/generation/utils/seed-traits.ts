import { CharacterCardInput } from '@/features/cards/types'
import { PromptSeedTrait } from '@/features/generation/types'
import {
  clampTraitValue,
  DEFAULT_TRAIT_VALUE,
  describeTraitValue,
  formatTraitValue,
  hasNonDefaultTraitValue,
} from '@/features/generation/utils/trait-value'

export function resolveSeedTraits(
  input: Pick<CharacterCardInput, 'selectedTraits' | 'traitLevels'>,
  seedTraits?: PromptSeedTrait[],
): PromptSeedTrait[] {
  if (seedTraits) {
    return seedTraits
  }

  // The form's sliders write `input.traitLevels`, and a saved card carries the
  // same field, so this one fallback covers both the first generation and every
  // regeneration. A trait the user never tuned, or a card saved before the
  // control existed, stays at the default.
  return input.selectedTraits.map((trait) => ({
    trait,
    traitValue: clampTraitValue(
      input.traitLevels?.[trait] ?? DEFAULT_TRAIT_VALUE,
    ),
  }))
}

export function seedTraitValuesOf(seedTraits: readonly PromptSeedTrait[]) {
  return seedTraits.map((seedTrait) => seedTrait.traitValue)
}

export function shouldPrintTraitValues(seedTraits: readonly PromptSeedTrait[]) {
  return hasNonDefaultTraitValue(seedTraitValuesOf(seedTraits))
}

export function traitListOf(
  seedTraits: readonly PromptSeedTrait[],
  labels: readonly string[],
) {
  return seedTraits
    .map((seedTrait, index) => labels[index] ?? seedTrait.trait)
    .join(', ')
}

export function traitSeedLinesOf(
  seedTraits: readonly PromptSeedTrait[],
  labels: readonly string[],
) {
  return seedTraits.map((seedTrait, index) => {
    const label = labels[index] ?? seedTrait.trait

    return [
      `  - ${label}`,
      `(value ${formatTraitValue(seedTrait.traitValue)}):`,
      describeTraitValue(seedTrait.traitValue),
    ].join(' ')
  })
}
