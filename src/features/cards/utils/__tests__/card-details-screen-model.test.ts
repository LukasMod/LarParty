import { resolveCardDetailsScreenModel } from '@/features/cards/utils/card-details-screen-model'
import { makeCard, makeParty } from '@test/factories'

const party = makeParty({ id: 'party-1' })
const card = makeCard({ id: 'card-1', partyId: 'party-1' })

describe('resolveCardDetailsScreenModel', () => {
  it('loads while either store is still hydrating', () => {
    const model = resolveCardDetailsScreenModel({
      hasHydrated: false,
      partyId: 'party-1',
      party: null,
      card: null,
    })

    expect(model).toEqual({ status: 'loading', party: null, card: null })
  })

  it('treats a cold start as loading, not missing', () => {
    expect(
      resolveCardDetailsScreenModel({
        hasHydrated: false,
        partyId: 'party-1',
        party: null,
        card: null,
      }).status,
    ).toBe('loading')
  })

  it('reports missing when the party is gone', () => {
    expect(
      resolveCardDetailsScreenModel({
        hasHydrated: true,
        partyId: 'party-1',
        party: null,
        card,
      }),
    ).toEqual({ status: 'missing', party: null, card: null })
  })

  it('reports missing when the card is gone', () => {
    expect(
      resolveCardDetailsScreenModel({
        hasHydrated: true,
        partyId: 'party-1',
        party,
        card: null,
      }),
    ).toEqual({ status: 'missing', party: null, card: null })
  })

  it('reports missing when the card belongs to another party', () => {
    const model = resolveCardDetailsScreenModel({
      hasHydrated: true,
      partyId: 'party-1',
      party,
      card: makeCard({ partyId: 'party-2' }),
    })

    expect(model).toEqual({ status: 'missing', party: null, card: null })
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
