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

  // The record only contains parties that have cards, which is why the list
  // builder has to default a missing key to zero.
  it('omits parties with no cards', () => {
    const counts = getCardCountByPartyId([makeCard({ partyId: 'party-1' })])

    expect(counts).not.toHaveProperty('party-empty')
  })
})

describe('getCardsForParty', () => {
  it('keeps only the cards of the requested party', () => {
    const cards = [
      makeCard({ id: 'card-1', partyId: 'party-1' }),
      makeCard({ id: 'card-2', partyId: 'party-2' }),
    ]

    expect(getCardsForParty(cards, 'party-1').map((card) => card.id)).toEqual([
      'card-1',
    ])
  })

  // Recency of the last edit decides order, so a card that a regeneration
  // touched returns to the top. Sorting on createdAt instead reads as a bug.
  it('orders by update time rather than creation time', () => {
    const touched = makeCard({
      id: 'touched',
      partyId: 'party-1',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-02-01T00:00:00.000Z',
    })
    const untouched = makeCard({
      id: 'untouched',
      partyId: 'party-1',
      createdAt: '2026-01-15T00:00:00.000Z',
      updatedAt: '2026-01-20T00:00:00.000Z',
    })

    expect(
      getCardsForParty([untouched, touched], 'party-1').map((card) => card.id),
    ).toEqual(['touched', 'untouched'])
  })
})
