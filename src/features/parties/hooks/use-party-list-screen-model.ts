import { useCardStore } from '@/features/cards/store/card-store'
import { usePartyStore } from '@/features/parties/store/party-store'
import { buildPartyListItems } from '@/features/parties/utils/party-list-items'

export function usePartyListScreenModel() {
  const hasHydrated = usePartyStore((state) => state.hasHydrated)
  const parties = usePartyStore((state) => state.parties)
  const cards = useCardStore((state) => state.cards)

  return {
    hasHydrated,
    items: buildPartyListItems(parties, cards),
  }
}
