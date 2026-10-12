import { CharacterCard } from '@/features/cards/types'

export function getCardById(
  cards: readonly CharacterCard[],
  cardId: string,
): CharacterCard | null {
  return cards.find((card) => card.id === cardId) ?? null
}

export function getCardCountByPartyId(cards: readonly CharacterCard[]) {
  return cards.reduce<Record<string, number>>((counts, card) => {
    counts[card.partyId] = (counts[card.partyId] ?? 0) + 1
    return counts
  }, {})
}

// Recency of the last edit decides order, so an accepted card that a
// regeneration touched moves back to the top of the list.
export function getCardsForParty(
  cards: readonly CharacterCard[],
  partyId: string,
) {
  return cards
    .filter((card) => card.partyId === partyId)
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
}
