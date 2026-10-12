// Index math for deterministic fixture data. Cycling pools instead of drawing
// randomness gives varied but stable-looking data and guarantees spread across
// a batch.

export function pick<T>(pool: readonly T[], index: number): T {
  return pool[index % pool.length]
}

// Picks are distinct at every index: the pairwise gaps are 4i+1, 2i+3 and 6i+4,
// none of which is ever a multiple of 12. Multipliers 1/5/7 cycle all 12 traits
// across a batch.
export function indexToDistinctTraits<T>(
  pool: readonly T[],
  index: number,
): [T, T, T] {
  const count = pool.length

  return [
    pool[index % count],
    pool[(index * 5 + 1) % count],
    pool[(index * 7 + 4) % count],
  ]
}

// Fixed epoch so repeated seeding produces recognizable, comparable data.
export function timestampFromDayOffset(
  dayOffset: number,
  epochMs = Date.UTC(2026, 0, 1),
): string {
  return new Date(epochMs + dayOffset * 86_400_000).toISOString()
}
