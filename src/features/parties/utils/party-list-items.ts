import { getCardCountByPartyId } from '@/features/cards/selectors'
import { CharacterCard } from '@/features/cards/types'
import { Party } from '@/features/parties/types'

export interface PartyListItemModel {
  party: Party
  cardCount: number
}

// Parties render in store order (newest first). A party with no cards still
// needs a row, so its count defaults to zero rather than being skipped.
export function buildPartyListItems(
  parties: readonly Party[],
  cards: readonly CharacterCard[],
): PartyListItemModel[] {
  const cardCountByPartyId = getCardCountByPartyId(cards)

  return parties.map((party) => ({
    party,
    cardCount: cardCountByPartyId[party.id] ?? 0,
  }))
}
