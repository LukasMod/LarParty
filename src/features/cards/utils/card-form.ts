import {
  CharacterCardInput,
  InputTrait,
  SexOption,
} from '@/features/cards/types'

export const MAX_CARD_TRAITS = 3

export const CARD_FORM_ERROR_KEYS = {
  partyNotFound: 'form.errors.partyNotFound',
  nameRequired: 'form.errors.nameRequired',
  invalidTraits: 'form.errors.invalidTraits',
} as const satisfies Record<string, string>

export type CardFormErrorKey =
  (typeof CARD_FORM_ERROR_KEYS)[keyof typeof CARD_FORM_ERROR_KEYS]

export interface CardFormDraft {
  name: string
  selectedTraits: InputTrait[]
}

export type CardFormValidation =
  | { ok: true; input: CharacterCardInput }
  | { ok: false; errorKey: CardFormErrorKey }

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

// First failing rule wins, matching the order the fields appear in the form.
export function validateCardForm(
  draft: CardFormDraft,
  sex: SexOption,
): CardFormValidation {
  const name = draft.name.trim()

  if (!name) {
    return { ok: false, errorKey: CARD_FORM_ERROR_KEYS.nameRequired }
  }

  if (
    draft.selectedTraits.length === 0 ||
    draft.selectedTraits.length > MAX_CARD_TRAITS
  ) {
    return { ok: false, errorKey: CARD_FORM_ERROR_KEYS.invalidTraits }
  }

  return {
    ok: true,
    input: { name, sex, selectedTraits: draft.selectedTraits },
  }
}
