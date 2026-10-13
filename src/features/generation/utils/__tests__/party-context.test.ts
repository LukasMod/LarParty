import {
  getGenerationAttempt,
  getPromptSiblings,
} from '@/features/generation/utils/party-context'
import { fixedTimestamp, makeCard, makeCardInput } from '@test/factories'

const groupOfFirst = 'generation-group-first'
const groupOfSecond = 'generation-group-second'

const first = makeCard({
  id: 'card-first',
  partyId: 'party-a',
  generationGroupId: groupOfFirst,
  updatedAt: fixedTimestamp(1),
})
const second = makeCard({
  id: 'card-second',
  partyId: 'party-a',
  generationGroupId: groupOfSecond,
  updatedAt: fixedTimestamp(3),
})
const otherParty = makeCard({
  id: 'card-other',
  partyId: 'party-b',
  generationGroupId: 'generation-group-other',
  updatedAt: fixedTimestamp(2),
})

describe('getGenerationAttempt', () => {
  it('is 1 without a generation group', () => {
    expect(getGenerationAttempt([first])).toBe(1)
  })

  it('is 1 for a fresh group', () => {
    expect(getGenerationAttempt([first], 'generation-empty')).toBe(1)
  })

  it('counts the existing variants of the group', () => {
    const variant = makeCard({ generationGroupId: groupOfFirst })

    expect(getGenerationAttempt([first, variant, second], groupOfFirst)).toBe(3)
  })
})

describe('getPromptSiblings', () => {
  it('returns only cards of the party', () => {
    const siblings = getPromptSiblings({
      cards: [first, second, otherParty],
      partyId: 'party-a',
    })

    expect(siblings).toHaveLength(2)
  })

  it('drops every variant of the card being regenerated', () => {
    const siblings = getPromptSiblings({
      cards: [first, second],
      partyId: 'party-a',
      excludeGenerationGroupId: groupOfFirst,
    })

    expect(siblings.map((sibling) => sibling.nameWithClass)).toEqual([
      second.generated.generatedNameWithClass,
    ])
  })

  it('summarises each card with name, traits, phrase, and movement', () => {
    const [sibling] = getPromptSiblings({ cards: [first], partyId: 'party-a' })

    expect(sibling).toEqual({
      nameWithClass: first.generated.generatedNameWithClass,
      traits: first.input.selectedTraits.map((trait) => ({
        trait,
        traitValue: 0,
      })),
      specialPhrase: first.generated.specialPhrase,
      specialMovement: first.generated.specialMovement,
    })
  })

  it('reads trait values from each card input', () => {
    const tuned = makeCard({
      partyId: 'party-a',
      generationGroupId: 'generation-group-tuned',
      updatedAt: fixedTimestamp(4),
      input: makeCardInput({ traitLevels: { loyal: -3, funny: 2, calm: 0 } }),
    })

    const [sibling] = getPromptSiblings({
      cards: [tuned],
      partyId: 'party-a',
    })

    expect(sibling?.traits).toEqual([
      { trait: 'loyal', traitValue: -3 },
      { trait: 'funny', traitValue: 2 },
      { trait: 'calm', traitValue: 0 },
    ])
  })

  it('defaults a trait with no stored level to 0', () => {
    const partial = makeCard({
      partyId: 'party-a',
      generationGroupId: 'generation-group-partial',
      updatedAt: fixedTimestamp(4),
      input: makeCardInput({ traitLevels: { loyal: 1 } }),
    })

    const [sibling] = getPromptSiblings({
      cards: [partial],
      partyId: 'party-a',
    })

    expect(sibling?.traits).toEqual([
      { trait: 'loyal', traitValue: 1 },
      { trait: 'funny', traitValue: 0 },
      { trait: 'calm', traitValue: 0 },
    ])
  })

  it('clamps a stored level into the scale', () => {
    const over = makeCard({
      partyId: 'party-a',
      generationGroupId: 'generation-group-over',
      updatedAt: fixedTimestamp(4),
      input: makeCardInput({ traitLevels: { loyal: 9 } }),
    })

    const [sibling] = getPromptSiblings({
      cards: [over],
      partyId: 'party-a',
    })

    expect(sibling?.traits[0]).toEqual({ trait: 'loyal', traitValue: 3 })
  })

  it('orders the newest card first', () => {
    const siblings = getPromptSiblings({
      cards: [first, second],
      partyId: 'party-a',
    })

    expect(siblings[0]?.nameWithClass).toBe(
      second.generated.generatedNameWithClass,
    )
  })
})
