import { useCardStore } from '@/features/cards/store/card-store'
import { usePartyStore } from '@/features/parties/store/party-store'
import { makeCard, makeParty } from '@test/factories'

const partyStore = () => usePartyStore.getState()

beforeEach(() => {
  useCardStore.setState({ cards: [], hasHydrated: false })
  usePartyStore.setState({ parties: [], hasHydrated: false })
})

describe('createParty', () => {
  it('trims the title before storing it', () => {
    partyStore().createParty({
      title: '  Emberkeep  ',
      themeCategory: 'fantasy',
      mood: 'fun',
    })

    expect(partyStore().parties[0].title).toBe('Emberkeep')
  })

  it('returns the id of the party it stored, for navigation', () => {
    const partyId = partyStore().createParty({
      title: 'Emberkeep',
      themeCategory: 'fantasy',
      mood: 'fun',
    })

    expect(partyStore().parties[0].id).toBe(partyId)
  })

  // Both lists render store order, so prepending is what puts a new party on top.
  it('prepends the new party', () => {
    partyStore().createParty({
      title: 'First',
      themeCategory: 'fantasy',
      mood: 'fun',
    })
    const secondId = partyStore().createParty({
      title: 'Second',
      themeCategory: 'horror',
      mood: 'wild',
    })

    expect(partyStore().parties[0].id).toBe(secondId)
  })
})

// The rule CLAUDE.md calls out explicitly: a party never outlives its cards.
describe('deleteParty', () => {
  it('removes the party and every card that points at it', () => {
    usePartyStore.setState({
      parties: [makeParty({ id: 'party-1' }), makeParty({ id: 'party-2' })],
    })
    useCardStore.setState({
      cards: [
        makeCard({ partyId: 'party-1' }),
        makeCard({ partyId: 'party-1' }),
        makeCard({ partyId: 'party-2' }),
      ],
    })

    partyStore().deleteParty('party-1')

    expect(partyStore().parties.map((party) => party.id)).toEqual(['party-2'])
    expect(useCardStore.getState().cards.map((card) => card.partyId)).toEqual([
      'party-2',
    ])
  })

  it('is a no-op for an unknown id', () => {
    usePartyStore.setState({ parties: [makeParty({ id: 'party-1' })] })
    useCardStore.setState({ cards: [makeCard({ partyId: 'party-1' })] })

    partyStore().deleteParty('nope')

    expect(partyStore().parties).toHaveLength(1)
    expect(useCardStore.getState().cards).toHaveLength(1)
  })
})
