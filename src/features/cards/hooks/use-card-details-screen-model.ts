import { getCardById } from '@/features/cards/selectors'
import { useCardStore } from '@/features/cards/store/card-store'
import { CharacterCard } from '@/features/cards/types'
import { getPartyById } from '@/features/parties/selectors'
import { usePartyStore } from '@/features/parties/store/party-store'
import { Party } from '@/features/parties/types'

type CardDetailsScreenModel =
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

export function useCardDetailsScreenModel(
  partyId: string,
  cardId: string,
): CardDetailsScreenModel {
  const partiesHaveHydrated = usePartyStore((state) => state.hasHydrated)
  const cardsHaveHydrated = useCardStore((state) => state.hasHydrated)
  const party = usePartyStore((state) => getPartyById(state.parties, partyId))
  const card = useCardStore((state) => getCardById(state.cards, cardId))

  if (!partiesHaveHydrated || !cardsHaveHydrated) {
    return {
      status: 'loading',
      party: null,
      card: null,
    }
  }

  if (!party || !card || card.partyId !== partyId) {
    return {
      status: 'missing',
      party: null,
      card: null,
    }
  }

  return {
    status: 'ready',
    party,
    card,
  }
}
