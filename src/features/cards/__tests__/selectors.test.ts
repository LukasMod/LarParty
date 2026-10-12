import {
  getCardById,
  getCardCountByPartyId,
  getCardsForParty,
} from '@/features/cards/selectors'
import { makeCard } from '@test/factories'

describe('getCardById', () => {
  const cards = [makeCard({ id: 'card-1' }), makeCard({ id: 'card-2' })]

  it('finds a card by id', () => {
    expect(getCardById(cards, 'card-2')).toBe(cards[1])
  })

  it('returns null when absent', () => {
    expect(getCardById(cards, 'card-missing')).toBeNull()
  })

  it('returns null for an empty list', () => {
    expect(getCardById([], 'card-1')).toBeNull()
  })

  it('returns the first match', () => {
    const duplicated = [makeCard({ id: 'dupe' }), makeCard({ id: 'dupe' })]

    expect(getCardById(duplicated, 'dupe')).toBe(duplicated[0])
  })
})

describe('getCardCountByPartyId', () => {
  it('counts cards grouped by party', () => {
    const cards = [
      makeCard({ partyId: 'party-1' }),
      makeCard({ partyId: 'party-1' }),
      makeCard({ partyId: 'party-2' }),
    ]

    expect(getCardCountByPartyId(cards)).toEqual({
      'party-1': 2,
      'party-2': 1,
    })
  })

  it('returns an empty record for no cards', () => {
    expect(getCardCountByPartyId([])).toEqual({})
  })

  it('omits parties with no cards', () => {
    const counts = getCardCountByPartyId([makeCard({ partyId: 'party-1' })])

    expect(counts).not.toHaveProperty('party-empty')
  })

  it('does not mutate the input', () => {
    const cards = [makeCard({ partyId: 'party-1' })]

    getCardCountByPartyId(cards)

    expect(cards).toHaveLength(1)
  })
})

describe('getCardsForParty', () => {
  it('keeps only the party’s cards', () => {
    const cards = [
      makeCard({ id: 'card-1', partyId: 'party-1' }),
      makeCard({ id: 'card-2', partyId: 'party-2' }),
    ]

    expect(getCardsForParty(cards, 'party-1').map((card) => card.id)).toEqual([
      'card-1',
    ])
  })

  it('returns an empty list for an unknown party', () => {
    expect(
      getCardsForParty([makeCard({ partyId: 'party-1' })], 'party-x'),
    ).toEqual([])
  })

  it('orders newest first', () => {
    const oldest = makeCard({
      id: 'oldest',
      partyId: 'party-1',
      updatedAt: '2026-01-01T00:00:00.000Z',
    })
    const newest = makeCard({
      id: 'newest',
      partyId: 'party-1',
      updatedAt: '2026-06-01T00:00:00.000Z',
    })

    expect(
      getCardsForParty([oldest, newest], 'party-1').map((card) => card.id),
    ).toEqual(['newest', 'oldest'])
  })

  it('sorts by update time rather than creation time', () => {
    const createdFirst = makeCard({
      id: 'created-first',
      partyId: 'party-1',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-02-01T00:00:00.000Z',
    })
    const createdLast = makeCard({
      id: 'created-last',
      partyId: 'party-1',
      createdAt: '2026-01-15T00:00:00.000Z',
      updatedAt: '2026-01-20T00:00:00.000Z',
    })

    expect(
      getCardsForParty([createdLast, createdFirst], 'party-1').map(
        (card) => card.id,
      ),
    ).toEqual(['created-first', 'created-last'])
  })

  it('does not mutate the input order', () => {
    const older = makeCard({
      partyId: 'party-1',
      updatedAt: '2026-01-01T00:00:00.000Z',
    })
    const newer = makeCard({
      partyId: 'party-1',
      updatedAt: '2026-06-01T00:00:00.000Z',
    })
    const cards = [older, newer]

    getCardsForParty(cards, 'party-1')

    expect(cards[0]).toBe(older)
  })
})
