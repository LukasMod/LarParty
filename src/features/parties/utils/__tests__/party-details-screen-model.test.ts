import {
  PartyDetailsScreenModel,
  resolvePartyDetailsScreenModel,
} from '@/features/parties/utils/party-details-screen-model'
import { makeCard, makeParty } from '@test/factories'

const party = makeParty({ id: 'party-1' })

function expectReady(model: PartyDetailsScreenModel) {
  if (model.status !== 'ready') {
    throw new Error(`expected ready, got ${model.status}`)
  }

  return model
}

describe('resolvePartyDetailsScreenModel', () => {
  // Hydration gates the missing branch: an empty store on a cold start reads as
  // loading, otherwise every deep link flashes "party not found".
  it('loads while hydration is in progress', () => {
    expect(
      resolvePartyDetailsScreenModel({
        hasHydrated: false,
        party: null,
        cards: [],
      }),
    ).toEqual({ status: 'loading', party: null, cards: null })
  })

  it('reports missing once hydrated without the party', () => {
    expect(
      resolvePartyDetailsScreenModel({
        hasHydrated: true,
        party: null,
        cards: [],
      }),
    ).toEqual({ status: 'missing', party: null, cards: null })
  })

  it('is ready with an empty card list', () => {
    const model = expectReady(
      resolvePartyDetailsScreenModel({
        hasHydrated: true,
        party,
        cards: [],
      }),
    )

    expect(model.cards).toEqual([])
  })

  // Cards reach the resolver already filtered and sorted by getCardsForParty.
  it('passes the party and cards through by reference', () => {
    const cards = [makeCard({ partyId: 'party-1' })]
    const model = expectReady(
      resolvePartyDetailsScreenModel({ hasHydrated: true, party, cards }),
    )

    expect(model.cards).toBe(cards)
    expect(model.party).toBe(party)
  })
})
