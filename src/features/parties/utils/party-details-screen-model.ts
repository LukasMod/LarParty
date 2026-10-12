import { CharacterCard } from '@/features/cards/types'
import { Party } from '@/features/parties/types'

export type PartyDetailsScreenModel =
  | {
      status: 'loading'
      party: null
      cards: null
    }
  | {
      status: 'missing'
      party: null
      cards: null
    }
  | {
      status: 'ready'
      party: Party
      cards: CharacterCard[]
    }

export interface PartyDetailsScreenInput {
  hasHydrated: boolean
  party: Party | null
  cards: CharacterCard[]
}

// Both stores must report hydration before an absent party counts as deleted,
// otherwise a cold start reads as "party not found".
export function resolvePartyDetailsScreenModel({
  hasHydrated,
  party,
  cards,
}: PartyDetailsScreenInput): PartyDetailsScreenModel {
  if (!hasHydrated) {
    return { status: 'loading', party: null, cards: null }
  }

  if (!party) {
    return { status: 'missing', party: null, cards: null }
  }

  return { status: 'ready', party, cards }
}
