import { useCardStore } from '@/features/cards/store/card-store'
import { CharacterCard } from '@/features/cards/types'
import { getPartyById } from '@/features/parties/selectors'
import { usePartyStore } from '@/features/parties/store/party-store'
import { Party } from '@/features/parties/types'

type PartyDetailsScreenModel =
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

export function usePartyDetailsScreenModel(
  partyId: string,
): PartyDetailsScreenModel {
  const partiesHaveHydrated = usePartyStore((state) => state.hasHydrated)
  const cardsHaveHydrated = useCardStore((state) => state.hasHydrated)
  const party = usePartyStore((state) => getPartyById(state.parties, partyId))
  const allCards = useCardStore((state) => state.cards)

  const cards = allCards
    .filter((card) => card.partyId === partyId)
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))

  if (!partiesHaveHydrated || !cardsHaveHydrated) {
    return {
      status: 'loading',
      party: null,
      cards: null,
    }
  }

  if (!party) {
    return {
      status: 'missing',
      party: null,
      cards: null,
    }
  }

  return {
    status: 'ready',
    party,
    cards,
  }
}
