import { getPartyById } from '@/features/parties/selectors'
import { makeParty } from '@test/factories'

describe('getPartyById', () => {
  const parties = [makeParty({ id: 'party-1' }), makeParty({ id: 'party-2' })]

  it('finds a party by id', () => {
    expect(getPartyById(parties, 'party-1')).toBe(parties[0])
  })

  it('returns null when absent', () => {
    expect(getPartyById(parties, 'party-missing')).toBeNull()
  })

  it('returns null for an empty list', () => {
    expect(getPartyById([], 'party-1')).toBeNull()
  })

  it('does not match on a partial id', () => {
    expect(getPartyById(parties, 'party')).toBeNull()
  })
})
