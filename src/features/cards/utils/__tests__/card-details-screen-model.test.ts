import { resolveCardDetailsScreenModel } from '@/features/cards/utils/card-details-screen-model'
import { makeCard, makeParty } from '@test/factories'

const party = makeParty({ id: 'party-1' })
const card = makeCard({ id: 'card-1', partyId: 'party-1' })

describe('resolveCardDetailsScreenModel', () => {
  // An absent card during hydration is the normal cold start, not a deletion.
  // Getting this backwards flashes "not found" on every deep link.
  it('loads while either store is still hydrating', () => {
    expect(
      resolveCardDetailsScreenModel({
        hasHydrated: false,
        partyId: 'party-1',
        party: null,
        card: null,
      }),
    ).toEqual({ status: 'loading', party: null, card: null })
  })

  it('reports missing once hydrated with the party or card gone', () => {
    expect(
      resolveCardDetailsScreenModel({
        hasHydrated: true,
        partyId: 'party-1',
        party: null,
        card,
      }),
    ).toEqual({ status: 'missing', party: null, card: null })

    expect(
      resolveCardDetailsScreenModel({
        hasHydrated: true,
        partyId: 'party-1',
        party,
        card: null,
      }),
    ).toEqual({ status: 'missing', party: null, card: null })
  })

  // A card whose partyId disagrees with the route is a stale deep link. Without
  // this the app renders one party's card under another party's theme.
  it('reports missing when the card belongs to another party', () => {
    expect(
      resolveCardDetailsScreenModel({
        hasHydrated: true,
        partyId: 'party-1',
        party,
        card: makeCard({ partyId: 'party-2' }),
      }),
    ).toEqual({ status: 'missing', party: null, card: null })
  })

  it('passes the party and card through when both exist', () => {
    const model = resolveCardDetailsScreenModel({
      hasHydrated: true,
      partyId: 'party-1',
      party,
      card,
    })

    if (model.status !== 'ready') {
      throw new Error(`expected ready, got ${model.status}`)
    }

    expect(model.party).toBe(party)
    expect(model.card).toBe(card)
  })
})
