import {
  getGenerationLanguageName,
  getGenerationPromptLabels,
  getGenerationTranslator,
} from '@/shared/i18n/generation'
import { SupportedLanguageCode } from '@/shared/i18n/locale'
import { makeCardInput, makeParty } from '@test/factories'

// The resource translator is asserted with raw keys, including ones the typed
// `TFunction` rejects by design.
function rawT(language: SupportedLanguageCode) {
  return getGenerationTranslator(language) as unknown as (key: string) => string
}

describe('getGenerationLanguageName', () => {
  it('names English for prompts', () => {
    expect(getGenerationLanguageName('en')).toBe('English')
  })

  it('names Polish for prompts', () => {
    expect(getGenerationLanguageName('pl')).toBe('Polish')
  })
})

describe('getGenerationTranslator', () => {
  it('resolves a namespaced key', () => {
    expect(rawT('en')('common:options.sex.female')).toBe('Female')
  })

  it('resolves a key without the namespace prefix', () => {
    expect(rawT('en')('options.sex.female')).toBe('Female')
  })

  it('reads from the requested language', () => {
    expect(rawT('pl')('common:options.sex.female')).toBe('Kobieta')
  })

  it('returns the key when the path does not exist', () => {
    expect(rawT('en')('common:options.nope.nope')).toBe(
      'common:options.nope.nope',
    )
  })

  it('returns the key when walking past a string leaf', () => {
    expect(rawT('en')('common:actions.cancel.deeper')).toBe(
      'common:actions.cancel.deeper',
    )
  })

  it('returns the key when the path lands on an object', () => {
    expect(rawT('en')('common:options.sex')).toBe('common:options.sex')
  })

  it('is deep enough for nested namespaces', () => {
    expect(rawT('en')('common:actions.cancel')).toBe('Cancel')
  })
})

describe('getGenerationPromptLabels', () => {
  it('labels every enum the prompt needs', () => {
    const party = makeParty({ themeCategory: 'sci-fi', mood: 'intrigue' })
    const input = makeCardInput({ sex: 'male', selectedTraits: ['loyal'] })

    expect(
      getGenerationPromptLabels(getGenerationTranslator('en'), party, input),
    ).toEqual({
      themeCategory: 'Sci-Fi',
      mood: 'Intrigue',
      sex: 'Male',
      selectedTraits: ['Loyal'],
    })
  })

  it('returns an empty trait list untouched', () => {
    const labels = getGenerationPromptLabels(
      getGenerationTranslator('en'),
      makeParty(),
      makeCardInput({ selectedTraits: [] }),
    )

    expect(labels.selectedTraits).toEqual([])
  })

  it('localizes traits in bulk', () => {
    const labels = getGenerationPromptLabels(
      getGenerationTranslator('pl'),
      makeParty({ themeCategory: 'horror', mood: 'wild' }),
      makeCardInput({ selectedTraits: ['vengeful', 'calm'] }),
    )

    expect(labels).toEqual({
      themeCategory: 'Horror',
      mood: 'Szalony',
      sex: 'Inna',
      selectedTraits: ['Mściwy', 'Spokojny'],
    })
  })
})
