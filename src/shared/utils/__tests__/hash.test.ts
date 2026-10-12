import { hashCode, seedOffset } from '@/shared/utils/hash'

describe('hashCode', () => {
  it('is stable across calls', () => {
    expect(hashCode('card-1')).toBe(hashCode('card-1'))
  })

  it('returns zero for an empty string', () => {
    expect(hashCode('')).toBe(0)
  })

  it('is never negative', () => {
    for (const value of ['a', 'zzzzzzzzzzzz', 'card-9f3a1b', 'Party of 12']) {
      expect(hashCode(value)).toBeGreaterThanOrEqual(0)
    }
  })

  it('separates different strings', () => {
    expect(hashCode('card-1')).not.toBe(hashCode('card-2'))
  })

  it('is case sensitive', () => {
    expect(hashCode('Abc')).not.toBe(hashCode('abc'))
  })

  it('survives a string long enough to overflow the int32 mask', () => {
    expect(hashCode('x'.repeat(200))).toBeGreaterThanOrEqual(0)
  })
})

describe('seedOffset', () => {
  it('stays inside the half-open unit range', () => {
    for (const seed of ['party-1', 'card-42', 'generation-7', '']) {
      const offset = seedOffset(seed)

      expect(offset).toBeGreaterThanOrEqual(0)
      expect(offset).toBeLessThan(1)
    }
  })

  it('is deterministic', () => {
    expect(seedOffset('card-1')).toBe(seedOffset('card-1'))
  })

  it('spreads uuid seeds across the range', () => {
    const offsets = Array.from({ length: 20 }, (_, index) =>
      seedOffset(`card-${index.toString(16)}${'a'.repeat(index)}`),
    )
    const spread = Math.max(...offsets) - Math.min(...offsets)

    expect(spread).toBeGreaterThan(0.5)
  })

  it('clusters purely sequential seeds', () => {
    const offsets = Array.from({ length: 20 }, (_, index) =>
      seedOffset(`card-${index}`),
    )
    const spread = Math.max(...offsets) - Math.min(...offsets)

    expect(spread).toBeLessThan(0.2)
  })

  it('honors a custom bucket count', () => {
    expect(seedOffset('any', 1)).toBe(0)
    expect((seedOffset('any', 10_000) * 10_000) % 1).toBeCloseTo(0)
  })
})
