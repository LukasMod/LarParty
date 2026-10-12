import {
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

  it('wraps a large index', () => {
    expect(pick(pool, 100)).toBe('b')
    expect(pick(pool, 99)).toBe('a')
  })

  it('never leaves the pool', () => {
    for (let index = 0; index < 200; index += 1) {
      expect(pool).toContain(pick(pool, index))
    }
  })
})

describe('indexToDistinctTraits', () => {
  it('always returns three distinct traits', () => {
    for (let index = 0; index < 200; index += 1) {
      const traits = indexToDistinctTraits(cardTraits, index)

      expect(traits).toHaveLength(3)
      expect(new Set(traits).size).toBe(3)
    }
  })

  it('only ever picks from the pool', () => {
    for (let index = 0; index < 200; index += 1) {
      for (const trait of indexToDistinctTraits(cardTraits, index)) {
        expect(cardTraits).toContain(trait)
      }
    }
  })

  it('cycles every trait across a full batch', () => {
    const seen = new Set<string>()

    for (let index = 0; index < cardTraits.length; index += 1) {
      indexToDistinctTraits(cardTraits, index).forEach((trait) =>
        seen.add(trait),
      )
    }

    expect(seen.size).toBe(cardTraits.length)
  })

  it('wraps a small pool only at pool sizes the multipliers support', () => {
    // Distinctness depends on the pool size: multipliers 1/5/7 collide for most
    // sizes, so the twelve-trait set is load-bearing.
    expect(new Set(indexToDistinctTraits(['x', 'y', 'z', 'w'], 0)).size).toBe(2)
  })

  it('pins the trait pool size the multipliers rely on', () => {
    expect(cardTraits).toHaveLength(12)
  })
})

describe('timestampFromDayOffset', () => {
  it('returns the epoch ISO string at zero', () => {
    expect(timestampFromDayOffset(0)).toBe('2026-01-01T00:00:00.000Z')
  })

  it('advances by exactly one day per step', () => {
    expect(timestampFromDayOffset(1)).toBe('2026-01-02T00:00:00.000Z')
    expect(timestampFromDayOffset(10)).toBe('2026-01-11T00:00:00.000Z')
  })

  it('handles a negative offset', () => {
    expect(timestampFromDayOffset(-1)).toBe('2025-12-31T00:00:00.000Z')
  })

  it('is timezone independent', () => {
    expect(timestampFromDayOffset(3)).toContain('T00:00:00.000Z')
  })

  it('orders the same as its offset', () => {
    expect(timestampFromDayOffset(0) < timestampFromDayOffset(1)).toBe(true)
  })

  it('accepts a custom epoch', () => {
    expect(timestampFromDayOffset(0, Date.UTC(2020, 0, 1))).toBe(
      '2020-01-01T00:00:00.000Z',
    )
  })
})
