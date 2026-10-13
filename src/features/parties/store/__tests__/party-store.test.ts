import { useCardStore } from '@/features/cards/store/card-store'
import { usePartyStore } from '@/features/parties/store/party-store'
import { makeCard, makeParty } from '@test/factories'

beforeEach(() => {
  useCardStore.setState({ cards: [], hasHydrated: false })
  usePartyStore.setState({ parties: [], hasHydrated: false })
})

describe('createParty', () => {
  it('trims the title', () => {
    usePartyStore.getState().createParty({
      title: '  Emberkeep  ',
      themeCategory: 'fantasy',
      mood: 'fun',
    })

    expect(usePartyStore.getState().parties[0].title).toBe('Emberkeep')
  })

  it('returns the new party id', () => {
    const partyId = usePartyStore.getState().createParty({
      title: 'Emberkeep',
      themeCategory: 'fantasy',
      mood: 'fun',
    })

    expect(usePartyStore.getState().parties[0].id).toBe(partyId)
  })

  it('prepends the new party', () => {
    usePartyStore.getState().createParty({
      title: 'First',
      themeCategory: 'fantasy',
      mood: 'fun',
    })
    const secondId = usePartyStore.getState().createParty({
      title: 'Second',
      themeCategory: 'horror',
      mood: 'wild',
    })

    expect(usePartyStore.getState().parties[0].id).toBe(secondId)
  })

  it('keeps the chosen theme and mood', () => {
    usePartyStore.getState().createParty({
      title: 'Kepler Drift',
      themeCategory: 'sci-fi',
      mood: 'intrigue',
    })

    const party = usePartyStore.getState().parties[0]

    expect(party.themeCategory).toBe('sci-fi')
    expect(party.mood).toBe('intrigue')
  })

  it('stamps creation and update identically', () => {
    usePartyStore.getState().createParty({
      title: 'Emberkeep',
      themeCategory: 'fantasy',
      mood: 'fun',
    })

    const party = usePartyStore.getState().parties[0]

    expect(party.createdAt).toBe(party.updatedAt)
  })
})

describe('deleteParty', () => {
  it('removes only the target party', () => {
    usePartyStore.setState({
      parties: [makeParty({ id: 'party-1' }), makeParty({ id: 'party-2' })],
    })

    usePartyStore.getState().deleteParty('party-1')

    expect(usePartyStore.getState().parties.map((party) => party.id)).toEqual([
      'party-2',
    ])
  })

  it('is a no-op for an unknown id', () => {
    usePartyStore.setState({ parties: [makeParty({ id: 'party-1' })] })

    usePartyStore.getState().deleteParty('nope')

    expect(usePartyStore.getState().parties).toHaveLength(1)
  })
})

// The rule CLAUDE.md calls out explicitly: a party never outlives its cards.
describe('cascade delete', () => {
  it('removes the party and all of its cards', () => {
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

    usePartyStore.getState().deleteParty('party-1')

    expect(usePartyStore.getState().parties).toHaveLength(1)
    expect(useCardStore.getState().cards).toHaveLength(1)
    expect(useCardStore.getState().cards[0].partyId).toBe('party-2')
  })

  it('clears a party whose cards are its only content', () => {
    usePartyStore.setState({ parties: [makeParty({ id: 'party-1' })] })
    useCardStore.setState({ cards: [makeCard({ partyId: 'party-1' })] })

    usePartyStore.getState().deleteParty('party-1')

    expect(useCardStore.getState().cards).toEqual([])
  })

  it('leaves other parties’ cards intact', () => {
    usePartyStore.setState({ parties: [makeParty({ id: 'party-1' })] })
    useCardStore.setState({
      cards: [
        makeCard({ partyId: 'party-1' }),
        makeCard({ partyId: 'party-2' }),
      ],
    })

    usePartyStore.getState().deleteParty('party-1')

    expect(useCardStore.getState().cards.map((card) => card.partyId)).toEqual([
      'party-2',
    ])
  })
})

describe('setPartyHistory', () => {
  beforeEach(() => {
    usePartyStore.setState({ parties: [makeParty({ id: 'party-1' })] })
  })

  it('writes the world to the party', () => {
    usePartyStore
      .getState()
      .setPartyHistory('party-1', 'The gate opens once a season.')

    expect(usePartyStore.getState().parties[0].partyHistory).toBe(
      'The gate opens once a season.',
    )
  })

  it('leaves an already established world untouched', () => {
    usePartyStore.setState({
      parties: [makeParty({ id: 'party-1', partyHistory: 'Original world.' })],
    })

    usePartyStore.getState().setPartyHistory('party-1', 'Replacement world.')

    expect(usePartyStore.getState().parties[0].partyHistory).toBe(
      'Original world.',
    )
  })

  it('claims a party has a world from empty string', () => {
    usePartyStore.setState({
      parties: [makeParty({ id: 'party-1', partyHistory: '' })],
    })

    usePartyStore.getState().setPartyHistory('party-1', 'Written world.')

    expect(usePartyStore.getState().parties[0].partyHistory).toBe(
      'Written world.',
    )
  })

  it('is a no-op for an unknown id', () => {
    usePartyStore.getState().setPartyHistory('party-nope', 'World.')

    expect(usePartyStore.getState().parties[0].partyHistory).toBeNull()
  })
})

describe('hasHydrated', () => {
  it('starts false so an empty store reads as restoring', () => {
    usePartyStore.getState().setHasHydrated(false)

    expect(usePartyStore.getState().hasHydrated).toBe(false)
  })

  it('flips to true once rehydrated', () => {
    usePartyStore.getState().setHasHydrated(true)

    expect(usePartyStore.getState().hasHydrated).toBe(true)
  })
})
