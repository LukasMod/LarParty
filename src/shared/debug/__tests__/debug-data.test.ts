import {
  buildLargeDebugDataset,
  buildSmallDebugDataset,
  DEBUG_LARGE_CARDS_PER_PARTY,
  DEBUG_LARGE_PARTY_COUNT,
  DEBUG_SMALL_PARTY_COUNT,
  generateDebugData,
} from '@/shared/debug/debug-data'
import { cardTraits } from '@/shared/constants/party-options'

// A malformed seed is only ever seen on a dev screen, so this asserts the few
// invariants that would otherwise read as a broken screen model or a broken
// cascade delete during a manual pass.

describe('generateDebugData', () => {
  it('gives every card a party that exists and a distinct id', () => {
    const { parties, cards } = generateDebugData(5, 3)
    const partyIds = new Set(parties.map((party) => party.id))

    expect(parties).toHaveLength(5)
    for (const card of cards) {
      expect(partyIds.has(card.partyId)).toBe(true)
    }

    const ids = cards.map((card) => card.id)

    expect(new Set(ids).size).toBe(ids.length)
  })

  // Lists render store order, so seeding newest-first is what makes the fake
  // data exercise the same layout as real usage.
  it('returns the newest party and newest cards first', () => {
    const { parties, cards } = generateDebugData(1, 3)
    const stamps = cards.map((card) => Date.parse(card.updatedAt))

    expect(parties[0].title).toBe('Emberkeep')
    expect(stamps).toEqual([...stamps].sort((a, b) => b - a))
  })

  // Details screens read three traits and expect version history to be queryable
  // by generationGroupId, so a seed that breaks either wastes a manual pass.
  it('selects three distinct traits per card', () => {
    for (const card of generateDebugData(5, 5).cards) {
      expect(card.input.selectedTraits).toHaveLength(3)
      expect(new Set(card.input.selectedTraits).size).toBe(3)

      for (const trait of card.input.selectedTraits) {
        expect(cardTraits).toContain(trait)
      }
    }
  })

  it('points every basedOnCardId at a card in the same generation group', () => {
    const { cards } = generateDebugData(3, 10)
    const byId = new Map(cards.map((card) => [card.id, card]))

    expect(cards.some((card) => card.basedOnCardId)).toBe(true)

    for (const card of cards.filter((entry) => entry.basedOnCardId)) {
      expect(byId.get(card.basedOnCardId as string)?.generationGroupId).toBe(
        card.generationGroupId,
      )
    }
  })

  it('mixes accepted and draft statuses', () => {
    const statuses = new Set(
      generateDebugData(3, 6).cards.map((card) => card.status),
    )

    expect(statuses.has('accepted')).toBe(true)
    expect(statuses.has('draft')).toBe(true)
  })
})

describe('preset datasets', () => {
  // The small preset is how a manual pass reaches every theme without spending
  // generation requests, so it has to cover all three categories.
  it('covers every theme category in the small set', () => {
    const { parties } = buildSmallDebugDataset()

    expect(parties).toHaveLength(DEBUG_SMALL_PARTY_COUNT)
    expect(new Set(parties.map((party) => party.themeCategory)).size).toBe(3)
  })

  // The large preset exists to exercise scrolling and counts, so shrinking a
  // per-party count below ten stops it doing its job.
  it('gives the large set enough rows per party to scroll', () => {
    const { parties, cards } = buildLargeDebugDataset()
    const perParty = cards.length / parties.length

    expect(parties).toHaveLength(DEBUG_LARGE_PARTY_COUNT)
    expect(perParty).toBeGreaterThanOrEqual(DEBUG_LARGE_CARDS_PER_PARTY)
  })
})
