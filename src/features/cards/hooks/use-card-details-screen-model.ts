import { getCardById } from '@/features/cards/selectors'
import { useCardStore } from '@/features/cards/store/card-store'
import {
  CardDetailsScreenModel,
  resolveCardDetailsScreenModel,
} from '@/features/cards/utils/card-details-screen-model'
import { getPartyById } from '@/features/parties/selectors'
import { usePartyStore } from '@/features/parties/store/party-store'

export function useCardDetailsScreenModel(
  partyId: string,
  cardId: string,
): CardDetailsScreenModel {
  const partiesHaveHydrated = usePartyStore((state) => state.hasHydrated)
  const cardsHaveHydrated = useCardStore((state) => state.hasHydrated)
  const party = usePartyStore((state) => getPartyById(state.parties, partyId))
  const card = useCardStore((state) => getCardById(state.cards, cardId))

  return resolveCardDetailsScreenModel({
    hasHydrated: partiesHaveHydrated && cardsHaveHydrated,
    partyId,
    party,
    card,
  })
}
