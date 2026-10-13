import {
  hasPartyWorld,
  splitGeneratedWorld,
} from '@/features/generation/utils/party-world'
import { makeGenerated } from '@test/factories'

const world =
  'The gate opens once a season. Nobody leaves with what they brought in.'

describe('splitGeneratedWorld', () => {
  it('lifts partyHistory out of the card fields', () => {
    const result = splitGeneratedWorld({
      ...makeGenerated(),
      partyHistory: world,
    })

    expect(result.partyHistory).toBe(world)
    expect(result.generated).not.toHaveProperty('partyHistory')
  })

  it('keeps every card field intact', () => {
    const generated = makeGenerated()

    expect(
      splitGeneratedWorld({ ...generated, partyHistory: world }).generated,
    ).toEqual(generated)
  })

  it('reports no world when the field is absent', () => {
    const result = splitGeneratedWorld(makeGenerated())

    expect(result.partyHistory).toBeNull()
  })

  it('reports no world when the field is blank', () => {
    expect(
      splitGeneratedWorld({ ...makeGenerated(), partyHistory: '   ' })
        .partyHistory,
    ).toBeNull()
  })

  it('trims the world it returns', () => {
    expect(
      splitGeneratedWorld({
        ...makeGenerated(),
        partyHistory: `  ${world}  `,
      }).partyHistory,
    ).toBe(world)
  })
})

describe('hasPartyWorld', () => {
  it('reads a stored string as an established world', () => {
    expect(hasPartyWorld(world)).toBe(true)
  })

  it('reads null, undefined, and blank as no world', () => {
    expect(hasPartyWorld(null)).toBe(false)
    expect(hasPartyWorld(undefined)).toBe(false)
    expect(hasPartyWorld('   ')).toBe(false)
  })
})
