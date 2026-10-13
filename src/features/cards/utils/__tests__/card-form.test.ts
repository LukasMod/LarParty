import {
  MAX_CARD_TRAITS,
  MAX_TRAIT_LEVEL,
  MIN_TRAIT_LEVEL,
  normalizeTraitLevels,
  setTraitLevel,
  toggleCardTrait,
  validateCardForm,
} from '@/features/cards/utils/card-form'
import { cardTraits } from '@/shared/constants/party-options'
import { makeCardInput } from '@test/factories'

const [first, second, third, fourth] = cardTraits

describe('toggleCardTrait', () => {
  it('adds an unselected trait', () => {
    expect(toggleCardTrait([], first)).toEqual([first])
  })

  it('removes an already selected trait', () => {
    expect(toggleCardTrait([first, second], second)).toEqual([first])
  })

  it('keeps selection order when adding', () => {
    expect(toggleCardTrait([first], third)).toEqual([first, third])
  })

  it('refuses a trait past the cap', () => {
    const selected = [first, second, third]

    expect(toggleCardTrait(selected, fourth)).toEqual(selected)
  })

  it('still removes at the cap', () => {
    const selected = [first, second, third]

    expect(toggleCardTrait(selected, second)).toEqual([first, third])
  })

  it('honors a custom cap', () => {
    expect(toggleCardTrait([first, second], third, 2)).toEqual([first, second])
    expect(toggleCardTrait([first, second], third, 3)).toEqual([
      first,
      second,
      third,
    ])
  })

  it('does not mutate the input array', () => {
    const selected = [first]

    toggleCardTrait(selected, second)
    toggleCardTrait(selected, first)

    expect(selected).toEqual([first])
  })

  it('returns a copy rather than the same array reference when capped', () => {
    const selected = [first, second, third]

    expect(toggleCardTrait(selected, fourth)).not.toBe(selected)
  })

  it('caps at the shared maximum', () => {
    expect(MAX_CARD_TRAITS).toBe(3)
  })
})

describe('validateCardForm', () => {
  const validDraft = {
    name: 'Aldric',
    selectedTraits: makeCardInput().selectedTraits,
    traitLevels: {},
  }

  it('accepts a valid draft and returns the card input', () => {
    expect(validateCardForm(validDraft, 'male')).toEqual({
      ok: true,
      input: {
        name: 'Aldric',
        sex: 'male',
        selectedTraits: validDraft.selectedTraits,
        traitLevels: { loyal: 0, funny: 0, calm: 0 },
      },
    })
  })

  it('carries the chosen sex into the input', () => {
    const result = validateCardForm(validDraft, 'female')

    if (!result.ok) {
      throw new Error('expected the draft to validate')
    }

    expect(result.input.sex).toBe('female')
  })

  it('trims the name in the returned input', () => {
    const result = validateCardForm(
      { ...validDraft, name: '  Aldric  ' },
      'other',
    )

    if (!result.ok) {
      throw new Error('expected the draft to validate')
    }

    expect(result.input.name).toBe('Aldric')
  })

  it('rejects a blank name', () => {
    expect(validateCardForm({ ...validDraft, name: '' }, 'other')).toEqual({
      ok: false,
      errorKey: 'form.errors.nameRequired',
    })
  })

  it('rejects a whitespace-only name', () => {
    expect(validateCardForm({ ...validDraft, name: '   ' }, 'other')).toEqual({
      ok: false,
      errorKey: 'form.errors.nameRequired',
    })
  })

  it('rejects an empty trait list', () => {
    expect(
      validateCardForm({ ...validDraft, selectedTraits: [] }, 'other'),
    ).toEqual({
      ok: false,
      errorKey: 'form.errors.invalidTraits',
    })
  })

  it('accepts exactly the cap of traits', () => {
    const result = validateCardForm(
      { ...validDraft, selectedTraits: [first, second, third] },
      'other',
    )

    expect(result.ok).toBe(true)
  })

  it('reports name before traits', () => {
    const result = validateCardForm(
      { name: '', selectedTraits: [], traitLevels: {} },
      'other',
    )

    if (result.ok) {
      throw new Error('expected the draft to fail')
    }

    expect(result.errorKey).toBe('form.errors.nameRequired')
  })

  it('defaults a selected trait with no stored level to 0', () => {
    const result = validateCardForm(
      { ...validDraft, selectedTraits: [first], traitLevels: {} },
      'other',
    )

    if (!result.ok) {
      throw new Error('expected the draft to validate')
    }

    expect(result.input.traitLevels).toEqual({ [first]: 0 })
  })

  it('carries a tuned level through to the input', () => {
    const result = validateCardForm(
      {
        ...validDraft,
        selectedTraits: [first, second],
        traitLevels: { [first]: 2, [second]: -1 },
      },
      'other',
    )

    if (!result.ok) {
      throw new Error('expected the draft to validate')
    }

    expect(result.input.traitLevels).toEqual({ [first]: 2, [second]: -1 })
  })

  it('drops a level for a trait that is no longer selected', () => {
    const result = validateCardForm(
      {
        ...validDraft,
        selectedTraits: [first],
        traitLevels: { [first]: 1, [second]: 3 },
      },
      'other',
    )

    if (!result.ok) {
      throw new Error('expected the draft to validate')
    }

    expect(result.input.traitLevels).toEqual({ [first]: 1 })
  })
})

describe('normalizeTraitLevels', () => {
  it('adds a 0 entry for every selected trait missing a level', () => {
    expect(normalizeTraitLevels([first, second], {})).toEqual({
      [first]: 0,
      [second]: 0,
    })
  })

  it('drops entries for unselected traits', () => {
    expect(normalizeTraitLevels([first], { [first]: 1, [second]: 2 })).toEqual({
      [first]: 1,
    })
  })

  it('clamps a stored level into range', () => {
    expect(normalizeTraitLevels([first], { [first]: 99 })).toEqual({
      [first]: MAX_TRAIT_LEVEL,
    })
    expect(normalizeTraitLevels([first], { [first]: -99 })).toEqual({
      [first]: MIN_TRAIT_LEVEL,
    })
  })

  it('returns an empty record when nothing is selected', () => {
    expect(normalizeTraitLevels([], { [first]: 2 })).toEqual({})
  })

  it('honors custom bounds', () => {
    expect(normalizeTraitLevels([first], { [first]: 5 }, -1, 1)).toEqual({
      [first]: 1,
    })
  })
})

describe('setTraitLevel', () => {
  it('sets one trait level without touching the rest', () => {
    expect(setTraitLevel({ [first]: 1 }, second, -2)).toEqual({
      [first]: 1,
      [second]: -2,
    })
  })

  it('overwrites an existing level', () => {
    expect(setTraitLevel({ [first]: 1 }, first, 3)).toEqual({ [first]: 3 })
  })

  it('does not mutate the input record', () => {
    const before = { [first]: 1 }

    setTraitLevel(before, second, 2)

    expect(before).toEqual({ [first]: 1 })
  })
})
