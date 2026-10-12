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
  it('saves a new card as a draft', () => {
    cardStore().createDraftCard({
      partyId: 'party-1',
      input: makeCard().input,
      generated: makeGenerated(),
    })

    expect(cardStore().cards[0].status).toBe('draft')
  })

  it('returns the new card id', () => {
    const cardId = cardStore().createDraftCard({
      partyId: 'party-1',
      input: makeCard().input,
      generated: makeGenerated(),
    })

    expect(cardStore().cards[0].id).toBe(cardId)
  })

  it('prepends so the newest card renders first', () => {
    const input = makeCard().input
    const generated = makeGenerated()

    cardStore().createDraftCard({ partyId: 'party-1', input, generated })
    const secondId = cardStore().createDraftCard({
      partyId: 'party-1',
      input,
      generated,
    })

    expect(cardStore().cards[0].id).toBe(secondId)
  })

  it('starts a new generation group when none is given', () => {
    cardStore().createDraftCard({
      partyId: 'party-1',
      input: makeCard().input,
      generated: makeGenerated(),
    })

    expect(cardStore().cards[0].generationGroupId).toBeDefined()
  })

  it('reuses the group id when regenerating', () => {
    const input = makeCard().input
    const generated = makeGenerated()

    cardStore().createDraftCard({
      partyId: 'party-1',
      input,
      generated,
      generationGroupId: 'group-1',
      basedOnCardId: 'card-1',
    })

    const card = cardStore().cards[0]

    expect(card.generationGroupId).toBe('group-1')
    expect(card.basedOnCardId).toBe('card-1')
  })

  it('stamps creation and update identically', () => {
    cardStore().createDraftCard({
      partyId: 'party-1',
      input: makeCard().input,
      generated: makeGenerated(),
    })

    const card = cardStore().cards[0]

    expect(card.createdAt).toBe(card.updatedAt)
  })
})

describe('acceptCard', () => {
  it('flips a draft to accepted', () => {
    const cardId = cardStore().createDraftCard({
      partyId: 'party-1',
      input: makeCard().input,
      generated: makeGenerated(),
    })

    cardStore().acceptCard(cardId)

    expect(cardStore().cards[0].status).toBe('accepted')
  })

  it('leaves other cards untouched', () => {
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

  it('keeps the input and generated payload intact', () => {
    const input = makeCard().input
    const generated = makeGenerated()
    const cardId = cardStore().createDraftCard({
      partyId: 'party-1',
      input,
      generated,
    })

    cardStore().acceptCard(cardId)

    expect(cardStore().cards[0].input).toEqual(input)
    expect(cardStore().cards[0].generated).toEqual(generated)
  })
})

describe('deleteCard', () => {
  it('removes only the target card', () => {
    const input = makeCard().input
    const generated = makeGenerated()
    const doomed = cardStore().createDraftCard({
      partyId: 'party-1',
      input,
      generated,
    })
    cardStore().createDraftCard({ partyId: 'party-1', input, generated })

    cardStore().deleteCard(doomed)

    expect(cardStore().cards).toHaveLength(1)
    expect(cardStore().cards[0].id).not.toBe(doomed)
  })
})

describe('deleteCardsForParty', () => {
  it('drops every card of the party', () => {
    const input = makeCard().input
    const generated = makeGenerated()

    cardStore().createDraftCard({ partyId: 'party-1', input, generated })
    cardStore().createDraftCard({ partyId: 'party-1', input, generated })
    cardStore().createDraftCard({ partyId: 'party-2', input, generated })

    cardStore().deleteCardsForParty('party-1')

    expect(cardStore().cards).toHaveLength(1)
    expect(cardStore().cards[0].partyId).toBe('party-2')
  })

  it('is a no-op for an unknown party', () => {
    cardStore().createDraftCard({
      partyId: 'party-1',
      input: makeCard().input,
      generated: makeGenerated(),
    })

    cardStore().deleteCardsForParty('nope')

    expect(cardStore().cards).toHaveLength(1)
  })
})

describe('hasHydrated', () => {
  it('starts false so an empty store reads as restoring', () => {
    expect(cardStore().hasHydrated).toBe(false)
  })

  it('flips to true once rehydrated', () => {
    cardStore().setHasHydrated(true)

    expect(cardStore().hasHydrated).toBe(true)
  })
})
