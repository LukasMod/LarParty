import {
  resolveSeedTraits,
  seedTraitValuesOf,
  shouldPrintTraitValues,
  traitListOf,
  traitSeedLinesOf,
} from '@/features/generation/utils/seed-traits'

describe('resolveSeedTraits', () => {
  it('defaults every trait to 0 when no values arrive', () => {
    expect(resolveSeedTraits({ selectedTraits: ['loyal', 'funny'] })).toEqual([
      { trait: 'loyal', traitValue: 0 },
      { trait: 'funny', traitValue: 0 },
    ])
  })

  it('passes through explicit seed traits', () => {
    const seeds = [{ trait: 'loyal' as const, traitValue: -3 }]

    expect(resolveSeedTraits({ selectedTraits: ['loyal'] }, seeds)).toBe(seeds)
  })
})

describe('seedTraitValuesOf', () => {
  it('keeps the seed order', () => {
    expect(
      seedTraitValuesOf([
        { trait: 'loyal', traitValue: 2 },
        { trait: 'funny', traitValue: -1 },
      ]),
    ).toEqual([2, -1])
  })
})

describe('shouldPrintTraitValues', () => {
  it('is false when the whole set sits at the default', () => {
    expect(
      shouldPrintTraitValues(resolveSeedTraits({ selectedTraits: ['loyal'] })),
    ).toBe(false)
  })

  it('is true once any value moves off the default', () => {
    expect(
      shouldPrintTraitValues([
        { trait: 'loyal', traitValue: 0 },
        { trait: 'funny', traitValue: 1 },
      ]),
    ).toBe(true)
  })
})

describe('traitListOf', () => {
  it('joins labels without mentioning values', () => {
    expect(
      traitListOf(
        [
          { trait: 'loyal', traitValue: 0 },
          { trait: 'funny', traitValue: -2 },
        ],
        ['Loyal', 'Funny'],
      ),
    ).toBe('Loyal, Funny')
  })

  it('renders an empty selection as an empty string', () => {
    expect(traitListOf([], [])).toBe('')
  })
})

describe('traitSeedLinesOf', () => {
  it('pairs each label with its signed value and wording', () => {
    const lines = traitSeedLinesOf(
      [
        { trait: 'vengeful', traitValue: -3 },
        { trait: 'funny', traitValue: 0 },
        { trait: 'arrogant', traitValue: 3 },
      ],
      ['Vengeful', 'Funny', 'Arrogant'],
    )

    expect(lines[0]).toContain('- Vengeful (value -3)')
    expect(lines[0]).toContain('exact opposite')
    expect(lines[1]).toContain('- Funny (value 0)')
    expect(lines[1]).toContain('plain and unexaggerated')
    expect(lines[2]).toContain('- Arrogant (value +3)')
    expect(lines[2]).toContain('too-much')
  })

  it('emits one line per seed trait', () => {
    expect(
      traitSeedLinesOf([{ trait: 'loyal', traitValue: 1 }], ['Loyal']),
    ).toHaveLength(1)
  })
})
