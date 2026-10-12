import {
  CharacterCardInput,
  InputTrait,
  SexOption,
  TraitLevels,
} from '@/features/cards/types'

export const MAX_CARD_TRAITS = 3

// The intensity slider's range. Exposed so the form, the slider defaults and the
// prompt's intensity rule all read the same bounds.
export const MIN_TRAIT_LEVEL = -3
export const MAX_TRAIT_LEVEL = 3

export const CARD_FORM_ERROR_KEYS = {
  partyNotFound: 'form.errors.partyNotFound',
  nameRequired: 'form.errors.nameRequired',
  invalidAge: 'form.errors.invalidAge',
  invalidTraits: 'form.errors.invalidTraits',
} as const satisfies Record<string, string>

export type CardFormErrorKey =
  (typeof CARD_FORM_ERROR_KEYS)[keyof typeof CARD_FORM_ERROR_KEYS]

export interface CardFormDraft {
  name: string
  age: string
  selectedTraits: InputTrait[]
  traitLevels: TraitLevels
}

export type CardFormValidation =
  | { ok: true; input: CharacterCardInput }
  | { ok: false; errorKey: CardFormErrorKey }

// Keeps `traitLevels` in lockstep with `selectedTraits`: every selected trait
// gets an entry (0 when untuned) and any entry for a deselected trait is gone.
// Also clamps a stored level back into range, so a hand-edited store value
// cannot smuggle an out-of-range number into a generation request.
export function normalizeTraitLevels(
  selectedTraits: readonly InputTrait[],
  traitLevels: TraitLevels,
  minValue = MIN_TRAIT_LEVEL,
  maxValue = MAX_TRAIT_LEVEL,
): TraitLevels {
  const normalized: TraitLevels = {}

  for (const trait of selectedTraits) {
    const stored = traitLevels[trait] ?? 0

    normalized[trait] = Math.min(maxValue, Math.max(minValue, stored))
  }

  return normalized
}

// Sets one trait's level, leaving the other entries untouched.
export function setTraitLevel(
  traitLevels: TraitLevels,
  trait: InputTrait,
  level: number,
): TraitLevels {
  return { ...traitLevels, [trait]: level }
}

// Adds an unselected trait, removes a selected one, and refuses a fourth pick.
export function toggleCardTrait(
  selectedTraits: readonly InputTrait[],
  trait: InputTrait,
  maxTraits: number = MAX_CARD_TRAITS,
): InputTrait[] {
  if (selectedTraits.includes(trait)) {
    return selectedTraits.filter((selectedTrait) => selectedTrait !== trait)
  }

  if (selectedTraits.length >= maxTraits) {
    return [...selectedTraits]
  }

  return [...selectedTraits, trait]
}

// Age arrives as free text. `Number.parseInt` yields NaN for anything without
// leading digits, so the finite check is what rejects "abc" and "". Zero and
// negatives are rejected separately. Leading digits of mixed text still read
// as a number ("25abc" is 25).
export function parseCardAge(age: string) {
  const parsedAge = Number.parseInt(age, 10)

  return Number.isFinite(parsedAge) && parsedAge > 0 ? parsedAge : null
}

// First failing rule wins, matching the order the fields appear in the form.
export function validateCardForm(
  draft: CardFormDraft,
  sex: SexOption,
): CardFormValidation {
  const name = draft.name.trim()

  if (!name) {
    return { ok: false, errorKey: CARD_FORM_ERROR_KEYS.nameRequired }
  }

  const age = parseCardAge(draft.age)

  if (age === null) {
    return { ok: false, errorKey: CARD_FORM_ERROR_KEYS.invalidAge }
  }

  if (
    draft.selectedTraits.length === 0 ||
    draft.selectedTraits.length > MAX_CARD_TRAITS
  ) {
    return { ok: false, errorKey: CARD_FORM_ERROR_KEYS.invalidTraits }
  }

  return {
    ok: true,
    input: {
      name,
      sex,
      age,
      selectedTraits: draft.selectedTraits,
      traitLevels: normalizeTraitLevels(draft.selectedTraits, draft.traitLevels),
    },
  }
}
