import {
  CardStatus,
  CharacterCard,
  CharacterCardGenerated,
  CharacterCardInput,
} from '@/features/cards/types'
import { Party, PartyMood, ThemeCategory } from '@/features/parties/types'

let counter = 0

function nextId(prefix: string) {
  counter += 1

  return `${prefix}-test-${counter}`
}

// Tests read better with an explicit ISO string than a real clock.
export function fixedTimestamp(dayOffset = 0) {
  return new Date(Date.UTC(2026, 0, 1) + dayOffset * 86_400_000).toISOString()
}

export function makeParty(overrides: Partial<Party> = {}): Party {
  return {
    id: nextId('party'),
    title: 'Test Party',
    themeCategory: 'fantasy' as ThemeCategory,
    mood: 'fun' as PartyMood,
    partyHistory: null,
    createdAt: fixedTimestamp(0),
    updatedAt: fixedTimestamp(0),
    ...overrides,
  }
}

export function makeCardInput(
  overrides: Partial<CharacterCardInput> = {},
): CharacterCardInput {
  return {
    name: 'Test Name',
    sex: 'other',
    selectedTraits: ['loyal', 'funny', 'calm'],
    ...overrides,
  }
}

export function makeGenerated(
  overrides: Partial<CharacterCardGenerated> = {},
): CharacterCardGenerated {
  return {
    generatedNameWithClass: 'Test Name the Test Class',
    backgroundHistory: 'One sentence. Two sentences.',
    characterTraits: ['Loyal', 'Funny', 'Calm'],
    specialMovement: 'Slow Bow',
    specialPhrase: 'The road decides.',
    ...overrides,
  }
}

export function makeCard(
  overrides: Partial<CharacterCard> = {},
): CharacterCard {
  const status = (overrides.status ?? 'draft') as CardStatus

  return {
    id: nextId('card'),
    partyId: 'party-default',
    status,
    input: makeCardInput(),
    generated: makeGenerated(),
    generationGroupId: nextId('generation'),
    createdAt: fixedTimestamp(0),
    updatedAt: fixedTimestamp(0),
    ...overrides,
  }
}
