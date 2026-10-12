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

  // A party with no cards still needs a row, so the missing count key has to
  // resolve to zero instead of dropping the party from the list.
  it('shows a zero count for a party with no cards', () => {
    const party = makeParty({ id: 'party-empty' })

    expect(buildPartyListItems([party], [])).toEqual([{ party, cardCount: 0 }])
  })

  it('returns an empty list with no parties, even with orphaned cards', () => {
    expect(buildPartyListItems([], [makeCard()])).toEqual([])
  })
})
