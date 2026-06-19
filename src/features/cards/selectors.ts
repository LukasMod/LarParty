import { CharacterCard } from '@/features/cards/types'

export function getCardById(
  cards: CharacterCard[],
  cardId: string,
): CharacterCard | null {
  return cards.find((card) => card.id === cardId) ?? null
}

export function getCardCountByPartyId(cards: CharacterCard[]) {
  return cards.reduce<Record<string, number>>((counts, card) => {
    counts[card.partyId] = (counts[card.partyId] ?? 0) + 1
    return counts
  }, {})
}

export function getCardsForParty(cards: CharacterCard[], partyId: string) {
  return cards
    .filter((card) => card.partyId === partyId)
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
}
