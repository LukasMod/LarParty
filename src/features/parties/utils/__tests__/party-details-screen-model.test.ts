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
  it('loads while hydration is in progress', () => {
    expect(
      resolvePartyDetailsScreenModel({
        hasHydrated: false,
        party: null,
        cards: [],
      }),
    ).toEqual({ status: 'loading', party: null, cards: null })
  })

  it('never reports missing during a cold start', () => {
    expect(
      resolvePartyDetailsScreenModel({
        hasHydrated: false,
        party: null,
        cards: [],
      }).status,
    ).not.toBe('missing')
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

  it('passes the already filtered cards through', () => {
    const cards = [makeCard({ partyId: 'party-1' })]
    const model = expectReady(
      resolvePartyDetailsScreenModel({ hasHydrated: true, party, cards }),
    )

    expect(model.cards).toBe(cards)
    expect(model.party).toBe(party)
  })

  it('does not filter out cards from another party', () => {
    const model = expectReady(
      resolvePartyDetailsScreenModel({
        hasHydrated: true,
        party,
        cards: [makeCard({ partyId: 'party-other' })],
      }),
    )

    expect(model.cards).toHaveLength(1)
  })
})
