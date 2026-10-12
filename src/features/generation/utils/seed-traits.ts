import { CharacterCardInput } from '@/features/cards/types'
import { PromptSeedTrait } from '@/features/generation/types'
import {
  DEFAULT_TRAIT_VALUE,
  describeTraitValue,
  formatTraitValue,
  hasNonDefaultTraitValue,
} from '@/features/generation/utils/trait-value'

export function resolveSeedTraits(
  input: Pick<CharacterCardInput, 'selectedTraits'>,
  seedTraits?: PromptSeedTrait[],
): PromptSeedTrait[] {
  if (seedTraits) {
    return seedTraits
  }

  return input.selectedTraits.map((trait) => ({
    trait,
    traitValue: DEFAULT_TRAIT_VALUE,
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
