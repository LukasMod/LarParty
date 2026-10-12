import { parseGeneratedCardResponse } from '@/features/generation/gemini'
import { makeGenerated } from '@test/factories'

const valid = makeGenerated()

// Saving an off-schema card is unrecoverable: it renders as blank fields and no
// regeneration fixes the stored record. These assert the parse rejects it.
describe('parseGeneratedCardResponse', () => {
  it('returns the parsed card, trimming whitespace', () => {
    expect(parseGeneratedCardResponse(JSON.stringify(valid))).toEqual(valid)
    expect(parseGeneratedCardResponse(`  ${JSON.stringify(valid)}\n`)).toEqual(
      valid,
    )
  })

  it('trims each string field so stored text has no padding', () => {
    const parsed = parseGeneratedCardResponse(
      JSON.stringify({ ...valid, specialPhrase: '  Hello.  ' }),
    )

    expect(parsed.specialPhrase).toBe('Hello.')
  })

  // Distinct messages, because "empty" means the provider answered nothing and
  // "invalid JSON" means it answered off-contract.
  it('rejects an empty or whitespace-only response', () => {
    expect(() => parseGeneratedCardResponse(undefined)).toThrow(
      'Gemini returned an empty response.',
    )
    expect(() => parseGeneratedCardResponse('')).toThrow(
      'Gemini returned an empty response.',
    )
    expect(() => parseGeneratedCardResponse('   \n ')).toThrow(
      'Gemini returned an empty response.',
    )
  })

  it('rejects non-JSON and truncated JSON as invalid', () => {
    expect(() => parseGeneratedCardResponse('not json')).toThrow(
      'Gemini returned invalid JSON.',
    )
    expect(() =>
      parseGeneratedCardResponse('{"generatedNameWithClass":'),
    ).toThrow('Gemini returned invalid JSON.')
  })

  it('rejects a missing required field', () => {
    const { specialPhrase: _omit, ...rest } = valid

    expect(() => parseGeneratedCardResponse(JSON.stringify(rest))).toThrow()
  })

  // A whitespace-only field parses as JSON and would render as an empty block.
  it('rejects a required string that is only whitespace', () => {
    expect(() =>
      parseGeneratedCardResponse(
        JSON.stringify({ ...valid, backgroundHistory: '   ' }),
      ),
    ).toThrow()
  })

  // The schema fixes traits at exactly three, matching the card layout.
  it('rejects a trait count other than three', () => {
    expect(() =>
      parseGeneratedCardResponse(
        JSON.stringify({ ...valid, characterTraits: ['Loyal', 'Funny'] }),
      ),
    ).toThrow()
    expect(() =>
      parseGeneratedCardResponse(
        JSON.stringify({ ...valid, characterTraits: ['a', 'b', 'c', 'd'] }),
      ),
    ).toThrow()
  })

  it('rejects a JSON array instead of an object', () => {
    expect(() => parseGeneratedCardResponse('[]')).toThrow()
  })

  // The model is asked for specific keys and sometimes adds more. Stripping them
  // keeps the persisted shape equal to the domain type.
  it('drops extra fields the model was not asked for', () => {
    const parsed = parseGeneratedCardResponse(
      JSON.stringify({ ...valid, extra: 'ignored' }),
    )

    expect(parsed).not.toHaveProperty('extra')
  })
})
