import { useCardStore } from '@/features/cards/store/card-store'
import { usePartyStore } from '@/features/parties/store/party-store'
import { makeCard, makeGenerated } from '@test/factories'

const cardStore = () => useCardStore.getState()

function resetStores() {
  useCardStore.setState({ cards: [], hasHydrated: false })
  usePartyStore.setState({ parties: [], hasHydrated: false })
}

beforeEach(resetStores)

describe('createDraftCard', () => {
  it('saves a new card as a draft, newest first', () => {
    cardStore().createDraftCard({
      partyId: 'party-1',
      input: makeCard().input,
      generated: makeGenerated(),
    })
    const secondId = cardStore().createDraftCard({
      partyId: 'party-1',
      input: makeCard().input,
      generated: makeGenerated(),
    })

    expect(cardStore().cards).toHaveLength(2)
    expect(cardStore().cards[0].id).toBe(secondId)
    expect(cardStore().cards.every((card) => card.status === 'draft')).toBe(
      true,
    )
  })

  // Accepting is what makes a card real, so a new generation must not land as
  // accepted and a regeneration must not open a fresh version history.
  it('starts a new generation group when none is given', () => {
    cardStore().createDraftCard({
      partyId: 'party-1',
      input: makeCard().input,
      generated: makeGenerated(),
    })

    expect(cardStore().cards[0].generationGroupId).toBeTruthy()
  })

  it('reuses the group id and parent when regenerating', () => {
    cardStore().createDraftCard({
      partyId: 'party-1',
      input: makeCard().input,
      generated: makeGenerated(),
      generationGroupId: 'group-1',
      basedOnCardId: 'card-1',
    })

    const card = cardStore().cards[0]

    expect(card.generationGroupId).toBe('group-1')
    expect(card.basedOnCardId).toBe('card-1')
  })
})

describe('acceptCard', () => {
  it('flips only the target from draft to accepted, leaving its payload intact', () => {
    const input = makeCard().input
    const generated = makeGenerated()
    const firstId = cardStore().createDraftCard({
      partyId: 'party-1',
      input,
      generated,
    })
    cardStore().createDraftCard({ partyId: 'party-1', input, generated })

    cardStore().acceptCard(firstId)

    const accepted = cardStore().cards.filter(
      (card) => card.status === 'accepted',
    )

    expect(accepted).toHaveLength(1)
    expect(accepted[0].id).toBe(firstId)
    expect(accepted[0].input).toEqual(input)
    expect(accepted[0].generated).toEqual(generated)
  })

  it('is a no-op for an unknown id', () => {
    cardStore().createDraftCard({
      partyId: 'party-1',
      input: makeCard().input,
      generated: makeGenerated(),
    })

    cardStore().acceptCard('nope')

    expect(cardStore().cards[0].status).toBe('draft')
  })
})

// deleteParty reaches the card store through this; the cascade itself is covered
// in party-store.test.ts.
describe('deleteCardsForParty', () => {
  it('drops every card of the party and nothing else', () => {
    const input = makeCard().input
    const generated = makeGenerated()

    cardStore().createDraftCard({ partyId: 'party-1', input, generated })
    cardStore().createDraftCard({ partyId: 'party-1', input, generated })
    cardStore().createDraftCard({ partyId: 'party-2', input, generated })

    cardStore().deleteCardsForParty('party-1')

    expect(cardStore().cards).toHaveLength(1)
    expect(cardStore().cards[0].partyId).toBe('party-2')
  })
})
