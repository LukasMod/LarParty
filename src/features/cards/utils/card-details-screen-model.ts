import { CharacterCard } from '@/features/cards/types'
import { Party } from '@/features/parties/types'

export type CardDetailsScreenModel =
  | {
      status: 'loading'
      party: null
      card: null
    }
  | {
      status: 'missing'
      party: null
      card: null
    }
  | {
      status: 'ready'
      party: Party
      card: CharacterCard
    }

export interface CardDetailsScreenInput {
  hasHydrated: boolean
  partyId: string
  party: Party | null
  card: CharacterCard | null
}

// A card whose `partyId` disagrees with the route is treated as missing, so a
// stale deep link never renders one party's card under another party's theme.
export function resolveCardDetailsScreenModel({
  hasHydrated,
  partyId,
  party,
  card,
}: CardDetailsScreenInput): CardDetailsScreenModel {
  if (!hasHydrated) {
    return { status: 'loading', party: null, card: null }
  }

  if (!party || !card || card.partyId !== partyId) {
    return { status: 'missing', party: null, card: null }
  }

  return { status: 'ready', party, card }
}
