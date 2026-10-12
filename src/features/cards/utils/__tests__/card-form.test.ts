import {
  MAX_CARD_TRAITS,
  parseCardAge,
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

describe('parseCardAge', () => {
  it('parses a plain number', () => {
    expect(parseCardAge('25')).toBe(25)
  })

  it('parses the youngest allowed age', () => {
    expect(parseCardAge('1')).toBe(1)
  })

  it('accepts surrounding whitespace', () => {
    expect(parseCardAge(' 30 ')).toBe(30)
  })

  it('ignores a trailing decimal', () => {
    expect(parseCardAge('25.9')).toBe(25)
  })

  it('rejects zero', () => {
    expect(parseCardAge('0')).toBeNull()
  })

  it('rejects a negative age', () => {
    expect(parseCardAge('-5')).toBeNull()
  })

  it('rejects an empty string', () => {
    expect(parseCardAge('')).toBeNull()
  })

  it('rejects non-numeric text', () => {
    expect(parseCardAge('abc')).toBeNull()
  })

  it('reads leading digits of mixed text as an age', () => {
    expect(parseCardAge('25abc')).toBe(25)
  })

  it('rejects text with no leading digits', () => {
    expect(parseCardAge('abc25')).toBeNull()
  })
})

describe('validateCardForm', () => {
  const validDraft = {
    name: 'Aldric',
    age: '25',
    selectedTraits: makeCardInput().selectedTraits,
  }

  it('accepts a valid draft and returns the card input', () => {
    expect(validateCardForm(validDraft, 'male')).toEqual({
      ok: true,
      input: {
        name: 'Aldric',
        sex: 'male',
        age: 25,
        selectedTraits: validDraft.selectedTraits,
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

  it('returns the parsed age, not the raw text', () => {
    const result = validateCardForm({ ...validDraft, age: ' 34 ' }, 'other')

    if (!result.ok) {
      throw new Error('expected the draft to validate')
    }

    expect(result.input.age).toBe(34)
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

  it('rejects an invalid age', () => {
    expect(validateCardForm({ ...validDraft, age: 'x' }, 'other')).toEqual({
      ok: false,
      errorKey: 'form.errors.invalidAge',
    })
  })

  it('rejects a zero age', () => {
    expect(validateCardForm({ ...validDraft, age: '0' }, 'other')).toEqual({
      ok: false,
      errorKey: 'form.errors.invalidAge',
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

  it('reports name before age and traits', () => {
    const result = validateCardForm(
      { name: '', age: 'x', selectedTraits: [] },
      'other',
    )

    if (result.ok) {
      throw new Error('expected the draft to fail')
    }

    expect(result.errorKey).toBe('form.errors.nameRequired')
  })

  it('reports age before traits', () => {
    const result = validateCardForm(
      { ...validDraft, age: 'x', selectedTraits: [] },
      'other',
    )

    if (result.ok) {
      throw new Error('expected the draft to fail')
    }

    expect(result.errorKey).toBe('form.errors.invalidAge')
  })
})
