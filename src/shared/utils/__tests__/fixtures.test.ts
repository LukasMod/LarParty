import {
  indexToAge,
  indexToDistinctTraits,
  pick,
  timestampFromDayOffset,
} from '@/shared/utils/fixtures'
import { cardTraits } from '@/shared/constants/party-options'

const pool = ['a', 'b', 'c'] as const

describe('pick', () => {
  it('cycles the pool', () => {
    expect([
      pick(pool, 0),
      pick(pool, 1),
      pick(pool, 2),
      pick(pool, 3),
    ]).toEqual(['a', 'b', 'c', 'a'])
  })

  it('never leaves the pool', () => {
    for (let index = 0; index < 200; index += 1) {
      expect(pool).toContain(pick(pool, index))
    }
  })
})

describe('indexToAge', () => {
  it('stays within the declared range', () => {
    for (let index = 0; index < 300; index += 1) {
      const age = indexToAge(index)

      expect(age).toBeGreaterThanOrEqual(19)
      expect(age).toBeLessThan(19 + 47)
    }
  })

  it('varies across a batch instead of repeating', () => {
    const ages = new Set(
      Array.from({ length: 12 }, (_, index) => indexToAge(index)),
    )

    expect(ages.size).toBe(12)
  })
})

describe('indexToDistinctTraits', () => {
  it('always returns three distinct traits from the pool', () => {
    for (let index = 0; index < 200; index += 1) {
      const traits = indexToDistinctTraits(cardTraits, index)

      expect(traits).toHaveLength(3)
      expect(new Set(traits).size).toBe(3)

      for (const trait of traits) {
        expect(cardTraits).toContain(trait)
      }
    }
  })

  // Distinctness is a property of the twelve-trait pool and the 1/5/7
  // multipliers, not of the function shape. A smaller or differently sized pool
  // collides, so the pool size is load-bearing and pinned here.
  it('collides on a pool the multipliers cannot handle', () => {
    expect(new Set(indexToDistinctTraits(['x', 'y', 'z', 'w'], 0)).size).toBe(2)
    expect(cardTraits).toHaveLength(12)
  })
})

describe('timestampFromDayOffset', () => {
  it('advances by exactly one day per step from a fixed epoch', () => {
    expect(timestampFromDayOffset(0)).toBe('2026-01-01T00:00:00.000Z')
    expect(timestampFromDayOffset(1)).toBe('2026-01-02T00:00:00.000Z')
    expect(timestampFromDayOffset(10)).toBe('2026-01-11T00:00:00.000Z')
  })

  it('handles a negative offset', () => {
    expect(timestampFromDayOffset(-1)).toBe('2025-12-31T00:00:00.000Z')
  })
})
