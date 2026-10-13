import { parseGeneratedCardResponse } from '@/features/generation/gemini'
import { makeGenerated } from '@test/factories'

const valid = makeGenerated()

describe('parseGeneratedCardResponse', () => {
  it('returns the parsed card', () => {
    expect(parseGeneratedCardResponse(JSON.stringify(valid))).toEqual(valid)
  })

  it('trims surrounding whitespace before parsing', () => {
    expect(parseGeneratedCardResponse(`  ${JSON.stringify(valid)}\n`)).toEqual(
      valid,
    )
  })

  it('trims each string field', () => {
    const parsed = parseGeneratedCardResponse(
      JSON.stringify({ ...valid, specialPhrase: '  Hello.  ' }),
    )

    expect(parsed.specialPhrase).toBe('Hello.')
  })

  it('rejects an undefined response', () => {
    expect(() => parseGeneratedCardResponse(undefined)).toThrow(
      'Gemini returned an empty response.',
    )
  })

  it('rejects an empty string', () => {
    expect(() => parseGeneratedCardResponse('')).toThrow(
      'Gemini returned an empty response.',
    )
  })

  it('rejects a whitespace-only response', () => {
    expect(() => parseGeneratedCardResponse('   \n ')).toThrow(
      'Gemini returned an empty response.',
    )
  })

  it('rejects non-JSON text with a distinct message', () => {
    expect(() => parseGeneratedCardResponse('not json')).toThrow(
      'Gemini returned invalid JSON.',
    )
  })

  it('rejects truncated JSON as invalid rather than crashing', () => {
    expect(() =>
      parseGeneratedCardResponse('{"generatedNameWithClass":'),
    ).toThrow('Gemini returned invalid JSON.')
  })

  it('rejects a missing required field', () => {
    const { specialPhrase: _omit, ...rest } = valid

    expect(() => parseGeneratedCardResponse(JSON.stringify(rest))).toThrow()
  })

  it('rejects an empty required string', () => {
    expect(() =>
      parseGeneratedCardResponse(
        JSON.stringify({ ...valid, backgroundHistory: '   ' }),
      ),
    ).toThrow()
  })

  it('rejects fewer than three traits', () => {
    expect(() =>
      parseGeneratedCardResponse(
        JSON.stringify({ ...valid, characterTraits: ['Loyal', 'Funny'] }),
      ),
    ).toThrow()
  })

  it('rejects more than three traits', () => {
    expect(() =>
      parseGeneratedCardResponse(
        JSON.stringify({
          ...valid,
          characterTraits: ['a', 'b', 'c', 'd'],
        }),
      ),
    ).toThrow()
  })

  it('rejects a JSON array instead of an object', () => {
    expect(() => parseGeneratedCardResponse('[]')).toThrow()
  })

  it('accepts extra fields the model was not asked for', () => {
    const parsed = parseGeneratedCardResponse(
      JSON.stringify({ ...valid, extra: 'ignored' }),
    )

    expect(parsed).not.toHaveProperty('extra')
  })

  describe('with world', () => {
    it('requires partyHistory alongside the card fields', () => {
      expect(() =>
        parseGeneratedCardResponse(JSON.stringify(valid), true),
      ).toThrow()
    })

    it('accepts a card with partyHistory and keeps the field', () => {
      const withWorld = {
        ...valid,
        partyHistory: 'The gate opens once a season.',
      }

      expect(
        parseGeneratedCardResponse(JSON.stringify(withWorld), true),
      ).toEqual(withWorld)
    })

    it('rejects a blank partyHistory', () => {
      expect(() =>
        parseGeneratedCardResponse(
          JSON.stringify({ ...valid, partyHistory: '   ' }),
          true,
        ),
      ).toThrow()
    })
  })
})
