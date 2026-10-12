import { getCardsForParty } from '@/features/cards/selectors'
import { useCardStore } from '@/features/cards/store/card-store'
import { getPartyById } from '@/features/parties/selectors'
import { usePartyStore } from '@/features/parties/store/party-store'
import {
  PartyDetailsScreenModel,
  resolvePartyDetailsScreenModel,
} from '@/features/parties/utils/party-details-screen-model'

export function usePartyDetailsScreenModel(
  partyId: string,
): PartyDetailsScreenModel {
  const partiesHaveHydrated = usePartyStore((state) => state.hasHydrated)
  const cardsHaveHydrated = useCardStore((state) => state.hasHydrated)
  const party = usePartyStore((state) => getPartyById(state.parties, partyId))
  const allCards = useCardStore((state) => state.cards)

  return resolvePartyDetailsScreenModel({
    hasHydrated: partiesHaveHydrated && cardsHaveHydrated,
    party,
    cards: getCardsForParty(allCards, partyId),
  })
}
