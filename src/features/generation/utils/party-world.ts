import { CharacterCardGenerated } from '@/features/cards/types'
import { GeneratedCharacterCard } from '@/features/generation/types'

export interface GeneratedCardWithWorldParts {
  generated: CharacterCardGenerated
  partyHistory: string | null
}

// The first card of a party answers `partyHistory` next to the card fields. It
// belongs to the party, not the card, so it is lifted out before saving and
// dropped from the card payload.
export function splitGeneratedWorld(
  generated: GeneratedCharacterCard,
): GeneratedCardWithWorldParts {
  const { partyHistory, ...card } = generated

  return {
    generated: card,
    partyHistory: partyHistory?.trim() ? partyHistory.trim() : null,
  }
}

// A party has a world only once a card has founded one. An empty string from
// stored data counts as none, so the next generation establishes one instead.
export function hasPartyWorld(partyHistory?: string | null) {
  return Boolean(partyHistory?.trim())
}
