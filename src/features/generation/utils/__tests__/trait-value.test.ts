import {
  DEFAULT_TRAIT_VALUE,
  TRAIT_VALUE_MAX,
  TRAIT_VALUE_MIN,
  clampTraitValue,
  describeTraitValue,
  formatTraitValue,
  getLoudestTraitIndex,
  hasNonDefaultTraitValue,
  traitValueScaleLines,
} from '@/features/generation/utils/trait-value'

describe('clampTraitValue', () => {
  it('keeps every in-range integer untouched', () => {
    for (let value = TRAIT_VALUE_MIN; value <= TRAIT_VALUE_MAX; value += 1) {
      expect(clampTraitValue(value)).toBe(value)
    }
  })

  it('clamps out-of-range values to the bounds', () => {
    expect(clampTraitValue(-9)).toBe(TRAIT_VALUE_MIN)
    expect(clampTraitValue(9)).toBe(TRAIT_VALUE_MAX)
  })

  it('rounds fractional values', () => {
    expect(clampTraitValue(1.6)).toBe(2)
    expect(clampTraitValue(-1.6)).toBe(-2)
  })

  it('falls back to the default for non-finite values', () => {
    expect(clampTraitValue(Number.NaN)).toBe(DEFAULT_TRAIT_VALUE)
    expect(clampTraitValue(Number.POSITIVE_INFINITY)).toBe(DEFAULT_TRAIT_VALUE)
  })
})

describe('hasNonDefaultTraitValue', () => {
  it('is false when every value is the default', () => {
    expect(hasNonDefaultTraitValue([0, 0, 0])).toBe(false)
    expect(hasNonDefaultTraitValue([])).toBe(false)
  })

  it('is true for any value away from the default', () => {
    expect(hasNonDefaultTraitValue([0, -1])).toBe(true)
    expect(hasNonDefaultTraitValue([2])).toBe(true)
  })
})

describe('getLoudestTraitIndex', () => {
  it('picks the value with the largest magnitude', () => {
    expect(getLoudestTraitIndex([1, -3, 2])).toBe(1)
    expect(getLoudestTraitIndex([2, 0, 1])).toBe(0)
  })

  it('ignores sign when comparing magnitude', () => {
    expect(getLoudestTraitIndex([-2, 2])).toBe(0)
    expect(getLoudestTraitIndex([2, -2])).toBe(0)
  })

  it('returns -1 when nothing stands out', () => {
    expect(getLoudestTraitIndex([0, 0])).toBe(-1)
    expect(getLoudestTraitIndex([])).toBe(-1)
  })
})

describe('formatTraitValue', () => {
  it('signs positive values so the scale reads as signed', () => {
    expect(formatTraitValue(3)).toBe('+3')
    expect(formatTraitValue(0)).toBe('0')
    expect(formatTraitValue(-3)).toBe('-3')
  })
})

describe('describeTraitValue', () => {
  it('calls the default the trait plain and unexaggerated', () => {
    expect(describeTraitValue(0)).toContain('plain and unexaggerated')
  })

  it('describes the maximum as a too-much extreme', () => {
    expect(describeTraitValue(3)).toContain('too-much')
  })

  it('describes the minimum as the exact opposite', () => {
    expect(describeTraitValue(-3)).toContain('exact opposite')
  })

  it('gives every value on the scale its own wording', () => {
    const descriptions = [-3, -2, -1, 0, 1, 2, 3].map(describeTraitValue)

    expect(new Set(descriptions).size).toBe(7)
  })
})

describe('traitValueScaleLines', () => {
  it('states the range and the default', () => {
    const scale = traitValueScaleLines.join('\n')

    expect(scale).toContain('-3 to 3')
    expect(scale).toContain('0 is the default')
  })

  it('blocks the two failure modes: 3 as a threat, negatives as tragedy', () => {
    const scale = traitValueScaleLines.join(' ')

    expect(scale).toContain('never as a superpower or a threat')
    expect(scale).toContain('never depression, cruelty, grief')
  })

  it('keeps a value scoped to its own trait', () => {
    expect(traitValueScaleLines.join('\n')).toContain(
      'A value changes only the strength and direction of its own trait',
    )
  })

  it('forbids printing the number in generated text', () => {
    expect(traitValueScaleLines.join('\n')).toContain('Never print a number')
  })
})
