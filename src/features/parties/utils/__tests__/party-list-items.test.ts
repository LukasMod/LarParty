import { buildPartyListItems } from '@/features/parties/utils/party-list-items'
import { makeCard, makeParty } from '@test/factories'

describe('buildPartyListItems', () => {
  it('pairs each party with its card count', () => {
    const partyA = makeParty({ id: 'party-a' })
    const partyB = makeParty({ id: 'party-b' })
    const cards = [
      makeCard({ partyId: 'party-a' }),
      makeCard({ partyId: 'party-a' }),
      makeCard({ partyId: 'party-b' }),
    ]

    const items = buildPartyListItems([partyA, partyB], cards)

    expect(items.map(({ party, cardCount }) => [party.id, cardCount])).toEqual([
      ['party-a', 2],
      ['party-b', 1],
    ])
  })

  it('shows a zero count for a party with no cards', () => {
    const party = makeParty({ id: 'party-empty' })

    expect(buildPartyListItems([party], [])).toEqual([{ party, cardCount: 0 }])
  })

  it('keeps party order so the store stays authoritative', () => {
    const newest = makeParty({ id: 'newest' })
    const oldest = makeParty({ id: 'oldest' })

    expect(
      buildPartyListItems([newest, oldest], []).map(({ party }) => party.id),
    ).toEqual(['newest', 'oldest'])
  })

  it('returns an empty list with no parties', () => {
    expect(buildPartyListItems([], [makeCard()])).toEqual([])
  })

  it('ignores cards belonging to a deleted party', () => {
    const party = makeParty({ id: 'party-a' })

    expect(
      buildPartyListItems([party], [makeCard({ partyId: 'gone' })])[0],
    ).toEqual({ party, cardCount: 0 })
  })

  it('reuses the same party object rather than copying it', () => {
    const party = makeParty()

    expect(buildPartyListItems([party], [])[0].party).toBe(party)
  })
})
