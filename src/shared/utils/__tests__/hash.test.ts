import { hashCode, seedOffset } from '@/shared/utils/hash'

describe('hashCode', () => {
  it('is stable across calls', () => {
    expect(hashCode('card-1')).toBe(hashCode('card-1'))
  })

  it('is never negative', () => {
    for (const value of ['a', 'zzzzzzzzzzzz', 'card-9f3a1b', 'Party of 12']) {
      expect(hashCode(value)).toBeGreaterThanOrEqual(0)
    }
  })

  it('survives a string long enough to overflow the int32 mask', () => {
    expect(hashCode('x'.repeat(200))).toBeGreaterThanOrEqual(0)
  })
})

// The one property the glow animation depends on: distinct seeds start at
// distinct points of the cycle, so the cards do not breathe in lockstep.
describe('seedOffset', () => {
  it('stays inside the half-open unit range', () => {
    for (const seed of ['party-1', 'card-42', 'generation-7', '']) {
      const offset = seedOffset(seed)

      expect(offset).toBeGreaterThanOrEqual(0)
      expect(offset).toBeLessThan(1)
    }
  })

  it('spreads uuid seeds across the range', () => {
    const offsets = Array.from({ length: 20 }, (_, index) =>
      seedOffset(`card-${index.toString(16)}${'a'.repeat(index)}`),
    )
    const spread = Math.max(...offsets) - Math.min(...offsets)

    expect(spread).toBeGreaterThan(0.5)
  })

  // Pinned, not asserted good: sequential seeds land within one fifth of the
  // cycle, so anything seeded from a counter animates in sync. Real ids are
  // uuids, which spread.
  it('clusters purely sequential seeds', () => {
    const offsets = Array.from({ length: 20 }, (_, index) =>
      seedOffset(`card-${index}`),
    )
    const spread = Math.max(...offsets) - Math.min(...offsets)

    expect(spread).toBeLessThan(0.2)
  })
})
