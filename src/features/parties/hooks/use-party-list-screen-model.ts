import { getCardCountByPartyId } from '@/features/cards/selectors'
import { useCardStore } from '@/features/cards/store/card-store'
import { usePartyStore } from '@/features/parties/store/party-store'
import { Party } from '@/features/parties/types'

interface PartyListItemModel {
  party: Party
  cardCount: number
}

export function usePartyListScreenModel() {
  const hasHydrated = usePartyStore((state) => state.hasHydrated)
  const parties = usePartyStore((state) => state.parties)
  const cards = useCardStore((state) => state.cards)
  const cardCountByPartyId = getCardCountByPartyId(cards)

  const items: PartyListItemModel[] = parties.map((party) => ({
    party,
    cardCount: cardCountByPartyId[party.id] ?? 0,
  }))

  return {
    hasHydrated,
    items,
  }
}
