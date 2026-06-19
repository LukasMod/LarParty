import { Colors } from '@/constants/theme'
import { getCardCountByPartyId } from '@/features/cards/selectors'
import { useCardStore } from '@/features/cards/store/card-store'
import { usePartyStore } from '@/features/parties/store/party-store'
import { Party } from '@/features/parties/types'

const partyAccentByTheme = {
  fantasy: Colors.fantasy.cardPreviewAccent,
  'sci-fi': Colors['sci-fi'].cardPreviewAccent,
  horror: Colors.horror.cardPreviewAccent,
  magic: Colors.magic.cardPreviewAccent,
  casual: Colors.casual.cardPreviewAccent,
  corporation: Colors.corporation.cardPreviewAccent,
} as const

interface PartyListItemModel {
  party: Party
  cardCount: number
  accentColor: string
}

export function usePartyListScreenModel() {
  const hasHydrated = usePartyStore((state) => state.hasHydrated)
  const parties = usePartyStore((state) => state.parties)
  const cards = useCardStore((state) => state.cards)
  const cardCountByPartyId = getCardCountByPartyId(cards)

  const items: PartyListItemModel[] = parties.map((party) => ({
    party,
    cardCount: cardCountByPartyId[party.id] ?? 0,
    accentColor: partyAccentByTheme[party.themeCategory],
  }))

  return {
    hasHydrated,
    items,
  }
}
