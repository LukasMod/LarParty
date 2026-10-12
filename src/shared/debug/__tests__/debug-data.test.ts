import {
  buildLargeDebugDataset,
  buildSmallDebugDataset,
  DEBUG_LARGE_CARDS_PER_PARTY,
  DEBUG_LARGE_PARTY_COUNT,
  DEBUG_SMALL_CARDS_PER_PARTY,
  DEBUG_SMALL_PARTY_COUNT,
  generateDebugData,
} from '@/shared/debug/debug-data'
import { cardTraits, themeCategories } from '@/shared/constants/party-options'

describe('generateDebugData', () => {
  it('builds the requested number of parties', () => {
    expect(generateDebugData(4, 1).parties).toHaveLength(4)
  })

  it('builds the requested number of cards per party', () => {
    const { parties, cards } = generateDebugData(3, 2)

    for (const party of parties) {
      const owned = cards.filter((card) => card.partyId === party.id)

      expect(owned.length).toBeGreaterThanOrEqual(DEBUG_SMALL_CARDS_PER_PARTY)
    }
  })

  it('puts the newest party first, matching the prepend order of the stores', () => {
    const { parties } = generateDebugData(3, 1)
    const titles = parties.map((party) => party.title)

    expect(titles).toEqual(['Hollow Creek', 'Kepler Drift', 'Emberkeep'])
  })

  it('puts the newest card of a party first', () => {
    const { parties, cards } = generateDebugData(1, 3)
    const owned = cards.filter((card) => card.partyId === parties[0].id)
    const stamps = owned.map((card) => Date.parse(card.updatedAt))

    expect(stamps).toEqual([...stamps].sort((a, b) => b - a))
  })

  it('gives every card a party that exists', () => {
    const { parties, cards } = generateDebugData(5, 3)
    const partyIds = new Set(parties.map((party) => party.id))

    for (const card of cards) {
      expect(partyIds.has(card.partyId)).toBe(true)
    }
  })

  it('gives every party a distinct id', () => {
    const ids = generateDebugData(6, 1).parties.map((party) => party.id)

    expect(new Set(ids).size).toBe(ids.length)
  })

  it('gives every card a distinct id', () => {
    const ids = generateDebugData(4, 4).cards.map((card) => card.id)

    expect(new Set(ids).size).toBe(ids.length)
  })

  it('rotates theme categories across parties', () => {
    const categories = generateDebugData(6, 1).parties.map(
      (party) => party.themeCategory,
    )

    expect(new Set(categories).size).toBe(themeCategories.length)
  })

  it('keeps card text aligned with the party theme', () => {
    const { parties, cards } = generateDebugData(3, 2)

    for (const party of parties) {
      const owned = cards.filter((card) => card.partyId === party.id)

      for (const card of owned) {
        expect(card.generated.characterTraits.length).toBe(3)
        expect(card.generated.specialPhrase.length).toBeGreaterThan(0)
      }
    }
  })

  it('selects three distinct traits per card', () => {
    for (const card of generateDebugData(5, 5).cards) {
      expect(card.input.selectedTraits).toHaveLength(3)
      expect(new Set(card.input.selectedTraits).size).toBe(3)
      for (const trait of card.input.selectedTraits) {
        expect(cardTraits).toContain(trait)
      }
    }
  })

  it('mixes accepted and draft statuses', () => {
    const statuses = new Set(
      generateDebugData(3, 6).cards.map((card) => card.status),
    )

    expect(statuses.has('accepted')).toBe(true)
    expect(statuses.has('draft')).toBe(true)
  })

  it('includes a version history for larger batches', () => {
    const cards = generateDebugData(2, 10).cards

    expect(cards.some((card) => card.basedOnCardId)).toBe(true)
  })

  it('points every basedOnCardId at a card in the same generation group', () => {
    const { cards } = generateDebugData(3, 10)
    const byId = new Map(cards.map((card) => [card.id, card]))

    for (const card of cards.filter((entry) => entry.basedOnCardId)) {
      const parent = byId.get(card.basedOnCardId as string)

      expect(parent).toBeDefined()
      expect(parent?.generationGroupId).toBe(card.generationGroupId)
    }
  })

  it('omits basedOnCardId for a single card per party', () => {
    expect(
      generateDebugData(2, 1).cards.every((card) => !card.basedOnCardId),
    ).toBe(true)
  })

  it('is deterministic apart from generated ids', () => {
    const strip = (data: ReturnType<typeof generateDebugData>) => ({
      parties: data.parties.map(({ id: _id, ...rest }) => rest),
      cards: data.cards
        .map(
          ({
            id: _id,
            partyId: _partyId,
            generationGroupId: _group,
            basedOnCardId: _based,
            ...rest
          }) => rest,
        )
        .sort((a, b) => a.input.name.localeCompare(b.input.name)),
    })

    expect(strip(generateDebugData(3, 3))).toEqual(
      strip(generateDebugData(3, 3)),
    )
  })

  it('returns empty datasets for a zero count', () => {
    expect(generateDebugData(0, 5)).toEqual({ parties: [], cards: [] })
  })
})

describe('preset datasets', () => {
  it('seeds one party per theme category in the small set', () => {
    expect(buildSmallDebugDataset().parties).toHaveLength(
      DEBUG_SMALL_PARTY_COUNT,
    )
  })

  it('seeds the documented large set size', () => {
    const { parties } = buildLargeDebugDataset()

    expect(parties).toHaveLength(DEBUG_LARGE_PARTY_COUNT)
  })

  it('gives the large set more cards than the small set', () => {
    expect(buildLargeDebugDataset().cards.length).toBeGreaterThan(
      buildSmallDebugDataset().cards.length,
    )
  })

  it('uses the documented per-party card counts', () => {
    expect(DEBUG_SMALL_CARDS_PER_PARTY).toBe(1)
    expect(DEBUG_LARGE_CARDS_PER_PARTY).toBe(10)
  })
})
